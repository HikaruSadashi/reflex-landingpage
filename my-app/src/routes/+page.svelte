<script>
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import {
		Zap,
		Brain,
		Shield,
		Play,
		ArrowRight,
		FlaskConical,
		Repeat,
		Dumbbell,
		UserCog
	} from '@lucide/svelte';

	let email = $state('');
</script>

<!-- ===== NAV ===== -->
<nav class="fixed top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
	<div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
		<a href="/" class="text-lg font-semibold tracking-tight">Reflex</a>
		<div class="hidden items-center gap-8 md:flex">
			<a href="#demo" class="text-sm text-muted-foreground transition-colors hover:text-foreground">Demo</a>
			<a href="#how-it-works" class="text-sm text-muted-foreground transition-colors hover:text-foreground">How it works</a>
			<a href="#features" class="text-sm text-muted-foreground transition-colors hover:text-foreground">Features</a>
			<a href="#waitlist" class="text-sm text-muted-foreground transition-colors hover:text-foreground">Waitlist</a>
		</div>
		<Button href="#waitlist" size="sm">Get early access</Button>
	</div>
</nav>

<!-- ===== HERO ===== -->
<section class="flex min-h-screen flex-col items-center justify-center px-6 pt-16 text-center">
	<div class="mx-auto max-w-3xl space-y-8">
		<Badge variant="outline" class="text-muted-foreground">Coming 2026</Badge>

		<h1 class="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
			PagerDuty for the AI era.
		</h1>

		<p class="text-xl text-muted-foreground sm:text-2xl">
			Incidents resolved before they page you.
		</p>

		<p class="text-sm text-muted-foreground/70">
			Production systems with reflexes.
		</p>

		<div class="flex items-center justify-center gap-4">
			<Button href="#demo" variant="outline" size="lg">
				<Play class="size-4" />
				Watch demo
			</Button>
			<Button href="#waitlist" size="lg">
				Join waitlist
				<ArrowRight class="size-4" />
			</Button>
		</div>

		<p class="text-xs text-muted-foreground/50">
			Outages shouldn't repeat.
		</p>
	</div>
</section>

<!-- ===== DEMO ===== -->
<section id="demo" class="px-6 py-32">
	<div class="mx-auto max-w-6xl">
		<h2 class="mb-16 text-center text-3xl font-semibold tracking-tight sm:text-4xl">
			See it fix an incident.
		</h2>

		<div class="grid items-center gap-12 lg:grid-cols-[1fr_auto]">
			<div class="aspect-video w-full overflow-hidden rounded-lg border border-border/50 bg-card">
				<!-- Replace with real demo link -->
				<iframe
					class="h-full w-full"
					src="about:blank"
					title="Reflex demo"
					frameborder="0"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
					allowfullscreen
				></iframe>
			</div>

			<div class="flex flex-col gap-4 lg:gap-6">
				<p class="text-2xl font-semibold tracking-tight">Detect.</p>
				<p class="text-2xl font-semibold tracking-tight">Mitigate.</p>
				<p class="text-2xl font-semibold tracking-tight">Remember.</p>
				<p class="text-2xl font-semibold tracking-tight text-muted-foreground">Repeat — faster.</p>
			</div>
		</div>
	</div>
</section>

<Separator class="mx-auto max-w-6xl opacity-50" />

<!-- ===== VALUE ===== -->
<section class="px-6 py-32">
	<div class="mx-auto max-w-6xl">
		<h2 class="mb-16 text-center text-3xl font-semibold tracking-tight sm:text-4xl">
			Stop paging humans for the same failure.
		</h2>

		<div class="grid gap-8 md:grid-cols-3">
			<Card.Card class="border-border/50 bg-card/50">
				<Card.CardHeader>
					<div class="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10">
						<Zap class="size-5 text-primary" />
					</div>
					<Card.CardTitle class="text-lg">Autonomous mitigation</Card.CardTitle>
				</Card.CardHeader>
				<Card.CardContent>
					<p class="text-sm text-muted-foreground">Rollback. Restart. Scale. Validate.</p>
				</Card.CardContent>
			</Card.Card>

			<Card.Card class="border-border/50 bg-card/50">
				<Card.CardHeader>
					<div class="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10">
						<Brain class="size-5 text-primary" />
					</div>
					<Card.CardTitle class="text-lg">Operational memory</Card.CardTitle>
				</Card.CardHeader>
				<Card.CardContent>
					<p class="text-sm text-muted-foreground">Executable postmortems.</p>
				</Card.CardContent>
			</Card.Card>

			<Card.Card class="border-border/50 bg-card/50">
				<Card.CardHeader>
					<div class="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10">
						<Shield class="size-5 text-primary" />
					</div>
					<Card.CardTitle class="text-lg">Self-improving reliability</Card.CardTitle>
				</Card.CardHeader>
				<Card.CardContent>
					<p class="text-sm text-muted-foreground">Every incident makes you stronger.</p>
				</Card.CardContent>
			</Card.Card>
		</div>
	</div>
</section>

<Separator class="mx-auto max-w-6xl opacity-50" />

<!-- ===== HOW IT WORKS ===== -->
<section id="how-it-works" class="px-6 py-32">
	<div class="mx-auto max-w-4xl">
		<h2 class="mb-16 text-center text-3xl font-semibold tracking-tight sm:text-4xl">
			From alert to autonomous fix.
		</h2>

		<div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
			{#each [
				{ step: '01', text: 'Detect a failure signature' },
				{ step: '02', text: 'Match past incidents' },
				{ step: '03', text: 'Test mitigation safely' },
				{ step: '04', text: 'Apply and store the playbook' }
			] as { step, text }}
				<div class="space-y-3">
					<span class="text-sm font-mono text-muted-foreground/60">{step}</span>
					<p class="text-base font-medium leading-snug">{text}</p>
				</div>
			{/each}
		</div>

		<p class="mt-12 text-center text-sm text-muted-foreground">
			Reliability that compounds.
		</p>
	</div>
</section>

<Separator class="mx-auto max-w-6xl opacity-50" />

<!-- ===== FEATURES GRID ===== -->
<section id="features" class="px-6 py-32">
	<div class="mx-auto max-w-5xl">
		<h2 class="mb-16 text-center text-3xl font-semibold tracking-tight sm:text-4xl">
			Built for real oncall.
		</h2>

		<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each [
				{ icon: Zap, label: 'Production Reflexes' },
				{ icon: Brain, label: 'Operational Memory' },
				{ icon: FlaskConical, label: 'Sandbox Mitigation' },
				{ icon: Shield, label: 'Safe Auto-Fix' },
				{ icon: Dumbbell, label: 'Incident Gym' },
				{ icon: UserCog, label: 'Adaptive Oncall' }
			] as { icon: Icon, label }}
				<div class="flex items-center gap-4 rounded-lg border border-border/40 bg-card/30 px-5 py-4 transition-colors hover:bg-card/60">
					<Icon class="size-5 text-muted-foreground" />
					<span class="text-sm font-medium">{label}</span>
				</div>
			{/each}
		</div>
	</div>
</section>

<Separator class="mx-auto max-w-6xl opacity-50" />

<!-- ===== DIFFERENTIATION ===== -->
<section class="px-6 py-32">
	<div class="mx-auto max-w-3xl text-center">
		<h2 class="mb-12 text-3xl font-semibold tracking-tight sm:text-4xl">
			PagerDuty detects. Reflex resolves.
		</h2>

		<div class="space-y-4">
			<p class="text-lg text-muted-foreground">Alerts are table stakes.</p>
			<p class="text-lg font-medium">Mitigation is the product.</p>
			<p class="text-lg text-muted-foreground">Infra that gets smarter under pressure.</p>
		</div>
	</div>
</section>

<Separator class="mx-auto max-w-6xl opacity-50" />

<!-- ===== FINAL CTA ===== -->
<section id="waitlist" class="px-6 py-32">
	<div class="mx-auto max-w-xl text-center">
		<h2 class="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">
			Outages shouldn't repeat.
		</h2>

		<p class="mb-10 text-muted-foreground">
			Turn outages into intelligence.
		</p>

		<form
			class="mx-auto flex max-w-md gap-3"
			onsubmit={(e) => { e.preventDefault(); }}
		>
			<Input
				type="email"
				placeholder="you@company.com"
				bind:value={email}
				class="h-10 flex-1"
			/>
			<Button type="submit" size="lg">Join waitlist</Button>
		</form>

		<p class="mt-4 text-xs text-muted-foreground/50">
			No spam. Early access only.
		</p>
	</div>
</section>

<!-- ===== FOOTER ===== -->
<footer class="border-t border-border/40 px-6 py-12">
	<div class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
		<p class="text-sm text-muted-foreground">&copy; 2026 Reflex</p>
		<div class="flex gap-6">
			<a href="/privacy" class="text-sm text-muted-foreground transition-colors hover:text-foreground">Privacy</a>
			<a href="/terms" class="text-sm text-muted-foreground transition-colors hover:text-foreground">Terms</a>
			<a href="/contact" class="text-sm text-muted-foreground transition-colors hover:text-foreground">Contact</a>
			<a href="/docs" class="text-sm text-muted-foreground transition-colors hover:text-foreground">Docs</a>
		</div>
	</div>
</footer>
