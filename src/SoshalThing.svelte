<script lang='ts'>
	import {setContext} from 'svelte'
	import Sidebar from "./sidebar/Sidebar.svelte"
	import type {FullscreenInfo, TimelineData} from "./timelines"
	import TimelineContainer from "./timelines/TimelineContainer.svelte"
	import {notifications} from './notifications/store'
	import Notification from "./notifications/Notification.svelte";
	import {Endpoint, refreshEndpoint, refreshEndpointName, RefreshType} from './services/endpoints'
	import type {FilterInstance} from './filters'
	import {getRootArticle} from './articles'

	(BigInt.prototype as any).toJSON = function () {
		return this.toString();
	};

	export let timelines: TimelineData[] = []
	export let fullscreen: FullscreenInfo = {
		index: null,
		columnCount: null,
		container: null,
	}
	export let isInjected = true
	export let favviewerHidden = false
	export let favviewerMaximized: boolean | undefined = undefined

	let modalTimeline: TimelineData | null = null
	let modalTimelineActive = false

	let batchActionFilters: FilterInstance[] = []

	setContext('isInjected', isInjected)
	let showSidebar = !isInjected

	function addTimeline(data: TimelineData) {
		timelines.push(data)
		timelines = timelines
	}

	function removeTimeline(index: number) {
		timelines.splice(index, 1)
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
			for (const timelineEndpoint of timeline.endpoints)
				if (timelineEndpoint.name !== undefined)
					endpointNames.add(timelineEndpoint.name)
				else
					refreshEndpoint(timelineEndpoint.endpoint as Endpoint, RefreshType.RefreshStart)
						.then(articles => {
							if (articles.length)
								timeline.articles.update(idPairs => {
									idPairs.push(...articles.map(a => getRootArticle(a).idPair))
									return idPairs
								})
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
			{timelines}
			{setModalTimeline}
			{addTimeline}
		/>
	{/if}
	<TimelineContainer
		bind:timelines
		bind:modalTimeline
		bind:modalTimelineActive
		bind:favviewerHidden
		bind:favviewerMaximized
		bind:showSidebar
		{fullscreen}
		{setModalTimeline}
		{removeTimeline}
		{initialRefresh}
	/>
</div>