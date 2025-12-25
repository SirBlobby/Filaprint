<script lang="ts">
	import { page } from "$app/stores";
	import Icon from "@iconify/svelte";

	let { data } = $props();
	let mobileMenuOpen = $state(false);

	let links = $derived([
		{ name: "Dashboard", href: "/", icon: "mdi:view-dashboard" },
		{ name: "Spools", href: "/spools", icon: "mdi:cylinder" },
		{ name: "Printers", href: "/printers", icon: "mdi:printer-3d" },
		{ name: "Prints", href: "/prints", icon: "mdi:cube-outline" },
		{ name: "Analytics", href: "/analytics", icon: "mdi:chart-line" },
		...($page.data.user?.role === "Admin"
			? [
					{
						name: "Users",
						href: "/admin/users",
						icon: "mdi:account-group",
					},
				]
			: []),
	]);

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}
</script>

<!-- Desktop Navbar -->
<nav
	class="fixed top-0 left-0 h-full w-64 bg-surface-900 border-r border-surface-700/50 p-4 hidden md:flex flex-col z-50"
>
	<div class="mb-8 px-2">
		<h1
			class="text-2xl font-bold bg-linear-to-r from-primary to-accent bg-clip-text text-transparent"
		>
			Filaprint
		</h1>
		<p class="text-xs text-text-muted mt-1">3D Printer Manager</p>
	</div>

	<div class="space-y-1">
		{#each links as link}
			<a
				href={link.href}
				class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
               {$page.url.pathname === link.href
					? 'bg-primary/10 text-primary border border-primary/20'
					: 'text-text-muted hover:text-text-main hover:bg-surface-800'}"
			>
				<Icon icon={link.icon} class="w-5 h-5" />
				{link.name}
			</a>
		{/each}
	</div>

	<div class="mt-auto pt-4 border-t border-surface-700/50">
		{#if $page.data.user}
			<div class="flex items-center px-2 py-2">
				<a
					href="/settings"
					class="flex items-center flex-1 min-w-0 hover:opacity-80 transition-opacity"
				>
					<div
						class="w-8 h-8 rounded-full bg-linear-to-br from-primary to-accent"
					></div>
					<div class="ml-3 flex-1 min-w-0">
						<p class="text-sm font-medium text-text-main truncate">
							{$page.data.user.username}
						</p>
						<p class="text-xs text-text-muted">
							{$page.data.user.role || "Maker"}
						</p>
					</div>
				</a>
				<form action="/logout" method="POST">
					<button
						type="submit"
						class="p-1.5 text-text-muted hover:text-red-400 transition-colors"
						title="Sign Out"
					>
						<Icon icon="mdi:logout" class="w-5 h-5" />
					</button>
				</form>
			</div>
		{:else}
			<div class="px-2 py-2">
				<a
					href="/login"
					class="text-sm text-primary hover:text-primary-400 font-medium"
					>Sign In</a
				>
			</div>
		{/if}
	</div>
</nav>

<!-- Mobile Header -->
<div
	class="md:hidden fixed top-0 w-full h-16 border-b border-surface-700/50 flex items-center justify-between px-4 z-50"
	style="background-color: #18181b;"
>
	<span
		class="text-xl font-bold bg-linear-to-r from-primary to-accent bg-clip-text text-transparent"
	>
		Filaprint
	</span>
	<button
		class="text-text-muted p-2 hover:bg-surface-800 rounded-lg transition-colors"
		onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
	>
		<Icon
			icon={mobileMenuOpen ? "mdi:close" : "mdi:menu"}
			class="w-6 h-6"
		/>
	</button>
</div>

<!-- Mobile Menu Overlay -->
{#if mobileMenuOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="md:hidden fixed inset-0 bg-black/70 z-40"
		onclick={closeMobileMenu}
	></div>

	<div
		class="md:hidden fixed top-16 left-0 right-0 z-50 p-4 space-y-2 animate-slide-down border-b border-surface-700/50"
		style="background-color: #18181b;"
	>
		{#each links as link}
			<a
				href={link.href}
				onclick={closeMobileMenu}
				class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
               {$page.url.pathname === link.href
					? 'bg-primary/10 text-primary border border-primary/20'
					: 'text-text-muted hover:text-text-main hover:bg-surface-800'}"
			>
				<Icon icon={link.icon} class="w-5 h-5" />
				{link.name}
			</a>
		{/each}

		<div class="border-t border-surface-700/50 pt-3 mt-3">
			{#if $page.data.user}
				<a
					href="/settings"
					onclick={closeMobileMenu}
					class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-text-muted hover:text-text-main hover:bg-surface-800 transition-all"
				>
					<div
						class="w-8 h-8 rounded-full bg-linear-to-br from-primary to-accent"
					></div>
					<div>
						<p class="text-text-main">{$page.data.user.username}</p>
						<p class="text-xs text-text-muted">
							{$page.data.user.role || "Maker"}
						</p>
					</div>
				</a>
				<form action="/logout" method="POST" class="mt-2">
					<button
						type="submit"
						class="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
					>
						<Icon icon="mdi:logout" class="w-5 h-5" />
						Sign Out
					</button>
				</form>
			{:else}
				<a
					href="/login"
					onclick={closeMobileMenu}
					class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-primary hover:bg-primary/10 transition-all"
				>
					<Icon icon="mdi:login" class="w-5 h-5" />
					Sign In
				</a>
			{/if}
		</div>
	</div>
{/if}

<style>
	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	.animate-slide-down {
		animation: slideDown 0.2s ease-out;
	}
</style>
