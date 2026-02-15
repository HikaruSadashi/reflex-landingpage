<script>
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import * as Stepper from '$lib/components/ui/stepper';
	import * as Choicebox from '$lib/components/ui/choicebox';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import {
		CheckCircle2,
		ArrowLeft,
		ArrowRight,
		Github,
		Database,
		Server,
		Activity
	} from '@lucide/svelte';

	const NAME_STORAGE_KEY = 'reflex.onboarding.name';
	const EMAIL_STORAGE_KEY = 'reflex.onboarding.email';
	const PROJECT_STORAGE_KEY = 'reflex.onboarding.projectName';

	let currentStep = $state(0);
	let name = $state('');
	let email = $state('');
	let connectedSources = $state([]);
	let triggerText = $state('');
	let projectName = $state('');

	const steps = [
		{ label: 'Login' },
		{ label: 'Connect sources' },
		{ label: 'Create triggers' },
		{ label: 'Project name' }
	];

	const triggerExample =
		'If you see repeated "database connection timeout" logs for 2 minutes, look for similar incidents in past production logs, identify the last successful mitigation, and run that playbook in dry-run mode first.';
	const sourceOptions = [
		{
			value: 'github',
			label: 'GitHub',
			description: 'Repos, workflows, and incidents',
			icon: Github
		},
		{
			value: 'datadog',
			label: 'Datadog',
			description: 'Metrics, monitors, and traces',
			icon: Database
		},
		{
			value: 'pagerduty',
			label: 'PagerDuty',
			description: 'Incidents, escalation policies, and on-call',
			icon: Activity
		},
		{
			value: 'cloudwatch',
			label: 'CloudWatch',
			description: 'Logs, alarms, and telemetry',
			icon: Server
		}
	];

	onMount(() => {
		const storedName = localStorage.getItem(NAME_STORAGE_KEY);
		const storedEmail = localStorage.getItem(EMAIL_STORAGE_KEY);
		const storedProject = localStorage.getItem(PROJECT_STORAGE_KEY);
		if (storedName) name = storedName;
		if (storedEmail) email = storedEmail;
		if (storedProject) projectName = storedProject;
	});

	$effect(() => {
		if (browser) {
			localStorage.setItem(NAME_STORAGE_KEY, name);
			localStorage.setItem(EMAIL_STORAGE_KEY, email);
			localStorage.setItem(PROJECT_STORAGE_KEY, projectName);
		}
	});

	const canContinueFromLogin = $derived(name.trim().length > 0 && email.trim().length > 0);
	const hasConnectedSource = $derived(connectedSources.length > 0);
	const canContinueFromTriggers = $derived(triggerText.trim().length > 0);
	const canFinish = $derived(projectName.trim().length > 0);

	function goNext() {
		if (currentStep < steps.length - 1) currentStep += 1;
	}

	function goBack() {
		if (currentStep > 0) currentStep -= 1;
	}

	async function handleFinish() {
		await goto('/incidents');
	}

	function fillExampleTrigger() {
		triggerText = triggerExample;
	}
</script>

<main class="bg-background flex min-h-svh justify-center px-6 py-14 md:px-10 md:py-20">
	<div class="w-full max-w-5xl space-y-16">
		<header class="space-y-4">
			<p class="text-muted-foreground text-xs uppercase tracking-[0.2em]">Reflex onboarding</p>
			<h1 class="font-serif text-4xl italic tracking-tight md:text-5xl">Quick setup</h1>
			<p class="text-muted-foreground text-sm leading-relaxed">Set up your incident workflow in four steps.</p>
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
			{#if currentStep === 0}
				<div class="space-y-12">
					<div class="space-y-3">
						<h2 class="font-serif text-3xl italic tracking-tight">Login</h2>
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
						<h2 class="font-serif text-3xl italic tracking-tight">Connect sources</h2>
						<p class="text-muted-foreground text-sm leading-relaxed">Select one or more sources to continue.</p>
					</div>

					<Choicebox.Root bind:value={connectedSources} multiple class="grid gap-6 md:grid-cols-2" name="sources">
						{#each sourceOptions as source}
							<Choicebox.Item
								value={source.value}
								class="group min-h-28 w-full grid-cols-[auto_1fr_auto] items-center gap-4 p-6 text-left"
							>
								<div class="text-muted-foreground flex size-10 items-center justify-center rounded-md border border-border/60 bg-background/50">
									<source.icon class="size-5" />
								</div>

								<div class="min-w-0 space-y-1">
									<Choicebox.Title class="text-base">{source.label}</Choicebox.Title>
									<Choicebox.Description class="text-sm leading-relaxed text-muted-foreground/85">
										{source.description}
									</Choicebox.Description>
								</div>

								<div class="self-center">
									<Choicebox.Indicator />
								</div>
							</Choicebox.Item>
						{/each}
					</Choicebox.Root>
				</div>
			{:else if currentStep === 2}
				<div class="space-y-12">
					<div class="space-y-3">
						<h2 class="font-serif text-3xl italic tracking-tight">Create triggers</h2>
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
			{:else}
				<div class="space-y-12">
					<div class="space-y-3">
						<h2 class="font-serif text-3xl italic tracking-tight">Project name</h2>
						<p class="text-muted-foreground text-sm leading-relaxed">Name this project before finishing setup.</p>
					</div>

					<div class="border-border bg-background/40 rounded-xl border p-7 md:p-10">
						<p class="text-muted-foreground mb-4 text-xs uppercase tracking-[0.2em]">Live preview</p>
						<div class="flex min-h-20 items-center">
							<h3 class="text-4xl font-semibold tracking-tight md:text-6xl">{projectName || 'reflex-prod-core'}<span class="bg-primary cursor-blink ml-1 inline-block h-[0.95em] w-[3px] translate-y-[0.08em] align-baseline"></span></h3>
						</div>
					</div>

					<div class="space-y-4">
						<label for="project-name" class="text-sm font-medium">Project name</label>
						<Input
							id="project-name"
							bind:value={projectName}
							placeholder="reflex-prod-core"
							class="h-11"
						/>
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
					disabled={
						(currentStep === 0 && !canContinueFromLogin) ||
						(currentStep === 1 && !hasConnectedSource) ||
						(currentStep === 2 && !canContinueFromTriggers)
					}
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
