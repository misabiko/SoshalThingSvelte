<script lang="ts">
	import ArticleComponent from "../articles/ArticleComponent.svelte";

	export let articles;
	export let articleView;
	export let columnCount: number;
</script>

<style lang='sass'>
	.articlesContainer.rowContainer
		display: flex
		flex-wrap: wrap
		align-items: flex-start
</style>

<div class='articlesContainer rowContainer'>
	{#each articles as article}
		<ArticleComponent
			{article}
			view={articleView}
			style={`width: calc(100% / ${columnCount})`}
		/>
	{/each}
</div>