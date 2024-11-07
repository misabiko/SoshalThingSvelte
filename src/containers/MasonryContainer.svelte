<script lang='ts'>
	import ArticleComponent from '~/articles/ArticleComponent.svelte';
	import {type ArticleProps, getIdServiceMediaStr} from '~/articles';
	import {getActualArticle, getRootArticle} from '~/articles';
	import type {ContainerProps} from './index';

	let {
		containerRef = $bindable(null),
		props,
	}: {
		containerRef: null | HTMLDivElement
		props: ContainerProps
	} = $props();

	let lastRebalanceTrigger = false;
	let lastColumnCount = props.columnCount;

	let uniqueArticles: Record<string, {
		articleProps: ArticleProps
		index: number
		mediaIndex: number | null
	}> = $derived.by(() => {
		if (props.separateMedia) {
			return Object.fromEntries(props.articles.map((articleProps, index) => [
				getIdServiceMediaStr(articleProps),
				{articleProps, index, mediaIndex: articleProps.mediaIndex},
			]));
		}else {
			const uniques: Record<string, {
				articleProps: ArticleProps
				index: number
				mediaIndex: number | null
			}> = {};
			const idServiceMedias = new Set<string>();
			for (const a of props.articles) {
				let lastSize = idServiceMedias.size;
				const idServiceMedia = getIdServiceMediaStr(a);
				idServiceMedias.add(idServiceMedia);
				if (idServiceMedias.size > lastSize) {
					uniques[idServiceMedia] = {articleProps: a, index: lastSize, mediaIndex: 0};
				}
			}

			return uniques;
		}
	});
	//TODO Support duplicate articles
	//Maybe by making a second MasonryContainer which refreshes every column every time

	type Column = {
		articles: {
			articleProps: ArticleProps
			index: number
			mediaIndex: number | null
		}[]
		ratio: number
	};
	let columns = $state<Column[]>([]);

	$effect(() => {
		if (props.rebalanceTrigger !== lastRebalanceTrigger || props.columnCount !== lastColumnCount) {
			//TODO Add columnRef array and rebalance by moving overflowing articles
			columns = [];
			lastRebalanceTrigger = props.rebalanceTrigger;
			lastColumnCount = props.columnCount;
		}

		if (!columns.length) {
			columns = makeColumns();
		}else {
			const columnsChanged = new Set<number>();
			const addedArticles: {
				article: {
					articleProps: ArticleProps
					index: number
					mediaIndex: number | null
				}
				index: number
			}[] = [];

			for (let i = 0; i < columns.length; ++i) {
				for (let j = 0; j < columns[i]!.articles.length;) {
					if (!uniqueArticles[getIdServiceMediaStr(columns[i]!.articles[j]!.articleProps)]) {
						columns[i]!.articles.splice(j, 1);
						columnsChanged.add(i);
					}else
						++j;
				}
			}

			for (const [_, {articleProps, index, mediaIndex}] of Object.entries(uniqueArticles)) {
				if (!columns.some(c => c.articles.some(a => {
					const mediaIndex2 = a.mediaIndex;
					return getRootArticle(a.articleProps).idPairStr === getRootArticle(articleProps).idPairStr && [mediaIndex2 === null ? mediaIndex === null : mediaIndex2 === mediaIndex];
				}))) {
					addedArticles.push({article: {articleProps, index, mediaIndex}, index});
				}
			}

			addedArticles.sort((a, b) => a.index - b.index);
			for (const {article} of addedArticles)
				columnsChanged.add(addArticle(article));

			for (const column of columns)
				column.articles.sort((a, b) => a.index - b.index);

			for (const i of columnsChanged.values())
				columns[i]!.ratio = columns[i]!.articles.reduce((acc, curr) => acc + getRatio(curr.articleProps), 0);
		}
	});

	function makeColumns() {
		columns = [];
		for (let i = 0; i < props.columnCount; ++i)
			columns.push({
				articles: [],
				ratio: 0,
			});

		const sortedArticles = Object.entries(uniqueArticles);
		sortedArticles.sort(([_ia, a], [_ib, b]) => a.index - b.index);
		for (const [_, article] of sortedArticles)
			addArticle(article);

		return columns;
	}

	function addArticle(article: {
		articleProps: ArticleProps
		index: number
		mediaIndex: number | null
	}): number {
		const smallestIndex = columns.reduce((acc, curr, currIndex) => curr.ratio < columns[acc]!.ratio ? currIndex : acc, 0);
		columns[smallestIndex]!.articles.push(article);
		columns[smallestIndex]!.ratio += getRatio(article.articleProps);
		return smallestIndex;
	}

	function getRatio(article: ArticleProps): number {
		//Don't remember what the 1 + is for, probably for articles without media
		if (props.timelineArticleProps.compact) {
			//TODO Take into account per-article compact bool
			//Compact with more than 1 media has medias in square grid of 2xn, so 1,2 has ratio of 1/2, 3,4 has ratio of 2/2, 5,6 has ratio of 3/2, etc
			const evenMediaCount = Math.min(getActualArticle(article).medias.length - props.timelineArticleProps.fullMedia, props.timelineArticleProps.maxMediaCount ?? Infinity);
			if (evenMediaCount > 1)
				return 1 + Math.floor(evenMediaCount / 2) /*( * 2 / 2)*/
					+ getActualArticle(article).medias
						.slice(0, props.timelineArticleProps.fullMedia)
						.reduce((acc, curr) => acc + (curr.ratio ?? 1), 0);
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
</style>

<div class='articlesContainer masonryContainer' bind:this={containerRef} style:flex-direction={props.rtl ? 'row-reverse' : null}>
	{#each columns as column, i (i)}
		<div class='masonryColumn' style:width={props.columnCount > 1 ? (100 / props.columnCount) + '%' : undefined}>
<!--		<span>Ratio: {column.ratio}</span>-->
<!--		TODO Find a way to share key among multiple columns?-->
			{#each column.articles as article (getIdServiceMediaStr(article.articleProps))}
				<ArticleComponent
					view={props.articleView}
					articleProps={article.articleProps}
					timelineProps={props.timelineArticleProps}
				/>
			{/each}
		</div>
	{/each}
</div>