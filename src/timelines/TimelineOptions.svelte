<script lang='ts'>
	import {Field, Button, Select, Switch} from 'svelma'
	import ColumnContainer from "../containers/ColumnContainer.svelte"
	import RowContainer from "../containers/RowContainer.svelte"
	import MasonryContainer from "../containers/MasonryContainer.svelte"
	import SocialArticleView from "../articles/social/SocialArticleView.svelte"
	import GalleryArticleView from "../articles/GalleryArticleView.svelte"
	import type {TimelineData} from './index'
	import FiltersOptions from "../filters/FiltersOptions.svelte"
	import SortOptions from "../sorting/SortOptions.svelte"
	import {SortMethod} from '../sorting'
	import type {FullscreenInfo} from './index'

	export let data: TimelineData
	export let fullscreen: FullscreenInfo | undefined
	export let removeTimeline: () => void
	export let sortOnce: (method: SortMethod, reversed: boolean) => void

	let fullscreenContainerChecked = fullscreen?.container !== null
	let lastFullscreenContainerChecked = fullscreenContainerChecked
	//TODO Just add on:change to Switch
	$: if (fullscreenContainerChecked !== lastFullscreenContainerChecked) {
		if (fullscreenContainerChecked)
			fullscreen.container = data.container
		else
			fullscreen.container = null
		lastFullscreenContainerChecked = fullscreenContainerChecked
	}
	let fullscreenColumnCountChecked = fullscreen?.columnCount !== null
	let lastFullscreenColumnCountChecked = fullscreenColumnCountChecked
	$: if (fullscreenColumnCountChecked !== lastFullscreenColumnCountChecked) {
		if (fullscreenColumnCountChecked)
			fullscreen.columnCount = data.columnCount
		else
			fullscreen.columnCount = null
		lastFullscreenColumnCountChecked = fullscreenColumnCountChecked
	}
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
		<Button type='is-danger' on:click={removeTimeline}>
			Remove timeline
		</Button>
	</div>
	<div class='box'>
		<Field label={`${fullscreen?.container !== null ? 'Timeline ' : ''}Container`}>
			<Select bind:selected={data.container} nativeSize={0}>
				<option value={ColumnContainer}>Column</option>
				<option value={RowContainer}>Row</option>
				<option value={MasonryContainer}>Masonry</option>
			</Select>
		</Field>
		{#if fullscreen !== undefined}
			<Field label='Fullscreen Container'>
				<Switch bind:checked={fullscreenContainerChecked}/>
				{#if fullscreenContainerChecked}
					<Select bind:selected={fullscreen.container} nativeSize={0}>
						<option value={ColumnContainer}>Column</option>
						<option value={RowContainer}>Row</option>
						<option value={MasonryContainer}>Masonry</option>
					</Select>
				{/if}
			</Field>
		{/if}
		{#if (fullscreen?.container ?? data.container) !== ColumnContainer}
			<Field label={`${fullscreen?.columnCount !== null ? 'Timeline ' : ''}Column Count`}>
<!--				TODO Make <Input type='number' bind:value/> work in svelma-->
				<input class='input' type='number' bind:value={data.columnCount} min={1}/>
			</Field>
			{#if fullscreen !== undefined}
				<Field label={'Fullscreen Column Count'}>
					<Switch bind:checked={fullscreenColumnCountChecked}/>
					{#if fullscreen.columnCount !== null}
						<input class='input' type='number' bind:value={fullscreen.columnCount} min={1}/>
					{/if}
				</Field>
			{/if}
			<Field label='Right to left'>
				<Switch bind:checked={data.rtl}/>
			</Field>
		{/if}
		{#if fullscreen === undefined}
			<Field label='Timeline Width'>
				<input class='input' type='number' bind:value={data.width} min={1}/>
			</Field>
		{/if}
		<Field label='AutoScroll Speed'>
			<input class='input' type='number' bind:value={data.scrollSpeed} min={0}/>
		</Field>
		<Field label='Section' addons={false}>
			<Switch bind:checked={data.section.useSection}>Section articles</Switch>
			<input class='input' type='number' bind:value={data.section.count} min={0}/>
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
					<li>{endpoint.name || endpoint.endpoint.name}</li>
				{/each}
			</ul>
		</Field>
	</div>
	<div class='box'>
		<FiltersOptions bind:instances={data.filters}/>
	</div>
	<div class='box'>
		<SortOptions bind:sortInfo={data.sortInfo} {sortOnce}/>
	</div>
</div>