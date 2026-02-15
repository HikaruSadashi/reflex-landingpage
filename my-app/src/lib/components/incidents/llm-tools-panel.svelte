<script lang="ts">
	import type { Component } from 'svelte';
	import Database from '@lucide/svelte/icons/database';
	import Rocket from '@lucide/svelte/icons/rocket';
	import Code2 from '@lucide/svelte/icons/code-2';
	import FileSearch from '@lucide/svelte/icons/file-search';
	import * as ButtonGroup from '$lib/components/ui/button-group/index.js';
	import * as ToggleGroup from '$lib/components/ui/toggle-group/index.js';

	type ToolDef = {
		id: string;
		label: string;
		icon: Component;
		suffix?: string;
	};
	const TOOLS: ToolDef[] = [
		{ id: 'query-db', label: 'Query DB', icon: Database },
		{ id: 'deploy', label: 'Deploy', icon: Rocket },
		{ id: 'search-code', label: 'Search code', icon: Code2, suffix: 'GitHub connected' },
		{ id: 'query-logs', label: 'Query logs', icon: FileSearch, suffix: 'connected' },
	];

	let enabledTools = $state<string[]>(TOOLS.map((t) => t.id));
</script>

<div class="rounded-md border border-[rgba(255,255,255,0.18)] p-3">
	<div class="mb-2 text-xs font-medium text-muted-foreground">
		Tools available to LLM
	</div>
	<ButtonGroup.Root class="flex flex-wrap">
		<ToggleGroup.Root
			type="multiple"
			bind:value={enabledTools}
			variant="outline"
			size="sm"
			spacing={0}
			class="inline-flex rounded-md"
		>
			{#each TOOLS as tool}
				{@const Icon = tool.icon}
				<ToggleGroup.Item value={tool.id} class="gap-1.5" size="sm" variant="outline">
					<Icon class="size-4 shrink-0" />
					<span>{tool.label}</span>
					{#if tool.suffix}
						<span class="text-muted-foreground">({tool.suffix})</span>
					{/if}
				</ToggleGroup.Item>
			{/each}
		</ToggleGroup.Root>
	</ButtonGroup.Root>
</div>
