<script lang="ts">
	import type {TimelineCollection, TimelineData, TimelineView} from './index'
	import Timeline from './Timeline.svelte'
	import {afterUpdate, getContext, onMount} from 'svelte'
	import {timelineEndpoints} from '../services/endpoints'
	import {updateFullscreenStorage} from '../storages';
    import Modal from 'Modal.svelte';
    import type { ArticleIdPair } from 'articles';

	export let timelines: TimelineCollection = {}
	export let modalTimeline: TimelineData | null;
	export let timelineView: TimelineView = {
		timelineIds: [],
		fullscreen: {
			index: null,
			columnCount: null,
			container: null,
		},
	}

	export let setModalTimeline: (data: TimelineData, width?: number) => void
	export let removeTimeline: (id: string) => void
	export let initialRefresh: (...refreshingTimelines: TimelineData[]) => void

	export let favviewerHidden: boolean;
	export let favviewerMaximized: boolean | null = null;
	export let showSidebar: boolean;
	export let modalTimelineActive: boolean

	const isInjected = getContext('isInjected');

	$: {
		for (const id of timelineView.timelineIds)
			if (!timelines.hasOwnProperty(id))
				console.error(`Timeline with id "${id}" not found.\nTimeline ids: `, Object.keys(timelines), '\nTimeline View: ', timelineView)
	}

	$: {
		const newTimelineEndpoints = timelineView.timelineIds.map(id => ({
			endpoints: timelines[id].endpoints,
			addArticles(newIdPairs: ArticleIdPair[]) {
				if (newIdPairs.length)
					timelines[id].addedIdPairs.update(addedIdPairs => {
						const newAddedIdPairs: ArticleIdPair[] = []
						for (const idPair of newIdPairs)
							if (!addedIdPairs.some(idp => idp.service === idPair.service && idp.id === idPair.id)) {
								addedIdPairs.push(idPair)
								newAddedIdPairs.push(idPair)
							}
						timelines[id].articles.update(actualIdPairs => {
							actualIdPairs.push(...newAddedIdPairs)
							return actualIdPairs
						})
						return addedIdPairs
					})
			}
		}))

		if (modalTimeline)
			newTimelineEndpoints.push({
				endpoints: modalTimeline.endpoints,
				addArticles(newIdPairs) {
					if (modalTimeline === null)
						throw new Error('modalTimeline is null');

					if (newIdPairs.length)
						modalTimeline.addedIdPairs.update(addedIdPairs => {
							if (modalTimeline === null)
								throw new Error('modalTimeline is null');

							const newAddedIdPairs: ArticleIdPair[] = []
							for (const idPair of newIdPairs)
								if (!addedIdPairs.some(idp => idp.service === idPair.service && idp.id === idPair.id)) {
									addedIdPairs.push(idPair)
									newAddedIdPairs.push(idPair)
								}
							modalTimeline.articles.update(actualIdPairs => {
								actualIdPairs.push(...newAddedIdPairs)
								return actualIdPairs
							})
							return addedIdPairs
						})
				}
			})

		timelineEndpoints.set(newTimelineEndpoints)
	}

	afterUpdate(() => {
		//Workaround for https://github.com/sveltejs/svelte/issues/5268
		//During Modal's close transition, the child Timeline still calls reactive statements for modalTimeline
		if (!modalTimelineActive)
			modalTimeline = null
	})

	onMount(() => {
		initialRefresh(...[
			...timelineView.timelineIds.map(id => timelines[id]),
			...(modalTimeline === null ? [] : [modalTimeline])
		])
	})
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
		<Modal bind:active={modalTimelineActive} mountElement={document.getElementsByClassName('soshalthing')[0]}>
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
					timelineId={timelineView.timelineIds[timelineView.fullscreen.index]}}
					favviewerButtons={true}
					bind:favviewerHidden
					bind:favviewerMaximized
					bind:showSidebar
					data={timelines[timelineView.timelineIds[timelineView.fullscreen.index]]}
					{setModalTimeline}
					bind:fullscreen={timelineView.fullscreen}
					removeTimeline={() => removeTimeline(timelineView.timelineIds[timelineView.fullscreen.index])}
					toggleFullscreen={() => {
						timelineView.fullscreen.index = null;
						updateFullscreenStorage(timelineView.fullscreen);
					}}
				/>
			{:else}
				<Timeline
					timelineId={timelineView.timelineIds[timelineView.fullscreen.index]}}
					data={timelines[timelineView.timelineIds[timelineView.fullscreen.index]]}
					{setModalTimeline}
					bind:fullscreen={timelineView.fullscreen}
					removeTimeline={() => removeTimeline(timelineView.timelineIds[timelineView.fullscreen.index])}
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
					data={timelines[id]}
					{setModalTimeline}
					removeTimeline={() => removeTimeline(id)}
					toggleFullscreen={() => {timelineView.fullscreen.index = i; updateFullscreenStorage(timelineView.fullscreen)}}
				/>
			{:else}
				<Timeline
					timelineId={id}
					data={timelines[id]}
					{setModalTimeline}
					removeTimeline={() => removeTimeline(id)}
					toggleFullscreen={() => {timelineView.fullscreen.index = i; updateFullscreenStorage(timelineView.fullscreen)}}
				/>
			{/if}
		{/each}
	{/if}
</div>