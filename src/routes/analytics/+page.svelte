<script lang="ts">
	import { onMount } from "svelte";
	import Chart from "chart.js/auto";
	import Card from "$lib/components/ui/Card.svelte";
	import Icon from "@iconify/svelte";

	let { data } = $props();
	// svelte-ignore non_reactive_update
	let analytics = $derived(data.analytics);

	let timelineCanvas: HTMLCanvasElement;
	let pieCanvas: HTMLCanvasElement;
	let electricityCanvas: HTMLCanvasElement;

	onMount(() => {
		// 1. Timeline Chart - Filament Usage
		const dates = Object.keys(analytics.usageByDate).slice(-30);
		const weights = dates.map((d) => analytics.usageByDate[d]);

		new Chart(timelineCanvas, {
			type: "line",
			data: {
				labels: dates,
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
					y: { grid: { color: "rgba(255,255,255,0.1)" } },
					x: { grid: { display: false } },
				},
			},
		});

		// 2. Material Pie Chart
		const materials = Object.keys(analytics.materialUsage);
		const matWeights = materials.map((m) => analytics.materialUsage[m]);
		const chartColors = [
			"#3b82f6",
			"#8b5cf6",
			"#10b981",
			"#f59e0b",
			"#ef4444",
			"#64748b",
		];

		new Chart(pieCanvas, {
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
					legend: { position: "right", labels: { color: "#94a3b8" } },
				},
			},
		});

		// 3. Electricity Usage Chart
		const electricDates = Object.keys(analytics.electricityByDate).slice(
			-30,
		);
		const electricityWh = electricDates.map(
			(d) => analytics.electricityByDate[d] / 1000,
		); // Convert to kWh

		new Chart(electricityCanvas, {
			type: "bar",
			data: {
				labels: electricDates,
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
						title: { display: true, text: "kWh", color: "#94a3b8" },
					},
					x: { grid: { display: false } },
				},
			},
		});
	});

	let totalPrints = $derived(
		analytics.successRate.success + analytics.successRate.fail,
	);
	let successRate = $derived(
		totalPrints > 0
			? Math.round((analytics.successRate.success / totalPrints) * 100)
			: 0,
	);
</script>

<div class="space-y-6 fade-in">
	<div>
		<h1 class="text-3xl font-bold text-white">Analytics</h1>
		<p class="text-slate-400 mt-1">Insights into your printing habits</p>
	</div>

	<!-- Stats Row -->
	<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
		<Card class="text-center">
			<p
				class="text-xs font-medium text-slate-400 uppercase tracking-wider"
			>
				Total Prints
			</p>
			<p class="text-3xl font-bold text-white mt-1">{totalPrints}</p>
		</Card>
		<Card class="text-center">
			<p
				class="text-xs font-medium text-slate-400 uppercase tracking-wider"
			>
				Success Rate
			</p>
			<p class="text-3xl font-bold text-emerald-400 mt-1">
				{successRate}%
			</p>
		</Card>
		<Card class="text-center">
			<p
				class="text-xs font-medium text-slate-400 uppercase tracking-wider"
			>
				Electricity Used
			</p>
			<p class="text-3xl font-bold text-amber-400 mt-1">
				{analytics.totalElectricity}<span
					class="text-sm font-normal text-slate-500 ml-1">kWh</span
				>
			</p>
		</Card>
		<Card class="text-center">
			<p
				class="text-xs font-medium text-slate-400 uppercase tracking-wider"
			>
				Materials
			</p>
			<p class="text-3xl font-bold text-violet-400 mt-1">
				{Object.keys(analytics.materialUsage).length}
			</p>
		</Card>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
		<!-- Usage Timeline -->
		<Card class="col-span-1 md:col-span-2 min-h-[350px]">
			<div class="flex items-center gap-2 mb-4">
				<Icon icon="mdi:scale" class="w-5 h-5 text-blue-400" />
				<h3 class="text-lg font-semibold text-white">
					Daily Filament Usage (g)
				</h3>
			</div>
			<div class="h-[280px]">
				<canvas bind:this={timelineCanvas}></canvas>
			</div>
		</Card>

		<!-- Electricity Usage Chart -->
		<Card class="col-span-1 md:col-span-2 min-h-[350px]">
			<div class="flex items-center gap-2 mb-4">
				<Icon
					icon="mdi:lightning-bolt"
					class="w-5 h-5 text-amber-400"
				/>
				<h3 class="text-lg font-semibold text-white">
					Daily Electricity Usage (kWh)
				</h3>
			</div>
			<div class="h-[280px]">
				<canvas bind:this={electricityCanvas}></canvas>
			</div>
		</Card>

		<!-- Success Rate Stat -->
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
			<p class="text-slate-400 mt-4 text-sm">
				{analytics.successRate.success} Success / {analytics.successRate
					.fail} Fail
			</p>
		</Card>

		<!-- Material Usage Pie -->
		<Card>
			<div class="flex items-center gap-2 mb-4">
				<Icon icon="mdi:chart-pie" class="w-5 h-5 text-violet-400" />
				<h3 class="text-lg font-semibold text-white">
					Material Distribution
				</h3>
			</div>
			<div class="h-[250px]">
				<canvas bind:this={pieCanvas}></canvas>
			</div>
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
