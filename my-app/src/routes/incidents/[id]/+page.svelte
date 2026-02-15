<script lang="ts">
	// @ts-nocheck
	import { page } from '$app/stores';
	import { onDestroy, onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Spinner } from '$lib/components/ui/spinner/index.js';
	import * as Item from '$lib/components/ui/item/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Resizable from '$lib/components/ui/resizable/index.js';
	import * as Choicebox from '$lib/components/ui/choicebox/index.js';
	import LiveReasoningPane from '$lib/components/incidents/live-reasoning-pane.svelte';
	import MemoryPane from '$lib/components/incidents/memory-pane.svelte';
	import PostmortemPanel from '$lib/components/incidents/postmortem-panel.svelte';
	import { ArrowLeft, RefreshCcw, Loader2 } from '@lucide/svelte';

	type IncidentSummary = {
		id: number;
		title: string;
		status: string;
		severity: string;
		source: string;
		started_at: string;
		resolved_at: string | null;
		investigation_state: 'pending' | 'running' | 'done' | 'error';
		investigation_updated_at: string | null;
		investigation_last_error: string | null;
		log_name: string | null;
	};

	type IncidentsResponse = {
		incidents: Array<Omit<IncidentSummary, 'id'> & { id: number | string }>;
		next_cursor: number | string | null;
		has_more: boolean;
	};

	type StreamState = 'idle' | 'running' | 'done' | 'error';
	type ActionOption = {
		id: string;
		label: string;
		description: string;
	};
	type MemoryEntry = {
		id: number;
		title: string;
		body_markdown: string;
		tags: string[];
		confidence_text: string;
		updated_at: string;
		created_at: string;
		last_updated_by: 'user' | 'ai';
	};
	const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'https://reflexbackend-r2rk.onrender.com';

	let loading = $state(true);
	let error = $state('');
	let incident = $state<IncidentSummary | null>(null);
	let incidentId = $derived(Number($page.params.id));
	let stream: EventSource | null = null;
	let postmortemStream: EventSource | null = null;
	let streamState = $state<StreamState>('idle');
	let postmortemState = $state<'idle' | 'running' | 'done' | 'error'>('idle');
	let streamError = $state('');
	let reasoningMarkdown = $state('');
	let postmortemMarkdown = $state('');
	let postmortemError = $state('');
	let actionOptions = $state<ActionOption[]>([]);
	let visibleActionOptions = $state<ActionOption[]>([]);
	let selectedActionId = $state('');
	let memoryEntry = $state<MemoryEntry | null>(null);
	let memoryTitle = $state('');
	let memoryBody = $state('');
	let memoryDirty = $state(false);
	let memorySaving = $state(false);
	let memorySaveError = $state('');
	let memoryStreamBuffer = $state('');
	let memoryStreamActive = $state(false);
	let memoryPoller: ReturnType<typeof setInterval> | null = null;
	let actionOptionTimers: ReturnType<typeof setTimeout>[] = [];
	let sessionHydrated = $state(false);

	function sessionStorageKey(id: number) {
		return `reflex.incident.session.${id}`;
	}

	function clearActionOptionTimers() {
		for (const timer of actionOptionTimers) clearTimeout(timer);
		actionOptionTimers = [];
	}

	function persistSession() {
		if (!sessionHydrated || !incident || typeof localStorage === 'undefined') return;
		localStorage.setItem(
			sessionStorageKey(incident.id),
			JSON.stringify({
				reasoningMarkdown,
				actionOptions,
				selectedActionId
			})
		);
	}

	function restoreSession(id: number) {
		if (typeof localStorage === 'undefined') return false;
		const raw = localStorage.getItem(sessionStorageKey(id));
		if (!raw) return false;
		try {
			const parsed = JSON.parse(raw) as {
				reasoningMarkdown?: string;
				actionOptions?: ActionOption[];
				selectedActionId?: string;
			};
			reasoningMarkdown = parsed.reasoningMarkdown ?? '';
			actionOptions = Array.isArray(parsed.actionOptions) ? parsed.actionOptions : [];
			visibleActionOptions = [...actionOptions];
			selectedActionId = parsed.selectedActionId ?? '';
			return true;
		} catch {
			// Ignore corrupted session payload.
			return false;
		}
	}

	function setActionOptions(nextOptions: ActionOption[], animate = false) {
		actionOptions = nextOptions;
		if (!animate) {
			visibleActionOptions = [...nextOptions];
			return;
		}
		clearActionOptionTimers();
		visibleActionOptions = [];
		for (const [index, option] of nextOptions.entries()) {
			const timer = setTimeout(() => {
				visibleActionOptions = [...visibleActionOptions, option];
			}, index * 120);
			actionOptionTimers.push(timer);
		}
	}

	$effect(() => {
		incident?.id;
		reasoningMarkdown;
		actionOptions;
		selectedActionId;
		persistSession();
	});

	function toPositiveNumber(value: unknown) {
		const n = Number(value);
		return Number.isFinite(n) && n > 0 ? n : null;
	}

	function normalizeIncident(raw: Omit<IncidentSummary, 'id'> & { id: number | string }): IncidentSummary {
		return {
			...raw,
			id: Number(raw.id)
		};
	}

	function statusVariant(status: string) {
		return status.toLowerCase() === 'triggered' ? 'destructive' : 'secondary';
	}

	function severityVariant(severity: string) {
		const v = severity.toLowerCase();
		if (v === 'critical') return 'destructive';
		if (v === 'warn') return 'secondary';
		return 'outline';
	}

	function investigationVariant(state: IncidentSummary['investigation_state']) {
		if (state === 'running') return 'secondary';
		if (state === 'done') return 'outline';
		if (state === 'error') return 'destructive';
		return 'outline';
	}

	function formatDateTime(iso: string | null) {
		if (!iso) return '—';
		return new Date(iso).toLocaleString();
	}

	async function fetchIncidentsPage(cursor?: number) {
		const params = new URLSearchParams({ limit: '100' });
		if (typeof cursor === 'number') params.set('cursor', String(cursor));
		const res = await fetch(`${API_BASE}/incidents?${params.toString()}`);
		if (!res.ok) throw new Error(`Failed to fetch incidents (${res.status})`);
		const payload = (await res.json()) as IncidentsResponse;
		return {
			incidents: (payload.incidents ?? []).map(normalizeIncident),
			next_cursor: toPositiveNumber(payload.next_cursor),
			has_more: Boolean(payload.has_more)
		};
	}

	async function findIncidentById(targetId: number) {
		let cursor: number | null = null;
		let hasMore = true;
		let guard = 0;
		while (hasMore && guard < 30) {
			const data = await fetchIncidentsPage(cursor ?? undefined);
			const found = data.incidents.find((a) => a.id === targetId);
			if (found) return found;
			hasMore = !!data.has_more;
			cursor = data.next_cursor ?? null;
			guard += 1;
		}
		return null;
	}

	async function fetchMemoryLatest() {
		const res = await fetch(`${API_BASE}/memory?limit=1`);
		if (!res.ok) throw new Error(`Failed to fetch memory (${res.status})`);
		const payload = (await res.json()) as { memory?: MemoryEntry[] };
		return payload.memory?.[0] ?? null;
	}

	async function fetchMemoryById(memoryId: number) {
		const res = await fetch(`${API_BASE}/memory/${memoryId}`);
		if (!res.ok) throw new Error(`Failed to fetch memory entry (${res.status})`);
		const payload = (await res.json()) as { memory?: MemoryEntry };
		return payload.memory ?? null;
	}

	function hydrateMemory(entry: MemoryEntry | null, force = false) {
		memoryEntry = entry;
		if (!entry) return;
		if (force || !memoryDirty) {
			memoryTitle = entry.title;
			memoryBody = entry.body_markdown;
			memoryDirty = false;
		}
	}

	async function loadMemory(force = false) {
		try {
			const latest = await fetchMemoryLatest();
			hydrateMemory(latest, force);
		} catch {
			// Keep existing memory UI state when polling fails.
		}
	}

	async function saveMemory() {
		if (!memoryEntry) return;
		memorySaving = true;
		memorySaveError = '';
		try {
			const res = await fetch(`${API_BASE}/memory/${memoryEntry.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					body_markdown: memoryBody || memoryEntry.body_markdown,
					tags: memoryEntry.tags,
					confidence_text: memoryEntry.confidence_text
				})
			});
			if (!res.ok) throw new Error(`Failed to save memory (${res.status})`);
			const payload = (await res.json()) as { memory?: MemoryEntry };
			hydrateMemory(payload.memory ?? memoryEntry, true);
		} catch (err) {
			memorySaveError = err instanceof Error ? err.message : 'Failed to save memory';
		} finally {
			memorySaving = false;
		}
	}

	function stopStream() {
		if (stream) {
			stream.close();
			stream = null;
		}
	}

	function stopPostmortemStream() {
		if (postmortemStream) {
			postmortemStream.close();
			postmortemStream = null;
		}
	}

	function attachMemoryStreamHandlers(es: EventSource) {
		es.addEventListener('memory_write_start', (ev) => {
			memoryStreamActive = true;
			memoryStreamBuffer = '';
			const data = JSON.parse((ev as MessageEvent).data) as { title?: string };
			if (data.title) {
				memoryTitle = data.title;
			}
		});

		es.addEventListener('memory_write_delta', (ev) => {
			const data = JSON.parse((ev as MessageEvent).data) as { delta?: string };
			memoryStreamActive = true;
			memoryStreamBuffer += data.delta ?? '';
			memoryBody = memoryStreamBuffer;
		});

		es.addEventListener('memory_write_done', async (ev) => {
			memoryStreamActive = false;
			const data = JSON.parse((ev as MessageEvent).data) as { memory_entry_id?: number };
			if (typeof data.memory_entry_id === 'number') {
				try {
					const latest = await fetchMemoryById(data.memory_entry_id);
					hydrateMemory(latest, true);
				} catch {
					await loadMemory(true);
				}
			} else {
				await loadMemory(true);
			}
			memoryStreamBuffer = '';
		});
	}

	function startStream({
		rerun = false,
		action,
		append = false
	}: { rerun?: boolean; action?: string; append?: boolean } = {}) {
		if (!incident) return;
		stopStream();
		streamError = '';
		if (!append) {
			reasoningMarkdown = '';
			setActionOptions([], false);
			selectedActionId = '';
			postmortemState = 'idle';
			postmortemMarkdown = '';
			postmortemError = '';
		} else {
			reasoningMarkdown += `\n\n---\n### Executing action: ${action}\n`;
		}
		streamState = 'running';
		incident = { ...incident, investigation_state: 'running', investigation_last_error: null };
		const params = new URLSearchParams();
		if (rerun) params.set('rerun', 'true');
		if (action) params.set('action', action);
		const streamUrl = `${API_BASE}/stream/incidents/${incident.id}${params.size ? `?${params.toString()}` : ''}`;
		const es = new EventSource(streamUrl);
		stream = es;

		es.addEventListener('investigation_delta', (ev) => {
			const data = JSON.parse((ev as MessageEvent).data);
			reasoningMarkdown += data.delta ?? '';
		});
		attachMemoryStreamHandlers(es);

		es.addEventListener('action_options', (ev) => {
			try {
				const data = JSON.parse((ev as MessageEvent).data) as { options?: ActionOption[] };
				setActionOptions(Array.isArray(data.options) ? data.options : [], true);
			} catch {
				setActionOptions([], false);
			}
		});

		es.addEventListener('done', () => {
			streamState = 'done';
			memoryStreamActive = false;
			void loadMemory(true);
			if (incident) {
				incident = {
					...incident,
					investigation_state: 'done',
					investigation_updated_at: new Date().toISOString(),
					investigation_last_error: null
				};
			}
			es.close();
			stream = null;
		});

		es.addEventListener('error', (ev) => {
			streamState = 'error';
			memoryStreamActive = false;
			try {
				const data = JSON.parse((ev as MessageEvent).data);
				streamError = data.message ?? 'Stream connection error';
			} catch {
				streamError = 'Stream connection error';
			}
			if (incident) {
				incident = {
					...incident,
					investigation_state: 'error',
					investigation_updated_at: new Date().toISOString(),
					investigation_last_error: streamError
				};
			}
			es.close();
			stream = null;
		});
	}

	function startPostmortemStream() {
		if (!incident || postmortemState === 'running') return;
		stopPostmortemStream();
		postmortemError = '';
		postmortemMarkdown = '';
		postmortemState = 'running';

		const es = new EventSource(`${API_BASE}/stream/incidents/${incident.id}/postmortem`);
		postmortemStream = es;
		attachMemoryStreamHandlers(es);

		es.addEventListener('postmortem_delta', (ev) => {
			const data = JSON.parse((ev as MessageEvent).data) as { delta?: string };
			postmortemMarkdown += data.delta ?? '';
		});

		es.addEventListener('done', () => {
			postmortemState = 'done';
			memoryStreamActive = false;
			void loadMemory(true);
			es.close();
			postmortemStream = null;
		});

		es.addEventListener('error', (ev) => {
			postmortemState = 'error';
			memoryStreamActive = false;
			try {
				const data = JSON.parse((ev as MessageEvent).data);
				postmortemError = data.message ?? 'Postmortem stream error';
			} catch {
				postmortemError = 'Postmortem stream error';
			}
			es.close();
			postmortemStream = null;
		});
	}

	function runSelectedAction(value: string) {
		const selected = actionOptions.find((option) => option.id === value);
		if (!selected || streamState === 'running') return;
		selectedActionId = value;
		startStream({
			rerun: true,
			action: selected.label,
			append: true
		});
	}

	async function loadIncident() {
		if (!Number.isFinite(incidentId) || incidentId <= 0) {
			error = 'Invalid incident id.';
			loading = false;
			return;
		}
		loading = true;
		error = '';
		sessionHydrated = false;
		try {
			incident = await findIncidentById(incidentId);
			if (!incident) {
				error = `Incident #${incidentId} not found in incidents list.`;
				return;
			}
			const restored = restoreSession(incident.id);
			if (!restored) {
				reasoningMarkdown = '';
				setActionOptions([], false);
				selectedActionId = '';
			}
			sessionHydrated = true;
			streamState = 'idle';
			postmortemState = 'idle';
			postmortemMarkdown = '';
			postmortemError = '';
			await loadMemory();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load incident';
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		void loadIncident();
		memoryPoller = setInterval(() => {
			if (!memoryStreamActive && !memorySaving) {
				void loadMemory();
			}
		}, 5000);
	});

	onDestroy(() => {
		stopStream();
		stopPostmortemStream();
		clearActionOptionTimers();
		if (memoryPoller) clearInterval(memoryPoller);
	});
</script>

<main class="bg-background min-h-svh px-6 pb-14 pt-24 md:px-10 md:pb-20 md:pt-28">
	<section class="mx-auto w-full max-w-7xl space-y-6">
		<div class="flex flex-wrap items-center justify-between gap-3">
			<Button href="/incidents" variant="outline">
				<ArrowLeft class="size-4" />
				Back
			</Button>
			<div class="flex items-center gap-2">
				<Button variant="outline" onclick={loadIncident}>
					<RefreshCcw class="size-4" />
					Refresh
				</Button>
				<Button
					variant="outline"
					onclick={() => startStream({ rerun: incident?.investigation_state === 'done' })}
					disabled={streamState === 'running' || !incident}
				>
					{#if streamState === 'running'}
						<Loader2 class="size-4 animate-spin" />
					{/if}
					{#if streamState === 'running'}
						Streaming...
					{:else if incident?.investigation_state === 'done'}
						Restart investigation
					{:else}
						Start investigation
					{/if}
				</Button>
			</div>
		</div>

		{#if loading}
			<div class="max-w-md">
				<Item.Root variant="muted" class="w-full">
					<Item.Media><Spinner /></Item.Media>
					<Item.Content><Item.Title>Loading incident...</Item.Title></Item.Content>
				</Item.Root>
			</div>
		{:else if error}
			<div class="space-y-3">
				<p class="text-sm text-red-500">{error}</p>
				<Button variant="outline" onclick={loadIncident}>Retry</Button>
			</div>
		{:else if incident}
			<div class="space-y-5">
				<div class="rounded-md border border-[rgba(255,255,255,0.18)]">
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head>Incident</Table.Head>
								<Table.Head>Status</Table.Head>
								<Table.Head>Severity</Table.Head>
								<Table.Head>Time</Table.Head>
								<Table.Head>Resolved</Table.Head>
								<Table.Head>Investigation</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							<Table.Row>
								<Table.Cell>
									<div class="font-medium">{incident.title}</div>
									<div class="text-xs text-muted-foreground">{incident.log_name ?? '—'}</div>
								</Table.Cell>
								<Table.Cell><Badge variant={statusVariant(incident.status)}>{incident.status}</Badge></Table.Cell>
								<Table.Cell><Badge variant={severityVariant(incident.severity)}>{incident.severity}</Badge></Table.Cell>
								<Table.Cell>{formatDateTime(incident.started_at)}</Table.Cell>
								<Table.Cell>{incident.resolved_at ? formatDateTime(incident.resolved_at) : 'In progress'}</Table.Cell>
								<Table.Cell>
									<span
										class={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${
											incident.investigation_state === 'done'
												? 'border-green-500/40 bg-green-500/10 text-green-400'
												: incident.investigation_state === 'running'
													? 'border-violet-500/40 bg-violet-500/10 text-violet-300'
													: incident.investigation_state === 'error'
														? 'border-red-500/40 bg-red-500/10 text-red-400'
														: 'border-border bg-muted/30 text-foreground'
										}`}
									>
										{incident.investigation_state}
									</span>
								</Table.Cell>
							</Table.Row>
						</Table.Body>
					</Table.Root>
				</div>

				{#if incident.investigation_last_error}
					<p class="text-sm text-red-400">{incident.investigation_last_error}</p>
				{/if}

				<Resizable.PaneGroup
					direction="horizontal"
					class="min-h-[460px] w-full rounded-lg border border-[rgba(255,255,255,0.18)]"
				>
					<Resizable.Pane defaultSize={50}>
						<LiveReasoningPane {streamState} {streamError} {reasoningMarkdown} />
					</Resizable.Pane>

					<Resizable.Handle withHandle />

					<Resizable.Pane defaultSize={50} minSize={22} collapsible={true} collapsedSize={0}>
						<MemoryPane
							body={memoryBody}
							lastUpdatedBy={memoryEntry?.last_updated_by ?? ''}
							isSaving={memorySaving}
							saveError={memorySaveError}
							active={streamState === 'running' || memoryStreamActive}
							onBodyInput={(value) => {
								memoryBody = value;
								memoryDirty = true;
							}}
							onSave={saveMemory}
						/>
					</Resizable.Pane>
				</Resizable.PaneGroup>

				{#if actionOptions.length > 0}
					<div class="space-y-3 rounded-lg border border-[rgba(255,255,255,0.18)] p-4">
						<div>
							<h3 class="font-serif text-xl italic tracking-tight">Recommended actions</h3>
							<p class="text-sm text-muted-foreground">
								Select an action to continue investigation and execution.
							</p>
						</div>
						<Choicebox.Root bind:value={selectedActionId} onValueChange={runSelectedAction}>
							{#each visibleActionOptions as option, idx (option.id)}
								<div class="w-full" transition:fly={{ y: 12, duration: 240, delay: idx * 70 }}>
									<Choicebox.Item
										value={option.id}
										class="group w-full items-center justify-between rounded-xl border-border/70 bg-background/40 px-4 py-3 transition-all duration-300 hover:border-primary/35 hover:bg-accent/25"
									>
										<div class="min-w-0 text-left">
											<Choicebox.Title class="line-clamp-1 text-base text-foreground">
												{option.label}
											</Choicebox.Title>
											<Choicebox.Description class="mt-1 line-clamp-2 text-sm leading-relaxed">
												{option.description}
											</Choicebox.Description>
										</div>
										<Choicebox.Indicator class="self-center" />
									</Choicebox.Item>
								</div>
							{:else}
								<div class="text-sm text-muted-foreground">Preparing action options...</div>
							{/each}
						</Choicebox.Root>
					</div>
				{/if}

				{#if streamState === 'done' || postmortemState !== 'idle'}
					<PostmortemPanel
						state={postmortemState}
						content={postmortemMarkdown}
						error={postmortemError}
						onCreate={startPostmortemStream}
					/>
				{/if}
			</div>
		{/if}
	</section>
</main>
