<script lang="ts">
	// @ts-nocheck
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Response } from '$lib/components/ai-elements/response/index.js';
	import { FileText, Loader2 } from '@lucide/svelte';

	type PanelState = 'idle' | 'running' | 'done' | 'error';

	let {
		state,
		content,
		error,
		onCreate
	}: {
		state: PanelState;
		content: string;
		error: string;
		onCreate: () => void;
	} = $props();
</script>

<div class="w-full rounded-lg border border-[rgba(255,255,255,0.18)] p-4">
	{#if state === 'idle'}
		<Button class="w-full" variant="outline" onclick={onCreate}>
			<FileText class="size-4" />
			Create Post Mortem
		</Button>
	{:else}
		<div class="mb-3 flex items-center justify-between">
			<h3 class="font-serif text-xl italic tracking-tight">Post Mortem</h3>
			<Badge variant={state === 'running' ? 'secondary' : state === 'error' ? 'destructive' : 'outline'}>
				{state === 'running' ? 'Streaming' : state}
			</Badge>
		</div>
		<div class="stream-scrollbar streaming-content max-h-[320px] overflow-auto rounded-md border border-border bg-background/40 p-4">
			{#if state === 'error' && error}
				<p class="text-sm text-red-400">{error}</p>
			{:else if content}
				<Response content={content} class="prose prose-sm dark:prose-invert max-w-none" />
			{:else if state === 'running'}
				<p class="text-sm text-muted-foreground">Generating postmortem...</p>
			{:else}
				<p class="text-sm text-muted-foreground">No postmortem content yet.</p>
			{/if}
		</div>
		{#if state === 'running'}
			<div class="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
				<Loader2 class="size-3 animate-spin" />
				Streaming markdown response...
			</div>
		{/if}
	{/if}
</div>
