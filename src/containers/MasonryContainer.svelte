<script lang="ts">
	import ArticleComponent from "../articles/ArticleComponent.svelte";
	import type {ArticleProps} from '../articles'
	import {getActualArticle, getRootArticle} from '../articles'
	import type {ContainerProps} from './index'

	let {
		containerRef = undefined,
		props,
	} = $props<{
		containerRef?: HTMLDivElement | undefined,
		props: ContainerProps,
	}>();
	let lastRebalanceTrigger = $state(false);
	let lastColumnCount = $state(props.columnCount);

	let uniqueArticles = $derived<{ [idPairStr: string]: { articleProps: ArticleProps, index: number } }>(getUniqueArticles());

	function getUniqueArticles() {
		const articles = {};
		const idPairs = new Set<string>();
		for (const a of props.articles) {
			let lastSize = idPairs.size;
			idPairs.add(getRootArticle(a).idPairStr);
			if (idPairs.size > lastSize) {
				articles[getRootArticle(a).idPairStr] = {articleProps: a, index: lastSize};
			}
		}

		return articles;
	}
	//TODO Support duplicate articles
	//Maybe by making a second MasonryContainer which refreshes every column every time

	type Column = {articles: string[], ratio: number}
	let columns = $state<Column[]>([]);

	$effect(() => {
		if (props.rebalanceTrigger !== lastRebalanceTrigger || props.columnCount !== lastColumnCount) {
			//TODO Add columnRef array and rebalance by moving overflowing articles
			columns = []
			lastRebalanceTrigger = props.rebalanceTrigger
			lastColumnCount = props.columnCount
		}
	});

	$effect.pre(() => {
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

			for (const {articleProps, index} of Object.values(uniqueArticles)) {
				if (!columns.some(c => c.articles.some(idPair => getRootArticle(uniqueArticles[idPair].articleProps).idPairStr === getRootArticle(articleProps).idPairStr))) {
					addedArticles.push({idPairStr: getRootArticle(articleProps).idPairStr, index})
				}
			}

			addedArticles.sort((a, b) => a.index - b.index)
			for (const {idPairStr} of addedArticles)
				columnsChanged.add(addArticle(idPairStr))

			for (let i = 0; i < columns.length; ++i)
				columns[i].articles.sort((a, b) => uniqueArticles[a].index - uniqueArticles[b].index)

			for (const i of columnsChanged.values())
				columns[i].ratio = columns[i].articles.reduce((acc, curr) => acc + getRatio(uniqueArticles[curr].articleProps), 0)
		}

		//Svelte5Check Shouldn't be necessary, columns should update when uniqueArticle does
		for (const c of columns)
			for (const a of c.articles)
				if (!Object.hasOwn(uniqueArticles, a))
					console.warn('Article not found in uniqueArticles', a);
	});

	function makeColumns() {
		columns = []
		for (let i = 0; i < props.columnCount; ++i)
			columns.push({articles: [], ratio: 0})

		const sortedArticles = Object.values(uniqueArticles)
		sortedArticles.sort((a, b) => a.index - b.index)
		for (const {articleProps} of sortedArticles)
			addArticle(getRootArticle(articleProps).idPairStr)

		return columns
	}

	function addArticle(idPairStr: string): number {
		const smallestIndex = columns.reduce((acc, curr, currIndex) => curr.ratio < columns[acc].ratio ? currIndex : acc, 0);
		columns[smallestIndex].articles.push(idPairStr);
		columns[smallestIndex].ratio += getRatio(uniqueArticles[idPairStr].articleProps);
		return smallestIndex
	}

	function getRatio(article: ArticleProps): number {
		return 1 + getActualArticle(article).medias.reduce((acc, curr) => acc + (curr.ratio ?? 1), 0)
	}
</script>

<style>
	.masonryContainer {
		display: flex;
		flex-wrap: nowrap;
		align-items: flex-start;
		align-content: flex-start;
		position: relative;
	}

	.masonryColumn {
		flex: 1 1 0;
	}

	:global(.fullscreenTimeline .masonryColumn) {
		width: unset;
	}
</style>

<div class='articlesContainer masonryContainer' bind:this={containerRef} style:flex-direction={props.rtl ? 'row-reverse' : null}>
	{#each columns as column, i (i)}
		<div class='masonryColumn'>
<!--		<span>Ratio: {column.ratio}</span>-->
<!--		TODO Find a way to share key among multiple columns?-->
			{#each column.articles as idPairStr, index (idPairStr)}
				{#if uniqueArticles[idPairStr] !== undefined}	<!--Svelte5Check Shouldn't be necessary, columns should update when uniqueArticle does-->
					<ArticleComponent
						view={props.articleView}
						articleProps={uniqueArticles[idPairStr].articleProps}
						timelineProps={props.timelineArticleProps}
					/>
				{/if}
			{/each}
		</div>
	{/each}
</div>