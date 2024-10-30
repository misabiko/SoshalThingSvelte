<script lang='ts'>
	import ArticleComponent from '~/articles/ArticleComponent.svelte';
	import {type ArticleProps, getIdServiceMediaStr} from '~/articles';
	import {getActualArticle, getRootArticle} from '~/articles';
	import type {ContainerProps} from './index';

	export let containerRef = null;
	export let props: ContainerProps;
	let lastRebalanceTrigger = false;
	let lastColumnCount = props.columnCount;

	let uniqueArticles: Record<string, {articleProps: ArticleProps, index: number, mediaIndex: number | null}>;
	$: if (props.separateMedia) {
		uniqueArticles = Object.fromEntries(props.articles.map((articleProps, index) => [
			getIdServiceMediaStr(articleProps),
			{articleProps, index, mediaIndex: articleProps.mediaIndex},
		]));
	}else {
		uniqueArticles = {};
		const idServiceMedias = new Set<string>();
		for (const a of props.articles) {
			let lastSize = idServiceMedias.size;
			const idServiceMedia = getIdServiceMediaStr(a);
			idServiceMedias.add(idServiceMedia);
			if (idServiceMedias.size > lastSize) {
				uniqueArticles[idServiceMedia] = {articleProps: a, index: lastSize, mediaIndex: 0};
			}
		}
	}
	//TODO Support duplicate articles
	//Maybe by making a second MasonryContainer which refreshes every column every time

	type Column = {idServiceMedias: string[], ratio: number};
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
			const addedArticles: {idServiceMedia: string, index: number}[] = [];

			for (let i = 0; i < columns.length; ++i) {
				for (let j = 0; j < columns[i]!.idServiceMedias.length;) {
					if (!uniqueArticles[columns[i]!.idServiceMedias[j]!]) {
						columns[i]!.idServiceMedias.splice(j, 1);
						columnsChanged.add(i);
					}else
						++j;
				}
			}

			for (const [idServiceMedia, {articleProps, index, mediaIndex}] of Object.entries(uniqueArticles)) {
				if (!columns.some(c => c.idServiceMedias.some(idServiceMedia => {
					const [_idStr, _service, mediaIndexStr] = idServiceMedia.split('/');
					if (!mediaIndexStr)
						throw new Error('Media index not found in idServiceMedia');
					return getRootArticle(uniqueArticles[idServiceMedia]!.articleProps).idPairStr === getRootArticle(articleProps).idPairStr && [mediaIndexStr === 'null' ? mediaIndex === null : parseInt(mediaIndexStr) === mediaIndex];
				}))) {
					addedArticles.push({idServiceMedia, index});
				}
			}

			addedArticles.sort((a, b) => a.index - b.index);
			for (const {idServiceMedia} of addedArticles)
				columnsChanged.add(addArticle(idServiceMedia));

			for (const column of columns)
				column.idServiceMedias.sort((a, b) => uniqueArticles[a]!.index - uniqueArticles[b]!.index);

			for (const i of columnsChanged.values())
				columns[i]!.ratio = columns[i]!.idServiceMedias.reduce((acc, curr) => acc + getRatio(uniqueArticles[curr]!.articleProps), 0);
		}
	}

	function makeColumns() {
		columns = [];
		for (let i = 0; i < props.columnCount; ++i)
			columns.push({idServiceMedias: [], ratio: 0});

		const sortedArticles = Object.entries(uniqueArticles);
		sortedArticles.sort(([_ia, a], [_ib, b]) => a.index - b.index);
		for (const [idServiceMedia, _] of sortedArticles)
			addArticle(idServiceMedia);

		return columns;
	}

	function addArticle(idServiceMedia: string): number {
		if (uniqueArticles[idServiceMedia] === undefined)
			throw new Error('Article not found in uniqueArticles');
		const smallestIndex = columns.reduce((acc, curr, currIndex) => curr.ratio < columns[acc]!.ratio ? currIndex : acc, 0);
		columns[smallestIndex]!.idServiceMedias.push(idServiceMedia);
		columns[smallestIndex]!.ratio += getRatio(uniqueArticles[idServiceMedia].articleProps);
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
			{#each column.idServiceMedias as idServiceMedia (idServiceMedia)}
				<ArticleComponent
					view={props.articleView}
					articleProps={uniqueArticles[idServiceMedia]!.articleProps}
					timelineProps={props.timelineArticleProps}
				/>
			{/each}
		</div>
	{/each}
</div>