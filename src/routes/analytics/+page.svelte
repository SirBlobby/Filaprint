<script lang="ts">
	import { goto } from "$app/navigation";
	import Chart from "chart.js/auto";
	import Card from "$lib/components/ui/Card.svelte";
	import Button from "$lib/components/ui/Button.svelte";
	import Icon from "@iconify/svelte";

	let { data } = $props();
	let analytics = $derived(data.analytics);

	// svelte-ignore non_reactive_update
	let timelineCanvas: HTMLCanvasElement;
	// svelte-ignore non_reactive_update
	let pieCanvas: HTMLCanvasElement;
	// svelte-ignore non_reactive_update
	let electricityCanvas: HTMLCanvasElement;
	// svelte-ignore non_reactive_update
	let costCanvas: HTMLCanvasElement;
	// svelte-ignore non_reactive_update
	let printerCanvas: HTMLCanvasElement;

	// Time range options
	const ranges = [
		{ value: "7", label: "7 Days" },
		{ value: "30", label: "30 Days" },
		{ value: "90", label: "90 Days" },
		{ value: "365", label: "1 Year" },
		{ value: "all", label: "All Time" },
	];
	let selectedRange = $derived(analytics.range);

	function changeRange(range: string) {
		goto(`/analytics?range=${range}`);
	}

	// Format minutes to hours:minutes
	function formatTime(minutes: number): string {
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		if (hours > 0) {
			return `${hours}h ${mins}m`;
		}
		return `${mins}m`;
	}

	// Format bytes to human readable
	function formatBytes(bytes: number): string {
		if (bytes === 0) return "0 B";
		const k = 1024;
		const sizes = ["B", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
	}

	// Chart instances
	let timelineChart: Chart | null = null;
	let pieChart: Chart | null = null;
	let electricityChart: Chart | null = null;
	let costChart: Chart | null = null;
	let printerChart: Chart | null = null;

	$effect(() => {
		// Cleanup previous charts
		if (timelineChart) timelineChart.destroy();
		if (pieChart) pieChart.destroy();
		if (electricityChart) electricityChart.destroy();
		if (costChart) costChart.destroy();
		if (printerChart) printerChart.destroy();

		const chartColors = [
			"#3b82f6",
			"#8b5cf6",
			"#10b981",
			"#f59e0b",
			"#ef4444",
			"#64748b",
		];

		// 1. Timeline Chart - Filament Usage
		if (timelineCanvas) {
			const dates = Object.keys(analytics.usageByDate).slice(-30);
			const weights = dates.map((d) => analytics.usageByDate[d]);

			timelineChart = new Chart(timelineCanvas, {
				type: "line",
				data: {
					labels: dates.map((d) =>
						new Date(d).toLocaleDateString("en-US", {
							month: "short",
							day: "numeric",
						}),
					),
					datasets: [
						{
							label: "Filament Usage (g)",
							data: weights,
							borderColor: "#3b82f6",
							backgroundColor: "rgba(59, 130, 246, 0.2)",
							tension: 0.4,
							fill: true,
						},
					],
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					plugins: {
						legend: { display: false },
					},
					scales: {
						y: {
							grid: { color: "rgba(255,255,255,0.1)" },
							ticks: { color: "#94a3b8" },
						},
						x: {
							grid: { display: false },
							ticks: { color: "#94a3b8" },
						},
					},
				},
			});
		}

		// 2. Material Pie Chart
		if (pieCanvas) {
			const materials = Object.keys(analytics.materialUsage);
			const matWeights = materials.map((m) => analytics.materialUsage[m]);

			pieChart = new Chart(pieCanvas, {
				type: "doughnut",
				data: {
					labels: materials,
					datasets: [
						{
							data: matWeights,
							backgroundColor: chartColors,
							borderWidth: 0,
						},
					],
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					plugins: {
						legend: {
							position: "right",
							labels: { color: "#94a3b8" },
						},
					},
				},
			});
		}

		// 3. Electricity Usage Chart
		if (electricityCanvas) {
			const electricDates = Object.keys(
				analytics.electricityByDate,
			).slice(-30);
			const electricityWh = electricDates.map(
				(d) => analytics.electricityByDate[d] / 1000,
			);

			electricityChart = new Chart(electricityCanvas, {
				type: "bar",
				data: {
					labels: electricDates.map((d) =>
						new Date(d).toLocaleDateString("en-US", {
							month: "short",
							day: "numeric",
						}),
					),
					datasets: [
						{
							label: "Electricity (kWh)",
							data: electricityWh,
							backgroundColor: "rgba(245, 158, 11, 0.6)",
							borderColor: "#f59e0b",
							borderWidth: 1,
							borderRadius: 4,
						},
					],
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					plugins: {
						legend: { display: false },
					},
					scales: {
						y: {
							grid: { color: "rgba(255,255,255,0.1)" },
							ticks: { color: "#94a3b8" },
							title: {
								display: true,
								text: "kWh",
								color: "#94a3b8",
							},
						},
						x: {
							grid: { display: false },
							ticks: { color: "#94a3b8" },
						},
					},
				},
			});
		}

		// 4. Cost Chart
		if (costCanvas) {
			const costDates = Object.keys(analytics.costByDate).slice(-30);
			const costs = costDates.map((d) => analytics.costByDate[d]);

			costChart = new Chart(costCanvas, {
				type: "line",
				data: {
					labels: costDates.map((d) =>
						new Date(d).toLocaleDateString("en-US", {
							month: "short",
							day: "numeric",
						}),
					),
					datasets: [
						{
							label: "Cost ($)",
							data: costs,
							borderColor: "#10b981",
							backgroundColor: "rgba(16, 185, 129, 0.2)",
							tension: 0.4,
							fill: true,
						},
					],
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					plugins: {
						legend: { display: false },
					},
					scales: {
						y: {
							grid: { color: "rgba(255,255,255,0.1)" },
							ticks: {
								color: "#94a3b8",
								callback: (value) => "$" + value,
							},
						},
						x: {
							grid: { display: false },
							ticks: { color: "#94a3b8" },
						},
					},
				},
			});
		}

		// 5. Printer Usage Chart
		if (printerCanvas && analytics.printerStats.length > 0) {
			printerChart = new Chart(printerCanvas, {
				type: "bar",
				data: {
					labels: analytics.printerStats.map(
						(p: { name: string }) => p.name,
					),
					datasets: [
						{
							label: "Prints",
							data: analytics.printerStats.map(
								(p: { count: number }) => p.count,
							),
							backgroundColor: chartColors,
							borderRadius: 6,
						},
					],
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					indexAxis: "y",
					plugins: {
						legend: { display: false },
					},
					scales: {
						y: {
							grid: { display: false },
							ticks: { color: "#94a3b8" },
						},
						x: {
							grid: { color: "rgba(255,255,255,0.1)" },
							ticks: { color: "#94a3b8" },
						},
					},
				},
			});
		}
	});

	// Derived values
	let totalPrints = $derived(
		analytics.successRate.success +
			analytics.successRate.fail +
			analytics.successRate.cancelled,
	);
	let successRate = $derived(
		totalPrints > 0
			? Math.round((analytics.successRate.success / totalPrints) * 100)
			: 0,
	);

	// Export to CSV
	function exportToCSV() {
		const headers = [
			"Date",
			"Filament (g)",
			"Electricity (kWh)",
			"Cost ($)",
		];
		const dates = Object.keys(analytics.usageByDate);
		const rows = dates.map((d) => [
			d,
			analytics.usageByDate[d] || 0,
			((analytics.electricityByDate[d] || 0) / 1000).toFixed(3),
			(analytics.costByDate[d] || 0).toFixed(2),
		]);

		const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join(
			"\n",
		);
		const blob = new Blob([csv], { type: "text/csv" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `filaprint-analytics-${new Date().toISOString().split("T")[0]}.csv`;
		a.click();
		URL.revokeObjectURL(url);
	}
</script>

<div class="space-y-6 fade-in">
	<div
		class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
	>
		<div>
			<h1 class="text-3xl font-bold text-white">Analytics</h1>
			<p class="text-slate-400 mt-1">
				Insights into your printing habits
			</p>
		</div>
		<div class="flex items-center gap-3">
			<!-- Time Range Selector -->
			<div class="flex bg-slate-800/50 rounded-lg p-1">
				{#each ranges as range}
					<button
						class="px-3 py-1.5 text-xs font-medium rounded-md transition-all {selectedRange ===
						range.value
							? 'bg-blue-500 text-white'
							: 'text-slate-400 hover:text-white'}"
						onclick={() => changeRange(range.value)}
					>
						{range.label}
					</button>
				{/each}
			</div>
			<!-- Export Button -->
			<Button variant="ghost" onclick={exportToCSV}>
				<Icon icon="mdi:download" class="w-4 h-4 mr-1" />
				Export
			</Button>
		</div>
	</div>

	<!-- Main Stats Row -->
	<div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
		<Card class="text-center">
			<p
				class="text-xs font-medium text-slate-400 uppercase tracking-wider"
			>
				Total Prints
			</p>
			<p class="text-2xl font-bold text-white mt-1">
				{analytics.totalPrints}
			</p>
		</Card>
		<Card class="text-center">
			<p
				class="text-xs font-medium text-slate-400 uppercase tracking-wider"
			>
				Success Rate
			</p>
			<p class="text-2xl font-bold text-emerald-400 mt-1">
				{successRate}%
			</p>
		</Card>
		<Card class="text-center">
			<p
				class="text-xs font-medium text-slate-400 uppercase tracking-wider"
			>
				Total Spent
			</p>
			<p class="text-2xl font-bold text-green-400 mt-1">
				${analytics.totalCost}
			</p>
		</Card>
		<Card class="text-center">
			<p
				class="text-xs font-medium text-slate-400 uppercase tracking-wider"
			>
				Filament Used
			</p>
			<p class="text-2xl font-bold text-blue-400 mt-1">
				{analytics.totalFilamentUsed}<span
					class="text-sm font-normal text-slate-500 ml-1">g</span
				>
			</p>
		</Card>
		<Card class="text-center">
			<p
				class="text-xs font-medium text-slate-400 uppercase tracking-wider"
			>
				Electricity
			</p>
			<p class="text-2xl font-bold text-amber-400 mt-1">
				{analytics.totalElectricity}<span
					class="text-sm font-normal text-slate-500 ml-1">kWh</span
				>
			</p>
		</Card>
		<Card class="text-center">
			<p
				class="text-xs font-medium text-slate-400 uppercase tracking-wider"
			>
				Print Time
			</p>
			<p class="text-2xl font-bold text-violet-400 mt-1">
				{formatTime(analytics.totalPrintTime)}
			</p>
		</Card>
	</div>

	<!-- Averages Row -->
	<div class="grid grid-cols-3 gap-4">
		<Card class="flex items-center gap-4">
			<div class="p-3 rounded-lg bg-blue-500/10">
				<Icon icon="mdi:timer-outline" class="w-8 h-8 text-blue-400" />
			</div>
			<div>
				<p class="text-xs text-slate-400 uppercase">Avg Print Time</p>
				<p class="text-xl font-bold text-white">
					{formatTime(analytics.avgPrintTime)}
				</p>
			</div>
		</Card>
		<Card class="flex items-center gap-4">
			<div class="p-3 rounded-lg bg-green-500/10">
				<Icon icon="mdi:currency-usd" class="w-8 h-8 text-green-400" />
			</div>
			<div>
				<p class="text-xs text-slate-400 uppercase">Avg Cost/Print</p>
				<p class="text-xl font-bold text-white">${analytics.avgCost}</p>
			</div>
		</Card>
		<Card class="flex items-center gap-4">
			<div class="p-3 rounded-lg bg-violet-500/10">
				<Icon icon="mdi:scale" class="w-8 h-8 text-violet-400" />
			</div>
			<div>
				<p class="text-xs text-slate-400 uppercase">
					Avg Filament/Print
				</p>
				<p class="text-xl font-bold text-white">
					{analytics.avgFilament}g
				</p>
			</div>
		</Card>
	</div>

	<!-- Cost Breakdown -->
	<Card>
		<div class="flex items-center justify-between mb-4">
			<div class="flex items-center gap-2">
				<Icon icon="mdi:wallet" class="w-5 h-5 text-green-400" />
				<h3 class="text-lg font-semibold text-white">Cost Breakdown</h3>
			</div>
		</div>
		<div class="grid grid-cols-3 gap-4">
			<div class="p-4 rounded-lg bg-slate-800/50 text-center">
				<p class="text-xs text-slate-400 uppercase mb-1">
					Filament Cost
				</p>
				<p class="text-2xl font-bold text-blue-400">
					${analytics.totalFilamentCost}
				</p>
			</div>
			<div class="p-4 rounded-lg bg-slate-800/50 text-center">
				<p class="text-xs text-slate-400 uppercase mb-1">Energy Cost</p>
				<p class="text-2xl font-bold text-amber-400">
					${analytics.totalEnergyCost}
				</p>
			</div>
			<div class="p-4 rounded-lg bg-slate-800/50 text-center">
				<p class="text-xs text-slate-400 uppercase mb-1">Total Cost</p>
				<p class="text-2xl font-bold text-green-400">
					${analytics.totalCost}
				</p>
			</div>
		</div>
	</Card>

	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
		<!-- Usage Timeline -->
		<Card class="min-h-[350px]">
			<div class="flex items-center gap-2 mb-4">
				<Icon icon="mdi:chart-line" class="w-5 h-5 text-blue-400" />
				<h3 class="text-lg font-semibold text-white">Filament Usage</h3>
			</div>
			<div class="h-[280px]">
				<canvas bind:this={timelineCanvas}></canvas>
			</div>
		</Card>

		<!-- Cost Timeline -->
		<Card class="min-h-[350px]">
			<div class="flex items-center gap-2 mb-4">
				<Icon
					icon="mdi:chart-areaspline"
					class="w-5 h-5 text-green-400"
				/>
				<h3 class="text-lg font-semibold text-white">Cost Over Time</h3>
			</div>
			<div class="h-[280px]">
				<canvas bind:this={costCanvas}></canvas>
			</div>
		</Card>

		<!-- Electricity Usage Chart -->
		<Card class="min-h-[350px]">
			<div class="flex items-center gap-2 mb-4">
				<Icon
					icon="mdi:lightning-bolt"
					class="w-5 h-5 text-amber-400"
				/>
				<h3 class="text-lg font-semibold text-white">
					Electricity Usage
				</h3>
			</div>
			<div class="h-[280px]">
				<canvas bind:this={electricityCanvas}></canvas>
			</div>
		</Card>

		<!-- Material Distribution -->
		<Card class="min-h-[350px]">
			<div class="flex items-center gap-2 mb-4">
				<Icon icon="mdi:chart-pie" class="w-5 h-5 text-violet-400" />
				<h3 class="text-lg font-semibold text-white">
					Material Distribution
				</h3>
			</div>
			<div class="h-[280px]">
				<canvas bind:this={pieCanvas}></canvas>
			</div>
		</Card>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<!-- Success Rate Ring -->
		<Card class="flex flex-col items-center justify-center py-8">
			<div class="relative w-32 h-32">
				<svg class="w-full h-full transform -rotate-90">
					<circle
						cx="64"
						cy="64"
						r="56"
						stroke="currentColor"
						stroke-width="12"
						fill="transparent"
						class="text-slate-800"
					/>
					<circle
						cx="64"
						cy="64"
						r="56"
						stroke="currentColor"
						stroke-width="12"
						fill="transparent"
						stroke-dasharray={351.86}
						stroke-dashoffset={351.86 -
							(351.86 * successRate) / 100}
						class="text-emerald-500 transition-all duration-1000"
					/>
				</svg>
				<div
					class="absolute inset-0 flex items-center justify-center flex-col"
				>
					<span class="text-3xl font-bold text-white"
						>{successRate}%</span
					>
					<span class="text-xs text-slate-400 uppercase">Success</span
					>
				</div>
			</div>
			<div class="flex items-center gap-4 mt-4 text-sm">
				<span class="flex items-center gap-1 text-emerald-400">
					<Icon icon="mdi:check-circle" class="w-4 h-4" />
					{analytics.successRate.success}
				</span>
				<span class="flex items-center gap-1 text-red-400">
					<Icon icon="mdi:close-circle" class="w-4 h-4" />
					{analytics.successRate.fail}
				</span>
				<span class="flex items-center gap-1 text-slate-400">
					<Icon icon="mdi:cancel" class="w-4 h-4" />
					{analytics.successRate.cancelled}
				</span>
			</div>
		</Card>

		<!-- Printer Usage -->
		<Card class="min-h-[280px]">
			<div class="flex items-center gap-2 mb-4">
				<Icon icon="mdi:printer-3d" class="w-5 h-5 text-blue-400" />
				<h3 class="text-lg font-semibold text-white">Printer Usage</h3>
			</div>
			{#if analytics.printerStats.length > 0}
				<div class="h-[200px]">
					<canvas bind:this={printerCanvas}></canvas>
				</div>
			{:else}
				<div
					class="flex items-center justify-center h-[200px] text-slate-500"
				>
					No printer data available
				</div>
			{/if}
		</Card>

		<!-- 3D Models Stats -->
		<Card>
			<div class="flex items-center gap-2 mb-4">
				<Icon icon="mdi:cube-scan" class="w-5 h-5 text-violet-400" />
				<h3 class="text-lg font-semibold text-white">3D Models</h3>
			</div>
			<div class="grid grid-cols-2 gap-4 mb-4">
				<div class="text-center p-3 bg-slate-800/50 rounded-lg">
					<p class="text-2xl font-bold text-violet-400">
						{analytics.printsWithModels}
					</p>
					<p class="text-xs text-slate-400 uppercase">
						Prints with Models
					</p>
				</div>
				<div class="text-center p-3 bg-slate-800/50 rounded-lg">
					<p class="text-2xl font-bold text-purple-400">
						{formatBytes(analytics.totalModelSize)}
					</p>
					<p class="text-xs text-slate-400 uppercase">Storage Used</p>
				</div>
			</div>
			{#if analytics.topModels.length > 0}
				<div class="space-y-2">
					<p class="text-xs text-slate-400 uppercase mb-2">
						Most Printed
					</p>
					{#each analytics.topModels as model}
						<div
							class="flex items-center justify-between text-sm py-1"
						>
							<span class="text-slate-300 truncate max-w-[150px]"
								>{model.name}</span
							>
							<span class="text-slate-500">{model.count}x</span>
						</div>
					{/each}
				</div>
			{:else}
				<p class="text-sm text-slate-500 text-center">
					No models uploaded yet
				</p>
			{/if}
		</Card>
	</div>
</div>

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
