<script>
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Play, ArrowRight } from '@lucide/svelte';

	let email = $state('');

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

<!-- ===== NAV ===== -->
<nav class="fixed top-0 z-50 w-full border-b border-[rgba(255,255,255,0.04)] bg-[#06060a]/90 backdrop-blur-sm">
	<div class="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
		<a href="/" class="font-serif text-xl italic tracking-tight text-foreground">Reflex</a>
		<div class="hidden items-center gap-8 md:flex">
			<a href="#demo" class="text-xs uppercase tracking-widest text-muted-foreground transition-colors duration-300 hover:text-foreground">Demo</a>
			<a href="#how-it-works" class="text-xs uppercase tracking-widest text-muted-foreground transition-colors duration-300 hover:text-foreground">How it works</a>
			<a href="#features" class="text-xs uppercase tracking-widest text-muted-foreground transition-colors duration-300 hover:text-foreground">Features</a>
			<a href="#waitlist" class="text-xs uppercase tracking-widest text-muted-foreground transition-colors duration-300 hover:text-foreground">Waitlist</a>
		</div>
		<Button href="#waitlist" size="sm" class="rounded-none bg-primary px-5 text-xs uppercase tracking-widest text-primary-foreground hover:bg-primary/85">Get early access</Button>
	</div>
</nav>

<!-- ===== HERO ===== -->
<section class="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-14">
	<!-- Decorative terminal code in background -->
	<div class="pointer-events-none absolute right-[5%] top-1/2 -translate-y-1/2 select-none text-[0.7rem] leading-relaxed text-foreground/[0.035] sm:text-sm" aria-hidden="true">
		<pre class="font-mono">$ reflex detect --watch{"\n"}  → anomaly: cpu-spike-us-east-1{"\n"}  → matching incident #1847 (95%){"\n"}  → testing: horizontal-scale{"\n"}  → sandbox passed. applying...{"\n"}  → resolved. MTTR: 14s{"\n"}{"\n"}$ reflex status{"\n"}  incidents today: 3{"\n"}  auto-resolved:   3{"\n"}  pages sent:      0</pre>
	</div>

	<div class="relative z-10 mx-auto max-w-4xl text-center">
		<!-- Micro-badge -->
		<div class="hero-enter mb-10" style="animation-delay: 0s">
			<span class="inline-block border border-[rgba(255,255,255,0.08)] px-4 py-1.5 text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground">
				Coming 2026
			</span>
		</div>

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
			class="hero-enter mt-3 text-xs tracking-widest text-muted-foreground/50 uppercase"
			style="animation-delay: 0.42s"
		>
			Production systems with reflexes
		</p>

		<!-- Buttons -->
		<div class="hero-enter mt-12 flex items-center justify-center gap-4" style="animation-delay: 0.55s">
			<Button
				href="#demo"
				variant="outline"
				size="lg"
				class="rounded-none border-[rgba(255,255,255,0.1)] bg-transparent px-6 text-xs uppercase tracking-widest text-foreground hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.03)]"
			>
				<Play class="size-3.5" />
				Watch demo
			</Button>
			<Button
				href="#waitlist"
				size="lg"
				class="rounded-none bg-primary px-6 text-xs uppercase tracking-widest text-primary-foreground hover:bg-primary/85"
			>
				Join waitlist
				<ArrowRight class="size-3.5" />
			</Button>
		</div>

		<!-- Micro-line -->
		<p
			class="hero-enter mt-16 text-[0.65rem] tracking-[0.2em] text-muted-foreground/30 uppercase"
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
			<!-- Video placeholder styled as terminal -->
			<div use:reveal={100} class="relative aspect-video w-full overflow-hidden border border-[rgba(255,255,255,0.06)] bg-[#0a0a10]">
				<!-- Terminal chrome -->
				<div class="absolute top-0 left-0 right-0 flex items-center gap-1.5 border-b border-[rgba(255,255,255,0.04)] px-4 py-2.5">
					<div class="size-2 rounded-full bg-[rgba(255,255,255,0.08)]"></div>
					<div class="size-2 rounded-full bg-[rgba(255,255,255,0.08)]"></div>
					<div class="size-2 rounded-full bg-[rgba(255,255,255,0.08)]"></div>
					<span class="ml-3 text-[0.6rem] tracking-wider text-muted-foreground/30 uppercase">reflex-demo.mp4</span>
				</div>
				<!-- Play button -->
				<div class="absolute inset-0 flex items-center justify-center">
					<button class="group flex size-16 items-center justify-center border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] transition-all duration-300 hover:border-primary/30 hover:bg-primary/5">
						<Play class="size-5 text-muted-foreground transition-colors group-hover:text-primary" />
					</button>
				</div>
				<!-- Replace with: <iframe src="YOUR_YOUTUBE_URL" ...></iframe> -->
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

		<p use:reveal={600} class="mt-16 text-xs tracking-[0.2em] text-muted-foreground/40 uppercase">
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
					class="group flex items-center border border-[rgba(255,255,255,0.04)] px-5 py-4 transition-all duration-300 hover:border-primary/20 hover:bg-[rgba(255,79,0,0.02)]"
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

		<form
			use:reveal={200}
			class="mx-auto flex max-w-md gap-2"
			onsubmit={(e) => {
				e.preventDefault();
			}}
		>
			<Input
				type="email"
				placeholder="you@company.com"
				bind:value={email}
				class="h-11 flex-1 rounded-none border-[rgba(255,255,255,0.08)] bg-transparent text-sm placeholder:text-muted-foreground/40 focus-visible:border-primary/40 focus-visible:ring-primary/10"
			/>
			<Button
				type="submit"
				size="lg"
				class="h-11 rounded-none bg-primary px-6 text-xs uppercase tracking-widest text-primary-foreground hover:bg-primary/85"
			>
				Join waitlist
			</Button>
		</form>

		<p use:reveal={300} class="mt-6 text-[0.65rem] tracking-[0.15em] text-muted-foreground/30 uppercase">
			No spam. Early access only.
		</p>
	</div>
</section>

<!-- ===== FOOTER ===== -->
<footer class="border-t border-[rgba(255,255,255,0.04)] px-6 py-10">
	<div class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
		<p class="text-xs tracking-wider text-muted-foreground/40">&copy; 2026 Reflex</p>
		<div class="flex gap-8">
			{#each ['Privacy', 'Terms', 'Contact', 'Docs'] as link}
				<a
					href="/{link.toLowerCase()}"
					class="text-xs tracking-wider text-muted-foreground/40 transition-colors duration-300 hover:text-muted-foreground"
				>
					{link}
				</a>
			{/each}
		</div>
	</div>
</footer>
