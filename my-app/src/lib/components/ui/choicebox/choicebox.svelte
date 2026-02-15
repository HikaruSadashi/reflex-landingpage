<script>
	import { cn } from '$lib/utils';
	import { setChoiceboxContext } from './ctx';
	let {
		value = $bindable(),
		multiple = false,
		class: className,
		children,
		name,
		onValueChange
	} = $props();

	function normalizeList(v) {
		if (Array.isArray(v)) return v;
		if (v == null || v === '') return [];
		return [v];
	}

	setChoiceboxContext({
		multiple: () => multiple,
		activeValue: () => value,
		isSelected: (v) => (multiple ? normalizeList(value).includes(v) : value === v),
		setActive: (v) => {
			if (multiple) {
				const current = normalizeList(value);
				value = current.includes(v) ? current.filter((item) => item !== v) : [...current, v];
			} else {
				value = v;
			}
			if (onValueChange) {
				onValueChange(v);
			}
		}
	});
</script>

<div class={cn('flex flex-col gap-3', className)} role={multiple ? 'group' : 'radiogroup'} aria-label={name}>
	{@render children()}
	{#if name}
		{#if multiple}
			{#each normalizeList(value) as selected}
				<input type="hidden" {name} value={selected} />
			{/each}
		{:else}
			<input type="hidden" {name} {value} />
		{/if}
	{/if}
</div>