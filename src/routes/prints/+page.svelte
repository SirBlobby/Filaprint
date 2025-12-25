<script lang="ts">
	import Button from "$lib/components/ui/Button.svelte";
	import Card from "$lib/components/ui/Card.svelte";
	import Icon from "@iconify/svelte";
	import LogPrintModal from "$lib/components/prints/LogPrintModal.svelte";
	import EditPrintModal from "$lib/components/prints/EditPrintModal.svelte";

	let { data } = $props();
	let showLogModal = $state(false);
	let showEditModal = $state(false);
	let editingPrint: any = $state(null);

	// svelte-ignore non_reactive_update
	let prints = $derived(data.prints || []);
	// svelte-ignore non_reactive_update
	let spools = $derived(data.spools || []);
	// svelte-ignore non_reactive_update
	let printers = $derived(data.printers || []);

	function openEditModal(print: any) {
		editingPrint = { ...print };
		showEditModal = true;
	}

	function closeEditModal() {
		showEditModal = false;
		editingPrint = null;
	}
</script>

<div class="space-y-6 fade-in">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-white">Print History</h1>
			<p class="text-slate-400 mt-1">
				Track your usage and successful prints
			</p>
		</div>
		<Button onclick={() => (showLogModal = true)}>
			<Icon icon="mdi:plus" class="w-4 h-4 mr-2" /> Log Print
		</Button>
	</div>

	<div class="space-y-4">
		{#each prints as print}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div onclick={() => openEditModal(print)} class="cursor-pointer">
				<Card
					class="flex flex-col md:flex-row items-start md:items-center gap-4 hover:bg-slate-800/80 transition-colors"
				>
					<!-- Status Icon -->
					<div
						class="w-10 h-10 rounded-full flex items-center justify-center shrink-0
              {print.status === 'Success'
							? 'bg-green-500/10 text-green-400'
							: print.status === 'Fail'
								? 'bg-red-500/10 text-red-400'
								: print.status === 'In Progress'
									? 'bg-blue-500/10 text-blue-400 animate-pulse'
									: 'bg-slate-500/10 text-slate-400'}"
					>
						{#if print.status === "Success"}
							<Icon icon="mdi:check-circle" class="w-5 h-5" />
						{:else if print.status === "Fail"}
							<Icon icon="mdi:close-circle" class="w-5 h-5" />
						{:else if print.status === "In Progress"}
							<Icon
								icon="mdi:loading"
								class="w-5 h-5 animate-spin"
							/>
						{:else}
							<Icon icon="mdi:cancel" class="w-5 h-5" />
						{/if}
					</div>

					<div class="flex-1 min-w-0">
						<h3 class="text-white font-medium truncate">
							{print.name}
						</h3>
						<div
							class="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-slate-400"
						>
							<span class="flex items-center">
								<span
									class="w-2 h-2 rounded-full mr-1.5"
									style="background-color: {print.spool_id
										?.color_hex}"
								></span>
								{print.spool_id?.brand || "Unknown Spool"}
							</span>
							<span>•</span>
							<span
								>{print.printer_id?.name ||
									"Unknown Printer"}</span
							>
							<span>•</span>
							<span
								>{new Date(
									print.date,
								).toLocaleDateString()}</span
							>
						</div>
					</div>

					<div class="flex items-center gap-6 text-sm text-slate-400">
						<div class="text-right">
							<p
								class="text-xs uppercase tracking-wider text-slate-500"
							>
								Duration
							</p>
							<p class="text-white">{print.duration_minutes}m</p>
						</div>
						<div class="text-right">
							<p
								class="text-xs uppercase tracking-wider text-slate-500"
							>
								Weight
							</p>
							<p class="text-white">{print.filament_used_g}g</p>
						</div>
						<div class="text-right min-w-[60px]">
							<p
								class="text-xs uppercase tracking-wider text-slate-500"
							>
								Cost
							</p>
							<p class="text-white font-medium">
								${print.calculated_cost_filament?.toFixed(2) ||
									"0.00"}
							</p>
						</div>
					</div>
				</Card>
			</div>
		{/each}

		{#if prints.length === 0}
			<div class="text-center py-12 text-slate-500">
				No prints logged yet. Start printing!
			</div>
		{/if}
	</div>
</div>

<!-- Modals -->
<LogPrintModal
	open={showLogModal}
	{printers}
	{spools}
	onclose={() => (showLogModal = false)}
/>

<EditPrintModal
	open={showEditModal}
	print={editingPrint}
	{printers}
	{spools}
	onclose={closeEditModal}
/>

<style>
	.fade-in {
		animation: fadeIn 0.4s ease-out;
	}
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
