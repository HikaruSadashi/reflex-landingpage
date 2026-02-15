<script>
    import { cn } from "$lib/utils";
    let { class: className, children } = $props();
</script>
<p class={cn("text-xs text-muted-foreground", className)}>{@render children()}</p>