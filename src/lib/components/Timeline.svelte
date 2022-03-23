<script>
	import ColumnContainer from "./containers/ColumnContainer.svelte";
	import RowContainer from "./containers/RowContainer.svelte";
	import SocialArticleView from "./articles/SocialArticleView.svelte";
	import Fa from 'svelte-fa/src/fa.svelte';
	import { faRandom, faScroll, faSyncAlt, faArrowDown, faArrowUp, faEllipsisV, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
	import {getTweet} from '../services/twitter/service';
	import {Select, Field} from 'svelma';

	export let title;
	export let fullscreen = false;
	export let initArticles = [];
	export let initContainer = undefined;
	export let initArticleView = undefined;

	export let favviewerButtons = false;
	export let favviewerHidden;
	export let showSidebar;

	let container = initContainer || ColumnContainer;
	let columnCount = 5;
	let width = 1;
	let articleView = initArticleView || SocialArticleView;
	let showOptions = false;

	let articles = initArticles;

	function shuffle() {
		console.log('Shuffling!');
	}

	function autoscroll() {
		console.log('Scrolling!');
	}

	async function refresh() {
		console.log('Refreshing!');
		const tweet = await getTweet("1504842554591772678");
		if (tweet !== undefined)
			articles = [...articles, tweet];
		console.dir(articles);
	}

	function loadBottom() {
		console.log('Loading Bottom!');
	}

	function loadTop() {
		console.log('Loading Top!');
	}
</script>

<style lang='sass' global>
	@use '../styles/core' as *

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
			<button title="Shuffle" on:click={shuffle}>
				<Fa icon={faRandom} size='large'/>
			</button>
			<button title="Autoscroll" on:click={autoscroll}>
				<Fa icon={faScroll} size='large'/>
			</button>
			<button title="Refresh" on:click={refresh}>
				<Fa icon={faSyncAlt} size='large'/>
			</button>
			<button title="Load Bottom" on:click={loadBottom}>
				<Fa icon={faArrowDown} size='large'/>
			</button>
			<button title="Load Top" on:click={loadTop}>
				<Fa icon={faArrowUp} size='large'/>
			</button>
			<button title="Expand options" on:click='{() => showOptions = !showOptions}'>
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
						<input class='input' type='number' bind:value={columnCount} min=1/>
					</div>
				{/if}
				{#if !fullscreen}
					<div class='block control'>
						<label class='label'>Timeline Width</label>
						<input class='input' type='number' bind:value={width} min=1/>
					</div>
				{/if}
			</div>
		</div>
	{/if}
	<svelte:component this={container} {articles} articleView={articleView} {columnCount}/>
</div>