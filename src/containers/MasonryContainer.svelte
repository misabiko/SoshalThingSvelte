<script lang="ts">
	import ArticleComponent from "../articles/ArticleComponent.svelte";
	import type {ArticleIdPair} from '../services/article'
	import {derived} from 'svelte/store'
	import {getWritable} from '../services/service'
	import Article from '../services/article'

	export let containerRef = undefined;
	export let idPairs;
	export let articleView;
	export let columnCount: number;
	export let animatedAsGifs;
	export let compact;
	export let hideText;
	export let shouldLoadMedia: boolean;

	type Column = {idPairs: ArticleIdPair[], ratio: number}
	$: columns = derived(idPairs.map(idPair => getWritable(idPair)), (articles: Article[]) => makeColumns(articles))

	function makeColumns(articles: Article[]) {
		let columns: Column[] = []
		for (let i = 0; i < columnCount; ++i)
			columns.push({idPairs: [], ratio: 0})

		for (const article of articles) {
			//TODO Support rtl
			const smallestIndex = columns.reduce((acc, curr, currIndex) => curr.ratio < columns[acc].ratio ? currIndex : acc, 0);
			columns[smallestIndex].idPairs.push(article.idPair);
			columns[smallestIndex].ratio += getRatio(article);
		}

		return columns
	}

	function getRatio(article: Article): number {
		return 1 + article.medias.reduce((acc, curr) => acc + curr.ratio, 0)
	}
</script>

<style lang='sass'>
	.masonryContainer
		display: flex
		flex-wrap: nowrap
		align-items: flex-start
		align-content: flex-start
		position: relative

	.masonryColumn
		flex: 1 1 0

	//.masonryColumn .postMedia img
	//	width: 100%

	:global(.fullscreenTimeline .masonryColumn)
		width: unset
</style>

<div class='articlesContainer masonryContainer' bind:this={containerRef}>
	{#each $columns as column, i (i)}
		<div class='masonryColumn'>
<!--		<span>Ratio: {column.ratio}</span>-->
			{#each column.idPairs as idPair (idPair)}
				<ArticleComponent
					{idPair}
					view={articleView}
					{animatedAsGifs}
					{compact}
					{hideText}
					{shouldLoadMedia}
				/>
			{/each}
		</div>
	{/each}
</div>