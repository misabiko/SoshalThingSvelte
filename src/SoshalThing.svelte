<script lang='ts'>
	import {setContext} from 'svelte'
	import Sidebar from "./sidebar/Sidebar.svelte"
	import type {TimelineCollection, TimelineData, TimelineView} from "./timelines"
	import TimelineContainer from "./timelines/TimelineContainer.svelte"
	import {notifications} from './notifications/store'
	import Notification from "./notifications/Notification.svelte";
	import {Endpoint, refreshEndpoint, refreshEndpointName, RefreshType} from './services/endpoints'
	import type {FilterInstance} from './filters'
	import {getRootArticle} from './articles'

	(BigInt.prototype as any).toJSON = function () {
		return this.toString();
	};

	export let timelines: TimelineCollection = {}
	export let timelineView: TimelineView = {
		timelineIds: [],
		fullscreen: {
			index: null,
			columnCount: null,
			container: null,
		}
	}
	export let timelineViews: {[name: string]: TimelineView} = {}
	export let isInjected = true
	export let favviewerHidden = false
	export let favviewerMaximized: boolean | undefined = undefined

	let modalTimeline: TimelineData | null = null
	let modalTimelineActive = false

	let batchActionFilters: FilterInstance[] = []

	setContext('isInjected', isInjected)
	let showSidebar = !isInjected && favviewerMaximized !== true

	function addTimeline(data: TimelineData) {
		let id = 0;
		while (timelines.hasOwnProperty(`Timeline ${id}`))
			id += 1;

		timelines[`Timeline ${id}`] = data;
		timelines = timelines
	}

	function removeTimeline(id: string) {
		delete timelines[id];
		//We don't cache index since TimelineView.timelineIds might hold duplicates
		if (timelineView.fullscreen.index === timelineView.timelineIds.indexOf(id))
			timelineView.fullscreen.index = null;

		timelineView.timelineIds = timelineView.timelineIds.filter(viewId => viewId !== id);
		timelineView = timelineView;
	}

	function setModalTimeline(data: TimelineData, width = 3) {
		modalTimeline = {
			...data,
			width,
		}
		modalTimelineActive = true

		initialRefresh(modalTimeline)
	}

	function initialRefresh(...refreshingTimelines: TimelineData[]) {
		const endpointNames = new Set<string>()
		for (const timeline of refreshingTimelines)
			for (const timelineEndpoint of timeline.endpoints.filter(e => e.refreshTypes.has(RefreshType.RefreshStart)))
				if (timelineEndpoint.name !== undefined)
					endpointNames.add(timelineEndpoint.name)
				else if (timelineEndpoint.endpoint?.refreshTypes?.has(RefreshType.RefreshStart))
					refreshEndpoint(timelineEndpoint.endpoint as Endpoint, RefreshType.RefreshStart)
						.then(articles => {
							if (articles.length) {
								const newAddedIdPairs = articles.map(a => getRootArticle(a).idPair)
								timeline.addedIdPairs.update(idPairs => {
									idPairs.push(...newAddedIdPairs)
									return idPairs
								})
								timeline.articles.update(idPairs => {
									idPairs.push(...newAddedIdPairs)
									return idPairs
								})
							}
						})

		for (const endpointName of endpointNames.values())
			refreshEndpointName(endpointName, RefreshType.RefreshStart)
	}
</script>

<style lang='sass'>
	.soshalthing
		display: flex
		width: 100%

		//.injected
		//	height: 100%
		//	display: flex

		//#favviewer
		//	width: 100vw
		//	height: 90vh
		//	display: flex
		//	-webkit-font-smoothing: antialiased
		//	-moz-osx-font-smoothing: grayscale

	#soshalNotifications
		position: absolute
		right: 0
		bottom: 0
		padding: 15px
		z-index: 1
</style>

<div class='soshalthing' class:injected={isInjected}>
	<div id='soshalNotifications'>
		{#each Object.entries($notifications) as [id, notif] (id)}
			<Notification data={notif} id={id}/>
		{/each}
	</div>
	{#if showSidebar}
		<Sidebar
			bind:batchActionFilters
			bind:timelineView
			bind:timelineViews
			bind:timelines
			{setModalTimeline}
			{addTimeline}
		/>
	{/if}
	<TimelineContainer
		bind:timelines
		bind:timelineView
		bind:modalTimeline
		bind:modalTimelineActive
		bind:favviewerHidden
		bind:favviewerMaximized
		bind:showSidebar
		{setModalTimeline}
		{removeTimeline}
		{initialRefresh}
	/>
</div>