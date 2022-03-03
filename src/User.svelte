<script>
  import { onMount, onDestroy, createEventDispatcher } from "svelte";
  import { userStore } from "./auth";

  export let persist = null;

  let store = userStore({ persist });

  const dispatch = createEventDispatcher();
  let unsub;
  onMount(() => {
    unsub = store.subscribe((user) => {
      dispatch("user", {
        user,
      });
    });
  });

  onDestroy(() => unsub());
</script>

<slot name="before" />
{#if $store}
  <slot user={$store} auth={store.auth} />
{:else if $store === undefined}
  <slot name="loading" />
{:else}
  <slot name="signed-out" />
{/if}
<slot name="after" />
