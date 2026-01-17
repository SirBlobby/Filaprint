<script lang="ts">
	import { fade, scale } from "svelte/transition";
	import type { Snippet } from "svelte";
	import Icon from "@iconify/svelte";

	interface Props {
		open: boolean;
		title: string;
		children: Snippet;
		onclose: () => void;
	}

	let { open, title, children, onclose }: Props = $props();
</script>

{#if open}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4"
		transition:fade={{ duration: 150 }}
	>
		<!-- Backdrop -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="fixed inset-0 bg-black/70" onclick={onclose}></div>

		<!-- Dialog Panel -->
		<div
			class="relative z-10 w-full max-w-lg rounded-xl border border-[#3f3f46] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
			style="background-color: #18181b;"
			transition:scale={{ duration: 150, start: 0.95 }}
		>
			<!-- Header -->
			<div
				class="flex items-center justify-between border-b border-[#3f3f46] px-6 py-4 shrink-0"
				style="background-color: #27272a;"
			>
				<h3 class="text-lg font-semibold text-white">{title}</h3>
				<button
					onclick={onclose}
					class="rounded p-1 text-[#a1a1aa] transition-colors hover:bg-[#3f3f46] hover:text-white"
					aria-label="Close"
					type="button"
				>
					<Icon icon="mdi:close" class="h-5 w-5" />
				</button>
			</div>

			<!-- Content -->
			<div class="p-6 overflow-y-auto">
				{@render children()}
			</div>
		</div>
	</div>
{/if}
