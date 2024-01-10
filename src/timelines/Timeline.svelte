<script lang='ts'>
	import {type Readable, readonly} from 'svelte/store';
	import {derived, get} from 'svelte/store';
	import {
		type ArticleIdPair,
		type ArticleProps,
		type ArticleWithRefs, flatDeriveArticle
	} from '~/articles';
	import {
		articleWithRefToArray,
		getActualArticle, getRootArticle, idPairEqual,
	} from '~/articles';
	import {fetchArticle} from '~/services/service';
	import type {FullscreenInfo, TimelineData} from './index';
	import {keepArticle} from '~/filters';
	import {compare, SortMethod} from '~/sorting';
	import type {ContainerProps} from '~/containers';
	import TimelineHeader from './TimelineHeader.svelte';
	import TimelineOptions from './TimelineOptions.svelte';
	import {endpoints, refreshEndpoint, refreshEndpointName, RefreshType} from '~/services/endpoints';
	import {loadingStore} from '~/bufferedMediaLoading';

	export let timelineId: string | null;
	export let data: TimelineData;
	export let fullscreen: FullscreenInfo | null = null;
	export let toggleFullscreen: (() => void) | null = null;
	export let removeTimeline: () => void;
	export let setModalTimeline: (data: TimelineData, width?: number) => void;
	export let modal = false;

	export let favviewerButtons = false;
	export let favviewerHidden = false;
	export let favviewerMaximized: boolean | null = null;
	export let showSidebar = true;

	let showOptions = false;
	let containerRef: HTMLElement | null = null;
	let containerRebalance = false;

	let articleIdPairs: Readable<ArticleIdPair[]> = readonly(data.articles);

	let articles: Readable<ArticleProps[]>;
	$: {
		//Get flat article ref store array per idPair, derive each then discard the refs, then add props for each
		articles = derived($articleIdPairs.map(idPair => derived(flatDeriveArticle(idPair), articles => articles[0])),
			articles => articles.map((a, i) => addProps(a.getArticleWithRefs(), i))
		);
	}

	let filteredArticles: Readable<ArticleProps[]>;
	$: filteredArticles = derived(articles, articleProps => {
		if (data.hideFilteredOutArticles)
			articleProps = articleProps.filter(a => !a.filteredOut);

		if (data.mergeReposts) {
			let merged: ArticleProps[] = [];
			for (const a of articleProps) {
				if (a.type === 'reposts') {
					const aIdPair = getRootArticle(a.reposted).idPair;

					//Checking if the reposted article is already in merged
					const plainIndex = merged.findIndex(m =>
						idPairEqual(getRootArticle(m).idPair, aIdPair)
					);
					if (plainIndex > -1) {
						//Replacing it with the repost
						merged[plainIndex] = a;
						continue;
					}

					//Checking if a duplicate repost is in merged
					const index = merged.findIndex(m =>
						m.type === 'reposts' &&
						idPairEqual(getRootArticle(m.reposted).idPair, aIdPair)
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
		if (data.sortInfo.reversed)
			articleProps.reverse();

		if (data.section.useSection)
			articleProps = articleProps.slice(0, data.section.count);

		return articleProps;
	});

	function addProps(articleWithRefs: ArticleWithRefs, index: number): ArticleProps {
		// const filteredOut =  !data.filters.every(f => !f.enabled || ((keepArticle(articleWithRefs, index, f.filter) ?? !f.inverted) !== f.inverted));
		//Caching filters for debugging, could return to boolean later
		const nonKeepFilters = [];
		for (const instance of data.filters) {
			if (!(!instance.enabled || (keepArticle(articleWithRefs, index, instance.filter) ?? !instance.inverted) !== instance.inverted))
				nonKeepFilters.push(instance);
		}

		const filteredOut = !!nonKeepFilters.length;

		switch (articleWithRefs.type) {
			case 'normal':
				return {
					...articleWithRefs,
					filteredOut,
					nonKeepFilters,
				};
			case 'repost':
				return {
					type: 'reposts',
					reposts: [articleWithRefs.article],
					filteredOut,
					nonKeepFilters,
					reposted: addProps(articleWithRefs.reposted, index)
				} as ArticleProps;
			case 'quote':
				return {
					...articleWithRefs,
					filteredOut,
					nonKeepFilters,
					quoted: addProps(articleWithRefs.quoted, index)
				} as ArticleProps;
			default:
				throw new Error('Unknown article type: ' + articleWithRefs.type);
		}
	}

	let articleCountLabel: string;
	$: if ($filteredArticles.length)
		articleCountLabel = `${$filteredArticles.length} articles shown, ${$articles.length - $filteredArticles.length} hidden.`;
	else if ($articles.length)
		articleCountLabel = `${$articles.length} hidden articles`;
	else
		articleCountLabel = 'No articles listed.';

	$: if (data.shouldLoadMedia && $filteredArticles.length) {
		for (const articleProps of $filteredArticles) {
			const actualArticle = getActualArticle(articleProps);
			if (!actualArticle.fetched)
				fetchArticle(actualArticle.idPair);
			if (data.shouldLoadMedia)
				for (const article of articleWithRefToArray(articleProps))
					for (let i = 0; i < article.medias.length; ++i)
						if (article.medias[i].loaded === false)
							loadingStore.requestLoad(article.idPair, i);
		}
	}

	let availableRefreshTypes: Readable<Set<RefreshType>>;
	$: availableRefreshTypes = derived(data.endpoints.flatMap(e => {
		const endpoint = e.name !== undefined ? get(endpoints[e.name]) : e.endpoint;
		return derived(endpoint.refreshTypes, rt => [...rt.values()]);
	}), rts => new Set(rts.flatMap(rt => rt)));

	let containerProps: ContainerProps;
	$: containerProps = {
		articles: $filteredArticles,
		timelineArticleProps: {
			animatedAsGifs: data.animatedAsGifs,
			muteVideos: data.muteVideos,
			compact: data.compact,
			hideQuoteMedia: data.hideQuoteMedia,
			hideText: data.hideText,
			shouldLoadMedia: data.shouldLoadMedia,
			maxMediaCount: data.maxMediaCount,
			setModalTimeline,
		},
		articleView: data.articleView,
		columnCount: fullscreen?.columnCount ?? data.columnCount,
		rtl: data.rtl,
		rebalanceTrigger: containerRebalance,
	};

	enum ScrollDirection {
		Up,
		Down,
	}

	let autoscrollInfo: {
		direction: ScrollDirection,
		anim?: () => void,
		scrollRequestId?: number,
	} = {
		direction: ScrollDirection.Down,
	};

	function shuffle() {
		data.articles.update(idPairs => {
			let currentIndex = idPairs.length,  randomIndex;

			// While there remain elements to shuffle...
			while (currentIndex != 0) {

				// Pick a remaining element...
				randomIndex = Math.floor(Math.random() * currentIndex);
				currentIndex--;

				// And swap it with the current element.
				[idPairs[currentIndex], idPairs[randomIndex]] = [
					idPairs[randomIndex], idPairs[currentIndex]];
			}

			data.sortInfo.method = null;
			containerRebalance = !containerRebalance;
			return idPairs;
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
					.then(articles => {
						if (articles.length) {
							data.addedIdPairs.update(addedIdPairs => {
								const newAddedIdPairs: ArticleIdPair[] = [];
								for (const idPair of articles.map(a => getRootArticle(a).idPair))
									if (!addedIdPairs.some(idp => idPairEqual(idPair, idp))) {
										addedIdPairs.push(idPair);
										newAddedIdPairs.push(idPair);
									}
								data.articles.update(actualIdPairs => {
									actualIdPairs.push(...newAddedIdPairs);
									return actualIdPairs;
								});
								return addedIdPairs;
							});
						}
					});
	}

	function sortOnce(method: SortMethod, reversed: boolean) {
		const sorted = get(articles).sort(compare({method, reversed, customMethod: null}));
		if (reversed)
			sorted.reverse();
		data.articles.set(sorted.map(a => getRootArticle(a).idPair));
	}

	function removeFiltered() {
		//TODO Prevent articles from just being added back
		data.articles.set(
			get(articles)
				.filter((a, i) =>
					data.filters.every(f =>
						!f.enabled || (keepArticle(a, i, f.filter) !== f.inverted)
					)
				)
				.map(a => getRootArticle(a).idPair)
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

<div class='timeline' class:fullscreenTimeline={fullscreen !== null} style={modal ? '' : data.width > 1 ? `width: ${data.width * 500}px` : ''}>
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
		<svelte:component
			this={fullscreen?.container ?? data.container}
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