<script lang='ts'>
	import {Field, Button, Input, Select, Switch} from 'svelma'
	import ColumnContainer from "../containers/ColumnContainer.svelte"
	import RowContainer from "../containers/RowContainer.svelte"
	import MasonryContainer from "../containers/MasonryContainer.svelte"
	import SocialArticleView from "../articles/social/SocialArticleView.svelte"
	import GalleryArticleView from "../articles/GalleryArticleView.svelte"
	import type {TimelineData} from './index'
	import FiltersOptions from "../filters/FiltersOptions.svelte"
	import SortOptions from "../sorting/SortOptions.svelte"
	import {createEventDispatcher} from 'svelte'

	export let data: TimelineData
	export let fullscreen: boolean

	const dispatch = createEventDispatcher()
</script>

<style lang='sass'>
	@use '../styles/variables' as *

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
</style>

<div class='timelineOptions'>
	<div class='box'>
		<Button type='is-danger' on:click={() => dispatch('removeTimeline')}>
			Remove timeline
		</Button>
	</div>
	<div class='box'>
		<Field label='Container'>
			<Select bind:selected={data.container} nativeSize={0}>
				<option value={ColumnContainer}>Column</option>
				<option value={RowContainer}>Row</option>
				<option value={MasonryContainer}>Masonry</option>
			</Select>
		</Field>
		{#if data.container !== ColumnContainer}
			<Field label='Column Count'>
				<Input type='number' bind:value={data.columnCount} min={1}/>
			</Field>
		{/if}
		{#if !fullscreen}
			<Field label='Timeline Width'>
				<Input type='number' bind:value={data.width} min={1}/>
			</Field>
		{/if}
		<Field label='AutoScroll Speed'>
			<Input type='number' bind:value={data.scrollSpeed} min={0}/>
		</Field>
	</div>
	<div class='box'>
		<Field label='Article View'>
			<Select bind:selected={data.articleView} nativeSize={0}>
				<option value={SocialArticleView}>Social</option>
				<option value={GalleryArticleView}>Gallery</option>
			</Select>
		</Field>
		<div class='field'>
			<Switch bind:checked={data.animatedAsGifs}>Show all animated as gifs</Switch>
		</div>
		<div class='field'>
			<Switch bind:checked={data.hideFilteredOutArticles}>Hide filtered out articles</Switch>
		</div>
		<!--				<div class='field'>-->
		<!--					<Switch bind:checked={lazyLoading}>Lazy media loading</Switch>-->
		<!--				</div>-->
		{#if data.articleView === SocialArticleView}
			<div class='field'>
				<Switch bind:checked={data.compact}>Compact articles</Switch>
			</div>
			<div class='field'>
				<Switch bind:checked={data.hideText}>Hide text</Switch>
			</div>
		{/if}
	</div>
	<div class='box'>
		<Field label='Endpoints'>
			<ul>
				{#each data.endpoints as endpoint (endpoint)}
					<li>{endpoint.name}</li>
				{/each}
			</ul>
		</Field>
	</div>
	<div class='box'>
		<FiltersOptions bind:instances={data.filters}/>
	</div>
	<div class='box'>
		<SortOptions bind:sortInfo={data.sortInfo} on:sortOnce={dispatch('sortOnce')}/>
	</div>
</div>