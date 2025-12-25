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
  let editingPrinter: any = $state(null);

  // svelte-ignore non_reactive_update
  let printers = $derived(data.printers || []);

  function openEditModal(printer: any) {
    editingPrinter = { ...printer };
    showEditModal = true;
  }

  function closeEditModal() {
    showEditModal = false;
    editingPrinter = null;
  }
</script>

<div class="space-y-6 fade-in">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold text-white">Printers</h1>
      <p class="text-slate-400 mt-1">Configure your machines</p>
    </div>
    <Button onclick={() => (showAddModal = true)}>
      <Icon icon="mdi:plus" class="w-4 h-4 mr-2" /> Add Printer
    </Button>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {#each printers as printer}
      <Card class="group hover:-translate-y-1 transition-all">
        <div class="flex justify-between items-start">
          <h3 class="text-lg font-bold text-white">{printer.name}</h3>
          <span
            class="text-xs font-mono bg-slate-800 px-2 py-1 rounded text-slate-300"
          >
            {printer.model || "Unknown Model"}
          </span>
        </div>

        <div class="mt-4 space-y-2 text-sm text-slate-400">
          <div class="flex justify-between border-b border-white/5 pb-1">
            <span>Power</span>
            <span class="text-white">{printer.power_consumption_watts}W</span>
          </div>
          <div class="flex justify-between border-b border-white/5 pb-1">
            <span>Nozzle</span>
            <span class="text-white">{printer.nozzle_diameter_mm}mm</span>
          </div>
        </div>

        <div class="mt-6 flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            class="w-full"
            onclick={() => openEditModal(printer)}
          >
            <Icon icon="mdi:cog" class="w-4 h-4 mr-2" /> Configure
          </Button>
        </div>
      </Card>
    {/each}

    {#if printers.length === 0}
      <Card
        class="col-span-full flex flex-col items-center justify-center py-12 border-dashed"
      >
        <div
          class="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 text-slate-500"
        >
          <Icon icon="mdi:printer-3d" class="w-8 h-8" />
        </div>
        <h3 class="text-lg font-medium text-white">No printers yet</h3>
        <p class="text-slate-500 mb-6 max-w-sm text-center">
          Add your first 3D printer to start tracking prints.
        </p>
        <Button onclick={() => (showAddModal = true)} variant="secondary"
          >Add First Printer</Button
        >
      </Card>
    {/if}
  </div>
</div>

<!-- Add Printer Modal -->
<Modal
  title="Add New Printer"
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
    <Input label="Printer Name" name="name" placeholder="My Ender 3" required />
    <Input label="Model" name="model" placeholder="Creality Ender 3 V2" />

    <div class="grid grid-cols-2 gap-4">
      <Input
        label="Power (Watts)"
        name="power_consumption_watts"
        type="number"
        placeholder="350"
      />
      <Input
        label="Nozzle (mm)"
        name="nozzle_diameter_mm"
        type="number"
        step="0.1"
        value="0.4"
      />
    </div>

    <div class="pt-4 flex justify-end gap-3">
      <Button
        variant="ghost"
        onclick={() => (showAddModal = false)}
        type="button">Cancel</Button
      >
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Add Printer"}
      </Button>
    </div>
  </form>
</Modal>

<!-- Edit Printer Modal -->
<Modal title="Configure Printer" open={showEditModal} onclose={closeEditModal}>
  {#if editingPrinter}
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
      <input type="hidden" name="id" value={editingPrinter._id} />

      <Input
        label="Printer Name"
        name="name"
        value={editingPrinter.name}
        required
      />
      <Input label="Model" name="model" value={editingPrinter.model} />

      <div class="grid grid-cols-2 gap-4">
        <Input
          label="Power (Watts)"
          name="power_consumption_watts"
          type="number"
          value={editingPrinter.power_consumption_watts}
        />
        <Input
          label="Nozzle (mm)"
          name="nozzle_diameter_mm"
          type="number"
          step="0.1"
          value={editingPrinter.nozzle_diameter_mm}
        />
      </div>

      <div class="pt-4 flex justify-between">
        <Button
          variant="destructive"
          type="button"
          disabled={isSubmitting}
          onclick={async () => {
            if (!confirm("Are you sure you want to delete this printer?"))
              return;
            isSubmitting = true;
            const formData = new FormData();
            formData.append("id", editingPrinter._id);
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
