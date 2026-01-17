<script lang="ts">
	import Card from "$lib/components/ui/Card.svelte";
	import Button from "$lib/components/ui/Button.svelte";
	import Icon from "@iconify/svelte";
	import { onMount, onDestroy } from "svelte";
	import { browser } from "$app/environment";

	import LogPrintModal from "$lib/components/prints/LogPrintModal.svelte";

	let { data } = $props();
	// svelte-ignore non_reactive_update
	let stats = $derived(data.stats);
	// svelte-ignore non_reactive_update
	let recentPrints = $derived(data.recentPrints || []);
	// svelte-ignore non_reactive_update
	let activePrinter = $derived(data.activePrinter);
	// svelte-ignore non_reactive_update
	let activePrintJob = $derived(data.activePrintJob);
	// svelte-ignore non_reactive_update
	let spools = $derived(data.spools || []);
	// svelte-ignore non_reactive_update
	let printers = $derived(data.printers || []);

	let showQuickLogModal = $state(false);

	// Timer state
	let currentTime = $state(Date.now());
	let timerInterval: ReturnType<typeof setInterval>;
	let notificationSent = $state(false);

	// ... (rest of onMount/onDestroy/notifications - keeping as is)
	onMount(() => {
		// Request notification permission
		if (
			browser &&
			"Notification" in window &&
			Notification.permission === "default"
		) {
			Notification.requestPermission();
		}

		// Update timer every 10 seconds
		timerInterval = setInterval(() => {
			currentTime = Date.now();

			// Check if print is complete
			if (activePrintJob && !notificationSent) {
				const progress = getProgress(
					activePrintJob.started_at,
					activePrintJob.duration_minutes,
				);
				if (progress >= 100) {
					sendNotification();
					notificationSent = true;
				}
			}
		}, 10000);
	});

	onDestroy(() => {
		if (timerInterval) clearInterval(timerInterval);
	});

	function sendNotification() {
		if (
			browser &&
			"Notification" in window &&
			Notification.permission === "granted"
		) {
			new Notification("🎉 Print Complete!", {
				body: `Your print "${activePrintJob?.name}" has finished!`,
				icon: "/favicon.png",
			});
		}
	}

	// Calculate time remaining for active print
	function getTimeRemaining(
		startedAt: string,
		durationMinutes: number,
	): string {
		if (!startedAt) return "--:--";
		const start = new Date(startedAt).getTime();
		const elapsed = Math.floor((currentTime - start) / 60000); // minutes
		const remaining = Math.max(0, durationMinutes - elapsed);
		if (remaining === 0) return "Complete!";
		const hours = Math.floor(remaining / 60);
		const mins = remaining % 60;
		return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
	}

	function getProgress(startedAt: string, durationMinutes: number): number {
		if (!startedAt || !durationMinutes) return 0;
		const start = new Date(startedAt).getTime();
		const elapsed = (currentTime - start) / 60000;
		return Math.min(100, Math.max(0, (elapsed / durationMinutes) * 100));
	}
</script>

<div class="space-y-8 fade-in">
	<!-- Header -->
	<div
		class="flex flex-col md:flex-row md:items-center justify-between gap-4"
	>
		<div>
			<h1 class="text-3xl font-bold tracking-tight text-white/90">
				Dashboard
			</h1>
			<p class="text-slate-400 mt-1">
				Welcome back to your printing hub.
			</p>
		</div>
		<div class="flex gap-3">
			<Button
				variant="secondary"
				size="sm"
				onclick={() => (showQuickLogModal = true)}>Quick Log</Button
			>
			<a href="/prints">
				<Button variant="primary" size="sm" class="shadow-blue-500/20">
					<span class="mr-2 text-lg leading-none">+</span> New Print
				</Button>
			</a>
		</div>
	</div>

	<!-- Stats Grid -->
	<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
		<Card class="relative overflow-hidden group">
			<div
				class="absolute inset-0 bg-linear-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
			></div>
			<div class="relative z-10">
				<p
					class="text-xs font-medium text-slate-400 uppercase tracking-wider"
				>
					Active Spools
				</p>
				<div class="flex items-baseline mt-2">
					<span class="text-3xl font-bold text-white"
						>{stats.spoolCount}</span
					>
				</div>
			</div>
		</Card>

		<Card class="relative overflow-hidden group">
			<div
				class="absolute inset-0 bg-linear-to-br from-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
			></div>
			<div class="relative z-10">
				<p
					class="text-xs font-medium text-slate-400 uppercase tracking-wider"
				>
					Filament On Hand
				</p>
				<div class="flex items-baseline mt-2">
					{#if stats.totalWeightG >= 1000}
						<span class="text-3xl font-bold text-white"
							>{stats.totalWeightKg}<span
								class="text-sm font-normal text-slate-500 ml-1"
								>kg</span
							></span
						>
					{:else}
						<span class="text-3xl font-bold text-white"
							>{stats.totalWeightG}<span
								class="text-sm font-normal text-slate-500 ml-1"
								>g</span
							></span
						>
					{/if}
				</div>
			</div>
		</Card>

		<Card class="relative overflow-hidden group">
			<div
				class="absolute inset-0 bg-linear-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
			></div>
			<div class="relative z-10">
				<p
					class="text-xs font-medium text-slate-400 uppercase tracking-wider"
				>
					Printers
				</p>
				<div class="flex items-baseline mt-2">
					<span class="text-3xl font-bold text-white"
						>{stats.printerCount}</span
					>
				</div>
			</div>
		</Card>

		<Card class="relative overflow-hidden group">
			<div
				class="absolute inset-0 bg-linear-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
			></div>
			<div class="relative z-10">
				<p
					class="text-xs font-medium text-slate-400 uppercase tracking-wider"
				>
					Est. Value
				</p>
				<div class="flex items-baseline mt-2">
					<span class="text-3xl font-bold text-white"
						>${stats.estimatedValue}</span
					>
				</div>
			</div>
		</Card>

		<Card class="relative overflow-hidden group">
			<div
				class="absolute inset-0 bg-linear-to-br from-rose-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
			></div>
			<div class="relative z-10">
				<p
					class="text-xs font-medium text-slate-400 uppercase tracking-wider"
				>
					Total Spent
				</p>
				<div class="flex items-baseline mt-2">
					<span class="text-3xl font-bold text-white"
						>${stats.totalSpent}</span
					>
				</div>
			</div>
		</Card>
	</div>

	<!-- Main Content Grid -->
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<!-- Recent Activity -->
		<div class="lg:col-span-2 space-y-6">
			<div class="flex items-center justify-between">
				<h2 class="text-xl font-semibold text-white/90">
					Recent Activity
				</h2>
				<a
					href="/prints"
					class="text-xs text-blue-400 hover:text-blue-300 transition-colors"
					>View All</a
				>
			</div>

			{#if recentPrints.length === 0}
				<Card
					class="min-h-[300px] flex items-center justify-center border-dashed border-slate-700 bg-transparent/50"
				>
					<div class="text-center">
						<div
							class="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-600"
						>
							<Icon
								icon="mdi:printer-3d-nozzle"
								class="w-6 h-6"
							/>
						</div>
						<p class="text-slate-500">No recent prints found</p>
						<a href="/prints">
							<Button
								variant="ghost"
								size="sm"
								class="mt-2 text-blue-400 hover:text-blue-300"
								>Log a Print</Button
							>
						</a>
					</div>
				</Card>
			{:else}
				<div class="space-y-3">
					{#each recentPrints as print}
						<Card
							class="flex items-center justify-between p-4! hover:bg-slate-800/80 transition-colors group"
						>
							<div class="flex items-center gap-4">
								<div
									class="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center group-hover:scale-105 transition-transform
                             {print.status === 'Fail'
										? 'text-red-400 bg-red-500/10'
										: print.status === 'In Progress'
											? 'text-blue-400 bg-blue-500/10'
											: 'text-blue-400 bg-blue-500/10'}"
								>
									{#if print.status === "Success"}
										<Icon
											icon="mdi:check-circle"
											class="w-5 h-5 text-green-400"
										/>
									{:else if print.status === "Fail"}
										<Icon
											icon="mdi:close-circle"
											class="w-5 h-5"
										/>
									{:else if print.status === "In Progress"}
										<Icon
											icon="mdi:loading"
											class="w-5 h-5 animate-spin"
										/>
									{:else}
										<Icon
											icon="mdi:printer-3d"
											class="w-5 h-5"
										/>
									{/if}
								</div>
								<div>
									<h4
										class="text-sm font-semibold text-white"
									>
										{print.name}
									</h4>
									<p class="text-xs text-slate-400 mt-0.5">
										{print.printer_id?.name ||
											"Unknown Printer"} • {print.filament_used_g}g
									</p>
								</div>
							</div>
							<div class="text-right">
								<span
									class="px-2 py-0.5 rounded text-[10px] font-medium
                           {print.status === 'Success'
										? 'bg-green-500/10 text-green-400'
										: print.status === 'Fail'
											? 'bg-red-500/10 text-red-400'
											: 'bg-slate-700 text-slate-400'}"
								>
									{print.status}
								</span>
								<p class="text-xs text-slate-500 mt-1">
									{new Date(print.date).toLocaleDateString(
										"en-US",
										{
											timeZone: "UTC",
										},
									)}
								</p>
							</div>
						</Card>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Quick Actions / Status -->
		<div class="space-y-6">
			<h2 class="text-xl font-semibold text-white/90">Printer Status</h2>
			<Card>
				{#if activePrintJob}
					<!-- Active Print Job -->
					<div class="flex items-center justify-between mb-4">
						<span class="font-medium text-white"
							>{activePrintJob.printer_id?.name ||
								"Unknown Printer"}</span
						>
						<span
							class="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wide bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse"
							>Printing</span
						>
					</div>

					<div class="space-y-4">
						<!-- Job Name -->
						<div>
							<p class="text-xs text-slate-400 mb-1">
								Currently Printing
							</p>
							<p class="text-sm font-semibold text-white">
								{activePrintJob.name}
							</p>
						</div>

						<!-- Progress Bar -->
						<div class="space-y-1.5">
							<div
								class="flex justify-between text-xs text-slate-400 font-medium"
							>
								<span>Progress</span>
								<span class="text-slate-200"
									>{Math.round(
										getProgress(
											activePrintJob.started_at,
											activePrintJob.duration_minutes,
										),
									)}%</span
								>
							</div>
							<div
								class="h-2 bg-surface-800 rounded-full overflow-hidden"
							>
								<div
									class="h-full bg-blue-500 transition-all duration-1000"
									style="width: {getProgress(
										activePrintJob.started_at,
										activePrintJob.duration_minutes,
									)}%"
								></div>
							</div>
						</div>

						<!-- Time & Material Info -->
						<div class="grid grid-cols-2 gap-4 text-sm">
							<div>
								<p class="text-xs text-slate-400">
									Time Remaining
								</p>
								<p class="font-medium text-white">
									{getTimeRemaining(
										activePrintJob.started_at,
										activePrintJob.duration_minutes,
									)}
								</p>
							</div>
							<div>
								<p class="text-xs text-slate-400">Filament</p>
								<p class="font-medium text-white">
									{activePrintJob.filament_used_g}g
								</p>
							</div>
						</div>

						<!-- Spool Info -->
						{#if activePrintJob.spool_id}
							<div class="flex items-center gap-2 text-sm">
								<div
									class="w-3 h-3 rounded-full"
									style="background-color: {activePrintJob
										.spool_id.color_hex}"
								></div>
								<span class="text-slate-300"
									>{activePrintJob.spool_id.brand}
									{activePrintJob.spool_id.material ||
										""}</span
								>
							</div>
						{/if}
					</div>

					<div class="mt-6 pt-4 border-t border-surface-700/50">
						<a href="/prints" class="block">
							<Button
								variant="secondary"
								size="sm"
								class="w-full text-xs">View All Prints</Button
							>
						</a>
					</div>
				{:else if activePrinter}
					<!-- Idle State -->
					<div class="flex items-center justify-between mb-4">
						<span class="font-medium text-white"
							>{activePrinter.name}</span
						>
						<span
							class="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wide bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
							>Idle</span
						>
					</div>
					<div class="text-center py-4">
						<p class="text-sm text-slate-400 mb-4">
							No active print job
						</p>
						<a href="/prints">
							<Button variant="primary" size="sm"
								>Start a Print</Button
							>
						</a>
					</div>
					<div class="mt-4 pt-4 border-t border-surface-700/50">
						<a href="/printers" class="block">
							<Button
								variant="secondary"
								size="sm"
								class="w-full text-xs">Manage Printer</Button
							>
						</a>
					</div>
				{:else}
					<div class="text-center py-6">
						<p class="text-sm text-text-muted mb-4">
							No printers configured
						</p>
						<a href="/printers">
							<Button variant="primary" size="sm"
								>Add Printer</Button
							>
						</a>
					</div>
				{/if}
			</Card>
		</div>
	</div>
</div>

<LogPrintModal
	open={showQuickLogModal}
	{printers}
	{spools}
	onclose={() => (showQuickLogModal = false)}
	action="/prints?/log"
/>

<style>
	/* Simple entry animation */
	.fade-in {
		animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
		opacity: 0;
		transform: translateY(10px);
	}
	@keyframes fadeIn {
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
