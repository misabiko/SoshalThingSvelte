<script lang='ts'>
	import {loadingStore} from "../bufferedMediaLoading"
</script>

<button on:click={loadingStore.clearLoadings}>Clear loadings</button>
<button on:click={loadingStore.clearQueue}>Clear queue</button>
<section>
	{#if $loadingStore.loadings.size}
		Currently loading:
		{#each [...$loadingStore.loadings] as idPair (idPair)}
			{idPair}
		{/each}
	{:else}
		No media currently loading
	{/if}
</section>
<section>
	{#if $loadingStore.queue.length}
		Currently queued:
		{#each [...$loadingStore.queue] as idPair (idPair)}
			{idPair}
		{/each}
	{:else}
		No media currently queued
	{/if}
</section>