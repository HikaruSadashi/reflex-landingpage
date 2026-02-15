<script lang="ts">
	import { onMount } from 'svelte';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Spinner } from '$lib/components/ui/spinner/index.js';
	import { ArrowLeft } from '@lucide/svelte';

	type RlRecord = {
		id: string;
		incident_id: number;
		incident_title?: string;
		action_type: string;
		outcome: string;
		recorded_at: string;
	};

	let records = $state<RlRecord[]>([]);
	let loading = $state(true);
	let error = $state('');

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
			const res = await fetch('/api/rl-dataset');
			if (!res.ok) throw new Error('Failed to load dataset');
			records = await res.json();
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load dataset';
			records = [];
		} finally {
			loading = false;
		}
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
			<Button href="/incidents" variant="outline" class="" disabled={false}>
				<ArrowLeft class="size-4" />
				Incidents
			</Button>
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
