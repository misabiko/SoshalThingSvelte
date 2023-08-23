<script lang="ts">
	import type {TimelineCollection, TimelineData, TimelineView} from './index'
	import Timeline from './Timeline.svelte'
	import {afterUpdate, getContext, onMount} from 'svelte'
	import {timelineEndpoints} from '../services/endpoints'
	import {updateMainStorage} from '../storages'

	export let timelines: TimelineCollection = {}
	export let modalTimeline: TimelineData | null;
	export let timelineView: TimelineView = {
		timelineIds: [],
		fullscreen: null,
	}

	export let setModalTimeline: (data: TimelineData, width?: number) => void
	export let removeTimeline: (id: string) => void
	export let initialRefresh: (...refreshingTimelines: TimelineData[]) => void

	export let favviewerHidden: boolean;
	export let favviewerMaximized: boolean | undefined = undefined;
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
			addArticles(newIdPairs) {
				if (newIdPairs.length)
					timelines[id].addedIdPairs.update(addedIdPairs => {
						const newAddedIdPairs = []
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
					if (newIdPairs.length)
						modalTimeline.addedIdPairs.update(addedIdPairs => {
							const newAddedIdPairs = []
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
		<!--TODO Replace onBody with mountElement-->
		<!--<Modal bind:active={modalTimelineActive} onBody={!isInjected}>
			<Timeline
				data={modalTimeline}
				{setModalTimeline}
				removeTimeline={() => modalTimeline = null}
			/>
		</Modal>-->
	{/if}
	{#if timelineView.fullscreen.index !== null}
		{#key `${timelineView.timelineIds[timelineView.fullscreen.index]}/${timelineView.fullscreen.index}`}
			{#if isInjected}
				<Timeline
					favviewerButtons=true
					bind:favviewerHidden
					bind:favviewerMaximized
					bind:showSidebar
					data={timelines[timelineView.timelineIds[timelineView.fullscreen.index]]}
					{setModalTimeline}
					bind:fullscreen={timelineView.fullscreen}
					removeTimeline={() => removeTimeline(timelineView.timelineIds[timelineView.fullscreen.index])}
					toggleFullscreen={() => {timelineView.fullscreen.index = null; updateMainStorage('fullscreen', timelineView.fullscreen)}}
				/>
			{:else}
				<Timeline
					data={timelines[timelineView.timelineIds[timelineView.fullscreen.index]]}
					{setModalTimeline}
					bind:fullscreen={timelineView.fullscreen}
					removeTimeline={() => removeTimeline(timelineView.timelineIds[timelineView.fullscreen.index])}
					toggleFullscreen={() => {timelineView.fullscreen.index = null; updateMainStorage('fullscreen', timelineView.fullscreen)}}
				/>
			{/if}
		{/key}
	{:else}
		{#each timelineView.timelineIds as id, i (`${id}/${i}`)}
			{#if isInjected && i === 0}
				<Timeline
					favviewerButtons=true
					bind:favviewerHidden
					bind:favviewerMaximized
					bind:showSidebar
					data={timelines[id]}
					{setModalTimeline}
					removeTimeline={() => removeTimeline(i)}
					toggleFullscreen={() => {timelineView.fullscreen.index = i; updateMainStorage('fullscreen', timelineView.fullscreen)}}
				/>
			{:else}
				<Timeline
					data={timelines[id]}
					{setModalTimeline}
					removeTimeline={() => removeTimeline(i)}
					toggleFullscreen={() => {timelineView.fullscreen.index = i; updateMainStorage('fullscreen', timelineView.fullscreen)}}
				/>
			{/if}
		{/each}
	{/if}
</div>