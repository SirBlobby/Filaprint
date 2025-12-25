<script lang="ts">
  import { type Snippet } from "svelte";

  interface Props {
    children: Snippet;
    variant?: "primary" | "secondary" | "ghost" | "destructive";
    size?: "sm" | "md" | "lg";
    class?: string;
    disabled?: boolean;
    onclick?: () => void;
    type?: "button" | "submit" | "reset";
  }

  let {
    children,
    variant = "primary",
    size = "md",
    class: className = "",
    disabled = false,
    onclick,
    type = "button",
  }: Props = $props();

  const variants = {
    primary:
      "bg-primary text-primary-content hover:bg-primary-600 shadow-lg shadow-primary/30",
    secondary:
      "bg-secondary text-secondary-content hover:bg-secondary-600 border border-secondary-600",
    ghost: "hover:bg-surface-800 text-text-muted hover:text-text-main",
    destructive:
      "bg-danger hover:bg-red-600 text-white shadow-lg shadow-danger/30",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };
</script>

<button
  {type}
  class="inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none {variants[
    variant
  ]} {sizes[size]} {className}"
  {disabled}
  {onclick}
>
  {@render children()}
</button>
