<script lang="ts">
	// @ts-nocheck
	import { page } from '$app/stores';
	import { onDestroy, onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Spinner } from '$lib/components/ui/spinner/index.js';
	import * as Item from '$lib/components/ui/item/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as ScrollArea from '$lib/components/ui/scroll-area/index.js';
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import {
		ArrowLeft,
		Brain,
		ChevronDown,
		ChevronUp,
		Loader2,
		RefreshCcw,
		Sparkles
	} from '@lucide/svelte';

	type AlertSummary = {
		id: number;
		title: string;
		status: string;
		severity: string;
		source: string;
		started_at: string;
		resolved_at: string | null;
		log_name: string | null;
	};

	type AlertsResponse = {
		alerts: AlertSummary[];
		next_cursor: number | null;
		has_more: boolean;
	};

	type IncidentLog = {
		id: number;
		incident_id: number;
		log_name: string;
		level: string;
		message: string;
		ts: string;
	};

	type LogsResponse = {
		logs: IncidentLog[];
		next_since_id: number | null;
		has_more: boolean;
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

	type MemoryResponse = {
		memory: MemoryEntry[];
	};

	type StreamState = 'idle' | 'running' | 'done' | 'error';

	const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'https://reflexbackend-r2rk.onrender.com';

	let loading = $state(true);
	let error = $state('');
	let incident = $state<AlertSummary | null>(null);
	let logs = $state<IncidentLog[]>([]);
	let memory = $state<MemoryEntry[]>([]);
	let incidentId = $derived(Number($page.params.id));
	let sinceId = $state<number | null>(null);
	let logsPollTimer: number | null = null;
	let stream: EventSource | null = null;
	let streamState = $state<StreamState>('idle');
	let streamError = $state('');
	let investigationText = $state('');
	let postmortemText = $state('');
	let memoryDraft = $state('');
	let writingMemory = $state(false);
	let highlightedMemoryId = $state<number | null>(null);
	let thoughtOpen = $state(true);
	let streamStartedAt = $state<number | null>(null);
	let elapsedSeconds = $state(0);
	let elapsedTimer: number | null = null;

	function statusVariant(status: string) {
		return status.toLowerCase() === 'triggered' ? 'destructive' : 'secondary';
	}

	function severityVariant(severity: string) {
		const v = severity.toLowerCase();
		if (v === 'critical') return 'destructive';
		if (v === 'warn') return 'secondary';
		return 'outline';
	}

	function formatDateTime(iso: string | null) {
		if (!iso) return '—';
		return new Date(iso).toLocaleString();
	}

	function formatThoughtTimer(seconds: number) {
		if (seconds < 60) return `${seconds} second${seconds === 1 ? '' : 's'}`;
		const mins = Math.floor(seconds / 60);
		const rem = seconds % 60;
		return `${mins}m ${rem}s`;
	}

	function flashMemory(memoryId?: number) {
		if (typeof memoryId === 'number') {
			highlightedMemoryId = memoryId;
		}
		setTimeout(() => {
			highlightedMemoryId = null;
		}, 1500);
	}

	async function fetchAlertsPage(cursor?: number) {
		const params = new URLSearchParams({ limit: '100' });
		if (typeof cursor === 'number') params.set('cursor', String(cursor));
		const res = await fetch(`${API_BASE}/alerts?${params.toString()}`);
		if (!res.ok) throw new Error(`Failed to fetch alerts (${res.status})`);
		return (await res.json()) as AlertsResponse;
	}

	async function findIncidentById(targetId: number) {
		let cursor: number | null = null;
		let hasMore = true;
		let guard = 0;
		while (hasMore && guard < 30) {
			const data = await fetchAlertsPage(cursor ?? undefined);
			const found = data.alerts.find((a) => a.id === targetId);
			if (found) return found;
			hasMore = !!data.has_more;
			cursor = data.next_cursor;
			guard += 1;
		}
		return null;
	}

	async function fetchMemoryEntries() {
		const res = await fetch(`${API_BASE}/memory?limit=50`);
		if (!res.ok) throw new Error(`Failed to fetch memory (${res.status})`);
		const data = (await res.json()) as MemoryResponse;
		memory = data.memory ?? [];
	}

	async function fetchLogsInitial() {
		const res = await fetch(`${API_BASE}/incidents/${incidentId}/logs?limit=30`);
		if (!res.ok) throw new Error(`Failed to fetch logs (${res.status})`);
		const data = (await res.json()) as LogsResponse;
		logs = data.logs ?? [];
		sinceId = data.next_since_id ?? null;
	}

	async function pollLogsIncremental() {
		if (!sinceId) return;
		const res = await fetch(`${API_BASE}/incidents/${incidentId}/logs?limit=30&since_id=${sinceId}`);
		if (!res.ok) return;
		const data = (await res.json()) as LogsResponse;
		if (data.logs?.length) {
			logs = [...logs, ...data.logs];
			if (logs.length > 400) logs = logs.slice(logs.length - 400);
		}
		sinceId = data.next_since_id ?? sinceId;
	}

	function startLogsPolling() {
		stopLogsPolling();
		logsPollTimer = window.setInterval(() => {
			void pollLogsIncremental();
		}, 2500);
	}

	function stopLogsPolling() {
		if (logsPollTimer) {
			window.clearInterval(logsPollTimer);
			logsPollTimer = null;
		}
	}

	function startThoughtTimer() {
		stopThoughtTimer();
		streamStartedAt = Date.now();
		elapsedSeconds = 0;
		elapsedTimer = window.setInterval(() => {
			if (!streamStartedAt) return;
			elapsedSeconds = Math.max(0, Math.floor((Date.now() - streamStartedAt) / 1000));
		}, 1000);
	}

	function stopThoughtTimer() {
		if (elapsedTimer) {
			window.clearInterval(elapsedTimer);
			elapsedTimer = null;
		}
	}

	function stopStream() {
		if (stream) {
			stream.close();
			stream = null;
		}
		stopThoughtTimer();
	}

	function startStream() {
		if (!incident) return;
		stopStream();
		streamError = '';
		streamState = 'running';
		thoughtOpen = true;
		investigationText = '';
		postmortemText = '';
		memoryDraft = '';
		writingMemory = false;
		startThoughtTimer();

		const es = new EventSource(`${API_BASE}/stream/incidents/${incident.id}`);
		stream = es;

		es.addEventListener('investigation_delta', (ev) => {
			const data = JSON.parse((ev as MessageEvent).data);
			investigationText += data.delta ?? '';
		});

		es.addEventListener('memory_read', (ev) => {
			const data = JSON.parse((ev as MessageEvent).data);
			flashMemory(data.memory_entry_id);
		});

		es.addEventListener('memory_write_start', () => {
			writingMemory = true;
			memoryDraft = '';
			flashMemory();
		});

		es.addEventListener('memory_write_delta', (ev) => {
			const data = JSON.parse((ev as MessageEvent).data);
			memoryDraft += data.delta ?? '';
		});

		es.addEventListener('memory_write_done', async (ev) => {
			const data = JSON.parse((ev as MessageEvent).data);
			writingMemory = false;
			flashMemory(data.memory_entry_id);
			await fetchMemoryEntries();
		});

		es.addEventListener('postmortem_delta', (ev) => {
			const data = JSON.parse((ev as MessageEvent).data);
			postmortemText += data.delta ?? '';
		});

		es.addEventListener('done', () => {
			streamState = 'done';
			stopThoughtTimer();
			es.close();
			stream = null;
		});

		es.addEventListener('error', (ev) => {
			streamState = 'error';
			stopThoughtTimer();
			try {
				const data = JSON.parse((ev as MessageEvent).data);
				streamError = data.message ?? 'Stream connection error';
			} catch {
				streamError = 'Stream connection error';
			}
			es.close();
			stream = null;
		});
	}

	async function loadIncidentDetail() {
		if (!Number.isFinite(incidentId) || incidentId <= 0) {
			error = 'Invalid incident id.';
			loading = false;
			return;
		}
		loading = true;
		error = '';
		try {
			const foundIncident = await findIncidentById(incidentId);
			incident = foundIncident;
			if (!incident) {
				error = `Incident #${incidentId} not found in alerts list.`;
				loading = false;
				return;
			}
			await Promise.all([fetchLogsInitial(), fetchMemoryEntries()]);
			startLogsPolling();
			startStream();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load incident details';
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		void loadIncidentDetail();
	});

	onDestroy(() => {
		stopLogsPolling();
		stopStream();
	});
</script>

<main class="bg-background min-h-svh px-6 pb-14 pt-24 md:px-10 md:pb-20 md:pt-28">
	<section class="mx-auto w-full max-w-7xl space-y-6">
		<div class="flex flex-wrap items-center justify-between gap-3">
			<Button href="/alerts" variant="outline">
				<ArrowLeft class="size-4" />
				Back
			</Button>
			<div class="flex items-center gap-2">
				<Button variant="outline" onclick={loadIncidentDetail}>
					<RefreshCcw class="size-4" />
					Refresh
				</Button>
				<Button variant="outline" onclick={startStream} disabled={streamState === 'running' || !incident}>
					{streamState === 'running' ? 'Streaming...' : 'Restart stream'}
				</Button>
			</div>
		</div>

		{#if loading}
			<div class="max-w-md">
				<Item.Root variant="muted" class="w-full">
					<Item.Media><Spinner /></Item.Media>
					<Item.Content><Item.Title>Loading incident details...</Item.Title></Item.Content>
				</Item.Root>
			</div>
		{:else if error}
			<div class="space-y-3">
				<p class="text-sm text-red-500">{error}</p>
				<Button variant="outline" onclick={loadIncidentDetail}>Retry</Button>
			</div>
		{:else if incident}
			<div class="grid gap-6 lg:grid-cols-[2fr_1fr]">
				<div class="space-y-6">
					<Card.Card class="bg-card border-border">
						<Card.CardHeader class="space-y-4">
							<Card.CardTitle class="font-serif text-3xl italic tracking-tight">{incident.log_name ?? incident.title}</Card.CardTitle>
							<div class="flex flex-wrap items-center gap-2">
								<Badge variant={statusVariant(incident.status)}>{incident.status}</Badge>
								<Badge variant={severityVariant(incident.severity)}>{incident.severity}</Badge>
								<Badge variant="outline">{formatDateTime(incident.started_at)}</Badge>
							</div>
						</Card.CardHeader>
					</Card.Card>

					<Card.Card class="bg-card border-border">
						<Card.CardHeader>
							<Card.CardTitle class="font-serif text-2xl italic tracking-tight">Investigating:</Card.CardTitle>
						</Card.CardHeader>
						<Card.CardContent class="space-y-4">
							<Collapsible.Root bind:open={thoughtOpen}>
								<Collapsible.Trigger class="bg-muted/40 hover:bg-muted/60 flex w-full items-center justify-between rounded-md border border-border px-3 py-2 text-left transition-colors">
									<span class="flex items-center gap-2 text-sm text-muted-foreground">
										<Brain class="size-4" />
										Thought for {formatThoughtTimer(elapsedSeconds)}
									</span>
									{#if thoughtOpen}
										<ChevronUp class="size-4 text-muted-foreground" />
									{:else}
										<ChevronDown class="size-4 text-muted-foreground" />
									{/if}
								</Collapsible.Trigger>
								<Collapsible.Content class="mt-3 rounded-md border border-border bg-background/40 p-4">
									<ScrollArea.Root class="h-56">
										<div class="whitespace-pre-wrap text-lg leading-relaxed text-muted-foreground">
											{investigationText || 'Waiting for model output...'}
										</div>
									</ScrollArea.Root>
								</Collapsible.Content>
							</Collapsible.Root>

							{#if streamError}
								<p class="text-sm text-red-500">{streamError}</p>
							{/if}
						</Card.CardContent>
					</Card.Card>

					<Card.Card class="bg-card border-border">
						<Card.CardHeader>
							<Card.CardTitle class="font-serif text-2xl italic tracking-tight">Logs</Card.CardTitle>
						</Card.CardHeader>
						<Card.CardContent>
							<div class="rounded-md border border-border">
								<Table.Root>
									<Table.Header>
										<Table.Row>
											<Table.Head>Time</Table.Head>
											<Table.Head>Level</Table.Head>
											<Table.Head>Message</Table.Head>
										</Table.Row>
									</Table.Header>
									<Table.Body>
										{#each logs as log (log.id)}
											<Table.Row>
												<Table.Cell class="whitespace-nowrap text-xs tabular-nums">{formatDateTime(log.ts)}</Table.Cell>
												<Table.Cell class="text-xs uppercase">{log.level}</Table.Cell>
												<Table.Cell class="text-sm">{log.message}</Table.Cell>
											</Table.Row>
										{:else}
											<Table.Row>
												<Table.Cell colspan={3} class="h-20 text-center text-muted-foreground">No logs yet.</Table.Cell>
											</Table.Row>
										{/each}
									</Table.Body>
								</Table.Root>
							</div>
						</Card.CardContent>
					</Card.Card>

					<Card.Card class="bg-card border-border">
						<Card.CardHeader>
							<Card.CardTitle class="font-serif text-2xl italic tracking-tight">Postmortem (streaming)</Card.CardTitle>
						</Card.CardHeader>
						<Card.CardContent>
							<ScrollArea.Root class="h-56 rounded-md border border-border bg-background/40 p-4">
								<div class="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
									{postmortemText || 'Postmortem content will stream here...'}
								</div>
							</ScrollArea.Root>
						</Card.CardContent>
					</Card.Card>
				</div>

				<div class="space-y-6">
					<Card.Card class={`bg-card border-border ${highlightedMemoryId ? 'ring-primary/40 ring-2' : ''}`}>
						<Card.CardHeader class="flex flex-row items-center justify-between">
							<Card.CardTitle class="font-serif text-3xl italic tracking-tight">Memory</Card.CardTitle>
							{#if streamState === 'running'}
								<Badge variant="outline" class="gap-1">
									<Loader2 class="size-3 animate-spin" />
									Streaming
								</Badge>
							{/if}
						</Card.CardHeader>
						<Card.CardContent class="space-y-4">
							{#if writingMemory}
								<Item.Root variant="muted" class="w-full">
									<Item.Media><Sparkles class="text-primary size-4" /></Item.Media>
									<Item.Content>
										<Item.Title>Writing memory...</Item.Title>
									</Item.Content>
								</Item.Root>
							{/if}

							{#if memoryDraft}
								<div class="rounded-md border border-primary/30 bg-primary/5 p-3">
									<p class="text-xs uppercase tracking-wide text-primary">Draft</p>
									<p class="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{memoryDraft}</p>
								</div>
							{/if}

							<ScrollArea.Root class="h-[420px]">
								<div class="space-y-3 pe-2">
									{#each memory as entry (entry.id)}
										<div class={`rounded-md border p-3 transition-colors ${highlightedMemoryId === entry.id ? 'border-primary bg-primary/10' : 'border-border bg-background/40'}`}>
											<div class="flex items-center justify-between gap-2">
												<p class="text-sm font-medium">{entry.title}</p>
												<Badge variant="outline">{entry.last_updated_by}</Badge>
											</div>
											<p class="mt-2 line-clamp-3 text-xs text-muted-foreground">{entry.body_markdown}</p>
											{#if entry.tags?.length}
												<div class="mt-2 flex flex-wrap gap-1">
													{#each entry.tags.slice(0, 3) as tag}
														<Badge variant="secondary" class="text-[10px]">{tag}</Badge>
													{/each}
												</div>
											{/if}
										</div>
									{:else}
										<p class="text-sm text-muted-foreground">No memory entries available.</p>
									{/each}
								</div>
							</ScrollArea.Root>
						</Card.CardContent>
					</Card.Card>

					<Card.Card class="bg-card border-border">
						<Card.CardContent class="pt-6">
							<div class="space-y-2 text-sm">
								<div class="flex items-center justify-between">
									<span class="text-muted-foreground">Incident ID</span>
									<span>{incident.id}</span>
								</div>
								<Separator />
								<div class="flex items-center justify-between">
									<span class="text-muted-foreground">Source</span>
									<span>{incident.source}</span>
								</div>
								<Separator />
								<div class="flex items-center justify-between">
									<span class="text-muted-foreground">Logs loaded</span>
									<span>{logs.length}</span>
								</div>
							</div>
						</Card.CardContent>
					</Card.Card>
				</div>
			</div>
		{/if}
	</section>
</main>
