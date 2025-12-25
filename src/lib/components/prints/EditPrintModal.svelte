<script lang="ts">
  import { enhance } from "$app/forms";
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
</script>

<Modal title="Edit Print Log" {open} onclose={handleClose}>
  {#if print}
    <form
      method="POST"
      action="?/edit"
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
                    print.printer_id === p._id}>{p.name}</option
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
                  >{s.brand} {s.material} ({s.weight_remaining_g}g left)</option
                >
              {/each}
            </select>
          </div>
        </div>

        <div class="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <p class="text-xs text-blue-300 mb-3">
            <Icon icon="mdi:information" class="w-4 h-4 inline mr-1" />
            Update the total print time and how long it's been running.
          </p>
          <div class="grid grid-cols-2 gap-4">
            <Input
              label="Total Duration (min)"
              name="duration_minutes"
              type="number"
              value={print.duration_minutes}
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
              value={print.filament_used_g}
              required
            />
            <Input
              label="Cost ($)"
              name="manual_cost"
              type="number"
              step="0.01"
              value={print.calculated_cost_filament}
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
            value={print.duration_minutes}
            required
          />
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
            value={print.calculated_cost_filament}
          />
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
