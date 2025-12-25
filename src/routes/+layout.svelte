<script>
  import "../app.css";
  import Navbar from "$lib/components/Navbar.svelte";
  import favicon from "$lib/assets/favicon.png";

  let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div
  class="min-h-screen bg-background text-text-main bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-surface-900 via-background to-background"
>
  <Navbar />

  <main class="md:pl-64 min-h-screen transition-all duration-300">
    <div class="max-w-7xl mx-auto p-4 md:p-8 pt-20 md:pt-8 w-full">
      {@render children()}
    </div>
  </main>
</div>
