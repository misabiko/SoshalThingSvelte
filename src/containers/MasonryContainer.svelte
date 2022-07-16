<script lang="ts">
	import ArticleComponent from "../articles/ArticleComponent.svelte";
	import {getActualArticle} from '../services/article'
	import type {ArticleWithRefs} from '../services/article'
	import type {ContainerProps} from './index'

	export let containerRef = undefined;
	export let props: ContainerProps
	let lastRebalanceTrigger = false
	let lastColumnCount = props.columnCount

	let uniqueArticles: { [idPairStr: string]: { articleWithRefs: ArticleWithRefs, index: number } }
	$: {
		uniqueArticles = {}
		const idPairs = new Set<string>()
		for (const a of props.articles) {
			let lastSize = idPairs.size
			idPairs.add(a.article.idPairStr)
			if (idPairs.size > lastSize) {
				uniqueArticles[a.article.idPairStr] = {articleWithRefs: a, index: lastSize}
			}
		}
	}
	//TODO Support duplicate articles
	//Maybe by making a second MasonryContainer which refreshes every column every time

	type Column = {articles: string[], ratio: number}
	let columns: Column[] = []

	$: if (props.rebalanceTrigger !== lastRebalanceTrigger || props.columnCount !== lastColumnCount) {
		columns = []
		lastRebalanceTrigger = props.rebalanceTrigger
	}

	$: {
		if (!columns.length) {
			columns = makeColumns()
		}else {
			const columnsChanged = new Set<number>()
			const addedArticles: { idPairStr: string, index: number }[] = []

			for (let i = 0; i < columns.length; ++i) {
				for (let j = 0; j < columns[i].articles.length;) {
					if (!uniqueArticles[columns[i].articles[j]]) {
						columns[i].articles.splice(j, 1)
						columnsChanged.add(i)
					}else
						++j
				}
			}

			for (const {articleWithRefs, index} of Object.values(uniqueArticles)) {
				if (!columns.some(c => c.articles.some(idPair => uniqueArticles[idPair].articleWithRefs.article.idPairStr === articleWithRefs.article.idPairStr))) {
					addedArticles.push({idPairStr: articleWithRefs.article.idPairStr, index})
				}
			}

			addedArticles.sort((a, b) => a.index - b.index)
			for (const {idPairStr} of addedArticles)
				columnsChanged.add(addArticle(idPairStr))

			for (let i = 0; i < columns.length; ++i)
				columns[i].articles.sort((a, b) => uniqueArticles[a].index - uniqueArticles[b].index)

			for (const i of columnsChanged.values())
				columns[i].ratio = columns[i].articles.reduce((acc, curr) => acc + getRatio(uniqueArticles[curr].articleWithRefs), 0)
		}
	}

	function makeColumns() {
		columns = []
		for (let i = 0; i < props.columnCount; ++i)
			columns.push({articles: [], ratio: 0})

		const sortedArticles = Object.values(uniqueArticles)
		sortedArticles.sort((a, b) => a.index - b.index)
		for (const {articleWithRefs, index} of sortedArticles)
			addArticle(articleWithRefs.article.idPairStr)

		return columns
	}

	function addArticle(idPairStr: string): number {
		//TODO Support rtl
		const smallestIndex = columns.reduce((acc, curr, currIndex) => curr.ratio < columns[acc].ratio ? currIndex : acc, 0);
		columns[smallestIndex].articles.push(idPairStr);
		columns[smallestIndex].ratio += getRatio(uniqueArticles[idPairStr].articleWithRefs);
		return smallestIndex
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
			{#each column.articles as idPairStr, index (idPairStr)}
				<ArticleComponent
					view={props.articleView}
					articleWithRefs={uniqueArticles[idPairStr].articleWithRefs}
					props={props.articleProps}
				/>
			{/each}
		</div>
	{/each}
</div>