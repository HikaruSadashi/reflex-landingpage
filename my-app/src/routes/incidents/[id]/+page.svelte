<script lang="ts">
	// @ts-nocheck
	import { page } from '$app/stores';
	import { onDestroy, onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Spinner } from '$lib/components/ui/spinner/index.js';
	import * as Item from '$lib/components/ui/item/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Resizable from '$lib/components/ui/resizable/index.js';
	import LiveReasoningPane from '$lib/components/incidents/live-reasoning-pane.svelte';
	import PlaceholderPane from '$lib/components/incidents/placeholder-pane.svelte';
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
	const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'https://reflexbackend-r2rk.onrender.com';

	let loading = $state(true);
	let error = $state('');
	let incident = $state<IncidentSummary | null>(null);
	let incidentId = $derived(Number($page.params.id));
	let stream: EventSource | null = null;
	let streamState = $state<StreamState>('idle');
	let streamError = $state('');
	let reasoningMarkdown = $state('');

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

	function stopStream() {
		if (stream) {
			stream.close();
			stream = null;
		}
	}

	function startStream(rerun = false) {
		if (!incident) return;
		stopStream();
		streamError = '';
		reasoningMarkdown = '';
		streamState = 'running';
		incident = { ...incident, investigation_state: 'running', investigation_last_error: null };
		const streamUrl = rerun
			? `${API_BASE}/stream/incidents/${incident.id}?rerun=true`
			: `${API_BASE}/stream/incidents/${incident.id}`;
		const es = new EventSource(streamUrl);
		stream = es;

		es.addEventListener('investigation_delta', (ev) => {
			const data = JSON.parse((ev as MessageEvent).data);
			reasoningMarkdown += data.delta ?? '';
		});

		es.addEventListener('done', () => {
			streamState = 'done';
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

	async function loadIncident() {
		if (!Number.isFinite(incidentId) || incidentId <= 0) {
			error = 'Invalid incident id.';
			loading = false;
			return;
		}
		loading = true;
		error = '';
		try {
			incident = await findIncidentById(incidentId);
			if (!incident) {
				error = `Incident #${incidentId} not found in incidents list.`;
				return;
			}
			streamState = 'idle';
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load incident';
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		void loadIncident();
	});

	onDestroy(() => {
		stopStream();
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
					onclick={() => startStream(incident?.investigation_state === 'done')}
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
									<Badge variant={investigationVariant(incident.investigation_state)}>
										{incident.investigation_state}
									</Badge>
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

					<Resizable.Pane defaultSize={50}>
						<PlaceholderPane />
					</Resizable.Pane>
				</Resizable.PaneGroup>
			</div>
		{/if}
	</section>
</main>
