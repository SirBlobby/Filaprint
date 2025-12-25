<script lang="ts">
  import { enhance } from "$app/forms";
  import Button from "$lib/components/ui/Button.svelte";
  import Card from "$lib/components/ui/Card.svelte";
  import Modal from "$lib/components/ui/Modal.svelte";
  import Input from "$lib/components/ui/Input.svelte";
  import Icon from "@iconify/svelte";

  let { data } = $props();
  let showAddModal = $state(false);
  let showEditModal = $state(false);
  let isSubmitting = $state(false);

  // Form state for add
  let formColor = $state("#3b82f6");
  let formInitial = $state(1000);
  let formRemaining = $state(1000);

  // Edit state
  let editingSpool: any = $state(null);

  // svelte-ignore non_reactive_update
  let spools = $derived(data.spools || []);

  function openEditModal(spool: any) {
    editingSpool = { ...spool };
    showEditModal = true;
  }

  function closeEditModal() {
    showEditModal = false;
    editingSpool = null;
  }
</script>

<div class="space-y-6 fade-in">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold text-white">My Spools</h1>
      <p class="text-slate-400 mt-1">Manage your filament inventory</p>
    </div>
    <Button onclick={() => (showAddModal = true)}>
      <Icon icon="mdi:plus" class="w-4 h-4 mr-2" /> Add Spool
    </Button>
  </div>

  {#if spools.length === 0}
    <Card class="flex flex-col items-center justify-center py-12 border-dashed">
      <div
        class="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 text-slate-500"
      >
        <Icon icon="mdi:shape-outline" class="w-8 h-8" />
      </div>
      <h3 class="text-lg font-medium text-white">No spools yet</h3>
      <p class="text-slate-500 mb-6 max-w-sm text-center">
        Add your first filament spool to start tracking usage and costs.
      </p>
      <Button onclick={() => (showAddModal = true)} variant="secondary"
        >Add First Spool</Button
      >
    </Card>
  {:else}
    <div
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      {#each spools as spool}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div onclick={() => openEditModal(spool)} class="cursor-pointer">
          <Card
            class="group relative overflow-hidden transition-all hover:-translate-y-1"
          >
            <!-- Color Strip -->
            <div
              class="absolute top-0 left-0 w-1.5 h-full"
              style="background-color: {spool.color_hex}; box-shadow: 0 0 10px {spool.color_hex}40;"
            ></div>

            <div class="pl-4">
              <div class="flex justify-between items-start mb-2">
                <div>
                  <span
                    class="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700"
                    >{spool.material}</span
                  >
                  <h3
                    class="text-lg font-semibold text-white mt-2 leading-tight"
                  >
                    {spool.brand}
                  </h3>
                </div>
                <div
                  class="w-8 h-8 rounded-full border border-white/10"
                  style="background-color: {spool.color_hex}"
                ></div>
              </div>

              <div class="mt-4 space-y-2">
                <div class="flex justify-between text-sm text-slate-400">
                  <span>Remaining</span>
                  <span class="text-white font-medium"
                    >{spool.weight_remaining_g}g</span
                  >
                </div>
                <!-- Progress Bar -->
                <div class="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all duration-500"
                    style="width: {(spool.weight_remaining_g /
                      spool.weight_initial_g) *
                      100}%; background-color: {spool.color_hex};"
                  ></div>
                </div>
                <div class="flex justify-between text-xs text-slate-500 pt-1">
                  <span>{spool.weight_initial_g}g Initial</span>
                  <span>${spool.price}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      {/each}
    </div>
  {/if}
</div>

<!-- Add Modal -->
<Modal
  title="Add New Spool"
  open={showAddModal}
  onclose={() => (showAddModal = false)}
>
  <form
    method="POST"
    action="?/create"
    use:enhance={() => {
      isSubmitting = true;
      return async ({ update }) => {
        await update();
        isSubmitting = false;
        showAddModal = false;
      };
    }}
    class="space-y-4"
  >
    <div class="grid grid-cols-2 gap-4">
      <Input label="Brand" name="brand" placeholder="e.g. Prusament" required />

      <label class="space-y-2 block">
        <span
          class="block text-xs font-medium text-text-muted uppercase tracking-wider"
          >Material</span
        >
        <select
          name="material"
          class="w-full rounded-lg bg-surface-800/50 border border-surface-700 px-4 py-2.5 text-sm text-text-main focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
        >
          <option value="PLA">PLA</option>
          <option value="PETG">PETG</option>
          <option value="ABS">ABS</option>
          <option value="TPU">TPU</option>
          <option value="ASA">ASA</option>
          <option value="Other">Other</option>
        </select>
      </label>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div class="space-y-2">
        <!-- svelte-ignore a11y_label_has_associated_control -->
        <label
          class="block text-xs font-medium text-text-muted uppercase tracking-wider"
          >Color</label
        >
        <div
          class="relative h-[42px] w-full rounded-lg bg-surface-800/50 border border-surface-700 flex items-center px-2 hover:border-surface-600 transition-colors"
        >
          <input
            name="color_hex"
            type="color"
            bind:value={formColor}
            class="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
          />
          <div
            class="w-full h-4 rounded"
            style="background-color: {formColor}; transition: background-color 0.2s;"
          ></div>
        </div>
      </div>
      <Input
        label="Price ($)"
        name="price"
        type="number"
        step="0.01"
        placeholder="0.00"
      />
    </div>

    <div class="grid grid-cols-2 gap-4">
      <Input
        label="Initial (g)"
        name="weight_initial_g"
        type="number"
        bind:value={formInitial}
        required
      />
      <Input
        label="Current (g)"
        name="weight_remaining_g"
        type="number"
        bind:value={formRemaining}
      />
    </div>

    <div class="pt-4 flex justify-end gap-3">
      <Button
        variant="ghost"
        onclick={() => (showAddModal = false)}
        type="button">Cancel</Button
      >
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save Spool"}
      </Button>
    </div>
  </form>
</Modal>

<!-- Edit Modal -->
<Modal title="Edit Spool" open={showEditModal} onclose={closeEditModal}>
  {#if editingSpool}
    <form
      method="POST"
      action="?/edit"
      use:enhance={() => {
        isSubmitting = true;
        return async ({ update }) => {
          await update();
          isSubmitting = false;
          closeEditModal();
        };
      }}
      class="space-y-4"
    >
      <input type="hidden" name="id" value={editingSpool._id} />

      <div class="grid grid-cols-2 gap-4">
        <Input label="Brand" name="brand" value={editingSpool.brand} required />

        <label class="space-y-2 block">
          <span
            class="block text-xs font-medium text-text-muted uppercase tracking-wider"
            >Material</span
          >
          <select
            name="material"
            value={editingSpool.material}
            class="w-full rounded-lg bg-surface-800/50 border border-surface-700 px-4 py-2.5 text-sm text-text-main focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
          >
            <option value="PLA">PLA</option>
            <option value="PETG">PETG</option>
            <option value="ABS">ABS</option>
            <option value="TPU">TPU</option>
            <option value="ASA">ASA</option>
            <option value="Other">Other</option>
          </select>
        </label>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-2">
          <!-- svelte-ignore a11y_label_has_associated_control -->
          <label
            class="block text-xs font-medium text-text-muted uppercase tracking-wider"
            >Color</label
          >
          <div
            class="relative h-[42px] w-full rounded-lg bg-surface-800/50 border border-surface-700 flex items-center px-2 hover:border-surface-600 transition-colors"
          >
            <input
              name="color_hex"
              type="color"
              bind:value={editingSpool.color_hex}
              class="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
            />
            <div
              class="w-full h-4 rounded"
              style="background-color: {editingSpool.color_hex}; transition: background-color 0.2s;"
            ></div>
          </div>
        </div>
        <Input
          label="Price ($)"
          name="price"
          type="number"
          step="0.01"
          value={editingSpool.price}
        />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <Input
          label="Initial (g)"
          name="weight_initial_g"
          type="number"
          value={editingSpool.weight_initial_g}
          required
        />
        <Input
          label="Current (g)"
          name="weight_remaining_g"
          type="number"
          value={editingSpool.weight_remaining_g}
        />
      </div>

      <div class="pt-4 flex justify-between">
        <Button
          variant="destructive"
          type="button"
          disabled={isSubmitting}
          onclick={async () => {
            if (!confirm("Are you sure you want to delete this spool?")) return;
            isSubmitting = true;
            const formData = new FormData();
            formData.append("id", editingSpool._id);
            await fetch("?/delete", { method: "POST", body: formData });
            isSubmitting = false;
            closeEditModal();
            window.location.reload();
          }}
        >
          Delete
        </Button>

        <div class="flex gap-3">
          <Button variant="ghost" onclick={closeEditModal} type="button"
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
