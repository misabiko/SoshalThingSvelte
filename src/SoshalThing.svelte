<script lang='ts'>
	import './partialGlobal.css';
	import {setContext} from 'svelte'
	import Sidebar from "./sidebar/Sidebar.svelte"
	import type {TimelineCollection, TimelineData, TimelineView} from "./timelines"
	import TimelineContainer from "./timelines/TimelineContainer.svelte"
	import {notifications} from './notifications/store'
	import Notification from "./notifications/Notification.svelte";
	import {Endpoint, refreshEndpoint, refreshEndpointName, RefreshType} from './services/endpoints';
	import type {FilterInstance} from './filters'
	import {getRootArticle} from './articles'
	import {updateTimelinesStorage} from 'storages'

	(BigInt.prototype as any).toJSON = function () {
		return this.toString();
	};

	let {
		timelines = {},
		timelineView = {
			timelineIds: [],
			fullscreen: {
				index: null,
				columnCount: null,
				container: null,
			},
		},
		timelineViews = {},
		isInjected = true,
		favviewerHidden = false,
		favviewerMaximized = undefined,
	} = $props<{
		timelines?: TimelineCollection,
		timelineView?: TimelineView,
		timelineViews?: {[name: string]: TimelineView},
		isInjected?: boolean,
		favviewerHidden?: boolean,
		favviewerMaximized?: boolean | undefined,
	}>();

	let modalTimeline = $state<TimelineData | null>(null);
	let modalTimelineActive = $state(false)

	let batchActionFilters = $state<FilterInstance[]>([]);

	setContext('isInjected', isInjected)
	let showSidebar = $state(!isInjected && favviewerMaximized !== true);

	function addTimeline(data: TimelineData) {
		let idNum = 0;
		while (timelines.hasOwnProperty(`Timeline ${idNum}`))
			idNum += 1;

		const id = `Timeline ${idNum}`;
		timelines[id] = data;
		timelines = timelines;
		timelineView.timelineIds = [...timelineView.timelineIds, id];

		updateTimelinesStorage(timelines);
	}

	function removeTimeline(id: string) {
		delete timelines[id];
		//We don't cache index since TimelineView.timelineIds might hold duplicates
		if (timelineView.fullscreen.index === timelineView.timelineIds.indexOf(id))
			timelineView.fullscreen.index = null;

		timelineView.timelineIds = timelineView.timelineIds.filter(viewId => viewId !== id);
		timelineView = timelineView;

		updateTimelinesStorage(timelines);
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

<style>
	.soshalthing {
		display: flex;
		width: 100%;
		font-family: BlinkMacSystemFont, -apple-system, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", "Helvetica", "Arial", sans-serif;
		color: var(--text);
	}

	#soshalNotifications {
		position: absolute;
		right: 0;
		bottom: 0;
		padding: 15px;
		z-index: 1;
	}

	/* TODO Confirm that all variables are defined */
	.soshalthing.injected {
		/* Inheriting generics.sass's html */
		background-color: var(--body-background-color);
		-moz-osx-font-smoothing: grayscale;
		-webkit-font-smoothing: antialiased;
		min-width: var(--body-min-width);
		overflow-x: var(--body-overflow-x);
		text-rendering: var(--body-rendering);

		/* Inheriting bulma's generics.sass's body */
		font-size: var(--body-font-size);
		font-weight: var(--body-weight);
		line-height: var(--body-line-height);
	}
	:global(.soshalthing.injected button.delete) {
		padding: 0;
	}
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