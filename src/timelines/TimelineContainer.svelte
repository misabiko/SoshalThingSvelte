<script lang='ts'>
	import {addArticlesToTimeline, type TimelineCollection, type TimelineData, type TimelineView} from './index';
	import Timeline from './Timeline.svelte';
	import {getContext, onMount} from 'svelte';
	import {timelineEndpoints} from '~/services/endpoints';
    import Modal from '~/Modal.svelte';
    import type {ArticleIdPair} from '~/articles';
	import {updateFullscreenStorage} from '~/storages';

	export let timelines: TimelineCollection = {};
	export let modalTimeline: TimelineData | null;
	export let timelineView: TimelineView = {
		timelineIds: [],
		fullscreen: {
			index: null,
			columnCount: null,
			container: null,
		},
	};

	export let setModalTimeline: (data: TimelineData, width?: number) => void;
	export let removeTimeline: (id: string) => void;
	export let initialRefresh: (...refreshingTimelines: TimelineData[]) => void;

	export let favviewerHidden: boolean;
	export let favviewerMaximized: boolean | null = null;
	export let showSidebar: boolean;
	export let modalTimelineActive: boolean;

	const isInjected = getContext('isInjected');

	$: {
		for (const id of timelineView.timelineIds)
			if (!Object.hasOwn(timelines, id))
				console.error(`Timeline with id "${id}" not found.\nTimeline ids: `, Object.keys(timelines), '\nTimeline View: ', timelineView);
	}

	$: {
		const newTimelineEndpoints = timelineView.timelineIds.map(id => ({
			endpoints: timelines[id]!.endpoints,
			addArticles: (newIdPairs: ArticleIdPair[]) => addArticlesToTimeline(timelines[id]!, ...newIdPairs),
		}));

		if (modalTimeline)
			newTimelineEndpoints.push({
				endpoints: modalTimeline.endpoints,
				addArticles(newIdPairs) {
					if (modalTimeline === null)
						throw new Error('modalTimeline is null');

					addArticlesToTimeline(modalTimeline, ...newIdPairs);
				},
			});

		timelineEndpoints.set(newTimelineEndpoints);
	}

	$: {
		//Workaround for https://github.com/sveltejs/svelte/issues/5268
		//During Modal's close transition, the child Timeline still calls reactive statements for modalTimeline
		if (!modalTimelineActive)
			modalTimeline = null;
	};

	onMount(() => {
		initialRefresh(...[
			...timelineView.timelineIds.map(id => timelines[id]!),
			...(modalTimeline === null ? [] : [modalTimeline]),
		]);
	});

	const mountElement = document.getElementsByClassName('soshalthing')[0] as HTMLDivElement;
</script>

<style>
	#timelineContainer {
		height: 100%;
		overflow-x: auto;
		display: flex;
		flex-grow: 1;
	}
</style>

<!--TODO id → class, to have multiple favviewer per page-->
<div id='timelineContainer'>
	{#if modalTimeline !== null}
	<!-- TODO Find way to get specific parent soshalthing -->
		<Modal bind:active={modalTimelineActive} {mountElement}>
			<Timeline
				timelineId={null}
				data={modalTimeline}
				{setModalTimeline}
				removeTimeline={() => modalTimeline = null}
				modal={true}
			/>
		</Modal>
	{/if}
	{#if timelineView.fullscreen.index !== null}
		{#key `${timelineView.timelineIds[timelineView.fullscreen.index]}/${timelineView.fullscreen.index}`}
			{#if isInjected}
				<Timeline
					timelineId={timelineView.timelineIds[timelineView.fullscreen.index]!}
					favviewerButtons={true}
					bind:favviewerHidden
					bind:favviewerMaximized
					bind:showSidebar
					data={timelines[timelineView.timelineIds[timelineView.fullscreen.index]!]!}
					{setModalTimeline}
					bind:fullscreen={timelineView.fullscreen}
					removeTimeline={() => timelineView.fullscreen.index !== null && removeTimeline(timelineView.timelineIds[timelineView.fullscreen.index]!)}
					toggleFullscreen={() => {
						timelineView.fullscreen.index = null;
						updateFullscreenStorage(timelineView.fullscreen);
					}}
				/>
			{:else}
				<Timeline
					timelineId={timelineView.timelineIds[timelineView.fullscreen.index]!}
					data={timelines[timelineView.timelineIds[timelineView.fullscreen.index]!]!}
					{setModalTimeline}
					bind:fullscreen={timelineView.fullscreen}
					removeTimeline={() => timelineView.fullscreen.index !== null && removeTimeline(timelineView.timelineIds[timelineView.fullscreen.index]!)}
					toggleFullscreen={() => {
						timelineView.fullscreen.index = null;
						updateFullscreenStorage(timelineView.fullscreen);
					}}
				/>
			{/if}
		{/key}
	{:else}
		{#each timelineView.timelineIds as id, i (`${id}/${i}`)}
			{#if isInjected && i === 0}
				<Timeline
					timelineId={id}
					favviewerButtons={true}
					bind:favviewerHidden
					bind:favviewerMaximized
					bind:showSidebar
					data={timelines[id]!}
					{setModalTimeline}
					removeTimeline={() => removeTimeline(id)}
					toggleFullscreen={() => {timelineView.fullscreen.index = i; updateFullscreenStorage(timelineView.fullscreen);}}
				/>
			{:else}
				<Timeline
					timelineId={id}
					data={timelines[id]!}
					{setModalTimeline}
					removeTimeline={() => removeTimeline(id)}
					toggleFullscreen={() => {timelineView.fullscreen.index = i; updateFullscreenStorage(timelineView.fullscreen);}}
				/>
			{/if}
		{/each}
	{/if}
</div>