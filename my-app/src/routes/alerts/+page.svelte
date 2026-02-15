<script>
	import { Button } from '$lib/components/ui/button';
	import { Bell, ShieldCheck } from '@lucide/svelte';
</script>

<main class="bg-background flex min-h-svh items-center justify-center px-6 py-14 md:px-10 md:py-20">
	<section class="bg-card border-border w-full max-w-3xl rounded-xl border p-8 md:p-12">
		<div class="space-y-6">
			<div class="flex items-center gap-3">
				<div class="bg-primary/15 text-primary flex size-10 items-center justify-center rounded-lg">
					<Bell class="size-5" />
				</div>
				<h1 class="text-2xl font-semibold tracking-tight">Alerts</h1>
			</div>

			<p class="text-muted-foreground text-sm leading-relaxed">
				You are now in the alerts workspace. Your onboarding selections were captured and setup is complete.
			</p>

			<div class="bg-background border-border rounded-lg border p-5">
				<div class="flex items-start gap-3">
					<ShieldCheck class="text-primary mt-0.5 size-5" />
					<div class="space-y-1">
						<p class="text-sm font-medium">Ready for incoming incidents</p>
						<p class="text-muted-foreground text-xs">Connect live alert streams and start mitigation workflows.</p>
					</div>
				</div>
			</div>

			<div class="pt-2">
				<Button href="/app" variant="outline">Back to onboarding</Button>
			</div>
		</div>
	</section>
</main>
