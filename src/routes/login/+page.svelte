<script lang="ts">
  import { enhance } from "$app/forms";
  import Button from "$lib/components/ui/Button.svelte";
  import Card from "$lib/components/ui/Card.svelte";
  import Input from "$lib/components/ui/Input.svelte";

  let { form } = $props();
  let loading = $state(false);
</script>

<div class="min-h-screen flex items-center justify-center p-4">
  <Card class="w-full max-w-md p-8 border-surface-700/50">
    <div class="text-center mb-8">
      <h1
        class="text-3xl font-bold bg-linear-to-r from-primary to-accent bg-clip-text text-transparent"
      >
        Filaprint
      </h1>
      <p class="text-text-muted mt-2">Sign in to your dashboard</p>
    </div>

    {#if form?.invalid}
      <div
        class="bg-red-500/10 text-red-500 p-3 rounded-lg text-sm text-center mb-6 border border-red-500/20"
      >
        Invalid credentials. Please try again.
      </div>
    {/if}

    <form
      method="POST"
      action="?/login"
      use:enhance={() => {
        loading = true;
        return async ({ update }) => {
          await update();
          loading = false;
        };
      }}
      class="space-y-6"
    >
      <Input
        name="username"
        label="Username"
        placeholder="Enter your username"
        required
      />
      <Input
        name="password"
        label="Password"
        type="password"
        placeholder="••••••••"
        required
      />

      <Button type="submit" class="w-full" disabled={loading}>
        {loading ? "Signing in..." : "Sign In"}
      </Button>
    </form>

    <div class="mt-6 text-center text-sm">
      <span class="text-text-muted">Don't have an account?</span>
      <a
        href="/register"
        class="text-primary hover:text-primary-400 font-medium ml-1"
        >Create one</a
      >
    </div>
  </Card>
</div>
