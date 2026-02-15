<script>
    import { cn } from "$lib/utils";
    let { class: className, children } = $props();
</script>
<h3 class={cn("text-sm font-medium leading-none", className)}>{@render children()}</h3>