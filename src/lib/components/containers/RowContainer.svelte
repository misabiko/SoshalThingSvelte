<script lang="ts">
	import ArticleComponent from "../articles/ArticleComponent.svelte";

	export let idPairs;
	export let articleView;
	export let columnCount: number;
</script>

<style lang='sass' global>
	@use '../../styles/core' as *

	.articlesContainer.rowContainer
		display: flex
		flex-wrap: wrap
		align-items: flex-start
</style>

<div class='articlesContainer rowContainer'>
	{#each idPairs as idPair (idPair)}
		<ArticleComponent
			{idPair}
			view={articleView}
			style={`width: calc(100% / ${columnCount})`}
		/>
	{/each}
</div>