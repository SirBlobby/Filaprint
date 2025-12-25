<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";

  interface Props extends HTMLInputAttributes {
    label?: string;
    class?: string;
    error?: string;
  }

  let {
    label,
    value = $bindable(),
    class: className = "",
    error,
    ...rest
  }: Props = $props();
</script>

<div class={className}>
  <label class="space-y-2 block">
    {#if label}
      <span
        class="block text-xs font-medium text-text-muted uppercase tracking-wider"
      >
        {label}
      </span>
    {/if}

    <input
      class="w-full rounded-lg bg-surface-800/50 border border-surface-700 px-4 py-2.5 text-sm text-text-main placeholder-text-muted focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all duration-200 hover:border-surface-600"
      bind:value
      {...rest}
    />
  </label>

  {#if error}
    <p class="text-xs text-red-500 mt-2">{error}</p>
  {/if}
</div>
