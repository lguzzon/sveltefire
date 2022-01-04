<script lang="ts">
  import type { User } from "firebase/auth";
  import { onMount, onDestroy, createEventDispatcher } from "svelte";
  import type { Unsubscriber } from "svelte/store";
  import { initUserStore, user } from "./auth";

  export let persist :Storage = null;

  initUserStore({ persist });

  const dispatch = createEventDispatcher<{user:{user:User}}>();
  let unsub :Unsubscriber;
  onMount(() => {
    unsub = user.subscribe(u => {
      dispatch("user", {user:u});
    });
  });

  onDestroy(() => unsub());
</script>

<slot name="before" />
{#if $user}
  <slot user={$user} auth={user.auth} />
{:else}
  <slot name="signed-out" />
{/if}
<slot name="after" />
