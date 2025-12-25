<script lang="ts">
  import { enhance } from "$app/forms";
  import Button from "$lib/components/ui/Button.svelte";
  import Modal from "$lib/components/ui/Modal.svelte";
  import Input from "$lib/components/ui/Input.svelte";
  import Icon from "@iconify/svelte";

  interface Props {
    open: boolean;
    printers: any[];
    spools: any[];
    onclose: () => void;
  }

  let { open, printers, spools, onclose }: Props = $props();
  let isSubmitting = $state(false);
  let selectedStatus = $state("Success");

  function handleClose() {
    selectedStatus = "Success";
    onclose();
  }
</script>

<Modal title="Log a Print" {open} onclose={handleClose}>
  <form
    method="POST"
    action="?/log"
    use:enhance={() => {
      isSubmitting = true;
      return async ({ update }) => {
        await update();
        isSubmitting = false;
        handleClose();
      };
    }}
    class="space-y-4"
  >
    <!-- Status Selection First -->
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
            bind:group={selectedStatus}
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
            bind:group={selectedStatus}
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
            bind:group={selectedStatus}
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
            bind:group={selectedStatus}
          />
          <div
            class="flex items-center justify-center gap-2 py-2 rounded-lg border border-slate-700 text-slate-400 peer-checked:bg-slate-600/20 peer-checked:text-slate-300 peer-checked:border-slate-500/50 transition-all"
          >
            <Icon icon="mdi:cancel" class="w-4 h-4" /> Cancelled
          </div>
        </label>
      </div>
    </div>

    <Input
      label="Print Name"
      name="name"
      placeholder="Dragon Scale Mail"
      required
    />

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
            <option value={p._id}>{p.name}</option>
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
            <option value={s._id}
              >{s.brand} {s.material} ({s.weight_remaining_g}g left)</option
            >
          {/each}
        </select>
      </div>
    </div>

    {#if selectedStatus === "In Progress"}
      <!-- In Progress specific fields -->
      <div class="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
        <p class="text-xs text-blue-300 mb-3">
          <Icon icon="mdi:information" class="w-4 h-4 inline mr-1" />
          Enter the expected total print time and how long it's been running.
        </p>
        <div class="grid grid-cols-2 gap-4">
          <Input
            label="Total Duration (min)"
            name="duration_minutes"
            type="number"
            placeholder="120"
            required
          />
          <Input
            label="Already Elapsed (min)"
            name="elapsed_minutes"
            type="number"
            placeholder="0"
            value="0"
          />
        </div>
        <div class="grid grid-cols-2 gap-4 mt-3">
          <Input
            label="Expected Filament (g)"
            name="filament_used_g"
            type="number"
            placeholder="50"
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
      <div class="grid grid-cols-3 gap-4">
        <Input
          label="Duration (min)"
          name="duration_minutes"
          type="number"
          placeholder="60"
          required
        />
        <Input
          label="Used (g)"
          name="filament_used_g"
          type="number"
          placeholder="15"
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
    {/if}

    <div class="pt-4 flex justify-end gap-3">
      <Button variant="ghost" onclick={handleClose} type="button">Cancel</Button
      >
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting
          ? "Saving..."
          : selectedStatus === "In Progress"
            ? "Start Print"
            : "Save Log"}
      </Button>
    </div>
  </form>
</Modal>
