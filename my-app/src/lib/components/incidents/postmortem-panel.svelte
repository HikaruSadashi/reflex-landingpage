<script lang="ts">
	// @ts-nocheck
	import { tick } from 'svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Response } from '$lib/components/ai-elements/response/index.js';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	import { FileText, Loader2, Pencil, Eye } from '@lucide/svelte';

	type PanelState = 'idle' | 'running' | 'done' | 'error';
	type ViewMode = 'render' | 'edit';

	let {
		panelState,
		content,
		error,
		editValue,
		isSaving,
		onEditInput,
		onSave,
		onCreate
	}: {
		panelState: PanelState;
		content: string;
		error: string;
		editValue: string;
		isSaving: boolean;
		onEditInput: (value: string) => void;
		onSave: () => void;
		onCreate: () => void;
	} = $props();

	let viewMode = $state<ViewMode>('render');
	let scroller = $state<HTMLDivElement | null>(null);

	async function scrollToBottom() {
		if (!scroller) return;
		await tick();
		scroller.scrollTop = scroller.scrollHeight;
	}

	$effect(() => {
		content;
		panelState;
		void scrollToBottom();
	});

	// When generation finishes, show rendered markdown
	$effect(() => {
		if (panelState === 'done') viewMode = 'render';
	});
</script>

<div class="w-full rounded-lg border border-[rgba(255,255,255,0.18)] p-4">
	{#if panelState === 'idle'}
		<Button class="w-full" variant="outline" onclick={onCreate}>
			<FileText class="size-4" />
			Create Post Mortem
		</Button>
	{:else}
		<div class="mb-3 flex items-center justify-between">
			<h3 class="font-serif text-xl italic tracking-tight">Post Mortem</h3>
			<Badge
				variant={panelState === 'running' ? 'secondary' : panelState === 'error' ? 'destructive' : 'outline'}
			>
				{panelState === 'running' ? 'Streaming' : panelState}
			</Badge>
		</div>
		<div
			bind:this={scroller}
			class="stream-scrollbar streaming-content max-h-[320px] overflow-auto rounded-md border border-border bg-background/40 p-4"
		>
			{#if panelState === 'error' && error}
				<p class="text-sm text-red-400">{error}</p>
			{:else if content && viewMode === 'render'}
				<Response content={content} class="prose prose-sm dark:prose-invert max-w-none" />
			{:else if panelState === 'done' && viewMode === 'edit'}
				<Textarea
					class="min-h-[200px] w-full resize-none border-0 bg-transparent p-0 focus-visible:ring-0"
					value={editValue}
					oninput={(e) => onEditInput(e.currentTarget.value)}
					onchange={(e) => onEditInput(e.currentTarget.value)}
				/>
			{:else if panelState === 'running'}
				<p class="text-sm text-muted-foreground">Generating postmortem...</p>
			{:else}
				<p class="text-sm text-muted-foreground">No postmortem content yet.</p>
			{/if}
		</div>
		{#if panelState === 'running'}
			<div class="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
				<Loader2 class="size-3 animate-spin" />
				Streaming markdown response...
			</div>
		{:else if panelState === 'done' && content}
			<div class="mt-3 flex flex-wrap items-center justify-end gap-2">
				<Button
					variant="outline"
					size="sm"
					onclick={() => (viewMode = viewMode === 'render' ? 'edit' : 'render')}
				>
					{#if viewMode === 'render'}
						<Pencil class="size-4" />
						Edit
					{:else}
						<Eye class="size-4" />
						Preview
					{/if}
				</Button>
				{#if viewMode === 'edit'}
					<Button variant="outline" size="sm" onclick={onSave} disabled={isSaving}>
						{isSaving ? 'Saving...' : 'Save'}
					</Button>
				{/if}
			</div>
		{/if}
	{/if}
</div>
