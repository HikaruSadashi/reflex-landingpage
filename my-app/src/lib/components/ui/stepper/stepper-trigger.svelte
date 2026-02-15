<script>
    import { cn } from "$lib/utils";
    import { Button } from "$lib/components/ui/button";
    import { getStepperContext } from "./ctx";
    let { step, class: className, children, ...rest } = $props();

    const ctx = getStepperContext();
    let isVertical = $derived(ctx.orientation() === "vertical");
</script>

<Button
        variant="ghost"
        onclick={() => ctx.setStep(step)}
        class={cn(
        "flex h-auto items-center justify-center gap-3 p-2 hover:bg-transparent",
        !isVertical && "flex-col",
        isVertical && "flex-row justify-start",
        className
    )}
        {...rest}
>
    {@render children()}
</Button>