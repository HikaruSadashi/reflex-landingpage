<script>
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import * as Stepper from '$lib/components/ui/stepper';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { CheckCircle2, ArrowLeft, ArrowRight, Github, Database } from '@lucide/svelte';

	const NAME_STORAGE_KEY = 'reflex.onboarding.name';
	const EMAIL_STORAGE_KEY = 'reflex.onboarding.email';

	let currentStep = $state(0);
	let name = $state('');
	let email = $state('');
	let githubConnected = $state(false);
	let datadogConnected = $state(false);
	let triggerText = $state('');
	let setupComplete = $state(false);

	const steps = [
		{ label: 'Login' },
		{ label: 'Connect sources' },
		{ label: 'Create triggers' }
	];

	const triggerExample =
		'If you see repeated "database connection timeout" logs for 2 minutes, look for similar incidents in past production logs, identify the last successful mitigation, and run that playbook in dry-run mode first.';

	onMount(() => {
		const storedName = localStorage.getItem(NAME_STORAGE_KEY);
		const storedEmail = localStorage.getItem(EMAIL_STORAGE_KEY);
		if (storedName) name = storedName;
		if (storedEmail) email = storedEmail;
	});

	$effect(() => {
		if (browser) {
			localStorage.setItem(NAME_STORAGE_KEY, name);
			localStorage.setItem(EMAIL_STORAGE_KEY, email);
		}
	});

	const canContinueFromLogin = $derived(name.trim().length > 0 && email.trim().length > 0);
	const hasConnectedSource = $derived(githubConnected || datadogConnected);
	const canFinish = $derived(triggerText.trim().length > 0);

	function goNext() {
		if (currentStep < steps.length - 1) currentStep += 1;
	}

	function goBack() {
		if (currentStep > 0) currentStep -= 1;
	}

	function handleFinish() {
		setupComplete = true;
	}

	function fillExampleTrigger() {
		triggerText = triggerExample;
	}
</script>

<main class="bg-background flex min-h-svh justify-center px-6 py-14 md:px-10 md:py-20">
	<div class="w-full max-w-5xl space-y-16">
		<header class="space-y-4">
			<p class="text-muted-foreground text-xs uppercase tracking-[0.2em]">Reflex onboarding</p>
			<h1 class="text-3xl font-semibold tracking-tight">Quick setup</h1>
			<p class="text-muted-foreground text-sm leading-relaxed">Set up your incident workflow in three steps.</p>
		</header>

		<Stepper.Root bind:value={currentStep} class="py-4">
			{#each steps as step, i}
				<Stepper.Item step={i}>
					<Stepper.Trigger step={i}>
						<Stepper.Indicator step={i} />
						<Stepper.Title class="pt-1">{step.label}</Stepper.Title>
					</Stepper.Trigger>
					{#if i !== steps.length - 1}
						<Stepper.Separator />
					{/if}
				</Stepper.Item>
			{/each}
		</Stepper.Root>

		<section class="bg-card border-border rounded-xl border p-8 md:p-12 min-h-[480px]">
			{#if setupComplete}
				<div class="space-y-8">
					<div class="flex items-center gap-2">
						<CheckCircle2 class="text-primary size-5" />
						<h2 class="text-xl font-semibold">Onboarding complete</h2>
					</div>
					<p class="text-muted-foreground text-sm leading-relaxed">You are set, {name}. Your first trigger is ready for review.</p>
					<Button onclick={() => (setupComplete = false)} variant="outline">Review setup</Button>
				</div>
			{:else if currentStep === 0}
				<div class="space-y-12">
					<div class="space-y-3">
						<h2 class="text-xl font-semibold">Login</h2>
						<p class="text-muted-foreground text-sm leading-relaxed">Enter your details to start onboarding.</p>
					</div>

					<div class="grid gap-10 md:grid-cols-2">
						<div class="space-y-4">
							<label for="name" class="text-sm font-medium">Name</label>
							<Input id="name" bind:value={name} placeholder="Jane Doe" class="h-11" />
						</div>
						<div class="space-y-4">
							<label for="email" class="text-sm font-medium">Work email</label>
							<Input id="email" type="email" bind:value={email} placeholder="you@company.com" class="h-11" />
						</div>
					</div>
				</div>
			{:else if currentStep === 1}
				<div class="space-y-12">
					<div class="space-y-3">
						<h2 class="text-xl font-semibold">Connect sources</h2>
						<p class="text-muted-foreground text-sm leading-relaxed">Connect at least one source to continue.</p>
					</div>

					<div class="grid gap-10 md:grid-cols-2">
						<button
							type="button"
							class="border-border hover:border-primary/40 hover:bg-accent/50 flex min-h-28 items-center justify-between rounded-lg border p-6 text-left transition-colors"
							onclick={() => (githubConnected = !githubConnected)}
						>
							<div class="flex items-center gap-3">
								<Github class="size-5" />
								<div class="space-y-1">
									<p class="text-sm font-medium">GitHub</p>
									<p class="text-muted-foreground text-xs leading-relaxed">Repos, workflows, and incidents</p>
								</div>
							</div>
							{#if githubConnected}
								<CheckCircle2 class="text-primary size-5" />
							{/if}
						</button>

						<button
							type="button"
							class="border-border hover:border-primary/40 hover:bg-accent/50 flex min-h-28 items-center justify-between rounded-lg border p-6 text-left transition-colors"
							onclick={() => (datadogConnected = !datadogConnected)}
						>
							<div class="flex items-center gap-3">
								<div class="bg-secondary text-secondary-foreground flex size-5 items-center justify-center rounded text-[10px] font-semibold">
									DD
								</div>
								<div class="space-y-1">
									<p class="text-sm font-medium">Datadog</p>
									<p class="text-muted-foreground text-xs leading-relaxed">Metrics, monitors, and traces</p>
								</div>
							</div>
							{#if datadogConnected}
								<CheckCircle2 class="text-primary size-5" />
							{/if}
						</button>
					</div>
				</div>
			{:else}
				<div class="space-y-12">
					<div class="space-y-3">
						<h2 class="text-xl font-semibold">Create triggers</h2>
						<p class="text-muted-foreground text-sm leading-relaxed">Describe a trigger in natural language.</p>
					</div>

					<div class="space-y-6">
						<label for="trigger" class="text-sm font-medium">Trigger rule</label>
						<Textarea
							id="trigger"
							rows={6}
							bind:value={triggerText}
							class="min-h-40"
							placeholder='Example: If you see repeated "database connection timeout" logs, look for similar incidents in historical logs and suggest the best matching mitigation.'
						/>
						<div class="flex items-center justify-between">
							<button type="button" class="text-primary text-xs hover:underline" onclick={fillExampleTrigger}>
								Use example
							</button>
							<div class="text-muted-foreground flex items-center gap-1 text-xs">
								<Database class="size-3.5" />
								Trigger preview
							</div>
						</div>
					</div>
				</div>
			{/if}
		</section>

		<div class="bg-card border-border mt-8 flex items-center justify-between rounded-xl border px-5 py-4 md:px-6 md:py-5">
			<Button variant="outline" onclick={goBack} disabled={currentStep === 0}>
				<ArrowLeft class="size-4" />
				Back
			</Button>

			{#if currentStep < steps.length - 1}
				<Button
					onclick={goNext}
					disabled={(currentStep === 0 && !canContinueFromLogin) || (currentStep === 1 && !hasConnectedSource)}
				>
					Continue
					<ArrowRight class="size-4" />
				</Button>
			{:else}
				<Button onclick={handleFinish} disabled={!canFinish}>
					Finish setup
					<CheckCircle2 class="size-4" />
				</Button>
			{/if}
		</div>
	</div>
</main>
