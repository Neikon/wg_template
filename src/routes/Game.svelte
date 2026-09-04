<script lang="ts">
  import { gameStore } from '../lib/stores/gameStore'
  import { roomStore } from '../lib/stores/roomStore'
  import { registry, currentGame } from '../lib/game/registry'
  export let onAction: (a:any)=>void
  $: comp = registry[currentGame]?.Component
</script>
{#if comp}
  <svelte:component this={comp} onAction={onAction} />
{:else}
  <p>Juego no encontrado</p>
{/if}
