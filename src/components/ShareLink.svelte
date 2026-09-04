<script lang="ts">
  export let salaId: string
  let copied=false
  $: link = typeof location !== 'undefined' ? `${location.origin}${import.meta.env.BASE_URL}#/sala/${salaId}` : ''
  async function copy(){
    try{ await navigator.clipboard.writeText(link); copied=true; setTimeout(()=>copied=false,1500)}catch{ prompt('Copia el enlace:', link)}
  }
</script>
<div class="card" style="display:flex;gap:0.5rem;align-items:center;flex-wrap:wrap">
  <input readonly value={link} style="flex:1;min-width:200px" />
  <button on:click={copy}>{copied ? '¡Copiado!' : 'Copiar enlace'}</button>
</div>
