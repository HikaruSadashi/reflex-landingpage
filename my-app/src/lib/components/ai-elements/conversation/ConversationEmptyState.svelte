<script module>
	import { cn } from "$lib/utils";

</script>

<script>
	let {
		class: className,
		title = "No messages yet",
		description = "Start a conversation to see messages here",
		icon,
		children,
		ref = $bindable(null),
		...restProps
	} = $props();
</script>

<div
	bind:this={ref}
	class={cn(
		"flex size-full flex-col items-center justify-center gap-3 p-8 text-center",
		className
	)}
	{...restProps}
>
	{#if children}
		{@render children?.()}
	{:else}
		{#if icon}
			<div class="text-muted-foreground">
				{@render icon()}
			</div>
		{/if}
		<div class="space-y-1">
			<h3 class="text-sm font-medium">{title}</h3>
			{#if description}
				<p class="text-muted-foreground text-sm">{description}</p>
			{/if}
		</div>
	{/if}
</div>