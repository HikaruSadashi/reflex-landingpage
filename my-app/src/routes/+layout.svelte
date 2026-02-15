<script>
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { Toaster } from '$lib/components/ui/sonner/index.js';

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
	{@render children()}
</div>
