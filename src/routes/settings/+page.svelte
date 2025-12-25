<script lang="ts">
	import { enhance } from "$app/forms";
	import Button from "$lib/components/ui/Button.svelte";
	import Card from "$lib/components/ui/Card.svelte";
	import Input from "$lib/components/ui/Input.svelte";
	import Icon from "@iconify/svelte";

	let { data, form } = $props();
	let userProfile = $derived(data.userProfile);
	let isSubmitting = $state(false);
	let showSuccess = $state(false);
	let successMessage = $state("");

	$effect(() => {
		if (form?.success || form?.passwordChanged) {
			showSuccess = true;
			successMessage = form.message || "Changes saved!";
			setTimeout(() => {
				showSuccess = false;
			}, 3000);
		}
	});
</script>

<div class="space-y-6 fade-in max-w-2xl">
	<div>
		<h1 class="text-3xl font-bold text-white">Settings</h1>
		<p class="text-slate-400 mt-1">Manage your account preferences</p>
	</div>

	{#if showSuccess}
		<div
			class="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 flex items-center gap-3"
		>
			<Icon icon="mdi:check-circle" class="w-5 h-5" />
			{successMessage}
		</div>
	{/if}

	{#if form?.message && !form?.success && !form?.passwordChanged}
		<div
			class="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3"
		>
			<Icon icon="mdi:alert-circle" class="w-5 h-5" />
			{form.message}
		</div>
	{/if}

	<!-- Profile Section -->
	<Card>
		<div class="flex items-center gap-3 mb-6">
			<Icon icon="mdi:account" class="w-6 h-6 text-primary" />
			<h2 class="text-xl font-semibold text-white">Profile</h2>
		</div>

		<form
			method="POST"
			action="?/updateProfile"
			use:enhance={() => {
				isSubmitting = true;
				return async ({ update }) => {
					await update();
					isSubmitting = false;
				};
			}}
			class="space-y-4"
		>
			<div class="flex items-center gap-4 mb-6">
				<div
					class="w-16 h-16 rounded-full bg-linear-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold text-white"
				>
					{userProfile?.username?.charAt(0).toUpperCase() || "U"}
				</div>
				<div>
					<p class="text-white font-medium">
						{userProfile?.username}
					</p>
					<p class="text-sm text-slate-400">{userProfile?.role}</p>
				</div>
			</div>

			<Input
				label="Username"
				name="username"
				value={userProfile?.username}
				required
			/>

			<Input
				label="Location"
				name="location"
				value={userProfile?.location || ""}
				placeholder="e.g., California, US or London, UK"
			/>

			<div class="grid grid-cols-2 gap-4">
				<Input
					label="Electricity Rate ($/kWh)"
					name="electricity_rate"
					type="number"
					step="0.01"
					value={userProfile?.electricity_rate || 0.12}
					placeholder="0.12"
				/>
				<div class="space-y-2">
					<p
						class="text-xs font-medium text-slate-400 uppercase tracking-wider"
					>
						Rate Info
					</p>
					<p class="text-xs text-slate-500 mt-2">
						Used to calculate electricity costs for your prints.
						Check your utility bill for your rate.
					</p>
				</div>
			</div>

			<div class="pt-2">
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting ? "Saving..." : "Save Changes"}
				</Button>
			</div>
		</form>
	</Card>

	<!-- Password Section -->
	<Card>
		<div class="flex items-center gap-3 mb-6">
			<Icon icon="mdi:lock" class="w-6 h-6 text-amber-400" />
			<h2 class="text-xl font-semibold text-white">Change Password</h2>
		</div>

		<form
			method="POST"
			action="?/changePassword"
			use:enhance={() => {
				isSubmitting = true;
				return async ({ update }) => {
					await update();
					isSubmitting = false;
				};
			}}
			class="space-y-4"
		>
			<Input
				label="Current Password"
				name="currentPassword"
				type="password"
				required
			/>
			<div class="grid grid-cols-2 gap-4">
				<Input
					label="New Password"
					name="newPassword"
					type="password"
					required
				/>
				<Input
					label="Confirm New Password"
					name="confirmPassword"
					type="password"
					required
				/>
			</div>

			<div class="pt-2">
				<Button
					type="submit"
					variant="secondary"
					disabled={isSubmitting}
				>
					{isSubmitting ? "Changing..." : "Change Password"}
				</Button>
			</div>
		</form>
	</Card>

	<!-- Danger Zone -->
	<Card class="border-red-500/20">
		<div class="flex items-center gap-3 mb-4">
			<Icon icon="mdi:alert" class="w-6 h-6 text-red-400" />
			<h2 class="text-xl font-semibold text-red-400">Danger Zone</h2>
		</div>

		<p class="text-slate-400 text-sm mb-4">
			Once you delete your account, there is no going back. Please be
			certain.
		</p>

		<Button
			variant="destructive"
			onclick={() => alert("Account deletion is not yet implemented")}
		>
			Delete Account
		</Button>
	</Card>
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
