<script lang="ts">
	import { enhance } from "$app/forms";
	import { browser } from "$app/environment";
	import Button from "$lib/components/ui/Button.svelte";
	import Modal from "$lib/components/ui/Modal.svelte";
	import Input from "$lib/components/ui/Input.svelte";
	import Icon from "@iconify/svelte";

	interface Props {
		open: boolean;
		print: any;
		printers: any[];
		spools: any[];
		onclose: () => void;
	}

	let { open, print, printers, spools, onclose }: Props = $props();
	let isSubmitting = $state(false);
	let editStatus = $state("Success");

	// Derived values for hours/minutes from print.duration_minutes
	let durationHours = $derived(
		print ? Math.floor(print.duration_minutes / 60) : 0,
	);
	let durationMins = $derived(print ? print.duration_minutes % 60 : 0);

	// Update editStatus when print changes
	$effect(() => {
		if (print) {
			editStatus = print.status || "Success";
		}
	});

	function handleClose() {
		editStatus = "Success";
		onclose();
	}

	async function handleDelete() {
		if (!confirm("Are you sure you want to delete this print log?")) return;
		isSubmitting = true;
		const formData = new FormData();
		formData.append("id", print._id);
		await fetch("?/delete", { method: "POST", body: formData });
		isSubmitting = false;
		handleClose();
		window.location.reload();
	}

	// STL Upload
	let stlFile = $state<File | null>(null);
	let uploadProgress = $state(0);
	let uploadStatus = $state("");

	function uploadSTL(): Promise<string> {
		return new Promise((resolve) => {
			if (!stlFile) {
				resolve("");
				return;
			}

			uploadStatus = "Uploading...";
			uploadProgress = 0;

			const formData = new FormData();
			formData.append("stl", stlFile);

			const xhr = new XMLHttpRequest();

			xhr.upload.addEventListener("progress", (e) => {
				if (e.lengthComputable) {
					uploadProgress = Math.round((e.loaded / e.total) * 100);
				}
			});

			xhr.addEventListener("load", () => {
				if (xhr.status === 200) {
					const data = JSON.parse(xhr.responseText);
					uploadStatus = "Uploaded!";
					uploadProgress = 100;
					resolve(data.path);
				} else {
					uploadStatus = "Upload failed";
					resolve("");
				}
			});

			xhr.addEventListener("error", () => {
				uploadStatus = "Upload error";
				resolve("");
			});

			xhr.open("POST", "/api/upload-stl");
			xhr.send(formData);
		});
	}

	function handleFileSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files[0]) {
			stlFile = input.files[0];
			uploadStatus = stlFile.name;
			uploadProgress = 0;
		}
	}
</script>

<Modal title="Edit Print Log" {open} onclose={handleClose}>
	{#if print}
		<form
			method="POST"
			action="?/edit"
			use:enhance={async ({ formData }) => {
				isSubmitting = true;

				// Upload STL file first if selected
				if (stlFile) {
					const uploadedPath = await uploadSTL();
					if (uploadedPath) {
						formData.set("stl_file", uploadedPath);
					}
				}

				// Convert hours + minutes to total minutes
				const hours = Number(formData.get("duration_hours") || 0);
				const mins = Number(formData.get("duration_mins") || 0);
				formData.set("duration_minutes", String(hours * 60 + mins));

				// Convert elapsed hours + minutes to total minutes
				const elapsedHours = Number(formData.get("elapsed_hours") || 0);
				const elapsedMins = Number(formData.get("elapsed_mins") || 0);
				formData.set(
					"elapsed_minutes",
					String(elapsedHours * 60 + elapsedMins),
				);

				return async ({ update }) => {
					await update();
					isSubmitting = false;
					handleClose();
				};
			}}
			class="space-y-4"
		>
			<input type="hidden" name="id" value={print._id} />

			<!-- Status Selection -->
			<div class="space-y-2">
				<!-- svelte-ignore a11y_label_has_associated_control -->
				<label
					class="block text-xs font-medium text-slate-400 uppercase tracking-wider"
					>Status</label
				>
				<div class="grid grid-cols-2 gap-2">
					<label class="cursor-pointer">
						<input
							type="radio"
							name="status"
							value="In Progress"
							class="peer sr-only"
							bind:group={editStatus}
						/>
						<div
							class="flex items-center justify-center gap-2 py-2 rounded-lg border border-slate-700 text-slate-400 peer-checked:bg-blue-500/20 peer-checked:text-blue-400 peer-checked:border-blue-500/50 transition-all"
						>
							<Icon icon="mdi:printer-3d" class="w-4 h-4" /> In Progress
						</div>
					</label>
					<label class="cursor-pointer">
						<input
							type="radio"
							name="status"
							value="Success"
							class="peer sr-only"
							bind:group={editStatus}
						/>
						<div
							class="flex items-center justify-center gap-2 py-2 rounded-lg border border-slate-700 text-slate-400 peer-checked:bg-green-500/20 peer-checked:text-green-400 peer-checked:border-green-500/50 transition-all"
						>
							<Icon icon="mdi:check" class="w-4 h-4" /> Success
						</div>
					</label>
					<label class="cursor-pointer">
						<input
							type="radio"
							name="status"
							value="Fail"
							class="peer sr-only"
							bind:group={editStatus}
						/>
						<div
							class="flex items-center justify-center gap-2 py-2 rounded-lg border border-slate-700 text-slate-400 peer-checked:bg-red-500/20 peer-checked:text-red-400 peer-checked:border-red-500/50 transition-all"
						>
							<Icon icon="mdi:close" class="w-4 h-4" /> Fail
						</div>
					</label>
					<label class="cursor-pointer">
						<input
							type="radio"
							name="status"
							value="Cancelled"
							class="peer sr-only"
							bind:group={editStatus}
						/>
						<div
							class="flex items-center justify-center gap-2 py-2 rounded-lg border border-slate-700 text-slate-400 peer-checked:bg-slate-600/20 peer-checked:text-slate-300 peer-checked:border-slate-500/50 transition-all"
						>
							<Icon icon="mdi:cancel" class="w-4 h-4" /> Cancelled
						</div>
					</label>
				</div>
			</div>

			<Input label="Print Name" name="name" value={print.name} required />

			<!-- STL Viewer/Upload -->
			<div class="space-y-2">
				<!-- svelte-ignore a11y_label_has_associated_control -->
				<label
					class="block text-xs font-medium text-slate-400 uppercase tracking-wider"
				>
					3D Model {print.stl_file ? "" : "(Optional)"}
				</label>

				{#if print.stl_file && browser && !stlFile}
					<!-- Show existing STL viewer -->
					<div
						class="flex justify-center bg-slate-900 rounded-lg p-2"
					>
						{#await import("$lib/components/STLViewer.svelte") then { default: STLViewer }}
							<STLViewer
								modelPath={print.stl_file}
								width={400}
								height={250}
							/>
						{/await}
					</div>
					<p class="text-xs text-slate-500 text-center">
						Click below to replace with a new model
					</p>
				{/if}

				<!-- Upload button or progress -->
				{#if uploadStatus === "Uploading..." && uploadProgress > 0}
					<!-- Progress Bar -->
					<div class="space-y-2">
						<div class="flex items-center justify-between text-xs">
							<span class="text-slate-400">{stlFile?.name}</span>
							<span class="text-blue-400">{uploadProgress}%</span>
						</div>
						<div
							class="w-full h-2 bg-slate-800 rounded-full overflow-hidden"
						>
							<div
								class="h-full bg-blue-500 rounded-full transition-all duration-150"
								style="width: {uploadProgress}%"
							></div>
						</div>
					</div>
				{:else}
					<div class="flex items-center gap-3">
						<label class="flex-1 cursor-pointer">
							<div
								class="flex items-center justify-center gap-2 py-3 px-4 rounded-lg border border-dashed border-slate-600 hover:border-blue-500 hover:bg-blue-500/5 transition-all text-slate-400 hover:text-blue-400"
							>
								<Icon icon="mdi:file-upload" class="w-5 h-5" />
								<span class="text-sm">
									{#if uploadStatus === "Uploaded!"}
										<span class="text-green-400"
											>✓ {stlFile?.name}</span
										>
									{:else if uploadStatus}
										{uploadStatus}
									{:else if print.stl_file}
										Replace model file...
									{:else}
										Choose model file...
									{/if}
								</span>
							</div>
							<input
								type="file"
								accept=".stl,.obj"
								class="sr-only"
								onchange={handleFileSelect}
							/>
						</label>
						{#if stlFile}
							<button
								type="button"
								class="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
								onclick={() => {
									stlFile = null;
									uploadProgress = 0;
									uploadStatus = "";
								}}
							>
								<Icon icon="mdi:close" class="w-5 h-5" />
							</button>
						{/if}
					</div>
				{/if}
			</div>

			{#if editStatus === "In Progress"}
				<!-- In Progress specific fields -->
				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-2">
						<!-- svelte-ignore a11y_label_has_associated_control -->
						<label
							class="block text-xs font-medium text-slate-400 uppercase tracking-wider"
							>Printer</label
						>
						<select
							name="printer_id"
							class="w-full rounded-lg bg-slate-800/50 border border-slate-700 px-4 py-2.5 text-sm text-slate-100 focus:border-blue-500 focus:outline-none"
						>
							{#each printers as p}
								<option
									value={p._id}
									selected={print.printer_id?._id === p._id ||
										print.printer_id === p._id}
									>{p.name}</option
								>
							{/each}
						</select>
					</div>
					<div class="space-y-2">
						<!-- svelte-ignore a11y_label_has_associated_control -->
						<label
							class="block text-xs font-medium text-slate-400 uppercase tracking-wider"
							>Spool</label
						>
						<select
							name="spool_id"
							class="w-full rounded-lg bg-slate-800/50 border border-slate-700 px-4 py-2.5 text-sm text-slate-100 focus:border-blue-500 focus:outline-none"
						>
							{#each spools as s}
								<option
									value={s._id}
									selected={print.spool_id?._id === s._id ||
										print.spool_id === s._id}
									>{s.brand}
									{s.material} ({s.weight_remaining_g}g left)</option
								>
							{/each}
						</select>
					</div>
				</div>

				<div
					class="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20"
				>
					<p class="text-xs text-blue-300 mb-3">
						<Icon
							icon="mdi:information"
							class="w-4 h-4 inline mr-1"
						/>
						Update the total print time and how long it's been running.
					</p>
					<div class="space-y-3">
						<div class="space-y-2">
							<!-- svelte-ignore a11y_label_has_associated_control -->
							<label
								class="block text-xs font-medium text-slate-400 uppercase tracking-wider"
								>Total Duration</label
							>
							<div class="grid grid-cols-2 gap-2">
								<div class="relative">
									<input
										type="number"
										name="duration_hours"
										value={durationHours}
										min="0"
										class="w-full rounded-lg bg-slate-800/50 border border-slate-700 px-4 py-2.5 text-sm text-slate-100 focus:border-blue-500 focus:outline-none pr-8"
									/>
									<span
										class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500"
										>hr</span
									>
								</div>
								<div class="relative">
									<input
										type="number"
										name="duration_mins"
										value={durationMins}
										min="0"
										max="59"
										class="w-full rounded-lg bg-slate-800/50 border border-slate-700 px-4 py-2.5 text-sm text-slate-100 focus:border-blue-500 focus:outline-none pr-10"
									/>
									<span
										class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500"
										>min</span
									>
								</div>
							</div>
						</div>
						<div class="space-y-2">
							<!-- svelte-ignore a11y_label_has_associated_control -->
							<label
								class="block text-xs font-medium text-slate-400 uppercase tracking-wider"
								>Already Elapsed</label
							>
							<div class="grid grid-cols-2 gap-2">
								<div class="relative">
									<input
										type="number"
										name="elapsed_hours"
										placeholder="0"
										min="0"
										value="0"
										class="w-full rounded-lg bg-slate-800/50 border border-slate-700 px-4 py-2.5 text-sm text-slate-100 focus:border-blue-500 focus:outline-none pr-8"
									/>
									<span
										class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500"
										>hr</span
									>
								</div>
								<div class="relative">
									<input
										type="number"
										name="elapsed_mins"
										placeholder="0"
										min="0"
										max="59"
										value="0"
										class="w-full rounded-lg bg-slate-800/50 border border-slate-700 px-4 py-2.5 text-sm text-slate-100 focus:border-blue-500 focus:outline-none pr-10"
									/>
									<span
										class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500"
										>min</span
									>
								</div>
							</div>
						</div>
					</div>
					<div class="grid grid-cols-2 gap-4 mt-3">
						<Input
							label="Expected Filament (g)"
							name="filament_used_g"
							type="number"
							value={print.filament_used_g}
							required
						/>
						<Input
							label="Cost ($)"
							name="manual_cost"
							type="number"
							step="0.01"
							placeholder="Auto"
						/>
					</div>
				</div>
			{:else}
				<!-- Completed print fields -->
				<div class="space-y-4">
					<div class="space-y-2">
						<!-- svelte-ignore a11y_label_has_associated_control -->
						<label
							class="block text-xs font-medium text-slate-400 uppercase tracking-wider"
							>Duration</label
						>
						<div class="grid grid-cols-2 gap-2">
							<div class="relative">
								<input
									type="number"
									name="duration_hours"
									value={durationHours}
									min="0"
									class="w-full rounded-lg bg-slate-800/50 border border-slate-700 px-4 py-2.5 text-sm text-slate-100 focus:border-blue-500 focus:outline-none pr-8"
								/>
								<span
									class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500"
									>hr</span
								>
							</div>
							<div class="relative">
								<input
									type="number"
									name="duration_mins"
									value={durationMins}
									min="0"
									max="59"
									class="w-full rounded-lg bg-slate-800/50 border border-slate-700 px-4 py-2.5 text-sm text-slate-100 focus:border-blue-500 focus:outline-none pr-10"
								/>
								<span
									class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500"
									>min</span
								>
							</div>
						</div>
					</div>
					<div class="grid grid-cols-2 gap-4">
						<Input
							label="Used (g)"
							name="filament_used_g"
							type="number"
							value={print.filament_used_g}
							required
						/>
						<Input
							label="Cost ($)"
							name="manual_cost"
							type="number"
							step="0.01"
							placeholder="Auto"
						/>
					</div>
				</div>
			{/if}

			<div class="pt-4 flex justify-between">
				<Button
					variant="destructive"
					type="button"
					disabled={isSubmitting}
					onclick={handleDelete}
				>
					Delete
				</Button>
				<div class="flex gap-3">
					<Button variant="ghost" onclick={handleClose} type="button"
						>Cancel</Button
					>
					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting ? "Saving..." : "Save Changes"}
					</Button>
				</div>
			</div>
		</form>
	{/if}
</Modal>
