<script lang='ts'>
	import {type Readable, readonly} from 'svelte/store';
	import {derived as storeDerived, get} from 'svelte/store';
	import {
		type ArticleIdPair,
		type ArticleProps,
		type ArticleWithRefs,
		articleWithRefToWithRefArray,
		flatDeriveArticle,
		getActualArticleRefs,
		getIdServiceMediaStr,
	} from '~/articles';
	import {getRootArticle, idPairEqual} from '~/articles';
	import {fetchArticle, getWritableArticle} from '~/services/service';
	import {addArticlesToTimeline, type FullscreenInfo, type TimelineData} from './index';
	import {type FilterInstance, keepArticle} from '~/filters';
	import {compare, SortMethod} from '~/sorting';
	import type {ContainerProps} from '~/containers';
	import TimelineHeader from './TimelineHeader.svelte';
	import TimelineOptions from './TimelineOptions.svelte';
	import {endpoints, refreshEndpoint, refreshEndpointName, RefreshType} from '~/services/endpoints';
	import {loadingStore} from '~/bufferedMediaLoading';

	let {
		timelineId,
		data,
		fullscreen = $bindable(null),
		toggleFullscreen = null,
		removeTimeline,
		setModalTimeline,
		modal = false,

		favviewerButtons = false,
		favviewerHidden = $bindable(false),
		favviewerMaximized = $bindable(null),
		showSidebar = $bindable(true),
	}: {
		//Modals don't have ids (though we should also be able to modal a timeline with id)
		timelineId: string | null
		data: TimelineData
		fullscreen?: FullscreenInfo | null
		toggleFullscreen?: (() => void) | null
		removeTimeline: () => void
		setModalTimeline: (data: TimelineData, width?: number) => void
		modal?: boolean

		favviewerButtons?: boolean
		favviewerHidden?: boolean
		favviewerMaximized?: boolean | null
		showSidebar?: boolean
	} = $props();

	let showOptions = $state(false);
	let containerRef: HTMLElement | null = $state(null);
	let containerRebalance = $state(false);

	let articleIdPairs: Readable<ArticleIdPair[]> = storeDerived([readonly(data.articles), loadingStore], ([a, _]) => a);
	let articlesOrder = readonly(data.articlesOrder);

	let showAllMediaArticles = data.showAllMediaArticles;
	let filters = data.filters;

	//Get flat article ref store array per idPair, derive each then discard the refs, then add props for each
	let preOrderArticles: Readable<Record<string, ArticleProps>> = $derived(storeDerived([filters, ...$articleIdPairs.map(idPair => storeDerived(flatDeriveArticle(idPair), articles => articles[0]))], ([filters, ...articles]) =>
		//Might have to give in to using .find if we want to keep duplicate articles
		Object.fromEntries(articles
			.flatMap((a, i) => addPropsRoot(a!.getArticleWithRefs(), i, filters))
			.map(a => [getIdServiceMediaStr(a), a])),
	));

	let articles: Readable<ArticleProps[]> = $derived(storeDerived([preOrderArticles, articlesOrder], ([a, order]) => {
		if (order === null)
			return Object.values(a);

		return order.map(id => a[id]!);
	}));

	let filteredArticles: Readable<ArticleProps[]> = $derived(storeDerived(articles, articleProps => {
		if (data.hideFilteredOutArticles)
			articleProps = articleProps.filter(a => !a.filteredOut);

		if (data.mergeReposts) {
			let merged: ArticleProps[] = [];
			for (const a of articleProps) {
				if (a.type === 'reposts') {
					const aIdPair = getRootArticle(a.reposted).idPair;

					//Checking if the reposted article is already in merged
					const plainIndex = merged.findIndex(m =>
						idPairEqual(getRootArticle(m).idPair, aIdPair),
					);
					if (plainIndex > -1) {
						//Replacing it with the repost
						merged[plainIndex] = a;
						continue;
					}

					//Checking if a duplicate repost is in merged
					const index = merged.findIndex(m =>
						m.type === 'reposts' &&
						idPairEqual(getRootArticle(m.reposted).idPair, aIdPair),
					);

					if (index > -1)
						(merged[index] as any).reposts.push(...a.reposts);
					else
						merged.push(a);
				}else
					merged.push(a);
			}

			articleProps = merged;

			//TODO Sort reposts
		}

		if (data.sortInfo.method !== null)
			articleProps.sort(compare(data.sortInfo));
		else if (data.sortInfo.reversed)
			articleProps.reverse();

		if (data.section.useSection)
			articleProps = articleProps.slice(0, data.section.count);

		return articleProps;
	}));

	function addPropsRoot(articleWithRefs: ArticleWithRefs, index: number, filters: FilterInstance[]): ArticleProps[] {
		if (data.separateMedia) {
			switch (articleWithRefs.type) {
				case 'normal':
				case 'quote': {
					const articleProps = addProps(articleWithRefs, index, filters);
					if (articleProps.type === 'reposts' || articleProps.type === 'repost')
						throw new Error('addProps({type: normal|quote}) returned a repost');

					const mediaCount = Math.min(!$showAllMediaArticles.has(articleProps.article.idPairStr) && data.maxMediaCount !== null ? data.maxMediaCount : Infinity, articleProps.article.medias.length);
					return mediaCount > 0
						? [...Array(mediaCount)].map((_, mediaIndex) => ({
							...articleProps,
							mediaIndex,
						}))
						: [articleProps];
				}
				case 'repost': {
					const splitReposted = addPropsRoot(articleWithRefs.reposted, index, filters);
					const {filteredOut, nonKeepFilters} = useFilters(articleWithRefs, index, filters);
					return splitReposted.map(reposted => ({
						type: 'reposts',
						reposts: [articleWithRefs.article],
						filteredOut,
						nonKeepFilters,
						reposted,
						mediaIndex: null,
					} as ArticleProps));
				}
				case 'reposts':
					throw {
						message: 'Reposts should come from the timeline and not articles themselves',
						articleWithRefs,
					};
			}
		}else {
			return [addProps(articleWithRefs, index, filters)];
		}
	}

	function addProps(articleWithRefs: ArticleWithRefs, index: number, filters: FilterInstance[]): ArticleProps {
		const {filteredOut, nonKeepFilters} = useFilters(articleWithRefs, index, filters);

		switch (articleWithRefs.type) {
			case 'normal':
				return {
					...articleWithRefs,
					filteredOut,
					nonKeepFilters,
					mediaIndex: null,
				};
			case 'repost':
				return {
					type: 'reposts',
					reposts: [articleWithRefs.article],
					filteredOut,
					nonKeepFilters,
					reposted: addProps(articleWithRefs.reposted, index, filters),
					mediaIndex: null,
				} as ArticleProps;
			case 'quote':
				return {
					...articleWithRefs,
					filteredOut,
					nonKeepFilters,
					quoted: addProps(articleWithRefs.quoted, index, filters),
					mediaIndex: null,
				} as ArticleProps;
			case 'reposts':
				throw {message: 'Reposts should come from the timeline and not articles themselves', articleWithRefs};
		}
	}

	function useFilters(articleWithRefs: ArticleWithRefs, index: number, filters: FilterInstance[]) {
		// const filteredOut =  !filters.every(f => !f.enabled || ((keepArticle(articleWithRefs, index, f.filter) ?? !f.inverted) !== f.inverted));
		//Caching filters for debugging, could return to boolean later
		const nonKeepFilters = [];
		for (const instance of filters) {
			if (!(!instance.enabled || (keepArticle(articleWithRefs, index, instance.filter) ?? !instance.inverted) !== instance.inverted))
				nonKeepFilters.push(instance);
		}

		const filteredOut = !!nonKeepFilters.length;

		return {filteredOut, nonKeepFilters};
	}

	let articleCountLabel: string = $derived.by(() => {
		if ($filteredArticles.length)
			return `${$filteredArticles.length} articles shown, ${$articles.length - $filteredArticles.length} hidden.`;
		else if ($articles.length)
			return `${$articles.length} hidden articles`;
		else
			return 'No articles listed.';
	});

	//Pre-queuing media loads so they load in the right order
	$effect(() => {
		if (data.shouldLoadMedia && $filteredArticles.length) {
			const articles = $filteredArticles.flatMap(articleWithRefToWithRefArray);

			const promises = [];
			const toRequest = [];

			for (const articleProps of articles) {
				const actualArticleProps = getActualArticleRefs(articleProps) as ArticleProps;
				if (actualArticleProps.type === 'repost' || actualArticleProps.type === 'reposts')
					throw new Error('Actual article is repost');

				if (data.hideFilteredOutArticles && actualArticleProps.filteredOut)
					continue;

				const articleStore = getWritableArticle(actualArticleProps.article.idPair);
				let article = get(articleStore);

				if (!article.fetched)
					promises.push(fetchArticle(article.idPair).then(() => {
						let article = get(articleStore);
						const mediaCount = Math.min(actualArticleProps.article.medias.length, !$showAllMediaArticles.has(article.idPairStr) && data.maxMediaCount !== null ? data.maxMediaCount : Infinity);
						for (let i = 0; i < mediaCount; ++i)
							loadingStore.getLoadingState(article.idPair, i, data.shouldLoadMedia);
					}));
				else {
					const mediaCount = Math.min(actualArticleProps.article.medias.length, !$showAllMediaArticles.has(article.idPairStr) && data.maxMediaCount !== null ? data.maxMediaCount : Infinity);
					for (let mediaIndex = 0; mediaIndex < mediaCount; ++mediaIndex)
						toRequest.push({idPair: article.idPair, mediaIndex});
				}
			}

			loadingStore.requestLoads(...toRequest);
			Promise.allSettled(promises).then();
		}
	});

	let availableRefreshTypes: Readable<Set<RefreshType>> = $derived(storeDerived(data.endpoints.flatMap(e => {
		const endpoint = e.name !== undefined ? get(endpoints[e.name]!) : e.endpoint;
		return storeDerived(endpoint.refreshTypes, rt => [...rt.values()]);
	}), rts => new Set(rts.flatMap(rt => rt))));

	let containerProps: ContainerProps = $derived({
		articles: $filteredArticles,
		timelineArticleProps: {
			animatedAsGifs: data.animatedAsGifs,
			muteVideos: data.muteVideos,
			compact: data.compact,
			fullMedia: data.fullMedia,
			hideQuoteMedia: data.hideQuoteMedia,
			hideText: data.hideText,
			shouldLoadMedia: data.shouldLoadMedia,
			maxMediaCount: data.maxMediaCount,
			setModalTimeline,
			showAllMediaArticles: data.showAllMediaArticles,
		},
		articleView: data.articleView,
		columnCount: fullscreen?.columnCount ?? data.columnCount,
		rtl: data.rtl,
		rebalanceTrigger: containerRebalance,
		separateMedia: data.separateMedia,
	});

	enum ScrollDirection {
		Up,
		Down,
	}

	let autoscrollInfo: {
		direction: ScrollDirection
		anim?: () => void
		scrollRequestId?: number
	} = {
		direction: ScrollDirection.Down,
	};

	let ContainerComponent = $derived(fullscreen?.container ?? data.container);

	function shuffle() {
		data.articlesOrder.update(articleIndex => {
			if (articleIndex === null)
				articleIndex = get(articles).map(getIdServiceMediaStr);

			let currentIndex = articleIndex.length, randomIndex;

			// While there remain elements to shuffle...
			while (currentIndex != 0) {
				// Pick a remaining element...
				randomIndex = Math.floor(Math.random() * currentIndex);
				currentIndex--;

				// And swap it with the current element.
				[articleIndex[currentIndex], articleIndex[randomIndex]] = [
					articleIndex[randomIndex]!, articleIndex[currentIndex]!];
			}

			data.sortInfo.method = null;
			containerRebalance = !containerRebalance;
			return articleIndex;
		});
	}

	function autoscroll() {
		const scrollStep = () => {
			if (containerRef === null)
				return;

			if ((autoscrollInfo.direction === ScrollDirection.Down && containerRef.scrollTop < containerRef.scrollHeight - containerRef.clientHeight) ||
				(autoscrollInfo.direction === ScrollDirection.Up && containerRef.scrollTop > 0))
				containerRef.scrollBy(0, autoscrollInfo.direction === ScrollDirection.Down ? data.scrollSpeed : -data.scrollSpeed);
			else
				autoscrollInfo.direction = autoscrollInfo.direction === ScrollDirection.Down ? ScrollDirection.Up : ScrollDirection.Down;
			autoscrollInfo.scrollRequestId = window.requestAnimationFrame(scrollStep);
		};
		autoscrollInfo.scrollRequestId = window.requestAnimationFrame(scrollStep);

		window.addEventListener(
			'mousedown',
			stopScroll,
			{once: true},
		);
	}

	function stopScroll(e: MouseEvent) {
		if (autoscrollInfo.scrollRequestId === undefined)
			return;

		window.cancelAnimationFrame(autoscrollInfo.scrollRequestId);
		autoscrollInfo.scrollRequestId = undefined;

		if ((e.target as HTMLElement).matches('.timelineAutoscroll, .timelineAutoscroll *'))
			autoscrollInfo.direction = autoscrollInfo.direction === ScrollDirection.Down
				? ScrollDirection.Up
				: ScrollDirection.Down;
		else
			autoscrollInfo.direction = ScrollDirection.Down;
	}

	function refresh(refreshType: RefreshType) {
		for (const timelineEndpoint of data.endpoints)
			if (timelineEndpoint.name !== undefined)
				refreshEndpointName(timelineEndpoint.name, refreshType);
			else
				refreshEndpoint(timelineEndpoint.endpoint, refreshType)
					.then(articles => addArticlesToTimeline(data, ...articles.map(a => getRootArticle(a).idPair)));
	}

	function sortOnce(method: SortMethod, reversed: boolean) {
		//Setting reversed otherwise the timeline will reverse the order again
		data.sortInfo.reversed = false;
		data.articlesOrder.set(get(articles)
			.sort(compare({method, reversed, customMethod: null}))
			.map(getIdServiceMediaStr));
	}

	function removeFiltered() {
		//TODO Prevent articles from just being added back
		data.articles.set(
			get(articles)
				.filter((a, i) =>
					$filters.every(f =>
						!f.enabled || (keepArticle(a, i, f.filter) !== f.inverted),
					),
				)
				.map(a => getRootArticle(a).idPair),
		);
	}
</script>

<style>
	.timeline {
		height: 100%;
		padding: 0 5px;
		box-sizing: border-box;
		display: flex;
		flex-flow: column;
		width: 500px;
		flex-shrink: 0;
		background-color: var(--main-background);
	}

	.timeline:first-child {
		padding: 0;
	}

	.timeline.fullscreenTimeline {
		flex-grow: 2;
		width: unset;
		max-width: 100%;
	}


	:global(.modal .timeline) {
		width: unset;
		background-color: var(--body-background-color);
	}

	:global(.articlesContainer) {
		overflow-y: auto;
		overflow-x: auto;
		flex-grow: 1;
		height: 20%;
	}

	.noArticleText {
		text-align: center;
		margin: 25px 0;
		font-size: xx-large;
	}
</style>

<div
		class='timeline'
		class:fullscreenTimeline={fullscreen !== null}
		style={modal ? '' : data.width > 1 ? `width: ${data.width * 500}px` : ''}
>
	<TimelineHeader
			bind:data
			availableRefreshTypes={$availableRefreshTypes}
			bind:containerRebalance
			bind:showSidebar
			bind:showOptions
			bind:favviewerButtons
			bind:favviewerHidden
			bind:favviewerMaximized
			{fullscreen}
			{articleCountLabel}

			{shuffle}
			{autoscroll}
			{refresh}
			{toggleFullscreen}
	/>
	{#if showOptions}
		<TimelineOptions
				{timelineId}
				bind:data
				bind:fullscreen
				{sortOnce}
				{removeTimeline}
				{articleCountLabel}
				{removeFiltered}
		/>
	{/if}
	{#if $filteredArticles.length}
		<ContainerComponent
				bind:containerRef
				props={containerProps}
		/>
	{:else}
		<div class='articlesContainer'>
			<p class='noArticleText'>
				{articleCountLabel}
			</p>
		</div>
	{/if}
</div>