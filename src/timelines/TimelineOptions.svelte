<script lang='ts'>
	import ColumnContainer from "../containers/ColumnContainer.svelte"
	import RowContainer from "../containers/RowContainer.svelte"
	import MasonryContainer from "../containers/MasonryContainer.svelte"
	import SocialArticleView from "../articles/social/SocialArticleView.svelte"
	import GalleryArticleView from "../articles/gallery/GalleryArticleView.svelte"
	import type {TimelineData} from './index'
	import FiltersOptions from "../filters/FiltersOptions.svelte"
	import SortOptions from "../sorting/SortOptions.svelte"
	import {SortMethod} from '../sorting'
	import type {FullscreenInfo} from './index'
	import {updateFullscreenStorage} from '../storages'

	export let data: TimelineData
	export let fullscreen: FullscreenInfo | undefined = undefined
	export let removeTimeline: () => void
	export let sortOnce: (method: SortMethod, reversed: boolean) => void
	export let articleCountLabel: string
	export let removeFiltered: () => void

	function setFullscreenContainer(checked: boolean) {
		if (checked)
			fullscreen.container ??= data.container
		else
			fullscreen.container = null

		updateFullscreenStorage(fullscreen)
	}

	function setFullscreenColumnCount(checked: boolean) {
		if (checked)
			fullscreen.columnCount ??= data.columnCount
		else
			fullscreen.columnCount = null

		updateFullscreenStorage(fullscreen)
	}
</script>

<style>
	.timelineOptions {
		/* TODO background-color: $scheme-main-ter; */
		padding: 1rem;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		overflow-x: hidden;
		overflow-y: scroll;
		min-height: 10%;
		resize: vertical;
	}
	.timelineOptions > .box {
		max-width: 100%;
		width: 100%;
	}

	/* :global(#timelineContainer .timelineOptions::-webkit-scrollbar-thumb) {
		TODO background-color: $dark
	} */
</style>

<div class='timelineOptions'>
	<div class='box'>
		<p>{articleCountLabel}</p>
		<!--TODO <Field label='Show article count on header'>
			<Switch bind:checked={data.showArticleCount}/>
		</Field>
		<Button type='is-danger' on:click={removeTimeline}>
			Remove timeline
		</Button> -->
	</div>
	<div class='box'>
		<!-- <Field label={`${fullscreen?.container !== null ? 'Timeline ' : ''}Container`}>
			<Select bind:selected={data.container} nativeSize={0}>
				<option value={ColumnContainer}>Column</option>
				<option value={RowContainer}>Row</option>
				<option value={MasonryContainer}>Masonry</option>
			</Select>
		</Field>
		{#if fullscreen !== undefined}
			<Field label='Fullscreen Container'>
				<Switch checked={!!fullscreen.container} on:input={e => setFullscreenContainer(e.target.checked)}/>
				{#if fullscreen.container}
					<Select
						nativeSize={0}
						bind:selected={fullscreen.container}
						on:input={() => updateFullscreenStorage(fullscreen)}
					>
						<option value={ColumnContainer}>Column</option>
						<option value={RowContainer}>Row</option>
						<option value={MasonryContainer}>Masonry</option>
					</Select>
				{/if}
			</Field>
		{/if} -->
		{#if (fullscreen?.container ?? data.container) !== ColumnContainer}
			<!-- <Field label={`${fullscreen?.columnCount !== null ? 'Timeline ' : ''}Column Count`}>
				<input class='input' type='number' bind:value={data.columnCount} min={1}/>
				<Button on:click={() => data.columnCount++}>
					+
				</Button>
				<Button on:click={() => {if (data.columnCount > 1) data.columnCount--}}>
					-
				</Button>
			</Field> -->
			<!-- {#if fullscreen !== undefined}
				<Field label={'Fullscreen Column Count'}>
					<Switch checked={fullscreen.columnCount !== null} on:input={e => setFullscreenColumnCount(e.target.checked)}/>
					{#if fullscreen.columnCount !== null}
						<input
							class='input'
							type='number'
							min={1}
							value={fullscreen.columnCount}
							on:change={e => {if (e.value) fullscreen.columnCount = parseInt(e.value)}}
							on:change={() => updateFullscreenStorage(fullscreen)}
						/>
						<Button on:click={() => {fullscreen.columnCount++; updateFullscreenStorage(fullscreen)}}>
							+
						</Button>
						<Button on:click={() => {if (fullscreen.columnCount > 1) fullscreen.columnCount--; updateFullscreenStorage(fullscreen)}}>
							-
						</Button>
					{/if}
				</Field>
			{/if}
			<Field label='Right to left'>
				<Switch bind:checked={data.rtl}/>
			</Field> -->
		{/if}
		<!-- {#if fullscreen === undefined}
			<Field label='Timeline Width'>
				<input class='input' type='number' bind:value={data.width} min={1}/>
			</Field>
		{/if}
		<Field label='AutoScroll Speed'>
			<input class='input' type='number' bind:value={data.scrollSpeed} min={0}/>
		</Field> -->
<!--		TODO Update on confirm-->
		<!-- <Field label='Section' addons={false}>
			<Switch bind:checked={data.section.useSection}>Section articles</Switch>
			<input class='input' type='number' bind:value={data.section.count} min={0}/>
		</Field> -->
	</div>
	<div class='box'>
		<!-- <Field label='Article View'>
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
		<div class='field'>
			<Switch bind:checked={data.mergeReposts}>Merge duplicate reposts</Switch>
		</div>
		{#if data.articleView === SocialArticleView}
			<div class='field'>
				<Switch bind:checked={data.compact}>Compact articles</Switch>
			</div>
			<div class='field'>
				<Switch bind:checked={data.hideText}>Hide text</Switch>
			</div>
		{/if}
		<Field label='Max media count'>
			<input class='input' type='number' bind:value={data.maxMediaCount} min={1}/>
		</Field> -->
	</div>
	<div class='box'>
		<!-- <Field label='Endpoints'>
			<ul>
				{#each data.endpoints as endpoint (endpoint)}
					<li>{endpoint.name || endpoint.endpoint.name}</li>
				{/each}
			</ul>
		</Field> -->
	</div>
	<div class='box'>
		<FiltersOptions bind:instances={data.filters}/>
		<div class='control'>
<!--			<Button on:click={removeFiltered}>Remove filtered articles</Button>-->
		</div>
	</div>
	<div class='box'>
		<SortOptions bind:sortInfo={data.sortInfo} {sortOnce}/>
	</div>
	<div class='box'>
		<!-- <Button on:click={() => console.log(data)}>
			Log Timeline Data
		</Button> -->
	</div>
</div>