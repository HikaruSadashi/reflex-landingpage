<script>
	import { cn } from '$lib/utils';
	import { getChoiceboxContext } from './ctx';
	let {
		value,
		class: className,
		children,
		disabled = false
	} = $props();

	const ctx = getChoiceboxContext();
	let isSelected = $derived(ctx.isSelected(value));
	let isMultiple = $derived(ctx.multiple());

	function handleClick() {
		if (!disabled) {
			ctx.setActive(value);
		}
	}
</script>

<button
	type="button"
	role={isMultiple ? 'checkbox' : 'radio'}
	aria-checked={isSelected}
	{disabled}
	onclick={handleClick}
	data-state={isSelected ? 'checked' : 'unchecked'}
	class={cn(
		'relative flex cursor-pointer items-start gap-4 rounded-lg border p-4 shadow-sm outline-none transition-all',
		'border-input bg-card hover:bg-accent/50 hover:text-accent-foreground',
		'data-[state=checked]:border-primary data-[state=checked]:ring-1 data-[state=checked]:ring-primary',
		disabled && 'cursor-not-allowed opacity-50',
		className
	)}
>
	{@render children()}
</button>