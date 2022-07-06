<script lang="ts">
	import ArticleComponent from "../articles/ArticleComponent.svelte";

	export let idPairs;
	export let articleView;
	export let containerRef;
	export let columnCount: number;
	export let animatedAsGifs
	export let compact
	export let hideText
	export let shouldLoadMedia: boolean;
</script>

<style lang='sass' global>
	@import '../../styles/variables'

	.articlesContainer.rowContainer
		display: flex
		flex-wrap: wrap
		align-items: flex-start
</style>

<div class='articlesContainer rowContainer' bind:this={containerRef}>
	{#each idPairs as idPair (idPair)}
		<ArticleComponent
			{idPair}
			view={articleView}
			{animatedAsGifs}
			{compact}
			{hideText}
			{shouldLoadMedia}
			style={`width: calc(100% / ${columnCount})`}
		/>
	{/each}
</div>