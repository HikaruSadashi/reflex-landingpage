<script lang="ts">
	import { onMount } from 'svelte';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Spinner } from '$lib/components/ui/spinner/index.js';
	import { ArrowLeft, Play } from '@lucide/svelte';

	type RlRecord = {
		id: string;
		incident_id: number;
		incident_title?: string;
		action_type: string;
		outcome: string;
		recorded_at: string;
	};

	const API_BASE =
		import.meta.env.VITE_API_BASE_URL ?? 'https://reflexbackend-r2rk.onrender.com';

	let records = $state<RlRecord[]>([]);
	let loading = $state(true);
	let error = $state('');
	let trainDialogOpen = $state(false);
	let trainSubmitting = $state(false);
	let trainError = $state('');
	let jobId = $state<string | null>(null);
	let jobStatus = $state<string | null>(null);

	function formatTime(iso: string) {
		try {
			return new Date(iso).toLocaleString(undefined, {
				dateStyle: 'short',
				timeStyle: 'short'
			});
		} catch {
			return iso;
		}
	}

	async function load() {
		loading = true;
		error = '';
		try {
			const res = await fetch(`${API_BASE}/rl-dataset`);
			if (!res.ok) {
				records = [];
				return;
			}
			const contentType = res.headers.get('content-type') ?? '';
			if (!contentType.includes('application/json')) {
				records = [];
				return;
			}
			records = await res.json();
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load dataset';
			records = [];
		} finally {
			loading = false;
		}
	}

	async function startTraining() {
		trainSubmitting = true;
		trainError = '';
		jobId = null;
		jobStatus = null;
		try {
			const res = await fetch(`${API_BASE}/train`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ dataset_snapshot: records })
			});
			const data = await res.json().catch(() => ({}));
			if (
				res.status === 501 ||
				res.status === 503 ||
				data.error === 'not_implemented' ||
				data.error === 'modal_not_configured'
			) {
				trainError = 'not_implemented';
				return;
			}
			if (!res.ok) {
				trainError = data.message ?? data.error ?? 'Failed to start training';
				return;
			}
			jobId = data.job_id ?? null;
			jobStatus = data.status ?? 'pending';
			if (jobId && jobStatus === 'pending') pollJobStatus(jobId);
		} catch (e) {
			trainError = e instanceof Error ? e.message : 'Request failed';
		} finally {
			trainSubmitting = false;
		}
	}

	async function pollJobStatus(id: string) {
		try {
			const res = await fetch(`${API_BASE}/train/${id}`);
			if (!res.ok) return;
			const data = await res.json();
			if (data.error === 'not_implemented') return;
			jobStatus = data.status ?? jobStatus;
			if (data.status === 'pending' || data.status === 'running') {
				setTimeout(() => pollJobStatus(id), 2000);
			}
		} catch {
			// ignore
		}
	}

	function closeTrainDialog() {
		trainDialogOpen = false;
		trainError = '';
		jobId = null;
		jobStatus = null;
	}

	onMount(() => {
		void load();
	});
</script>

<main class="bg-background min-h-svh px-6 pb-14 pt-24 md:px-10 md:pb-20 md:pt-28">
	<section class="mx-auto w-full max-w-6xl space-y-8">
		<header class="flex flex-wrap items-center justify-between gap-4">
			<div class="space-y-2">
				<h1 class="font-serif text-5xl italic tracking-tight md:text-6xl">RL</h1>
				<p class="text-muted-foreground max-w-2xl text-sm leading-relaxed">
					Reinforcement learning on incident response: we farm data from every action, investigation step, and outcome
					to build a persistent dataset. That dataset trains our own model—like Compose for incident response—with
					post-training and RL so the system gets better over time from real usage.
				</p>
			</div>
			<div class="flex flex-wrap items-center gap-2">
				<Dialog.Root bind:open={trainDialogOpen}>
					<Dialog.Trigger>
						<Button type="button" variant="default" class="" disabled={false}>
							<Play class="size-4" />
							Train model
						</Button>
					</Dialog.Trigger>
					<Dialog.Content class="" portalProps={{}} showCloseButton={true}>
						<Dialog.Header class="">
							<Dialog.Title class="">Train on dataset</Dialog.Title>
							<Dialog.Description class="">
								Start training on Modal using the collected RL dataset. Requires reflex-backend with
								<code class="rounded bg-black/20 px-1">MODAL_TOKEN_ID</code> and
								<code class="rounded bg-black/20 px-1">MODAL_TOKEN_SECRET</code> set.
							</Dialog.Description>
						</Dialog.Header>
						<form
							class="space-y-4"
							onsubmit={(e) => {
								e.preventDefault();
								startTraining();
							}}
						>
							{#if trainError === 'not_implemented'}
								<div class="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-200">
									Training is not configured. In reflex-backend set <strong>MODAL_TOKEN_ID</strong> and
									<strong>MODAL_TOKEN_SECRET</strong>, then deploy a Modal app named
									<code class="rounded bg-black/20 px-1">reflex-rl-training</code> with a function
									<code class="rounded bg-black/20 px-1">train</code>. See docs/MODAL_INTEGRATION.md.
								</div>
							{:else if trainError}
								<p class="text-sm text-red-400">{trainError}</p>
							{:else if jobId}
								<div class="rounded-md border border-[rgba(255,255,255,0.18)] bg-muted/30 p-3 text-sm">
									<p class="font-medium">Job started</p>
									<p class="font-mono text-xs text-muted-foreground">{jobId}</p>
									{#if jobStatus}
										<p class="mt-1">Status: {jobStatus}</p>
									{/if}
								</div>
							{/if}
							<Dialog.Footer class="">
								<Button type="button" variant="outline" class="" disabled={false} onclick={closeTrainDialog}>
									{jobId ? 'Close' : 'Cancel'}
								</Button>
								{#if !jobId}
									<Button type="submit" class="" disabled={trainSubmitting}>
										{#if trainSubmitting}
											<Spinner class="size-4" />
										{/if}
										{trainSubmitting ? 'Starting…' : 'Start'}
									</Button>
								{/if}
							</Dialog.Footer>
						</form>
					</Dialog.Content>
				</Dialog.Root>
				<Button href="/incidents" variant="outline" class="" disabled={false}>
					<ArrowLeft class="size-4" />
					Incidents
				</Button>
			</div>
		</header>

		{#if loading}
			<div class="flex max-w-md items-center gap-3 rounded-md border border-[rgba(255,255,255,0.18)] bg-muted/30 p-4">
				<Spinner class="" />
				<span class="text-sm">Loading dataset...</span>
			</div>
		{:else if error}
			<div class="space-y-3">
				<p class="text-sm text-red-500">{error}</p>
				<Button variant="outline" class="" disabled={false} onclick={() => load()}>Retry</Button>
			</div>
		{:else}
			<div class="rounded-md border border-[rgba(255,255,255,0.18)]">
				<Table.Root class="">
					<Table.Caption class="">A list of collected RL dataset events (actions and outcomes).</Table.Caption>
					<Table.Header class="">
						<Table.Row class="">
							<Table.Head class="w-[120px]">Event</Table.Head>
							<Table.Head class="">Incident</Table.Head>
							<Table.Head class="">Action type</Table.Head>
							<Table.Head class="">Outcome</Table.Head>
							<Table.Head class="text-end">Recorded</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body class="">
						{#each records as record (record.id)}
							<Table.Row class="">
								<Table.Cell class="font-mono text-xs">{record.id}</Table.Cell>
								<Table.Cell class="font-medium">
									#{record.incident_id}
									{#if record.incident_title}
										<span class="text-muted-foreground block text-xs">{record.incident_title}</span>
									{/if}
								</Table.Cell>
								<Table.Cell class="">{record.action_type}</Table.Cell>
								<Table.Cell class="">{record.outcome}</Table.Cell>
								<Table.Cell class="text-end text-muted-foreground">{formatTime(record.recorded_at)}</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
					<Table.Footer class="">
						<Table.Row class="">
							<Table.Cell class="" colspan={4}>{records.length} event(s)</Table.Cell>
							<Table.Cell class="text-end">—</Table.Cell>
						</Table.Row>
					</Table.Footer>
				</Table.Root>
			</div>
		{/if}
	</section>
</main>
