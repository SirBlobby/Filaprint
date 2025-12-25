<script lang="ts">
  interface Props {
    children: import("svelte").Snippet;
    class?: string;
  }

  let { children, class: className = "" }: Props = $props();
</script>

<div class="glass-card p-6 border border-white/5 bg-slate-900/50 {className}">
  {@render children()}
</div>
