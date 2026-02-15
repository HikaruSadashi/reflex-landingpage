<script>
	import { fly } from 'svelte/transition';

	let { src = '', children } = $props();

	let imgSrc = $state('');
	let showImage = $state(false);
	let position = $state({ x: 0, y: 0 });

	function handleMouseEnter(event) {
		imgSrc = src;
		showImage = true;
		position = { x: event.clientX, y: event.clientY };
	}

	function handleMouseMove(event) {
		position = { x: event.clientX, y: event.clientY };
	}

	function handleMouseLeave() {
		showImage = false;
	}
</script>

<span
	role="presentation"
	onmouseenter={handleMouseEnter}
	onmousemove={handleMouseMove}
	onmouseleave={handleMouseLeave}
	class="inline"
>
	{@render children()}
</span>

{#if showImage}
	<div
		class="image-container"
		style="top: {position.y + 16}px; left: {position.x + 16}px;"
		transition:fly={{ y: 10, duration: 200 }}
	>
		<img src={imgSrc} alt="Reveal" class="w-40 h-auto rounded" />
	</div>
{/if}

<style>
	.image-container {
		position: fixed;
		pointer-events: none;
		z-index: 1001;
	}
</style>
