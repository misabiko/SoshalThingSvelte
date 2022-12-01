<script lang='ts'>
	import type {Readable, Writable} from 'svelte/store'
	import {derived, get} from 'svelte/store'
	import type {ArticleIdPair, ArticleProps, ArticleWithRefs} from '../articles'
	import Article, {
		articleWithRefToArray,
		deriveArticleRefs,
		getActualArticle, getDerivedArticleWithRefs, getRootArticle, idPairEqual,
	} from '../articles'
	import {fetchArticle, getWritable} from '../services/service'
	import {onMount} from 'svelte'
	import type {FullscreenInfo, TimelineData} from './index'
	import {keepArticle} from '../filters'
	import {compare, SortMethod} from '../sorting'
	import type {ContainerProps} from '../containers'
	import TimelineHeader from "./TimelineHeader.svelte"
	import TimelineOptions from "./TimelineOptions.svelte"
	import {endpoints, refreshEndpoint, refreshEndpointName, RefreshType} from '../services/endpoints'
	import {loadingStore} from '../bufferedMediaLoading'

	export let data: TimelineData
	//Would like to make this immutable https://github.com/sveltejs/svelte/issues/5572
	export let fullscreen: FullscreenInfo | undefined = undefined
	export let toggleFullscreen: () => void | undefined = undefined
	export let removeTimeline: () => void
	export let setModalTimeline: (data: TimelineData, width?: number) => void

	export let favviewerButtons = false
	export let favviewerHidden = false
	export let favviewerMaximized: boolean | undefined = undefined
	export let showSidebar = true

	let showOptions = false
	let containerRef: HTMLElement | undefined = undefined
	let containerRebalance = false;

	let articleIdPairs: Writable<ArticleIdPair[]> = data.articles

	let articles: Readable<Article[]>
	$: articles = derived($articleIdPairs.map(getWritable), a => a)

	let articlesWithRefs: Readable<ArticleWithRefs[]>
	$: articlesWithRefs = derived($articles.map(deriveArticleRefs), a => a.map(getDerivedArticleWithRefs))

	let filteredArticles: Readable<ArticleProps[]>
	$: filteredArticles = derived(articlesWithRefs, stores => {
		let articleProps: ArticleProps[] = stores
			.map((articleWithRefs, i) => addProps(articleWithRefs, i))

		if (data.hideFilteredOutArticles)
			articleProps = articleProps.filter(a => !a.filteredOut)

		if (data.mergeReposts) {
			let merged: ArticleProps[] = []
			for (const a of articleProps) {
				if (a.type === 'reposts') {
					const aIdPair = getRootArticle(a.reposted).idPair

					//Checking if the reposted article is already in merged
					const plainIndex = merged.findIndex(m =>
						idPairEqual(getRootArticle(m).idPair, aIdPair)
					)
					if (plainIndex > -1) {
						//Replacing it with the repost
						merged[plainIndex] = a
						continue
					}

					//Checking if a duplicate repost is in merged
					const index = merged.findIndex(m =>
						m.type === 'reposts' &&
						idPairEqual(getRootArticle(m.reposted).idPair, aIdPair)
					)

					if (index > -1)
						(merged[index] as any).reposts.push(...a.reposts)
					else
						merged.push(a)
				}else
					merged.push(a)
			}

			articleProps = merged

			//TODO Sort reposts
		}

		if (data.sortInfo.method !== undefined)
			articleProps.sort(compare(data.sortInfo))
		if (data.sortInfo.reversed)
			articleProps.reverse()

		if (data.section.useSection)
			articleProps = articleProps.slice(0, data.section.count)

		return articleProps
	})

	function addProps(articleWithRefs: ArticleWithRefs, index: number): ArticleProps {
		const filteredOut = !data.filters.every(f => !f.enabled || (keepArticle(articleWithRefs, index, f.filter) !== f.inverted))
		switch (articleWithRefs.type) {
			case 'normal':
				return {
					...articleWithRefs,
					filteredOut
				}
			case 'repost':
				return {
					type: 'reposts',
					reposts: [articleWithRefs.article],
					filteredOut,
					reposted: addProps(articleWithRefs.reposted, index)
				} as ArticleProps
			case 'quote':
				return {
					...articleWithRefs,
					filteredOut,
					quoted: addProps(articleWithRefs.quoted, index)
				} as ArticleProps
		}
	}

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
						if (article.medias[i].loaded === false)
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
			maxMediaCount: data.maxMediaCount,
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
						if (articles.length) {
							data.addedIdPairs.update(addedIdPairs => {
								const newAddedIdPairs = []
								for (const idPair of articles.map(a => getRootArticle(a).idPair))
									if (!addedIdPairs.some(idp => idPairEqual(idPair, idp))) {
										addedIdPairs.push(idPair)
										newAddedIdPairs.push(idPair)
									}
								data.articles.update(actualIdPairs => {
									actualIdPairs.push(...newAddedIdPairs)
									return actualIdPairs
								})
								return addedIdPairs
							})
						}
					})
	}

	function sortOnce(method: SortMethod, reversed: boolean) {
		const sorted = get(articlesWithRefs).sort(compare({method, reversed, customMethod: undefined}))
		if (reversed)
			sorted.reverse()
		data.articles.set(sorted.map(a => getRootArticle(a).idPair))
	}

	onMount(async () => {
		if (!data.endpoints.length)
			return

		return () => {
			console.log('Destroying timeline ' + data.title)
		}
	})

	function removeFiltered() {
		//TODO Prevent articles from just being added back
		data.articles.set(
			get(articlesWithRefs)
				.filter((a, i) =>
					data.filters.every(f =>
						!f.enabled || (keepArticle(a, i, f.filter) !== f.inverted)
					)
				)
				.map(a => getRootArticle(a).idPair)
		)
	}
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
		overflow-y: auto
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