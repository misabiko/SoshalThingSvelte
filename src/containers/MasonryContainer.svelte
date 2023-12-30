<script lang="ts">
	import ArticleComponent from '~/articles/ArticleComponent.svelte';
	import type {ArticleProps} from '~/articles';
	import {getActualArticle, getRootArticle} from '~/articles';
	import type {ContainerProps} from './index';

	export let containerRef = null;
	export let props: ContainerProps;
	let lastRebalanceTrigger = false;
	let lastColumnCount = props.columnCount;

	let uniqueArticles: { [idPairStr: string]: { articleProps: ArticleProps, index: number } };
	$: {
		uniqueArticles = {};
		const idPairs = new Set<string>();
		for (const a of props.articles) {
			let lastSize = idPairs.size;
			idPairs.add(getRootArticle(a).idPairStr);
			if (idPairs.size > lastSize) {
				uniqueArticles[getRootArticle(a).idPairStr] = {articleProps: a, index: lastSize};
			}
		}
	}
	//TODO Support duplicate articles
	//Maybe by making a second MasonryContainer which refreshes every column every time

	type Column = {articles: string[], ratio: number}
	let columns: Column[] = [];

	$: if (props.rebalanceTrigger !== lastRebalanceTrigger || props.columnCount !== lastColumnCount) {
		//TODO Add columnRef array and rebalance by moving overflowing articles
		columns = [];
		lastRebalanceTrigger = props.rebalanceTrigger;
		lastColumnCount = props.columnCount;
	}

	$: {
		if (!columns.length) {
			columns = makeColumns();
		}else {
			const columnsChanged = new Set<number>();
			const addedArticles: { idPairStr: string, index: number }[] = [];

			for (let i = 0; i < columns.length; ++i) {
				for (let j = 0; j < columns[i].articles.length;) {
					if (!uniqueArticles[columns[i].articles[j]]) {
						columns[i].articles.splice(j, 1);
						columnsChanged.add(i);
					}else
						++j;
				}
			}

			for (const {articleProps, index} of Object.values(uniqueArticles)) {
				if (!columns.some(c => c.articles.some(idPair => getRootArticle(uniqueArticles[idPair].articleProps).idPairStr === getRootArticle(articleProps).idPairStr))) {
					addedArticles.push({idPairStr: getRootArticle(articleProps).idPairStr, index});
				}
			}

			addedArticles.sort((a, b) => a.index - b.index);
			for (const {idPairStr} of addedArticles)
				columnsChanged.add(addArticle(idPairStr));

			for (let i = 0; i < columns.length; ++i)
				columns[i].articles.sort((a, b) => uniqueArticles[a].index - uniqueArticles[b].index);

			for (const i of columnsChanged.values())
				columns[i].ratio = columns[i].articles.reduce((acc, curr) => acc + getRatio(uniqueArticles[curr].articleProps), 0);
		}
	}

	function makeColumns() {
		columns = [];
		for (let i = 0; i < props.columnCount; ++i)
			columns.push({articles: [], ratio: 0});

		const sortedArticles = Object.values(uniqueArticles);
		sortedArticles.sort((a, b) => a.index - b.index);
		for (const {articleProps} of sortedArticles)
			addArticle(getRootArticle(articleProps).idPairStr);

		return columns;
	}

	function addArticle(idPairStr: string): number {
		const smallestIndex = columns.reduce((acc, curr, currIndex) => curr.ratio < columns[acc].ratio ? currIndex : acc, 0);
		columns[smallestIndex].articles.push(idPairStr);
		columns[smallestIndex].ratio += getRatio(uniqueArticles[idPairStr].articleProps);
		return smallestIndex;
	}

	function getRatio(article: ArticleProps): number {
		//Don't remember what the 1 + is for, probably for articles without media
		if (props.timelineArticleProps.compact) {
			//TODO Take into account per-article compact bool
			//Compact with more than 1 media has medias in square grid of 2xn, so 1,2 has ratio of 1/2, 3,4 has ratio of 2/2, 5,6 has ratio of 3/2, etc
			const evenMediaCount = Math.min(getActualArticle(article).medias.length, props.timelineArticleProps.maxMediaCount ?? Infinity);
			if (evenMediaCount > 1)
				return 1 + Math.floor(evenMediaCount / 2); /*( * 2 / 2)*/
			else
				return 2;
		}else
			return 1 + getActualArticle(article).medias
				.slice(0, props.timelineArticleProps.maxMediaCount ?? undefined)
				.reduce((acc, curr) => acc + (curr.ratio ?? 1), 0);
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
			{#each column.articles as idPairStr (idPairStr)}
				<ArticleComponent
					view={props.articleView}
					articleProps={uniqueArticles[idPairStr].articleProps}
					timelineProps={props.timelineArticleProps}
				/>
			{/each}
		</div>
	{/each}
</div>