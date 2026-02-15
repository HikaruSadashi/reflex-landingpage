<script lang="ts">
	// @ts-nocheck
	import { goto } from '$app/navigation';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import ArrowUpDownIcon from '@lucide/svelte/icons/arrow-up-down';
	import {
		type ColumnDef,
		type ColumnFiltersState,
		type PaginationState,
		type SortingState,
		type VisibilityState,
		getCoreRowModel,
		getFilteredRowModel,
		getPaginationRowModel,
		getSortedRowModel
	} from '@tanstack/table-core';
	import { createRawSnippet, onMount } from 'svelte';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Spinner } from '$lib/components/ui/spinner/index.js';
	import * as Item from '$lib/components/ui/item/index.js';
	import {
		FlexRender,
		createSvelteTable,
		renderComponent,
		renderSnippet
	} from '$lib/components/ui/data-table/index.js';

	type IncidentRow = {
		id: number;
		title: string;
		log_name: string;
		status: string;
		severity: string;
		started_at: string;
		resolved_at: string | null;
	};

	type IncidentsResponse = {
		incidents: IncidentRow[];
		next_cursor: number | null;
		has_more: boolean;
	};

	const PROJECT_STORAGE_KEY = 'reflex.onboarding.projectName';
	const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'https://reflexbackend-r2rk.onrender.com';

	let projectName = $state('Project');
	let rows = $state<IncidentRow[]>([]);
	let loading = $state(true);
	let error = $state('');
	let nextCursor = $state<number | null>(null);
	let hasMore = $state(false);
	let loadingMore = $state(false);

	let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 10 });
	let sorting = $state<SortingState>([]);
	let columnFilters = $state<ColumnFiltersState>([]);
	let columnVisibility = $state<VisibilityState>({});
	let quickFilter = $state<'all' | 'critical' | 'warn' | 'info' | 'triggered' | 'resolved'>('all');

	function formatAlertTime(iso: string) {
		const date = new Date(iso);
		return new Intl.DateTimeFormat('en-US', {
			hour: '2-digit',
			minute: '2-digit',
			hour12: true,
			timeZoneName: 'short'
		}).format(date);
	}

	function capitalize(value: string) {
		return value.charAt(0).toUpperCase() + value.slice(1);
	}

	function statusClass(status: string) {
		switch (status.toLowerCase()) {
			case 'triggered':
				return 'text-red-500';
			case 'resolved':
				return 'text-green-500';
			default:
				return 'text-foreground';
		}
	}

	function severityClass(severity: string) {
		switch (severity.toLowerCase()) {
			case 'critical':
				return 'text-red-500';
			case 'warn':
				return 'text-amber-500';
			case 'info':
				return 'text-sky-400';
			default:
				return 'text-foreground';
		}
	}

	function applyQuickFilter(
		filter: 'all' | 'critical' | 'warn' | 'info' | 'triggered' | 'resolved'
	) {
		quickFilter = filter;
		const severityColumn = table.getColumn('severity');
		const statusColumn = table.getColumn('status');
		if (!severityColumn || !statusColumn) return;

		if (filter === 'all') {
			severityColumn.setFilterValue(undefined);
			statusColumn.setFilterValue(undefined);
			return;
		}

		if (filter === 'triggered' || filter === 'resolved') {
			severityColumn.setFilterValue(undefined);
			statusColumn.setFilterValue(filter);
			return;
		}

		statusColumn.setFilterValue(undefined);
		severityColumn.setFilterValue(filter);
	}

	function incidentStateClass(row: IncidentRow) {
		return row.resolved_at == null ? 'agent-working-row' : '';
	}

	const columns: ColumnDef<IncidentRow>[] = [
		{
			accessorKey: 'title',
			header: 'Incident',
			cell: ({ row }) => {
				const snippet = createRawSnippet<[{ title: string; logName: string | null }]>((getData) => {
					const { title, logName } = getData();
					return {
						render: () =>
							`<div><div class="font-medium">${title}</div><div class="text-xs text-muted-foreground">${logName ?? '—'}</div></div>`
					};
				});
				return renderSnippet(snippet, {
					title: row.original.title,
					logName: row.original.log_name
				});
			}
		},
		{
			accessorKey: 'status',
			header: 'Status',
			cell: ({ row }) => {
				const snippet = createRawSnippet<[{ status: string; className: string }]>((getData) => {
					const { status, className } = getData();
					return { render: () => `<div class="${className}">${status}</div>` };
				});
				return renderSnippet(snippet, {
					status: capitalize(row.original.status),
					className: statusClass(row.original.status)
				});
			}
		},
		{
			accessorKey: 'severity',
			header: 'Severity',
			cell: ({ row }) => {
				const snippet = createRawSnippet<[{ severity: string; className: string }]>((getData) => {
					const { severity, className } = getData();
					return { render: () => `<div class="${className}">${severity}</div>` };
				});
				return renderSnippet(snippet, {
					severity: capitalize(row.original.severity),
					className: severityClass(row.original.severity)
				});
			}
		},
		{
			accessorKey: 'started_at',
			header: 'Time',
			cell: ({ row }) => {
				const snippet = createRawSnippet<[{ time: string }]>((getData) => {
					const { time } = getData();
					return { render: () => `<div class="tabular-nums">${time}</div>` };
				});
				return renderSnippet(snippet, {
					time: formatAlertTime(row.original.started_at)
				});
			}
		}
	];

	const table = createSvelteTable({
		get data() {
			return rows;
		},
		columns,
		state: {
			get pagination() {
				return pagination;
			},
			get sorting() {
				return sorting;
			},
			get columnVisibility() {
				return columnVisibility;
			},
			get columnFilters() {
				return columnFilters;
			}
		},
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onPaginationChange: (updater) => {
			pagination = typeof updater === 'function' ? updater(pagination) : updater;
		},
		onSortingChange: (updater) => {
			sorting = typeof updater === 'function' ? updater(sorting) : updater;
		},
		onColumnFiltersChange: (updater) => {
			columnFilters = typeof updater === 'function' ? updater(columnFilters) : updater;
		},
		onColumnVisibilityChange: (updater) => {
			columnVisibility = typeof updater === 'function' ? updater(columnVisibility) : updater;
		}
	});

	async function fetchIncidents(cursor?: number) {
		const params = new URLSearchParams({ limit: '20' });
		if (typeof cursor === 'number') params.set('cursor', String(cursor));
		const res = await fetch(`${API_BASE}/incidents?${params.toString()}`);
		if (!res.ok) {
			const body = await res.text();
			throw new Error(body || `Request failed (${res.status})`);
		}
		return (await res.json()) as IncidentsResponse;
	}

	async function loadInitialIncidents() {
		loading = true;
		error = '';
		try {
			const data = await fetchIncidents();
			rows = data.incidents ?? [];
			nextCursor = data.next_cursor ?? null;
			hasMore = !!data.has_more;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load incidents';
		} finally {
			loading = false;
		}
	}

	async function loadMoreIncidents() {
		if (!hasMore || nextCursor == null || loadingMore) return;
		loadingMore = true;
		try {
			const data = await fetchIncidents(nextCursor);
			rows = [...rows, ...(data.incidents ?? [])];
			nextCursor = data.next_cursor ?? null;
			hasMore = !!data.has_more;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load more incidents';
		} finally {
			loadingMore = false;
		}
	}

	onMount(() => {
		const stored = localStorage.getItem(PROJECT_STORAGE_KEY);
		if (stored?.trim()) projectName = stored.trim();
		void loadInitialIncidents();
	});
</script>

<main class="bg-background min-h-svh px-6 pb-14 pt-24 md:px-10 md:pb-20 md:pt-28">
	<section class="mx-auto w-full max-w-6xl space-y-8">
		<header>
			<h1 class="font-serif text-5xl italic tracking-tight md:text-6xl">Incidents for {projectName}</h1>
		</header>

		{#if loading}
			<div class="max-w-md">
				<Item.Root variant="muted">
					<Item.Media>
						<Spinner />
					</Item.Media>
					<Item.Content>
						<Item.Title>Loading incidents...</Item.Title>
					</Item.Content>
				</Item.Root>
			</div>
		{:else if error}
			<div class="space-y-3">
				<p class="text-sm text-red-500">{error}</p>
				<Button variant="outline" onclick={loadInitialIncidents}>Retry</Button>
			</div>
		{:else}
			<div class="-mb-8 w-full">
				<div class="flex items-center gap-3 py-4">
					<Input
						placeholder="Filter incidents..."
						value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
						oninput={(e) => table.getColumn('title')?.setFilterValue(e.currentTarget.value)}
						onchange={(e) => table.getColumn('title')?.setFilterValue(e.currentTarget.value)}
						class="max-w-sm"
					/>
					<DropdownMenu.Root>
						<DropdownMenu.Trigger>
							{#snippet child({ props })}
								<Button {...props} variant="outline" class="ms-auto">
									Columns <ChevronDownIcon class="ms-2 size-4" />
								</Button>
							{/snippet}
						</DropdownMenu.Trigger>
						<DropdownMenu.Content align="end">
							{#each table
								.getAllColumns()
								.filter((col) => col.getCanHide()) as column (column.id)}
								<DropdownMenu.CheckboxItem
									class="capitalize"
									bind:checked={() => column.getIsVisible(), (v) => column.toggleVisibility(!!v)}
								>
									{column.id}
								</DropdownMenu.CheckboxItem>
							{/each}
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</div>

				<div class="mb-4 flex flex-wrap items-center gap-2">
					<button type="button" onclick={() => applyQuickFilter('all')}>
						<Badge variant={quickFilter === 'all' ? 'default' : 'outline'}>
							All {rows.length}
						</Badge>
					</button>
					<button type="button" onclick={() => applyQuickFilter('critical')}>
						<Badge variant={quickFilter === 'critical' ? 'destructive' : 'outline'}>
							Critical {rows.filter((r) => r.severity.toLowerCase() === 'critical').length}
						</Badge>
					</button>
					<button type="button" onclick={() => applyQuickFilter('warn')}>
						<Badge variant={quickFilter === 'warn' ? 'secondary' : 'outline'}>
							Warn {rows.filter((r) => r.severity.toLowerCase() === 'warn').length}
						</Badge>
					</button>
					<button type="button" onclick={() => applyQuickFilter('info')}>
						<Badge variant={quickFilter === 'info' ? 'secondary' : 'outline'}>
							Info {rows.filter((r) => r.severity.toLowerCase() === 'info').length}
						</Badge>
					</button>
					<button type="button" onclick={() => applyQuickFilter('triggered')}>
						<Badge variant={quickFilter === 'triggered' ? 'default' : 'outline'}>
							Triggered {rows.filter((r) => r.status.toLowerCase() === 'triggered').length}
						</Badge>
					</button>
					<button type="button" onclick={() => applyQuickFilter('resolved')}>
						<Badge variant={quickFilter === 'resolved' ? 'default' : 'outline'}>
							Resolved {rows.filter((r) => r.status.toLowerCase() === 'resolved').length}
						</Badge>
					</button>
				</div>

				<div class="rounded-md border border-[rgba(255,255,255,0.18)]">
					<Table.Root>
						<Table.Header>
							{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
								<Table.Row>
									{#each headerGroup.headers as header (header.id)}
										<Table.Head>
											{#if !header.isPlaceholder}
												{#if header.column.getCanSort()}
													<Button
														variant="ghost"
														class="-ms-3 h-8"
														onclick={header.column.getToggleSortingHandler()}
													>
														<FlexRender
															content={header.column.columnDef.header}
															context={header.getContext()}
														/>
														<ArrowUpDownIcon class="ms-2 size-4" />
													</Button>
												{:else}
													<FlexRender
														content={header.column.columnDef.header}
														context={header.getContext()}
													/>
												{/if}
											{/if}
										</Table.Head>
									{/each}
								</Table.Row>
							{/each}
						</Table.Header>
						<Table.Body>
							{#each table.getRowModel().rows as row (row.id)}
								<Table.Row
									class={`cursor-pointer transition-colors hover:bg-accent/30 ${incidentStateClass(row.original)}`}
									onclick={() => goto(`/incidents/${row.original.id}`)}
								>
									{#each row.getVisibleCells() as cell (cell.id)}
										<Table.Cell>
											<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
										</Table.Cell>
									{/each}
								</Table.Row>
							{:else}
								<Table.Row>
									<Table.Cell colspan={columns.length} class="h-24 text-center">
										No results.
									</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</div>

				<div class="flex items-center justify-end space-x-2 pt-4">
					<div class="text-muted-foreground flex-1 text-sm">
						{table.getFilteredRowModel().rows.length} incident(s)
					</div>
					<div class="space-x-2">
						<Button
							variant="outline"
							size="sm"
							onclick={() => table.previousPage()}
							disabled={!table.getCanPreviousPage()}
						>
							Previous
						</Button>
						<Button
							variant="outline"
							size="sm"
							onclick={() => table.nextPage()}
							disabled={!table.getCanNextPage()}
						>
							Next
						</Button>
					</div>
				</div>

				{#if hasMore}
					<div class="flex items-center justify-end pt-2">
						<Button variant="outline" onclick={loadMoreIncidents} disabled={loadingMore}>
							{loadingMore ? 'Loading...' : 'Load more from backend'}
						</Button>
					</div>
				{/if}
			</div>
		{/if}
	</section>
</main>
