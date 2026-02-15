<script>
    import { cn } from "$lib/utils";
    let { class: className, children } = $props();
</script>
<p class={cn("text-sm text-muted-foreground leading-normal", className)}>
    {@render children()}
</p>