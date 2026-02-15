<script module>
	import { cn } from "$lib/utils";

</script>

<script>
	import { getStickToBottomContext } from "./stick-to-bottom-context.svelte.js";
	import { watch } from "runed";

	let {
		class: className,
		children,
		ref = $bindable(null),
		...restProps
	} = $props();

	const context = getStickToBottomContext();
	let element;

	watch(
		() => element,
		() => {
			if (element) {
				context.setElement(element);
				// Initial scroll to bottom
				context.scrollToBottom("smooth");
			}
		}
	);
</script>

<div
	bind:this={element}
	bind:this={ref}
	class={cn("flex-1 overflow-y-auto p-4", className)}
	{...restProps}
>
	{@render children?.()}
</div>