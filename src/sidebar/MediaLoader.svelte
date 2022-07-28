<script lang='ts'>
	import {loadingStore} from "../bufferedMediaLoading"
	import {Button} from 'svelma'
</script>

<Button on:click={loadingStore.clearLoadings}>Clear loadings</Button>
<Button on:click={loadingStore.clearQueue}>Clear queue</Button>
<div class='box'>
	{#each [...$loadingStore.loadings] as idPair (idPair)}
		{idPair}
	{:else}
		No media currently loading
	{/each}
</div>
<div class='box'>
	{#each [...$loadingStore.queue] as idPair (idPair)}
		{idPair}
	{:else}
		No media currently queued
	{/each}
</div>