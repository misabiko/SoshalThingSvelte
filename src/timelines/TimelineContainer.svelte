<script lang="ts">
	import type {TimelineData} from './index'
	import {defaultTimeline} from './index'
	import Timeline from './Timeline.svelte'
	import {afterUpdate, getContext, onMount} from 'svelte'
	import {Modal} from 'svelma'
	import {refreshEndpoint, refreshEndpointName, RefreshType, timelineEndpoints} from '../services/endpoints'

	export let initTimelines: TimelineData[] = [];
	export let fullscreen: number | undefined;
	export let favviewerHidden;
	export let showSidebar;

	//We could make this a stack of timelines
	let modalTimeline: TimelineData | null = null
	let modalTimelineActive = false

	const isInjected = getContext('isInjected');
	let timelines: TimelineData[] = initTimelines;

	$: {
		const newTimelineEndpoints = timelines.map((t, i) => ({
			endpoints: t.endpoints,
			addArticles(newIdPairs) {
				if (newIdPairs.length)
					timelines[i].articles.update(idPairs => {
						idPairs.push(...newIdPairs)
						return idPairs
					})
			}
		}))

		if (modalTimeline)
			newTimelineEndpoints.push({
				endpoints: modalTimeline.endpoints,
				addArticles(newIdPairs) {
					if (newIdPairs.length)
						modalTimeline.articles.update(idPairs => {
							idPairs.push(...newIdPairs)
							return idPairs
						})
				}
			})

		timelineEndpoints.set(newTimelineEndpoints)
	}

	function removeTimeline(index: number) {
		timelines.splice(index, 1)
	}

	function setModalTimeline(data: Partial<TimelineData>) {
		modalTimeline = {
			...defaultTimeline(),
			...data,
		}
		modalTimelineActive = true
	}

	afterUpdate(() => {
		//Workaround for https://github.com/sveltejs/svelte/issues/5268
		//During Modal's close transition, the child Timeline still calls reactive statements for modalTimeline
		if (!modalTimelineActive)
			modalTimeline = null
	})

	onMount(() => {
		const endpointNames = new Set<string>()
		for (const timeline of timelines)
			for (const timelineEndpoint of timeline.endpoints)
				if (timelineEndpoint.name !== undefined)
					endpointNames.add(timelineEndpoint.name)
				else
					refreshEndpoint(timelineEndpoint.endpoint, RefreshType.RefreshStart)
						.then(articles => {
							if (articles.length)
								timeline.articles.update(idPairs => {
									idPairs.push(...articles.map(a => a.article.idPair))
									return idPairs
								})
						})

		for (const endpointName of endpointNames.values())
			refreshEndpointName(endpointName, RefreshType.RefreshStart)
	})
</script>

<style lang='sass'>
	#timelineContainer
		height: 100%
		overflow-x: auto
		display: flex
		flex-grow: 1
</style>

<div id='timelineContainer'>
	{#if modalTimeline !== null}
		<Modal bind:active={modalTimelineActive}>
			<Timeline
				data={modalTimeline}
				{setModalTimeline}
				fullscreen={false}
				removeTimeline={() => modalTimeline = null}
			/>
		</Modal>
	{/if}
	{#if fullscreen !== undefined}
		{#if isInjected}
			<Timeline
				favviewerButtons=true
				bind:favviewerHidden={favviewerHidden}
				bind:showSidebar={showSidebar}
				data={timelines[fullscreen]}
				{setModalTimeline}
				fullscreen={true}
				removeTimeline={() => removeTimeline(fullscreen)}
				toggleFullscreen={() => fullscreen = undefined}
			/>
		{:else}
			<Timeline
				data={timelines[fullscreen]}
				{setModalTimeline}
				fullscreen={true}
				removeTimeline={() => removeTimeline(fullscreen)}
				toggleFullscreen={() => fullscreen = undefined}
			/>
		{/if}
	{:else}
		<!--TODO Add id to timeline, just to use as key-->
		{#each timelines as data, i (`${data.name}/${i}`)}
			{#if isInjected && i === 0}
				<Timeline
					favviewerButtons=true
					bind:favviewerHidden={favviewerHidden}
					bind:showSidebar={showSidebar}
					{data}
					{setModalTimeline}
					fullscreen={false}
					removeTimeline={() => removeTimeline(i)}
					toggleFullscreen={() => fullscreen = i}
				/>
			{:else}
				<Timeline
					{data}
					{setModalTimeline}
					fullscreen={false}
					removeTimeline={() => removeTimeline(i)}
					toggleFullscreen={() => fullscreen = i}
				/>
			{/if}
		{/each}
	{/if}
</div>