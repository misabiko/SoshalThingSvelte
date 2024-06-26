<script lang='ts'>
	import ColumnContainer from '~/containers/ColumnContainer.svelte';
	import RowContainer from '~/containers/RowContainer.svelte';
	import MasonryContainer from '~/containers/MasonryContainer.svelte';
	import SocialArticleView from '~/articles/social/SocialArticleView.svelte';
	import GalleryArticleView from '~/articles/gallery/GalleryArticleView.svelte';
	import type {TimelineData} from './index';
	import FiltersOptions from '~/filters/FiltersOptions.svelte';
	import SortOptions from '~/sorting/SortOptions.svelte';
	import type { SortMethod } from '~/sorting';
	import type {FullscreenInfo} from './index';
	import {updateFullscreenStorage, updateServiceTemplateStorageValue, updateTimelinesStorageValue} from '~/storages';
	import EndpointOptions from '~/timelines/EndpointOptions.svelte';
	import {getServices} from '~/services/service';
	import {get, writable} from 'svelte/store';

	export let timelineId: string | null;
	export let data: TimelineData;
	export let fullscreen: FullscreenInfo | null = null;
	export let removeTimeline: () => void;
	export let sortOnce: (method: SortMethod, reversed: boolean) => void;
	export let articleCountLabel: string;
	export let removeFiltered: () => void;

	function setFullscreenContainer(checked: boolean) {
		if (fullscreen === null)
			throw new Error('FullscreenInfo is null');

		if (checked)
			fullscreen.container ??= data.container;
		else
			fullscreen.container = null;

		updateFullscreenStorage(fullscreen);
	}

	function setFullscreenColumnCount(checked: boolean) {
		if (fullscreen === null)
			throw new Error('FullscreenInfo is null');

		if (checked)
			fullscreen.columnCount ??= data.columnCount;
		else
			fullscreen.columnCount = null;

		updateFullscreenStorage(fullscreen);
	}

	enum OptionLayer {
		Session = 'session',
		Timeline = 'timeline',
		//Fullscreen = 'fullscreen',
		ServiceTemplate = 'serviceTemplate',
	}
	const currentLayer = writable(OptionLayer.Timeline);

	const template = data.serviceTemplate !== null
		? getServices()[data.serviceTemplate.service].timelineTemplates[data.serviceTemplate.templateId]
		: null;
	let templateFilters = template?.filters ?? null;
	if (templateFilters === null && template !== null)
		template.filters = templateFilters = writable(structuredClone(get(data.filters)));
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

	.timelineOptions > section {
		max-width: 100%;
		width: 100%;
	}

	:global(#timelineContainer .timelineOptions::-webkit-scrollbar-thumb) {
		background-color: var(--dark);
	}
</style>

<div class='timelineOptions'>
	<section>
		<label class='field'>
			Title
			<input type='text'
					bind:value={data.title}
					on:change="{() => timelineId !== null && updateTimelinesStorageValue(timelineId, 'title', data.title)}"
			/>
		</label>
		<p>{articleCountLabel}</p>
		<label class='field'>
			Show article count on header
			<input type='checkbox' bind:checked={data.showArticleCount}/>
		</label>
		<button class='button red-button' on:click={removeTimeline}>
			Remove timeline
		</button>
	</section>
	<section>
		<label class='field'>
			{`${fullscreen?.container !== null ? 'Timeline ' : ''}Container`}
			<select
					bind:value={data.container}
					on:change="{() => timelineId !== null && updateTimelinesStorageValue(timelineId, 'container', data.container.name.replace('Proxy<', '').replace('>', ''))}"
			>
				<option value={ColumnContainer}>Column</option>
				<option value={RowContainer}>Row</option>
				<option value={MasonryContainer}>Masonry</option>
			</select>
		</label>
		{#if fullscreen !== null}
			<label class='field'>
				<input type='checkbox' checked={!!fullscreen.container}
						on:change='{e => setFullscreenContainer(e.currentTarget.checked)}'/>
				Fullscreen Container
				{#if fullscreen.container}
					<select
							bind:value={fullscreen.container}
						on:change="{() => {
							if (fullscreen === null)
								throw new Error('FullscreenInfo is null');
							updateFullscreenStorage(fullscreen);
						}}"
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
				<input
						class='input'
						type='number'
						bind:value={data.columnCount}
						min={1}
						on:change="{() => timelineId !== null && updateTimelinesStorageValue(timelineId, 'columnCount', data.columnCount)}"
				/>
				<!-- Add PlusMinusNumber component -->
				<button on:click="{() => {
					data.columnCount++;
					if (timelineId !== null)
						updateTimelinesStorageValue(timelineId, 'columnCount', data.columnCount);
				}}">
					+
				</button>
				<button on:click="{() => {
					if (data.columnCount > 1) {
						data.columnCount--;

						if (timelineId !== null)
							updateTimelinesStorageValue(timelineId, 'columnCount', data.columnCount);
					}
				}}">
					-
				</button>
			</label>
			{#if fullscreen !== null}
				<label class='field'>
					<input type='checkbox' checked='{fullscreen.columnCount !== null}'
							on:change='{e => setFullscreenColumnCount(e.currentTarget.checked)}'/>
					Fullscreen Column Count
					{#if fullscreen.columnCount !== null}
						<input
								class='input'
								type='number'
								min={1}
								value={fullscreen.columnCount}
								on:change='{e => {
									if (fullscreen && e.currentTarget.value) {
										fullscreen.columnCount = parseInt(e.currentTarget.value);
										updateFullscreenStorage(fullscreen);
									}
								}}'
						/>
						<button on:click='{() => {
							if (fullscreen?.columnCount) {
								fullscreen.columnCount++;
								updateFullscreenStorage(fullscreen);
							}
						}}'>
							+
						</button>
						<button on:click='{() => {
							if (fullscreen?.columnCount && fullscreen?.columnCount > 1) {
								fullscreen.columnCount--;
								updateFullscreenStorage(fullscreen);
							}
						}}'>
							-
						</button>
					{/if}
				</label>
			{/if}
			<label class='field'>
				<input type='checkbox' bind:checked={data.rtl}/>
				Right to left
			</label>
		{/if}
		{#if fullscreen === null}
			<label class='field'>
				Timeline Width
				<input
						class='input'
						type='number'
						bind:value={data.width}
						min={1}
						on:change="{() => timelineId !== null && updateTimelinesStorageValue(timelineId, 'width', data.width)}"
				/>
			</label>
		{/if}
		<label class='field'>
			AutoScroll Speed
			<input class='input' type='number' bind:value={data.scrollSpeed} min={0}/>
		</label>
		<label class='field'>
			Section
			<label>
				<input type='checkbox'
						bind:checked={data.section.useSection}
						on:change="{() => timelineId !== null && updateTimelinesStorageValue(timelineId, 'section', data.section)}"
				/>
				Section articles
			</label>
			<input
					class='input'
					type='number'
					bind:value={data.section.count}
					min={0}
					on:change="{() => timelineId !== null && updateTimelinesStorageValue(timelineId, 'section', data.section)}"
			/>
		</label>
	</section>
	<section>
		<label class='field'>
			Article View
			<select
					bind:value={data.articleView}
					on:change="{() => timelineId !== null && updateTimelinesStorageValue(timelineId, 'articleView', data.articleView.name.replace('Proxy<', '').replace('>', ''))}"
			>
				<option value={SocialArticleView}>Social</option>
				<option value={GalleryArticleView}>Gallery</option>
			</select>
		</label>
		<div class='field'>
			<label>
				<input type='checkbox'
						bind:checked={data.animatedAsGifs}
						on:change="{() => timelineId !== null && updateTimelinesStorageValue(timelineId, 'animatedAsGifs', data.animatedAsGifs)}"
				/>
				Show all animated as gifs
			</label>
		</div>
		<div class='field'>
			<label>
				<input type='checkbox'
						bind:checked={data.muteVideos}
						on:change="{() => timelineId !== null && updateTimelinesStorageValue(timelineId, 'muteVideos', data.muteVideos)}"
				/>
				Mute videos
			</label>
		</div>
		<div class='field'>
			<label>
				<input type='checkbox'
						bind:checked={data.hideFilteredOutArticles}
						on:change="{() => timelineId !== null && updateTimelinesStorageValue(timelineId, 'hideFilteredOutArticles', data.hideFilteredOutArticles)}"
				/>
				Hide filtered out articles
			</label>
		</div>
		<div class='field'>
			<label>
				<input type='checkbox' bind:checked={data.mergeReposts}
						on:change="{() => timelineId !== null && updateTimelinesStorageValue(timelineId, 'mergeReposts', data.mergeReposts)}"
				/>
				Merge duplicate reposts
			</label>
		</div>
		{#if data.articleView === SocialArticleView}
			<div class='field'>
				<label>
					<input type='checkbox'
							bind:checked={data.compact}
							on:change="{() => timelineId !== null && updateTimelinesStorageValue(timelineId, 'compact', data.compact)}"
					/>
					Compact articles
				</label>
			</div>
			<label class='field'>
				Full medias
				<input
						class='input'
						type='number'
						bind:value={data.fullMedia}
						min={0}
						on:change="{() => timelineId !== null && updateTimelinesStorageValue(timelineId, 'fullMedia', data.fullMedia)}"
				/>
			</label>
			<div class='field'>
				<label>
					<input type='checkbox'
							bind:checked={data.hideQuoteMedia}
							on:change="{() => timelineId !== null && updateTimelinesStorageValue(timelineId, 'hideQuoteMedia', data.hideQuoteMedia)}"
					/>
					Hide quote media
				</label>
			</div>
			<div class='field'>
				<label>
					<input type='checkbox'
							bind:checked={data.hideText}
							on:change="{() => timelineId !== null && updateTimelinesStorageValue(timelineId, 'hideText', data.hideText)}"
					/>
					Hide text
				</label>
			</div>
		{/if}
		<label class='field'>
			Max media count
			<input
					class='input'
					type='number'
					value={data.maxMediaCount}
					min={1}
					on:change="{() => timelineId !== null && updateTimelinesStorageValue(timelineId, 'maxMediaCount', data.maxMediaCount)}"
			/>
		</label>
		<div class='field'>
			<label>
				<input type='checkbox'
					bind:checked={data.separateMedia}
					on:change="{() => timelineId !== null && updateTimelinesStorageValue(timelineId, 'separateMedia', data.separateMedia)}"
				/>
				Split articles per media
			</label>
		</div>
		<div class='field'>
			<label>
				<input type='checkbox'
					bind:checked={data.shouldLoadMedia}
					on:change="{() => timelineId !== null && updateTimelinesStorageValue(timelineId, 'shouldLoadMedia', data.shouldLoadMedia)}"
				/>
				Load media
			</label>
		</div>
	</section>
	<section>
		<h1>Endpoints</h1>
		<EndpointOptions
				{timelineId}
				bind:data
		/>
	</section>
	<section>
		<select bind:value={$currentLayer}>
			<option value={OptionLayer.Session}>Session</option>
			<option value={OptionLayer.Timeline}>Timeline</option>
			{#if data.serviceTemplate !== null}
				<option value={OptionLayer.ServiceTemplate}>Service Template</option>
			{/if}
		</select>
		{#key $currentLayer}
			{#if ($currentLayer === OptionLayer.Timeline) && timelineId !== null}
				<FiltersOptions
					onInstancesUpdate="{(instances) => {
						if (timelineId === null)
							throw {message: 'TimelineId is null', data};
						updateTimelinesStorageValue(timelineId, 'filters', instances);
					}}"
					instances={data.filters}
				/>
			{:else if $currentLayer === OptionLayer.ServiceTemplate && data.serviceTemplate !== null && templateFilters !== null}
				<FiltersOptions
					onInstancesUpdate="{(instances) => {
						if (data.serviceTemplate === null)
							throw {message: 'ServiceTemplate is null', data};
						updateServiceTemplateStorageValue(data.serviceTemplate.service, data.serviceTemplate.templateId, 'filters', instances);
					}}"
					instances={templateFilters}
				/>
			{/if}
		{/key}
		<button on:click={removeFiltered}>Remove filtered articles</button>
	</section>
	<section>
		<SortOptions {timelineId} bind:sortInfo={data.sortInfo} articlesOrder={data.articlesOrder} {sortOnce}/>
	</section>
	<section>
		<button on:click='{() => console.log(data)}'>
			Log Timeline Data
		</button>
	</section>
</div>