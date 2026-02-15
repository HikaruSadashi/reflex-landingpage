<script>
	import { onMount, onDestroy } from 'svelte';
	import { fly } from 'svelte/transition';

	let { src = '', children } = $props();

	let showImage = $state(false);
	let position = $state({ x: 0, y: 0 });

	let portalTarget;
	let portalEl;

	onMount(() => {
		portalTarget = document.body;
	});

	onDestroy(() => {
		if (portalEl && portalEl.parentNode) {
			portalEl.parentNode.removeChild(portalEl);
		}
	});

	function portal(node) {
		portalEl = node;
		if (portalTarget) {
			portalTarget.appendChild(node);
		}
		return {
			destroy() {
				if (node.parentNode) {
					node.parentNode.removeChild(node);
				}
			}
		};
	}

	function handleMouseEnter(event) {
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
		use:portal
		class="image-container"
		style="top: {position.y + 16}px; left: {position.x + 16}px;"
		transition:fly={{ y: 10, duration: 200 }}
	>
		<img src={src} alt="Reveal" class="w-40 h-auto rounded" />
	</div>
{/if}

<style>
	.image-container {
		position: fixed;
		pointer-events: none;
		z-index: 1001;
	}
</style>
