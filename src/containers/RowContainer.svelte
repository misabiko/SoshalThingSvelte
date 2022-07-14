<script lang="ts">
	import ArticleComponent from "../articles/ArticleComponent.svelte";
	import type {ArticleWithRefs} from '../services/article'
	import {SvelteComponent} from 'svelte'

	export let containerRef = undefined;
	export let articlesWithRefs: ArticleWithRefs[];
	export let articleView: typeof SvelteComponent;
	export let columnCount: number;
	export let animatedAsGifs: boolean;
	export let compact: boolean;
	export let hideText: boolean;
	export let shouldLoadMedia: boolean;
</script>

<style lang='sass'>
	@use '../styles/variables' as *

	.articlesContainer.rowContainer
		display: flex
		flex-wrap: wrap
		align-items: flex-start
</style>

<div class='articlesContainer rowContainer' bind:this={containerRef}>
	{#each articlesWithRefs as articleWithRefs, index (JSON.stringify({...articleWithRefs.article.idPair, index}))}
		<ArticleComponent
			{articleWithRefs}
			view={articleView}
			{animatedAsGifs}
			{compact}
			{hideText}
			{shouldLoadMedia}
			style={`width: calc(100% / ${columnCount})`}
		/>
	{/each}
</div>