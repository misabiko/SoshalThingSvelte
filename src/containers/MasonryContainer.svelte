<script lang="ts">
	import ArticleComponent from "../articles/ArticleComponent.svelte";
	import Article, {getActualArticle} from '../services/article'
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

	type Column = {articles: ArticleWithRefs[], ratio: number}
	let columns: Column[]
	$: columns = makeColumns(articlesWithRefs)

	function makeColumns(articles: ArticleWithRefs[]) {
		let columns: Column[] = []
		for (let i = 0; i < columnCount; ++i)
			columns.push({articles: [], ratio: 0})

		for (const article of articles) {
			//TODO Support rtl
			const smallestIndex = columns.reduce((acc, curr, currIndex) => curr.ratio < columns[acc].ratio ? currIndex : acc, 0);
			columns[smallestIndex].articles.push(article);
			columns[smallestIndex].ratio += getRatio(article);
		}

		return columns
	}

	function getRatio(article: ArticleWithRefs): number {
		return 1 + getActualArticle(article).medias.reduce((acc, curr) => acc + curr.ratio, 0)
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
	{#each columns as column, i (i)}
		<div class='masonryColumn'>
<!--		<span>Ratio: {column.ratio}</span>-->
			{#each column.articles as articleWithRefs, index (JSON.stringify({...articleWithRefs.article.idPair, index}))}
				<ArticleComponent
					{articleWithRefs}
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