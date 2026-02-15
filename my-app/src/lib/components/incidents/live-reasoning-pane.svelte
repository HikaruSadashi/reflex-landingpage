<script lang="ts">
	// @ts-nocheck
	import { tick } from 'svelte';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Response } from '$lib/components/ai-elements/response/index.js';

	type StreamState = 'idle' | 'running' | 'done' | 'error';

	let {
		streamState,
		streamError,
		reasoningMarkdown
	}: {
		streamState: StreamState;
		streamError: string;
		reasoningMarkdown: string;
	} = $props();

	let scroller: HTMLDivElement | null = null;

	async function scrollToBottom() {
		if (!scroller) return;
		await tick();
		scroller.scrollTop = scroller.scrollHeight;
	}

	$effect(() => {
		reasoningMarkdown;
		void scrollToBottom();
	});
</script>

<div class="h-full p-6">
	<div class="mb-4 flex items-center justify-between">
		<h2 class="font-serif text-2xl italic tracking-tight">Live reasoning</h2>
		<Badge variant={streamState === 'running' ? 'secondary' : 'outline'}>
			{streamState === 'running' ? 'Streaming' : streamState}
		</Badge>
	</div>

	<div
		bind:this={scroller}
		class={`stream-scrollbar h-[380px] overflow-auto rounded-md border border-border bg-background/40 p-4 ${streamState === 'running' ? 'streaming-content' : ''}`}
	>
		{#if streamError}
			<p class="text-sm text-red-500">{streamError}</p>
		{:else if reasoningMarkdown}
			<Response content={reasoningMarkdown} class="prose prose-sm dark:prose-invert max-w-none" />
		{:else}
			<p class="text-sm text-muted-foreground">Waiting for model reasoning...</p>
		{/if}
	</div>
</div>
