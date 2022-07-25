<script lang='ts'>
	import type {Readable, Writable} from 'svelte/store'
	import {derived, get} from 'svelte/store'
	import type {ArticleIdPair, ArticleRef, ArticleWithRefs} from '../services/article'
	import Article, {articleRefIdPairToRef, articleWithRefToArray, getActualArticle} from '../services/article'
	import {
		fetchArticle,
		getWritable,

	} from '../services/service'
	import {onMount} from 'svelte'
	import type {FullscreenInfo, TimelineData} from './index'
	import {keepArticle} from '../filters'
	import {compare, SortMethod} from '../sorting'
	import type {ContainerProps} from '../containers'
	import TimelineHeader from "./TimelineHeader.svelte";
	import TimelineOptions from "./TimelineOptions.svelte";
	import type {ArticleProps} from '../articles'
	import {
		endpoints,
		refreshEndpoint,
		refreshEndpointName,
		RefreshType,
	} from '../services/endpoints'
	import {loadingStore} from '../bufferedMediaLoading'

	export let data: TimelineData
	//Would like to make this immutable https://github.com/sveltejs/svelte/issues/5572
	export let fullscreen: FullscreenInfo | undefined = undefined
	export let toggleFullscreen: () => void | undefined = undefined
	export let removeTimeline: () => void
	export let setModalTimeline: (data: TimelineData, width?: number) => void

	export let favviewerButtons = false
	export let favviewerHidden = false
	export let showSidebar = true

	let showOptions = false
	let containerRef: HTMLElement | undefined = undefined
	let containerRebalance = false;

	let articleIdPairs: Writable<ArticleIdPair[]> = data.articles

	let articles: Readable<Article[]>
	$: articles = derived($articleIdPairs.map(getWritable), a => a)

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
				.map((articleWithRefs, i) => ({
					...articleWithRefs,
					filteredOut: !data.filters.every(f => !f.enabled || (keepArticle(articleWithRefs, i, f.filter) !== f.inverted))
				}))

			if (data.hideFilteredOutArticles)
				articleProps = articleProps.filter(a => !a.filteredOut)

			if (data.sortInfo.method)
				articleProps.sort(compare(data.sortInfo.method))
			if (data.sortInfo.reversed)
				articleProps.reverse()

			if (data.section.useSection)
				articleProps = articleProps.slice(0, data.section.count)

			return articleProps
		},
	)

	let articleCountLabel: string
	$: if ($filteredArticles.length)
		articleCountLabel = `${$filteredArticles.length} articles shown, ${$articles.length - $filteredArticles.length} hidden.`
	else if ($articles.length)
		articleCountLabel = `${$articles.length} hidden articles`
	else
		articleCountLabel = 'No articles listed.'

	$: if (data.shouldLoadMedia && $filteredArticles.length) {
		for (const articleProps of $filteredArticles) {
			const actualArticle = getActualArticle(articleProps)
			if (!actualArticle.fetched)
				fetchArticle(actualArticle.idPair)
			if (data.shouldLoadMedia)
				for (const article of articleWithRefToArray(articleProps))
					for (let i = 0; i < article.medias.length; ++i)
						if (!article.medias[i].loaded)
							loadingStore.requestLoad(article.idPair, i)
		}
	}

	let availableRefreshTypes: Set<RefreshType>
	$: availableRefreshTypes = new Set(data.endpoints.flatMap(e => {
		const endpoint = e.name !== undefined ? get(endpoints[e.name]) : e.endpoint
		return [...endpoint.refreshTypes.values()]
	}))

	let containerProps: ContainerProps
	$: containerProps = {
		articles: $filteredArticles,
		timelineArticleProps: {
			animatedAsGifs: data.animatedAsGifs,
			compact: data.compact,
			hideText: data.hideText,
			shouldLoadMedia: data.shouldLoadMedia,
			setModalTimeline,
		},
		articleView: data.articleView,
		columnCount: fullscreen?.columnCount ?? data.columnCount,
		rtl: data.rtl,
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
		data.articles.update(idPairs => {
			let currentIndex = length,  randomIndex;

			// While there remain elements to shuffle...
			while (currentIndex != 0) {

				// Pick a remaining element...
				randomIndex = Math.floor(Math.random() * currentIndex);
				currentIndex--;

				// And swap it with the current element.
				[idPairs[currentIndex], idPairs[randomIndex]] = [
					idPairs[randomIndex], idPairs[currentIndex]];
			}

			data.sortInfo.method = undefined
			containerRebalance = !containerRebalance
			return idPairs
		})
	}

	function autoscroll() {
		const scrollStep = () => {
			if ((autoscrollInfo.direction === ScrollDirection.Down && containerRef.scrollTop < containerRef.scrollHeight - containerRef.clientHeight) ||
				(autoscrollInfo.direction === ScrollDirection.Up && containerRef.scrollTop > 0))
				containerRef.scrollBy(0, autoscrollInfo.direction === ScrollDirection.Down ? data.scrollSpeed : -data.scrollSpeed)
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

	function refresh(refreshType: RefreshType) {
		for (const timelineEndpoint of data.endpoints)
			if (timelineEndpoint.name !== undefined)
				refreshEndpointName(timelineEndpoint.name, refreshType)
			else
				refreshEndpoint(timelineEndpoint.endpoint, refreshType)
					.then(articles => {
						if (articles.length)
							data.articles.update(idPairs => {
								for (const a of articles)
									if (!idPairs.some(idp => idp.service === a.article.idPair.service && idp.id === a.article.idPair.id))
										idPairs.push(a.article.idPair)
								return idPairs
							})
					})
	}

	function sortOnce(method: SortMethod, reversed: boolean) {
		const sorted = get(articlesWithRefs).sort(compare(method))
		if (reversed)
			sorted.reverse()
		data.articles.set(sorted.map(a => a.article.idPair))
	}

	onMount(async () => {
		if (!data.endpoints.length)
			return

		return () => {
			console.log('Destroying timeline ' + data.title)
		}
	})
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


	:global(.modal .timeline)
		width: unset

	:global(.articlesContainer)
		overflow-y: scroll
		overflow-x: hidden
		flex-grow: 1
		height: 20%
		background-color: $background

	.noArticleText
		text-align: center
		margin: 25px 0
		font-size: xx-large
</style>

<div class='timeline' class:fullscreenTimeline={fullscreen !== undefined} style='{data.width > 1 ? `width: ${data.width * 500}px` : ""}'>
	<TimelineHeader
		bind:data
		bind:availableRefreshTypes
		bind:containerRebalance
		bind:showSidebar
		bind:showOptions
		bind:favviewerButtons
		bind:favviewerHidden
		{fullscreen}
		{articleCountLabel}

		{shuffle}
		{autoscroll}
		{refresh}
		{toggleFullscreen}
	/>
	{#if showOptions}
		<TimelineOptions
			bind:data
			bind:fullscreen
			{sortOnce}
			{removeTimeline}
			{articleCountLabel}
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