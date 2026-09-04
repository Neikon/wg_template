<script lang="ts">
  import { gameStore } from '../../stores/gameStore'
  import { roomStore } from '../../stores/roomStore'
  import { OPCIONES } from './engine'
  import type { VotacionState } from './types'

  export let onAction: (action: any) => void = () => {}

  $: state = $gameStore as VotacionState
  $: room = $roomStore
  $: miVoto = state.votos?.[room.selfId]
  $: totales = OPCIONES.map((_, opcion) =>
    Object.values(state.votos ?? {}).filter(voto => voto === opcion).length
  )
</script>

{#if state.phase === 'lobby'}
  <div class="card">
    <h2>Votación rápida</h2>
    <p class="muted">Cada jugador elige una opción. No hay temporizador.</p>
    {#if room.isHost}
      <button on:click={() => onAction({ t: 'startGame', juegoId: 'votacion' })}>Empezar votación</button>
    {:else}
      <p class="muted">El anfitrión iniciará la votación.</p>
    {/if}
  </div>
{:else}
  <div class="card">
    <h2>¿Qué cenamos?</h2>
    <div class="choices">
      {#each OPCIONES as opcion, index}
        <button
          class:selected={miVoto === index}
          disabled={miVoto !== undefined}
          on:click={() => onAction({ t: 'votar', opcion: index })}
        >
          {opcion}{miVoto === index ? ' ✓' : ''}
        </button>
      {/each}
    </div>

    {#if miVoto !== undefined}
      <h3>Resultados</h3>
      <ul>
        {#each OPCIONES as opcion, index}
          <li>{opcion}: {totales[index]} voto{totales[index] === 1 ? '' : 's'}</li>
        {/each}
      </ul>
    {:else}
      <p class="muted">Elige una opción para ver el recuento.</p>
    {/if}

    <p class="muted">{Object.keys(state.votos ?? {}).length}/{state.participantes?.length ?? 0} han votado</p>
    {#if room.isHost}
      <button class="secondary" on:click={() => onAction({ t: 'restart' })}>Nueva votación</button>
    {/if}
  </div>
{/if}

<style>
  .choices { display: grid; gap: 0.6rem; margin: 1rem 0; }
  .selected { background: var(--success); }
  .secondary { background: var(--muted); }
</style>
