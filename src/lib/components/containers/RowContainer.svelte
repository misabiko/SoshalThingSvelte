<script lang="ts">
	import ArticleComponent from "../articles/ArticleComponent.svelte";

	export let idPairs;
	export let articleView;
	export let columnCount: number;
	export let animatedAsGifs
	export let socialSettings
</script>

<style lang='sass' global>
	@import '../../styles/core'

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
			{animatedAsGifs}
			{socialSettings}
			style={`width: calc(100% / ${columnCount})`}
		/>
	{/each}
</div>