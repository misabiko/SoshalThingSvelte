<script lang='ts'>
	import {loadingStore} from "../bufferedMediaLoading"
</script>

<!--<Button on:click={loadingStore.clearLoadings}>Clear loadings</Button>-->
<!--<Button on:click={loadingStore.clearQueue}>Clear queue</Button>-->
<div class='box'>
	{#if $loadingStore.loadings.length}
		Currently loading:
		{#each [...$loadingStore.loadings] as idPair (idPair)}
			{idPair}
		{/each}
	{:else}
		No media currently loading
	{/if}
</div>
<div class='box'>
	{#if $loadingStore.queue.length}
		Currently queued:
		{#each [...$loadingStore.queue] as idPair (idPair)}
			{idPair}
		{/each}
	{:else}
		No media currently queued
	{/if}
</div>