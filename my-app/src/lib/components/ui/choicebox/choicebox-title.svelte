<script>
    import { cn } from "$lib/utils";
    let { class: className, children } = $props();
</script>
<h3 class={cn("font-semibold leading-none tracking-tight", className)}>
    {@render children()}
</h3>