<script context='module'>
	import {Field, Select} from 'svelma';
</script>

<script lang='ts'>
	import type {Writable} from 'svelte/store'
	import type {ArticleIdPair} from '../services/service'
	import ColumnContainer from "./containers/ColumnContainer.svelte"
	import RowContainer from "./containers/RowContainer.svelte"
	import SocialArticleView from "./articles/SocialArticleView.svelte"
	import Fa from 'svelte-fa/src/fa.svelte'
	import {
		faRandom,
		faScroll,
		faSyncAlt,
		faArrowDown,
		faArrowUp,
		faEllipsisV,
		faEyeSlash,
	} from '@fortawesome/free-solid-svg-icons'
	import {derived, writable} from 'svelte/store'
	import {
		getWritable,
		loadBottomEndpoints,
		loadTopEndpoints,
		refreshEndpoints,
		RefreshTime,
	} from '../services/service'
	import Article from '../services/article'
	import {onMount} from 'svelte'

	export interface TimelineData {
		title: string;
		fullscreen?: boolean;
		endpoints: string[];
		initArticles?: Article[];
		initContainer?: any;
		initArticleView?: any;
	}

	export let title
	export let fullscreen = false
	export let endpoints: string[]
	export let initArticles: ArticleIdPair[] = []
	export let initContainer = undefined
	export let initArticleView = undefined

	export let favviewerButtons = false
	export let favviewerHidden = false
	export let showSidebar = true

	let container = initContainer || ColumnContainer
	let columnCount = 5
	let width = 1
	let articleView = initArticleView || SocialArticleView
	let showOptions = false
	const socialSettings = {
		hideText: false,
	}

	let articleIdPairs: Writable<ArticleIdPair[]> = writable([...initArticles])

	$: filteredArticles = derived($articleIdPairs.map(idPair => getWritable(idPair)),
		(articles: Article[]) => articles?.filter((a: Article) => !a.markedAsRead && !a.hidden)
			.map((a: Article) => a.idPair) || [],
	)

	function shuffle() {
		console.log('Shuffling!')
	}

	function autoscroll() {
		console.log('Scrolling!')
	}

	async function refresh() {
		console.log('Refreshing!')
		const newArticles = await refreshEndpoints(endpoints, RefreshTime.OnRefresh)
		articleIdPairs.update(idPairs => {
			idPairs.push(...newArticles)
			return idPairs
		})
	}

	async function loadBottom() {
		console.log('Loading Bottom!')
		const newArticles = await loadBottomEndpoints(endpoints, RefreshTime.OnRefresh)
		articleIdPairs.update(idPairs => {
			idPairs.push(...newArticles)
			return idPairs
		})
	}

	async function loadTop() {
		console.log('Loading Top!')
		const newArticles = await loadTopEndpoints(endpoints, RefreshTime.OnRefresh)
		articleIdPairs.update(idPairs => {
			idPairs.push(...newArticles)
			return idPairs
		})
	}

	onMount(async () => {
		if (!endpoints.length)
			return

		const newArticles = await refreshEndpoints(endpoints, RefreshTime.OnStart)
		articleIdPairs.update(idPairs => {
			idPairs.push(...newArticles)
			return idPairs
		})
	})
</script>

<style lang='sass' global>
	@import '../styles/core'

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

	.timelineHeader
		height: 50px
		line-height: 50px
		padding-left: 25px
		background-color: $dark
		display: flex
		justify-content: space-between

		strong
			vertical-align: middle

		&.timelineInvalid
			background-color: $dark-error

	.timelineLeftHeader
		display: flex
		flex-shrink: 8

	.timelineButtons
		display: flex
		flex-wrap: nowrap

	.timelineButtons > button
		@include borderless-button(0 1rem)
		height: 100%

	.timelineOptions
		background-color: $scheme-main-ter
		padding: 1rem
		display: flex
		flex-direction: column
		align-items: flex-start
		overflow-x: hidden
		overflow-y: scroll

		& input[type="number"]
			width: 200px

		& > .box
			max-width: 100%
			width: 100%

	#timelineContainer .timelineOptions::-webkit-scrollbar-thumb
		background-color: $dark

	.articlesContainer
		overflow-y: scroll
		overflow-x: hidden
		flex-grow: 1
		height: 20%
		background-color: $background
</style>

<div class='timeline' class:fullscreenTimeline={fullscreen} style='{width > 1 ? `width: ${width * 500}px` : ""}'>
	<div class='timelineHeader'>
		<div class='timelineLeftHeader'>
			<strong>{title}</strong>
			{#if favviewerButtons}
				<div class='timelineButtons'>
					<button title='Toggle FavViewer' on:click={() => favviewerHidden = !favviewerHidden}>
						<Fa icon={faEyeSlash} size='large'/>
					</button>
					<button title='Show Sidebar' on:click={() => showSidebar = !showSidebar}>
						<Fa icon={faEllipsisV} size='large'/>
					</button>
				</div>
			{/if}
		</div>
		<div class='timelineButtons'>
			<button title='Shuffle' on:click={shuffle}>
				<Fa icon={faRandom} size='large'/>
			</button>
			<button title='Autoscroll' on:click={autoscroll}>
				<Fa icon={faScroll} size='large'/>
			</button>
			<button title='Refresh' on:click={refresh}>
				<Fa icon={faSyncAlt} size='large'/>
			</button>
			<button title='Load Bottom' on:click={loadBottom}>
				<Fa icon={faArrowDown} size='large'/>
			</button>
			<button title='Load Top' on:click={loadTop}>
				<Fa icon={faArrowUp} size='large'/>
			</button>
			<button title='Expand options' on:click='{() => showOptions = !showOptions}'>
				<Fa icon={faEllipsisV} size='large'/>
			</button>
		</div>
	</div>
	{#if showOptions}
		<div class='timelineOptions'>
			<div class='box'>
				<Field label='Container'>
					<Select bind:selected={container}>
						<option value={ColumnContainer}>Column</option>
						<option value={RowContainer}>Row</option>
					</Select>
				</Field>
				{#if container !== ColumnContainer}
					<div class='block control'>
						<label class='label'>Column Count</label>
						<input class='input' type='number' bind:value={columnCount} min='1/'>
					</div>
				{/if}
				{#if !fullscreen}
					<div class='block control'>
						<label class='label'>Timeline Width</label>
						<input class='input' type='number' bind:value={width} min='1/'>
					</div>
				{/if}
			</div>
			<div class='box'>
				<Field label='Endpoints'>
					<ul>
						{#each endpoints as endpoint (endpoint)}
							<li>{endpoint}</li>
						{/each}
					</ul>
				</Field>
			</div>
		</div>
	{/if}
	<svelte:component this={container} idPairs={$filteredArticles} articleView={articleView} {columnCount} {socialSettings}/>
</div>