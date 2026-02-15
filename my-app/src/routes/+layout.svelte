<script>
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import { page } from '$app/stores';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Reflex — PagerDuty for the AI era</title>
	<meta name="description" content="Incidents resolved before they page you. Autonomous incident mitigation with operational memory." />
	<style>
		html { scroll-behavior: smooth; }
	</style>
</svelte:head>

<Toaster position="top-center" />
<div class="grain min-h-screen bg-background text-foreground antialiased">
	<nav class="fixed top-0 z-50 w-full border-b border-[rgba(255,255,255,0.04)] bg-[#06060a]/90 backdrop-blur-sm">
		<div class="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
			<a href="/" class="font-serif text-xl italic tracking-tight text-foreground">reflex</a>
			<div class="hidden items-center gap-8 md:flex">
				<a href="/incidents" class="text-xs uppercase tracking-widest text-muted-foreground transition-colors duration-300 hover:text-foreground">Incidents</a>
				<a href="/rl" class="text-xs uppercase tracking-widest text-muted-foreground transition-colors duration-300 hover:text-foreground">RL</a>
				<a href="/#demo" class="text-xs uppercase tracking-widest text-muted-foreground transition-colors duration-300 hover:text-foreground">Demo</a>
				<a href="/#how-it-works" class="text-xs uppercase tracking-widest text-muted-foreground transition-colors duration-300 hover:text-foreground">How it works</a>
				<a href="/#features" class="text-xs uppercase tracking-widest text-muted-foreground transition-colors duration-300 hover:text-foreground">Features</a>
				<a href="/#waitlist" class="text-xs uppercase tracking-widest text-muted-foreground transition-colors duration-300 hover:text-foreground">Waitlist</a>
			</div>
		</div>
	</nav>

	{@render children()}
</div>
