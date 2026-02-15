<script lang="ts">
	// @ts-nocheck
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
</script>

<div class="h-full p-6">
	<div class="mb-4 flex items-center justify-between">
		<h2 class="font-serif text-2xl italic tracking-tight">Live reasoning</h2>
		<Badge variant={streamState === 'running' ? 'secondary' : 'outline'}>
			{streamState === 'running' ? 'Streaming' : streamState}
		</Badge>
	</div>

	<div class="h-[380px] overflow-auto rounded-md border border-border bg-background/40 p-4">
		{#if streamError}
			<p class="text-sm text-red-500">{streamError}</p>
		{:else if reasoningMarkdown}
			<Response content={reasoningMarkdown} class="prose prose-sm dark:prose-invert max-w-none" />
		{:else}
			<p class="text-sm text-muted-foreground">Waiting for model reasoning...</p>
		{/if}
	</div>
</div>
