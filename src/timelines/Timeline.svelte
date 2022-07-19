<script lang='ts'>
	import type {Readable} from 'svelte/store'
	import {derived, get} from 'svelte/store'
	import type {ArticleRef, ArticleWithRefs} from '../services/article'
	import Article, {articleRefIdPairToRef} from '../services/article'
	import {
		getEndpoints,
		getWritable,
		refreshEndpoints,
		RefreshType,
	} from '../services/service'
	import {createEventDispatcher, onMount} from 'svelte'
	import {type TimelineData} from './index'
	import {keepArticle} from '../filters'
	import {compare, SortMethod} from '../sorting'
	import type {ContainerProps} from '../containers'
	import TimelineHeader from "./TimelineHeader.svelte";
	import TimelineOptions from "./TimelineOptions.svelte";
	import type {ArticleProps} from '../articles'

	export let data: TimelineData
	//Would like to make this immutable https://github.com/sveltejs/svelte/issues/5572
	export let fullscreen: boolean

	export let favviewerButtons = false
	export let favviewerHidden = false
	export let showSidebar = true

	let showOptions = false
	let containerRef: HTMLElement | undefined = undefined
	let containerRebalance = false;

	//TODO Move articles to TimelineData
	let articleIdPairs = [...data.initArticles]

	let articles: Readable<Article[]>
	$: articles = derived(articleIdPairs.map(getWritable), a => a)

	let articlesWithRefs: Readable<ArticleWithRefs[]>
	$: articlesWithRefs = derived($articles.map(article => {
		const stores: Readable<ArticleRef | Article>[] = []
		if (article.actualArticleRef)
			stores.push(articleRefIdPairToRef(article.actualArticleRef))
		if (article.replyRef)
			stores.push(getWritable(article.replyRef))

		return derived(stores, refs => ({
			article,
			actualArticleRef: article.actualArticleRef ? refs[0] as ArticleRef : undefined,
			replyRef: article.replyRef ? (article.actualArticleRef ? refs[1] : refs[0]) as Article : undefined,
		}))
	}), a => a)

	let filteredArticles: Readable<ArticleProps[]>
	$: filteredArticles = derived(
		articlesWithRefs,
		stores => {
			let articleProps: ArticleProps[] = stores
				.map(articleWithRefs => ({
					...articleWithRefs,
					filteredOut: !data.filters.every(f => !f.enabled || (keepArticle(articleWithRefs, f.filter) !== f.inverted))
				}))

			if (data.hideFilteredOutArticles)
				articleProps = articleProps.filter(a => !a.filteredOut)

			if (data.sortInfo.method)
				articleProps.sort(compare(data.sortInfo.method))
			if (data.sortInfo.reversed)
				articleProps.reverse()

			return articleProps
		},
	)

	let availableRefreshTypes: Set<RefreshType>
	$: availableRefreshTypes = new Set(data.endpoints.flatMap(e => [...getEndpoints()[e.name].refreshTypes.values()]))

	let containerProps: ContainerProps
	$: containerProps = {
		articles: $filteredArticles,
		timelineArticleProps: {
			animatedAsGifs: data.animatedAsGifs,
			compact: data.compact,
			hideText: data.hideText,
			shouldLoadMedia: data.shouldLoadMedia,
		},
		articleView: data.articleView,
		columnCount: data.columnCount,
		rebalanceTrigger: containerRebalance,
	}

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
	}

	function shuffle() {
		let currentIndex = articleIdPairs.length,  randomIndex;

		// While there remain elements to shuffle...
		while (currentIndex != 0) {

			// Pick a remaining element...
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex--;

			// And swap it with the current element.
			[articleIdPairs[currentIndex], articleIdPairs[randomIndex]] = [
				articleIdPairs[randomIndex], articleIdPairs[currentIndex]];
		}

		articleIdPairs = articleIdPairs
		data.sortInfo.method = undefined
		containerRebalance = !containerRebalance
	}

	function autoscroll() {
		const scrollStep = () => {
			if ((autoscrollInfo.direction && containerRef.scrollTop > 0) ||
				(!autoscrollInfo.direction && containerRef.scrollTop < containerRef.scrollHeight - containerRef.clientHeight))
				containerRef.scrollBy(0, autoscrollInfo.direction ? data.scrollSpeed : -data.scrollSpeed)
			else
				autoscrollInfo.direction = autoscrollInfo.direction === ScrollDirection.Down ? ScrollDirection.Up : ScrollDirection.Down
			autoscrollInfo.scrollRequestId = window.requestAnimationFrame(scrollStep)
		}
		autoscrollInfo.scrollRequestId = window.requestAnimationFrame(scrollStep)

		window.addEventListener(
			'mousedown',
			stopScroll,
			{once: true},
		);
	}

	function stopScroll(e: MouseEvent) {
		if (autoscrollInfo.scrollRequestId === undefined)
			return

		window.cancelAnimationFrame(autoscrollInfo.scrollRequestId)
		autoscrollInfo.scrollRequestId = undefined

		if ((e.target as HTMLElement).matches('.timelineAutoscroll, .timelineAutoscroll *'))
			autoscrollInfo.direction = autoscrollInfo.direction === ScrollDirection.Down
				? ScrollDirection.Up
				: ScrollDirection.Down
		else
			autoscrollInfo.direction = ScrollDirection.Down
	}

	async function refresh(refreshType: RefreshType) {
		const newArticles = await refreshEndpoints(data.endpoints, refreshType)
		articleIdPairs.push(...newArticles)
		articleIdPairs = articleIdPairs
	}

	function sortOnce(event: {detail: {method: SortMethod, reversed: boolean}}) {
		const sorted = get(articlesWithRefs).sort(compare(event.detail.method))
		if (event.detail.reversed)
			sorted.reverse()
		articleIdPairs = sorted.map(a => a.article.idPair)
	}

	onMount(async () => {
		if (!data.endpoints.length)
			return

		const newArticles = await refreshEndpoints(data.endpoints, RefreshType.RefreshStart)
		articleIdPairs.push(...newArticles)
		articleIdPairs = articleIdPairs
	})

	const dispatch = createEventDispatcher()
</script>

<style lang='sass'>
	@use '../styles/variables' as *

	.timeline
		color: $text
		height: 100%
		padding: 0 5px
		box-sizing: border-box
		display: flex
		flex-flow: column
		width: 500px
		flex-shrink: 0

		&:first-child
			padding: 0

	.timeline.fullscreenTimeline
		flex-grow: 2
		width: unset
		max-width: 100%

	:global(.articlesContainer)
		overflow-y: scroll
		overflow-x: hidden
		flex-grow: 1
		height: 20%
		background-color: $background
</style>

<div class='timeline' class:fullscreenTimeline={fullscreen} style='{data.width > 1 ? `width: ${data.width * 500}px` : ""}'>
	<TimelineHeader
		bind:data
		bind:availableRefreshTypes
		bind:containerRebalance
		bind:showSidebar
		bind:showOptions
		bind:favviewerButtons
		bind:favviewerHidden
		{fullscreen}

		on:shuffle={shuffle}
		on:autoscroll={autoscroll}
		on:refresh={e => refresh(e.detail)}
		on:toggleFullscreen={() => dispatch('toggleFullscreen')}
	/>
	{#if showOptions}
		<TimelineOptions
			bind:data
			{fullscreen}
			on:sortOnce
			on:removeTimeline={() => dispatch('removeTimeline')}
		/>
	{/if}
	<svelte:component
		this={data.container}
		bind:containerRef={containerRef}
		props={containerProps}
	/>
</div>