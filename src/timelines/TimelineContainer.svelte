<script lang="ts">
	import type {FullscreenInfo, TimelineData} from './index'
	import {defaultTimeline} from './index'
	import Timeline from './Timeline.svelte'
	import {afterUpdate, getContext, onMount} from 'svelte'
	import {Modal} from 'svelma'
	import {refreshEndpoint, refreshEndpointName, RefreshType, timelineEndpoints} from '../services/endpoints'
	import portal from '../usePortal'
	import TimelineEditMenu from "../sidebar/TimelineEditMenu.svelte";
	import {SidebarMenu} from '../sidebar'

	export let initTimelines: TimelineData[] = [];
	export let fullscreen: FullscreenInfo;
	export let favviewerHidden;
	export let showSidebar;
	export let sidebarMenu: SidebarMenu

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

	function removeTimeline(index: number) {
		timelines.splice(index, 1)
	}

	function setModalTimeline(data: Partial<TimelineData>) {
		modalTimeline = {
			...defaultTimeline(),
			...data,
		}
		modalTimelineActive = true

		initialRefresh(modalTimeline)
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

	function addTimeline(data: TimelineData) {
		timelines.push(data)
		timelines = timelines
	}

	function initialRefresh(...refreshingTimelines: TimelineData[]) {
		const endpointNames = new Set<string>()
		for (const timeline of refreshingTimelines)
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
	}
</script>

<style lang='sass'>
	#timelineContainer
		height: 100%
		overflow-x: auto
		display: flex
		flex-grow: 1
</style>

{#if sidebarMenu === SidebarMenu.TimelineEdit}
	<div use:portal={document.querySelector('.sidebarMenu.timelineEdit')} class='box'>
		<TimelineEditMenu
			{setModalTimeline}
			{addTimeline}
		/>
	</div>
{/if}

<div id='timelineContainer'>
	{#if modalTimeline !== null}
		<Modal bind:active={modalTimelineActive}>
			<Timeline
				data={modalTimeline}
				{setModalTimeline}
				removeTimeline={() => modalTimeline = null}
			/>
		</Modal>
	{/if}
	{#if fullscreen.index !== null}
		{#if isInjected}
			<Timeline
				favviewerButtons=true
				bind:favviewerHidden
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