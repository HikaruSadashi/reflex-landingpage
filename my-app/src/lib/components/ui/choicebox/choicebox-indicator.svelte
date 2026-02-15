<script>
	import { cn } from '$lib/utils';
	import { Check } from '@lucide/svelte';

	let { class: className } = $props();
</script>

<div class={cn('flex shrink-0 items-center justify-center', className)}>
	<div
		class="h-4 w-4 rounded-[4px] border border-primary text-primary shadow-sm flex items-center justify-center ring-offset-background"
	>
		<Check class="h-3 w-3 opacity-0 scale-75 transition-all duration-200 group-data-[state=checked]:opacity-100 group-data-[state=checked]:scale-100" />
	</div>
</div>