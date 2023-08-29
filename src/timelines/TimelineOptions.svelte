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
		background-color: var(--scheme-main-ter);
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

	:global(#timelineContainer .timelineOptions::-webkit-scrollbar-thumb) {
		background-color: var(--dark);
	}
</style>

<div class='timelineOptions'>
	<div class='box'>
		<p>{articleCountLabel}</p>
		<label class='field'>
			Show article count on header
			<input type='checkbox' bind:checked={data.showArticleCount}/>
		</label>
		<button type='is-danger' on:click={removeTimeline}>
			Remove timeline
		</button>
	</div>
	<div class='box'>
		<label class='field'>
			{`${fullscreen?.container !== null ? 'Timeline ' : ''}Container`}
			<select bind:value={data.container}>
				<option value={ColumnContainer}>Column</option>
				<option value={RowContainer}>Row</option>
				<option value={MasonryContainer}>Masonry</option>
			</select>
		</label>
		{#if fullscreen !== undefined}
			<label class='field'>
				Fullscreen Container
				<input type='checkbox' checked={!!fullscreen.container} on:input={e => setFullscreenContainer(e.target.checked)}/>
				{#if fullscreen.container}
					<select
						bind:value={fullscreen.container}
						on:input={() => updateFullscreenStorage(fullscreen)}
					>
						<option value={ColumnContainer}>Column</option>
						<option value={RowContainer}>Row</option>
						<option value={MasonryContainer}>Masonry</option>
					</select>
				{/if}
			</label>
		{/if}
		{#if (fullscreen?.container ?? data.container) !== ColumnContainer}
			<label class='field'>
				{`${fullscreen?.columnCount !== null ? 'Timeline ' : ''}Column Count`}
				<input class='input' type='number' bind:value={data.columnCount} min={1}/>
				<button on:click={() => data.columnCount++}>
					+
				</button>
				<button on:click={() => {if (data.columnCount > 1) data.columnCount--}}>
					-
				</button>
			</label>
			{#if fullscreen !== undefined}
				<label class='field'>
					Fullscreen Column Count
					<input type='checkbox' checked={fullscreen.columnCount !== null} on:input={e => setFullscreenColumnCount(e.target.checked)}/>
					{#if fullscreen.columnCount !== null}
						<input
							class='input'
							type='number'
							min={1}
							value={fullscreen.columnCount}
							on:change={e => {if (e.value) fullscreen.columnCount = parseInt(e.value)}}
							on:change={() => updateFullscreenStorage(fullscreen)}
						/>
						<button on:click={() => {fullscreen.columnCount++; updateFullscreenStorage(fullscreen)}}>
							+
						</button>
						<button on:click={() => {if (fullscreen.columnCount > 1) fullscreen.columnCount--; updateFullscreenStorage(fullscreen)}}>
							-
						</button>
					{/if}
				</label>
			{/if}
			<label class='field'>
				Right to left
				<input type='checkbox' bind:checked={data.rtl}/>
			</label>
		{/if}
		{#if fullscreen === undefined}
			<label class='field'>
				Timeline Width
				<input class='input' type='number' bind:value={data.width} min={1}/>
			</label>
		{/if}
		<label class='field'>
			AutoScroll Speed
			<input class='input' type='number' bind:value={data.scrollSpeed} min={0}/>
		</label>
<!--		TODO Update on confirm-->
		<label class='field'>
			Section
			<label>
				Section articles
				<input type='checkbox' bind:checked={data.section.useSection}/>
			</label>
			<input class='input' type='number' bind:value={data.section.count} min={0}/>
		</label>
	</div>
	<div class='box'>
		<label class='field'>
			Article View
			<select bind:value={data.articleView}>
				<option value={SocialArticleView}>Social</option>
				<option value={GalleryArticleView}>Gallery</option>
			</select>
		</label>
		<div class='field'>
			<label>
				Show all animated as gifs
				<input type='checkbox' bind:checked={data.animatedAsGifs}/>
			</label>
		</div>
		<div class='field'>
			<label>
				Hide filtered out articles
				<input type='checkbox' bind:checked={data.hideFilteredOutArticles}/>
			</label>
		</div>
		<div class='field'>
			<label>
				Merge duplicate reposts
				<input type='checkbox' bind:checked={data.mergeReposts}/>
			</label>
		</div>
		{#if data.articleView === SocialArticleView}
			<div class='field'>
				<label>
					Compact articles
					<input type='checkbox' bind:checked={data.compact}/>
				</label>
			</div>
			<div class='field'>
				<label>
					Hide text
					<input type='checkbox' bind:checked={data.hideText}/>
				</label>
			</div>
		{/if}
		<label class='field'>
			Max media count
			<input class='input' type='number' bind:value={data.maxMediaCount} min={1}/>
		</label>
	</div>
	<div class='box'>
		<label class='field'>
			Endpoints
			<ul>
				{#each data.endpoints as endpoint (endpoint)}
					<li>{endpoint.name || endpoint.endpoint.name}</li>
				{/each}
			</ul>
			<!-- TODO Add dynamic endpoint menu -->
		</label>
	</div>
	<div class='box'>
		<FiltersOptions bind:instances={data.filters}/>
		<div class='control'>
			<button on:click={removeFiltered}>Remove filtered articles</button>
		</div>
	</div>
	<div class='box'>
		<SortOptions bind:sortInfo={data.sortInfo} {sortOnce}/>
	</div>
	<div class='box'>
		<button on:click={() => console.log(data)}>
			Log Timeline Data
		</button>
	</div>
</div>