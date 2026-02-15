<script module>
	import { cn } from "$lib/utils";

</script>

<script>
	import { setStickToBottomContext } from "./stick-to-bottom-context.svelte.js";

	let {
		class: className,
		children,
		initial = "smooth",
		resize = "smooth",
		ref = $bindable(null),
		...restProps
	} = $props();

	let context = setStickToBottomContext();
</script>

<div
	bind:this={ref}
	class={cn("relative flex h-full flex-col overflow-hidden", className)}
	role="log"
	{...restProps}
>
	{@render children?.()}
</div>