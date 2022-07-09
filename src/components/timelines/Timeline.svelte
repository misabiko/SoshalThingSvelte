<script lang='ts'>
	import {Field, Select, Input, Switch} from 'svelma';
	import type {Writable} from 'svelte/store'
	import type {ArticleIdPair} from '../../services/article'
	import ColumnContainer from "../containers/ColumnContainer.svelte"
	import RowContainer from "../containers/RowContainer.svelte"
	import MasonryContainer from "../containers/MasonryContainer.svelte"
	import SocialArticleView from "../articles/SocialArticleView.svelte"
	import GalleryArticleView from "../articles/GalleryArticleView.svelte"
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
	} from '../../services/service'
	import Article from '../../services/article'
	import {afterUpdate, onMount, SvelteComponent} from 'svelte'
	import {type TimelineData} from './index'

	export let data: TimelineData
	export let fullscreen: boolean

	export let favviewerButtons = false
	export let favviewerHidden = false

	export let showSidebar = true
	let showOptions = false
	let container = data.initContainer || MasonryContainer
	let containerRef: HTMLElement | undefined = undefined
	let width = 1
	let articleView = data.initArticleView || SocialArticleView
	let animatedAsGifs = false
	let scrollSpeed = 3
	let hideText = false
	let compact = false
	let shouldLoadMedia = true;

	let articleIdPairs: Writable<ArticleIdPair[]> = writable([...data.initArticles])

	$: filteredArticles = derived($articleIdPairs.map(idPair => getWritable(idPair)),
		(articles: Article[]) => articles?.filter((a: Article) => !a.markedAsRead && !a.hidden)
			.map((a: Article) => a.idPair) || [],
	)

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
		articleIdPairs.update(array => {
			let currentIndex = array.length,  randomIndex;

			// While there remain elements to shuffle...
			while (currentIndex != 0) {

				// Pick a remaining element...
				randomIndex = Math.floor(Math.random() * currentIndex);
				currentIndex--;

				// And swap it with the current element.
				[array[currentIndex], array[randomIndex]] = [
					array[randomIndex], array[currentIndex]];
			}

			return array;
		})
	}

	function autoscroll() {
		console.log('Scrolling!')
		let oldDirection = autoscrollInfo.direction;
		autoscrollInfo.direction = oldDirection === ScrollDirection.Down ? ScrollDirection.Up : ScrollDirection.Down;

		const scrollStep = () => {
			if ((autoscrollInfo.direction && containerRef.scrollTop > 0) ||
				(!autoscrollInfo.direction && containerRef.scrollTop < containerRef.scrollHeight - containerRef.clientHeight))
				containerRef.scrollBy(0, autoscrollInfo.direction ? -scrollSpeed : scrollSpeed)
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

	function stopScroll() {
		if (autoscrollInfo.scrollRequestId === undefined)
			return

		window.cancelAnimationFrame(autoscrollInfo.scrollRequestId)
		autoscrollInfo.scrollRequestId = undefined
	}

	async function refresh() {
		console.log('Refreshing!')
		const newArticles = await refreshEndpoints(data.endpoints, RefreshTime.OnRefresh)
		articleIdPairs.update(idPairs => {
			idPairs.push(...newArticles)
			return idPairs
		})
	}

	async function loadBottom() {
		console.log('Loading Bottom!')
		const newArticles = await loadBottomEndpoints(data.endpoints, RefreshTime.OnRefresh)
		articleIdPairs.update(idPairs => {
			idPairs.push(...newArticles)
			return idPairs
		})
	}

	async function loadTop() {
		console.log('Loading Top!')
		const newArticles = await loadTopEndpoints(data.endpoints, RefreshTime.OnRefresh)
		articleIdPairs.update(idPairs => {
			idPairs.push(...newArticles)
			return idPairs
		})
	}

	onMount(async () => {
		if (!data.endpoints.length)
			return

		const newArticles = await refreshEndpoints(data.endpoints, RefreshTime.OnStart)
		articleIdPairs.update(idPairs => {
			idPairs.push(...newArticles)
			return idPairs
		})
	})

	/*afterUpdate(async () => {
		for (const idPair of)
	})*/
</script>

<style lang='sass'>
	@use '../../styles/variables' as *

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

		//TODO &.timelineInvalid
		//	background-color: $dark-error

	.timelineLeftHeader
		display: flex
		flex-shrink: 8

	.timelineButtons
		display: flex
		flex-wrap: nowrap

	.timelineButtons > button
		height: 100%
		padding: 0 1rem

	.timelineOptions
		background-color: $scheme-main-ter
		padding: 1rem
		display: flex
		flex-direction: column
		align-items: flex-start
		overflow-x: hidden
		overflow-y: scroll
		min-height: 50%

		//TODO & input[type="number"]
		//	width: 200px

		& > .box
			max-width: 100%
			width: 100%

	:global(#timelineContainer .timelineOptions::-webkit-scrollbar-thumb)
		background-color: $dark

	:global(.articlesContainer)
		overflow-y: scroll
		overflow-x: hidden
		flex-grow: 1
		height: 20%
		background-color: $background
</style>

<div class='timeline' class:fullscreenTimeline={fullscreen} style='{width > 1 ? `width: ${width * 500}px` : ""}'>
	<div class='timelineHeader'>
		<div class='timelineLeftHeader'>
			<strong>{data.title}</strong>
			{#if favviewerButtons}
				<div class='timelineButtons'>
					<button class='borderless-button' title='Toggle FavViewer' on:click={() => favviewerHidden = !favviewerHidden}>
						<Fa icon={faEyeSlash} size='large'/>
					</button>
					<button class='borderless-button' title='Show Sidebar' on:click={() => showSidebar = !showSidebar}>
						<Fa icon={faEllipsisV} size='large'/>
					</button>
				</div>
			{/if}
		</div>
		<div class='timelineButtons'>
			<button class='borderless-button' title='Shuffle' on:click={shuffle}>
				<Fa icon={faRandom} size='large'/>
			</button>
			<button class='borderless-button' title='Autoscroll' on:click={autoscroll}>
				<Fa icon={faScroll} size='large'/>
			</button>
			<button class='borderless-button' title='Refresh' on:click={refresh}>
				<Fa icon={faSyncAlt} size='large'/>
			</button>
			<button class='borderless-button' title='Load Bottom' on:click={loadBottom}>
				<Fa icon={faArrowDown} size='large'/>
			</button>
			<button class='borderless-button' title='Load Top' on:click={loadTop}>
				<Fa icon={faArrowUp} size='large'/>
			</button>
			<button class='borderless-button' title='Expand options' on:click='{() => showOptions = !showOptions}'>
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
						<option value={MasonryContainer}>Masonry</option>
					</Select>
				</Field>
				{#if container !== ColumnContainer}
					<Field label='Column Count'>
						<Input type='number' bind:value={data.columnCount} min={1}/>
					</Field>
				{/if}
				{#if !fullscreen}
					<Field label='Timeline Width'>
						<Input type='number' bind:value={width} min={1}/>
					</Field>
				{/if}
				<Field label='AutoScroll Speed'>
					<Input type='number' bind:value={scrollSpeed} min={0}/>
				</Field>
			</div>
			<div class='box'>
				<Field label='Article View'>
					<Select bind:selected={articleView}>
						<option value={SocialArticleView}>Social</option>
						<option value={GalleryArticleView}>Gallery</option>
					</Select>
				</Field>
				<div class='field'>
					<Switch bind:checked={animatedAsGifs}>Show all animated as gifs</Switch>
				</div>
<!--				<div class='field'>-->
<!--					<Switch bind:checked={lazyLoading}>Lazy media loading</Switch>-->
<!--				</div>-->
				{#if articleView === SocialArticleView}
					<div class='field'>
						<Switch bind:checked={compact}>Compact articles</Switch>
					</div>
					<div class='field'>
						<Switch bind:checked={hideText}>Hide text</Switch>
					</div>
				{/if}
			</div>
			<div class='box'>
				<Field label='Endpoints'>
					<ul>
						{#each data.endpoints as endpoint (endpoint)}
							<li>{endpoint}</li>
						{/each}
					</ul>
				</Field>
			</div>
		</div>
	{/if}
	<svelte:component
		this={container}
		bind:containerRef={containerRef}
		idPairs={$filteredArticles}
		articleView={articleView}
		columnCount={data.columnCount}
		{hideText}
		{compact}
		{animatedAsGifs}
		{shouldLoadMedia}
	/>
</div>