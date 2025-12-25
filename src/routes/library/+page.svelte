<script lang="ts">
	import { browser } from "$app/environment";
	import Card from "$lib/components/ui/Card.svelte";
	import Icon from "@iconify/svelte";

	let { data } = $props();
	let models = $derived(data.models);

	let selectedModel = $state<any>(null);
	let showViewer = $state(false);

	function openViewer(model: any) {
		selectedModel = model;
		showViewer = true;
	}

	function closeViewer() {
		selectedModel = null;
		showViewer = false;
	}

	function formatDate(dateStr: string) {
		return new Date(dateStr).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	}
</script>

<div class="space-y-6 fade-in">
	<div>
		<h1 class="text-3xl font-bold text-white">Model Library</h1>
		<p class="text-slate-400 mt-1">
			Browse your 3D model collection ({models.length} models)
		</p>
	</div>

	{#if models.length === 0}
		<Card class="text-center py-12">
			<Icon
				icon="mdi:cube-off-outline"
				class="w-16 h-16 text-slate-600 mx-auto mb-4"
			/>
			<h3 class="text-lg font-medium text-slate-300 mb-2">
				No Models Yet
			</h3>
			<p class="text-slate-500 max-w-md mx-auto">
				Upload STL files when logging prints to build your model
				library. Go to <a
					href="/prints"
					class="text-blue-400 hover:underline">Prints</a
				> to add your first model.
			</p>
		</Card>
	{:else}
		<div
			class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
		>
			{#each models as model}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					class="group cursor-pointer"
					onclick={() => openViewer(model)}
				>
					<Card
						class="overflow-hidden hover:ring-2 hover:ring-blue-500/50 transition-all duration-200"
					>
						<!-- Thumbnail/Preview -->
						<div
							class="aspect-square bg-slate-800 flex items-center justify-center relative overflow-hidden"
						>
							<Icon
								icon="mdi:cube-scan"
								class="w-20 h-20 text-slate-600 group-hover:text-blue-500 transition-colors"
							/>
							<div
								class="absolute inset-0 bg-linear-to-t from-slate-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4"
							>
								<span
									class="text-white text-sm font-medium flex items-center gap-1"
								>
									<Icon icon="mdi:eye" class="w-4 h-4" />
									View Model
								</span>
							</div>
						</div>

						<!-- Info -->
						<div class="p-4">
							<h3 class="font-medium text-white truncate">
								{model.name}
							</h3>
							<p class="text-xs text-slate-500 mt-1">
								{formatDate(model.date)}
							</p>
							<div
								class="flex items-center gap-2 mt-2 text-xs text-slate-400"
							>
								{#if model.status === "Success"}
									<span
										class="flex items-center gap-1 text-green-400"
									>
										<Icon
											icon="mdi:check-circle"
											class="w-3.5 h-3.5"
										/>
										Printed
									</span>
								{:else if model.status === "In Progress"}
									<span
										class="flex items-center gap-1 text-blue-400"
									>
										<Icon
											icon="mdi:printer-3d"
											class="w-3.5 h-3.5"
										/>
										Printing
									</span>
								{:else if model.status === "Fail"}
									<span
										class="flex items-center gap-1 text-red-400"
									>
										<Icon
											icon="mdi:close-circle"
											class="w-3.5 h-3.5"
										/>
										Failed
									</span>
								{/if}
							</div>
						</div>
					</Card>
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- Full Screen Viewer Modal -->
{#if showViewer && selectedModel && browser}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 bg-black/90 z-50 flex flex-col"
		onclick={closeViewer}
	>
		<!-- Header -->
		<div
			class="flex items-center justify-between p-4 border-b border-slate-800"
			onclick={(e) => e.stopPropagation()}
		>
			<div>
				<h2 class="text-xl font-bold text-white">
					{selectedModel.name}
				</h2>
				<p class="text-sm text-slate-400">
					{formatDate(selectedModel.date)}
				</p>
			</div>
			<button
				class="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
				onclick={closeViewer}
			>
				<Icon icon="mdi:close" class="w-6 h-6" />
			</button>
		</div>

		<!-- Viewer -->
		<div
			class="flex-1 flex items-center justify-center p-4"
			onclick={(e) => e.stopPropagation()}
		>
			{#await import("$lib/components/STLViewer.svelte") then { default: STLViewer }}
				<STLViewer
					modelPath={selectedModel.stl_file}
					width={Math.min(window.innerWidth - 48, 900)}
					height={Math.min(window.innerHeight - 200, 600)}
				/>
			{/await}
		</div>

		<!-- Footer Info -->
		<div
			class="p-4 border-t border-slate-800 flex items-center justify-center gap-8 text-sm"
			onclick={(e) => e.stopPropagation()}
		>
			{#if selectedModel.filament_used_g}
				<div class="text-slate-400">
					<span class="text-slate-500">Filament:</span>
					{selectedModel.filament_used_g}g
				</div>
			{/if}
			{#if selectedModel.duration_minutes}
				<div class="text-slate-400">
					<span class="text-slate-500">Duration:</span>
					{Math.floor(selectedModel.duration_minutes / 60)}h {selectedModel.duration_minutes %
						60}m
				</div>
			{/if}
			{#if selectedModel.calculated_cost_filament}
				<div class="text-slate-400">
					<span class="text-slate-500">Cost:</span>
					${selectedModel.calculated_cost_filament.toFixed(2)}
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.fade-in {
		animation: fadeIn 0.3s ease-out;
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
