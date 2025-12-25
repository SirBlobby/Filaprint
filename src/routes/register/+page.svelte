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
      <p class="text-text-muted mt-2">Create your account</p>
    </div>

    {#if form?.mismatch}
      <div
        class="bg-red-500/10 text-red-500 p-3 rounded-lg text-sm text-center mb-6 border border-red-500/20"
      >
        Passwords do not match.
      </div>
    {:else if form?.exists}
      <div
        class="bg-red-500/10 text-red-500 p-3 rounded-lg text-sm text-center mb-6 border border-red-500/20"
      >
        Username already taken.
      </div>
    {:else if form?.weak}
      <div
        class="bg-red-500/10 text-red-500 p-3 rounded-lg text-sm text-center mb-6 border border-red-500/20"
      >
        Password must be at least 6 characters.
      </div>
    {/if}

    <form
      method="POST"
      action="?/register"
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
        placeholder="Choose a username"
        required
      />
      <Input
        name="password"
        label="Password"
        type="password"
        placeholder="Min 6 characters"
        required
      />
      <Input
        name="confirmPassword"
        label="Confirm Password"
        type="password"
        placeholder="Confirm your password"
        required
      />

      <Button type="submit" class="w-full" disabled={loading}>
        {loading ? "Creating Account..." : "Sign Up"}
      </Button>
    </form>

    <div class="mt-6 text-center text-sm">
      <span class="text-text-muted">Already have an account?</span>
      <a
        href="/login"
        class="text-primary hover:text-primary-400 font-medium ml-1">Log In</a
      >
    </div>
  </Card>
</div>
