<script lang="ts">
	import type {FullscreenInfo, TimelineData} from './index'
	import Timeline from './Timeline.svelte'
	import {afterUpdate, getContext, onMount} from 'svelte'
	import {Modal} from 'svelma'
	import {timelineEndpoints} from '../services/endpoints'

	export let timelines: TimelineData[] = []
	export let modalTimeline: TimelineData | null;
	export let setModalTimeline: (data: TimelineData, width?: number) => void
	export let removeTimeline: (index: number) => void
	export let initialRefresh: (...refreshingTimelines: TimelineData[]) => void

	export let fullscreen: FullscreenInfo;
	export let favviewerHidden;
	export let favviewerMaximized: boolean | undefined = undefined;
	export let showSidebar;
	export let modalTimelineActive: boolean

	const isInjected = getContext('isInjected');

	$: {
		const newTimelineEndpoints = timelines.map((t, i) => ({
			endpoints: t.endpoints,
			addArticles(newIdPairs) {
				if (newIdPairs.length)
					timelines[i].articles.update(idPairs => {
						for (const idPair of newIdPairs)
							if (!idPairs.some(idp => idp.service === idPair.service && idp.id === idPair.id))
								idPairs.push(idPair)
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
							for (const idPair of newIdPairs)
								if (!idPairs.some(idp => idp.service === idPair.service && idp.id === idPair.id))
									idPairs.push(idPair)
							return idPairs
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
			...timelines,
			...(modalTimeline === null ? [] : [modalTimeline])
		])
	})
</script>

<style lang='sass'>
	#timelineContainer
		height: 100%
		overflow-x: auto
		display: flex
		flex-grow: 1
</style>
<!--TODO id → class-->
<div id='timelineContainer'>
	{#if modalTimeline !== null}
		<!--TODO Replace onBody with mountElement-->
		<Modal bind:active={modalTimelineActive} onBody={!isInjected}>
			<Timeline
				data={modalTimeline}
				{setModalTimeline}
				removeTimeline={() => modalTimeline = null}
			/>
		</Modal>
	{/if}
	{#if fullscreen.index !== null && timelines[fullscreen.index] !== undefined}
		{#if isInjected}
			<Timeline
				favviewerButtons=true
				bind:favviewerHidden
				bind:favviewerMaximized
				bind:showSidebar
				data={timelines[fullscreen.index]}
				{setModalTimeline}
				bind:fullscreen
				removeTimeline={() => removeTimeline(fullscreen.index)}
				toggleFullscreen={() => fullscreen.index = null}
			/>
		{:else}
			<Timeline
				data={timelines[fullscreen.index]}
				{setModalTimeline}
				bind:fullscreen
				removeTimeline={() => removeTimeline(fullscreen.index)}
				toggleFullscreen={() => fullscreen.index = null}
			/>
		{/if}
	{:else}
		<!--TODO Add id to timeline, just to use as key-->
		{#each timelines as data, i (`${data.name}/${i}`)}
			{#if isInjected && i === 0}
				<Timeline
					favviewerButtons=true
					bind:favviewerHidden
					bind:favviewerMaximized
					bind:showSidebar
					{data}
					{setModalTimeline}
					removeTimeline={() => removeTimeline(i)}
					toggleFullscreen={() => fullscreen.index = i}
				/>
			{:else}
				<Timeline
					{data}
					{setModalTimeline}
					removeTimeline={() => removeTimeline(i)}
					toggleFullscreen={() => fullscreen.index = i}
				/>
			{/if}
		{/each}
	{/if}
</div>