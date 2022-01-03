<script lang="ts">
  export let persist :Storage = null;
  import { onMount, onDestroy, createEventDispatcher } from "svelte";
  import type { Unsubscriber } from "svelte/store";
  import { initUserStore, user } from "./auth";

  initUserStore({ persist });

  const dispatch = createEventDispatcher();
  let unsub :Unsubscriber;
  onMount(() => {
    unsub = user.subscribe(u => {
      dispatch("user", {
        u
      });
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
