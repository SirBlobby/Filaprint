<script lang="ts">
  import Card from "$lib/components/ui/Card.svelte";

  let { data } = $props();
  // svelte-ignore non_reactive_update
  let users = $derived(data.users || []);
</script>

<div class="space-y-6 fade-in">
  <div>
    <h1 class="text-3xl font-bold text-white">User Management</h1>
    <p class="text-text-muted mt-1">Manage platform access</p>
  </div>

  <Card class="overflow-x-auto">
    <table class="w-full text-left">
      <thead
        class="text-xs text-text-muted uppercase border-b border-surface-700/50"
      >
        <tr>
          <th class="px-4 py-3 font-medium">Username</th>
          <th class="px-4 py-3 font-medium">Role</th>
          <th class="px-4 py-3 font-medium">Joined</th>
          <th class="px-4 py-3 font-medium text-right">Actions</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-surface-700/50">
        {#each users as user}
          <tr
            class="text-sm font-medium hover:bg-surface-800/50 transition-colors"
          >
            <td class="px-4 py-3 text-white">{user.username}</td>
            <td class="px-4 py-3">
              <span
                class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                                {user.role === 'Admin'
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'bg-surface-700 text-text-muted'}"
              >
                {user.role}
              </span>
            </td>
            <td class="px-4 py-3 text-text-muted"
              >{new Date(user.createdAt).toLocaleDateString()}</td
            >
            <td class="px-4 py-3 text-right">
              {#if user.role !== "Admin"}
                <button
                  class="text-red-400 hover:text-red-300 transition-colors text-xs"
                  >Delete</button
                >
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </Card>
</div>
