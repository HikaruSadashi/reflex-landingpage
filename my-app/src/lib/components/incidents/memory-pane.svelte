<script lang="ts">
	// @ts-nocheck
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';

	let {
		title,
		body,
		lastUpdatedBy,
		isSaving,
		saveError,
		active,
		onTitleInput,
		onBodyInput,
		onSave
	}: {
		title: string;
		body: string;
		lastUpdatedBy: 'user' | 'ai' | '';
		isSaving: boolean;
		saveError: string;
		active: boolean;
		onTitleInput: (value: string) => void;
		onBodyInput: (value: string) => void;
		onSave: () => void;
	} = $props();
</script>

<div class="h-full p-6">
	<div class="mb-4 flex items-center justify-between gap-3">
		<div>
			<h2 class="font-serif text-2xl italic tracking-tight">Memory</h2>
			<p class="text-xs text-muted-foreground">Shared memory for user and agent updates.</p>
		</div>
		<div class="flex items-center gap-2">
			{#if lastUpdatedBy}
				<Badge variant="outline">Last update: {lastUpdatedBy}</Badge>
			{/if}
			<Button variant="outline" size="sm" onclick={onSave} disabled={isSaving}>
				{isSaving ? 'Saving...' : 'Save'}
			</Button>
		</div>
	</div>

	<div class={`space-y-3 rounded-md border p-3 ${active ? 'agent-working-border' : 'border-border'}`}>
		<Input
			placeholder="Memory title"
			value={title}
			oninput={(e) => onTitleInput(e.currentTarget.value)}
			onchange={(e) => onTitleInput(e.currentTarget.value)}
		/>
		<Textarea
			class="min-h-[300px] resize-none"
			placeholder="Write persistent memory notes..."
			value={body}
			oninput={(e) => onBodyInput(e.currentTarget.value)}
			onchange={(e) => onBodyInput(e.currentTarget.value)}
		/>
		{#if saveError}
			<p class="text-xs text-red-400">{saveError}</p>
		{/if}
	</div>
</div>
