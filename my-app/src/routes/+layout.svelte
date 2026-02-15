<script>
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

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

<div class="grain min-h-screen bg-background text-foreground antialiased">
	{@render children()}
</div>
