<script>
	import { cn } from '$lib/utils';
	import { setStepperContext } from './ctx';
	let {
		value = $bindable(0),
		orientation = 'horizontal',
		class: className,
		children
	} = $props();

	setStepperContext({
		activeStep: () => value,
		setStep: (s) => {
			value = s;
		},
		orientation: () => orientation
	});
</script>

<div
	class={cn(
		'flex w-full gap-4',
		orientation === 'vertical' ? 'flex-col' : 'flex-row items-start justify-between',
		className
	)}
>
	{@render children()}
</div>