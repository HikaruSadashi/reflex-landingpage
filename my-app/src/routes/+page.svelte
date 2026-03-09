<script>
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Play, ArrowRight, Check, Loader2 } from '@lucide/svelte';

	// Demo video: replace with your YouTube video ID if needed
	const DEMO_YOUTUBE_VIDEO_ID = 'jNQXAC9IVRw';
	const DEMO_YOUTUBE_EMBED_URL = DEMO_YOUTUBE_VIDEO_ID
		? `https://www.youtube.com/embed/${DEMO_YOUTUBE_VIDEO_ID}?modestbranding=1&rel=0`
		: '';
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { toast } from 'svelte-sonner';
	import ImgReveal from '$lib/ImgReveal.svelte';

	let email = $state('');
	let submitting = $state(false);
	let submitted = $state(false);
	let cursorElement;
	let cursorText;

	async function handleWaitlistSubmit(e) {
		e.preventDefault();
		if (!email.trim() || submitting) return;

		submitting = true;
		try {
			const res = await fetch('https://reflexbackend-r2rk.onrender.com/waitlist', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					email: email.trim(),
					source: 'landing-page'
				})
			});

			const data = await res.json();

			if (res.ok) {
				submitted = true;
				if (data.already_exists) {
					toast.success("You're already on the list!", {
						description: "We'll be in touch soon with early access."
					});
				} else {
					toast.success("You're in!", {
						description: "We'll notify you when early access is ready."
					});
				}
			} else if (res.status === 400) {
				toast.error('Invalid email', {
					description: data.error || 'Please enter a valid email address.'
				});
			} else {
				toast.error('Something went wrong', {
					description: 'Please try again in a moment.'
				});
			}
		} catch {
			toast.error('Network error', {
				description: 'Could not reach the server. Please try again.'
			});
		} finally {
			submitting = false;
		}
	}

	onMount(() => {
		initCursor();
	});

	function initCursor() {
		if (!cursorElement) return;

		const cursorParagraph = cursorElement.querySelector('p');
		const targets = document.querySelectorAll('[data-cursor]');

		let xOffset = 6;
		let yOffset = 50;
		let cursorIsOnRight = false;
		let currentTarget = null;
		let lastText = '';

		gsap.set(cursorElement, { xPercent: xOffset, yPercent: yOffset });

		let xTo = gsap.quickTo(cursorElement, 'x', { ease: 'power3' });
		let yTo = gsap.quickTo(cursorElement, 'y', { ease: 'power3' });

		window.addEventListener('mousemove', (e) => {
			const cursorX = e.clientX;
			const cursorY = e.pageY;
			const windowWidth = window.innerWidth;

			// Flip offset when cursor is near the right edge
			let xPercent = xOffset;
			let yPercent = yOffset;

			if (cursorX > windowWidth * 0.75) {
				xPercent = -106;
				cursorIsOnRight = true;
			} else {
				xPercent = xOffset;
				cursorIsOnRight = false;
			}

			// Update text from data-easteregg when on right side
			if (currentTarget) {
				const easterEgg = currentTarget.getAttribute('data-easteregg');
				const cursorData = currentTarget.getAttribute('data-cursor');
				const newText = cursorIsOnRight && easterEgg ? easterEgg : cursorData;
				if (newText !== lastText) {
					lastText = newText;
					if (cursorParagraph) cursorParagraph.textContent = newText;
				}
			}

			gsap.to(cursorElement, { xPercent, yPercent, duration: 0.9, ease: 'power3' });
			xTo(cursorX);
			yTo(cursorY - window.scrollY);
		});

		targets.forEach((target) => {
			target.addEventListener('mouseenter', () => {
				currentTarget = target;
				const text = target.getAttribute('data-cursor');
				if (cursorParagraph && text) {
					lastText = text;
					cursorParagraph.textContent = text;
				}
			});
			target.addEventListener('mouseleave', () => {
				if (currentTarget === target) {
					currentTarget = null;
					lastText = '';
				}
			});
		});
	}

	/**
	 * Scroll-triggered reveal animation action.
	 * @param {HTMLElement} node
	 * @param {number} delay - ms delay before transition starts
	 */
	function reveal(node, delay = 0) {
		node.style.transitionDelay = `${delay}ms`;
		node.classList.add('reveal');

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						node.classList.add('revealed');
						observer.unobserve(node);
					}
				});
			},
			{ threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
		);

		observer.observe(node);

		return {
			destroy() {
				observer.disconnect();
			}
		};
	}
</script>

<!-- Custom Cursor -->
<div bind:this={cursorElement} class="cursor">
	<p bind:this={cursorText}>Learn more</p>
</div>

<!-- ===== HERO ===== -->
<section class="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-14">
	<!-- Decorative terminal code in background -->
	<div class="pointer-events-none absolute right-[5%] top-1/2 -translate-y-1/2 select-none text-[0.7rem] leading-relaxed text-foreground/[0.035] sm:text-sm" aria-hidden="true">
		<pre class="font-mono">$ reflex detect --watch{"\n"}  → anomaly: cpu-spike-us-east-1{"\n"}  → matching incident #1847 (95%){"\n"}  → testing: horizontal-scale{"\n"}  → sandbox passed. applying...{"\n"}  → resolved. MTTR: 14s{"\n"}{"\n"}$ reflex status{"\n"}  incidents today: 3{"\n"}  auto-resolved:   3{"\n"}  pages sent:      0</pre>
	</div>

	<div class="relative z-10 mx-auto max-w-4xl text-center">
		<!-- Headline -->
		<h1
			class="hero-enter font-serif text-[clamp(3rem,8.5vw,7.5rem)] leading-[0.95] tracking-tight"
			style="animation-delay: 0.12s"
		>
			<span class="italic">PagerDuty for</span><br />
			<span class="italic">the AI era</span><span class="not-italic text-primary">.</span><span
				class="cursor-blink ml-1 inline-block h-[0.75em] w-[3px] translate-y-[0.05em] bg-primary align-baseline"
			></span>
		</h1>

		<!-- Subheadline -->
		<p
			class="hero-enter mx-auto mt-8 max-w-lg text-base text-muted-foreground sm:text-lg"
			style="animation-delay: 0.3s"
		>
			Incidents resolved before they page you.
		</p>

		<!-- Supporting line -->
		<p
			class="hero-enter mt-3 text-xs tracking-widest text-muted-foreground uppercase"
			style="animation-delay: 0.42s"
		>
			Production systems with <ImgReveal src="/cat.gif"><span class="text-primary cursor-pointer transition-colors duration-300 hover:text-primary/80">reflexes</span></ImgReveal> and <ImgReveal src="/bigbrain.gif"><span class="text-primary cursor-pointer transition-colors duration-300 hover:text-primary/80">memory</span></ImgReveal>
		</p>

		<!-- Buttons -->
		<div class="hero-enter mt-12 flex items-center justify-center gap-4" style="animation-delay: 0.55s">
			<Button
				href="#demo"
				variant="outline"
				size="lg"
				class="rounded-none border-[rgba(255,255,255,0.1)] bg-transparent px-6 text-xs uppercase tracking-widest text-foreground hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.03)]"
				data-cursor="See it in action"
			>
				<Play class="size-3.5" />
				Watch demo
			</Button>
			<Button
				href="#waitlist"
				size="lg"
				class="rounded-none bg-primary px-6 text-xs uppercase tracking-widest text-primary-foreground hover:bg-primary/85"
				data-cursor="Let's go!"
			>
				Join waitlist
				<ArrowRight class="size-3.5" />
			</Button>
		</div>

		<!-- Micro-line -->
		<p
			class="hero-enter mt-16 text-[0.65rem] tracking-[0.2em] text-muted-foreground uppercase"
			style="animation-delay: 0.7s"
		>
			Outages shouldn't repeat
		</p>
	</div>

	<!-- Scroll indicator -->
	<div class="hero-enter absolute bottom-8 left-1/2 -translate-x-1/2" style="animation-delay: 1s">
		<div class="h-8 w-px bg-gradient-to-b from-transparent to-muted-foreground/20"></div>
	</div>
</section>

<!-- ===== DEMO ===== -->
<section id="demo" class="px-6 py-32 sm:py-40">
	<div class="mx-auto max-w-6xl">
		<h2
			use:reveal={0}
			class="mb-16 font-serif text-[clamp(2rem,4.5vw,3.5rem)] italic leading-tight tracking-tight sm:mb-20"
		>
			See it fix an incident.
		</h2>

		<div class="grid items-center gap-12 lg:grid-cols-[1fr_280px] lg:gap-16">
			<!-- Demo: YouTube embed in terminal-style frame -->
			<div use:reveal={100} class="relative aspect-video w-full overflow-hidden rounded-sm border border-[rgba(255,255,255,0.06)] bg-[#0a0a10] shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
				<!-- Terminal chrome -->
				<div class="absolute top-0 left-0 right-0 z-10 flex items-center gap-1.5 border-b border-[rgba(255,255,255,0.04)] bg-[#0a0a10]/95 px-4 py-2.5 backdrop-blur-sm">
					<div class="size-2 rounded-full bg-[rgba(255,255,255,0.08)]"></div>
					<div class="size-2 rounded-full bg-[rgba(255,255,255,0.08)]"></div>
					<div class="size-2 rounded-full bg-[rgba(255,255,255,0.08)]"></div>
					<span class="ml-3 text-[0.6rem] tracking-wider text-muted-foreground/50 uppercase">reflex · demo</span>
				</div>

				{#if DEMO_YOUTUBE_EMBED_URL}
					<iframe
						class="absolute inset-0 h-full w-full pt-[2.5rem]"
						title="Reflex demo video"
						src={DEMO_YOUTUBE_EMBED_URL}
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
						allowfullscreen
						loading="lazy"
					></iframe>
				{:else}
					<div class="absolute inset-0 flex items-center justify-center pt-[2.5rem] text-center">
						<p class="max-w-[18rem] text-xs text-muted-foreground/70">
							Set <code class="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[0.65rem]">DEMO_YOUTUBE_VIDEO_ID</code> in <code class="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[0.65rem]">+page.svelte</code> to your YouTube video ID.
						</p>
					</div>
				{/if}
			</div>

			<!-- Four words -->
			<div class="flex flex-col gap-5 lg:gap-7">
				{#each ['Detect.', 'Mitigate.', 'Remember.'] as word, i}
					<p
						use:reveal={200 + i * 120}
						class="font-serif text-3xl italic tracking-tight lg:text-4xl"
					>
						{word}
					</p>
				{/each}
				<p
					use:reveal={560}
					class="font-serif text-3xl italic tracking-tight text-muted-foreground lg:text-4xl"
				>
					Repeat — faster.
				</p>
			</div>
		</div>
	</div>
</section>

<!-- Divider -->
<div class="mx-auto max-w-6xl px-6">
	<div class="h-px bg-[rgba(255,255,255,0.04)]"></div>
</div>

<!-- ===== VALUE ===== -->
<section class="px-6 py-32 sm:py-40">
	<div class="mx-auto max-w-6xl">
		<h2
			use:reveal={0}
			class="mb-20 max-w-2xl font-serif text-[clamp(2rem,4.5vw,3.5rem)] italic leading-tight tracking-tight"
		>
			Stop paging humans for the same failure.
		</h2>

		<div class="grid gap-12 sm:grid-cols-3 sm:gap-8">
			{#each [
				{ title: 'Autonomous mitigation', desc: 'Rollback. Restart. Scale. Validate.' },
				{ title: 'Operational memory', desc: 'Executable postmortems.' },
				{ title: 'Self-improving reliability', desc: 'Every incident makes you stronger.' }
			] as { title, desc }, i}
				<div use:reveal={i * 150} class="group">
					<div class="mb-6 h-px w-8 bg-primary transition-all duration-500 group-hover:w-12"></div>
					<h3 class="mb-3 text-sm font-medium tracking-wide text-foreground">{title}</h3>
					<p class="text-sm leading-relaxed text-muted-foreground">{desc}</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- Divider -->
<div class="mx-auto max-w-6xl px-6">
	<div class="h-px bg-[rgba(255,255,255,0.04)]"></div>
</div>

<!-- ===== HOW IT WORKS ===== -->
<section id="how-it-works" class="px-6 py-32 sm:py-40">
	<div class="mx-auto max-w-5xl">
		<h2
			use:reveal={0}
			class="mb-20 font-serif text-[clamp(2rem,4.5vw,3.5rem)] italic leading-tight tracking-tight"
		>
			From alert to autonomous fix.
		</h2>

		<div class="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
			{#each [
				'Detect a failure signature',
				'Match past incidents',
				'Test mitigation safely',
				'Apply and store the playbook'
			] as text, i}
				<div use:reveal={i * 130} class="group">
					<span class="block font-serif text-4xl italic text-primary/80 transition-colors duration-300 group-hover:text-primary lg:text-5xl">
						{String(i + 1).padStart(2, '0')}
					</span>
					<div class="mt-4 mb-4 h-px w-full bg-[rgba(255,255,255,0.04)] transition-colors duration-300 group-hover:bg-[rgba(255,255,255,0.08)]"></div>
					<p class="text-sm leading-relaxed text-muted-foreground">{text}</p>
				</div>
			{/each}
		</div>

		<p use:reveal={600} class="mt-16 text-xs tracking-[0.2em] text-muted-foreground uppercase">
			Reliability that compounds.
		</p>
	</div>
</section>

<!-- Divider -->
<div class="mx-auto max-w-6xl px-6">
	<div class="h-px bg-[rgba(255,255,255,0.04)]"></div>
</div>

<!-- ===== FEATURES GRID ===== -->
<section id="features" class="px-6 py-32 sm:py-40">
	<div class="mx-auto max-w-5xl">
		<h2
			use:reveal={0}
			class="mb-20 font-serif text-[clamp(2rem,4.5vw,3.5rem)] italic leading-tight tracking-tight"
		>
			Built for real oncall.
		</h2>

		<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
			{#each [
				'Production Reflexes',
				'Operational Memory',
				'Sandbox Mitigation',
				'Safe Auto-Fix',
				'Incident Gym',
				'Adaptive Oncall'
			] as label, i}
				<div
					use:reveal={i * 80}
					class="group flex items-center border border-[rgba(255,255,255,0.04)] px-5 py-4 transition-all duration-300 hover:border-primary/20 hover:bg-[rgba(161,92,168,0.02)]"
				>
					<span class="mr-3 inline-block size-1.5 bg-muted-foreground/30 transition-colors duration-300 group-hover:bg-primary"></span>
					<span class="text-sm text-muted-foreground transition-colors duration-300 group-hover:text-foreground">{label}</span>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- Divider -->
<div class="mx-auto max-w-6xl px-6">
	<div class="h-px bg-[rgba(255,255,255,0.04)]"></div>
</div>

<!-- ===== DIFFERENTIATION ===== -->
<section class="px-6 py-32 sm:py-40">
	<div class="mx-auto max-w-3xl">
		<h2
			use:reveal={0}
			class="mb-16 font-serif text-[clamp(2rem,4.5vw,3.5rem)] italic leading-tight tracking-tight"
		>
			PagerDuty detects.<br /><span class="text-primary">Reflex resolves.</span>
		</h2>

		<div class="space-y-5">
			<p use:reveal={100} class="text-base text-muted-foreground sm:text-lg">
				Alerts are table stakes.
			</p>
			<p use:reveal={200} class="text-base font-medium text-foreground sm:text-lg">
				Mitigation is the product.
			</p>
			<p use:reveal={300} class="text-base text-muted-foreground sm:text-lg">
				Infra that gets smarter under pressure.
			</p>
		</div>
	</div>
</section>

<!-- Divider -->
<div class="mx-auto max-w-6xl px-6">
	<div class="h-px bg-[rgba(255,255,255,0.04)]"></div>
</div>

<!-- ===== FINAL CTA ===== -->
<section id="waitlist" class="px-6 py-32 sm:py-44">
	<div class="mx-auto max-w-xl text-center">
		<h2
			use:reveal={0}
			class="mb-4 font-serif text-[clamp(2.5rem,5vw,4rem)] italic leading-tight tracking-tight"
		>
			Outages shouldn't repeat<span class="text-primary">.</span>
		</h2>

		<p use:reveal={100} class="mb-12 text-base text-muted-foreground">
			Turn outages into intelligence.
		</p>

		{#if submitted}
			<div use:reveal={0} class="mx-auto flex max-w-md flex-col items-center gap-4">
				<div class="flex size-12 items-center justify-center border border-primary/20 bg-primary/5">
					<Check class="size-5 text-primary" />
				</div>
				<p class="text-sm text-muted-foreground">
					You're on the list. We'll reach out when it's your turn.
				</p>
			</div>
		{:else}
			<form
				use:reveal={200}
				class="mx-auto flex max-w-md gap-2"
				onsubmit={handleWaitlistSubmit}
			>
				<Input
					type="email"
					placeholder="you@company.com"
					bind:value={email}
					required
					disabled={submitting}
					class="h-11 flex-1 rounded-none border-[rgba(255,255,255,0.08)] bg-transparent text-sm placeholder:text-muted-foreground/40 focus-visible:border-primary/40 focus-visible:ring-primary/10"
				/>
				<Button
					type="submit"
					size="lg"
					disabled={submitting}
					class="h-11 rounded-none bg-primary px-6 text-xs uppercase tracking-widest text-primary-foreground hover:bg-primary/85"
					data-cursor="Submit"
				>
					{#if submitting}
						<Loader2 class="size-4 animate-spin" />
						Joining...
					{:else}
						Join waitlist
					{/if}
				</Button>
			</form>
		{/if}

		<p use:reveal={300} class="mt-6 text-[0.65rem] tracking-[0.15em] text-muted-foreground uppercase">
			No spam. Early access only.
		</p>
	</div>
</section>

<!-- ===== FOOTER ===== -->
<footer class="border-t border-[rgba(255,255,255,0.04)] px-6 py-10">
	<div class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
		<p class="text-xs tracking-wider text-muted-foreground">&copy; 2026 Reflex</p>
		<div class="flex gap-8">
			<a
				href="mailto:khalid.zabalawi.ca@gmail.com"
				class="text-xs tracking-wider text-muted-foreground transition-colors duration-300 hover:text-foreground"
				data-cursor="Send us an email"
			>
				Contact
			</a>
		</div>
	</div>
</footer>
