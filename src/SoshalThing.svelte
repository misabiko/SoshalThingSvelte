<script lang='ts'>
	import './partialGlobal.css';
	import {setContext} from 'svelte'
	import Sidebar from "./sidebar/Sidebar.svelte"
	import {
		defaultTimelineView,
		type TimelineCollection,
		type TimelineData, type TimelineView,
	} from './timelines';
	import TimelineContainer from "./timelines/TimelineContainer.svelte"
	import {notifications} from './notifications/store'
	import Notification from "./notifications/Notification.svelte";
	import {Endpoint, endpoints, refreshEndpoint, refreshEndpointName, RefreshType} from './services/endpoints';
	import type {FilterInstance} from './filters'
	import {getRootArticle} from './articles'
	import {updateTimelinesStorage} from 'storages'
	import {get} from "svelte/store";
	import {getServices} from './services/service';
	import {fetchExtension} from './services/extension';

	(BigInt.prototype as any).toJSON = function () {
		return this.toString();
	};

	export let timelines: TimelineCollection = {}
	export let timelineViews: Record<string, TimelineView> = {
		[defaultTimelineView]: {
			timelineIds: [],
			fullscreen: {
				index: null,
				columnCount: null,
				container: null,
			}
		}
	}
	export let timelineViewId: string = defaultTimelineView
	export let isInjected = true
	export let favviewerHidden = false
	export let favviewerMaximized: boolean | null = null

	let modalTimeline: TimelineData | null = null
	let modalTimelineActive = false

	let batchActionFilters: FilterInstance[] = []

	setContext('isInjected', isInjected)
	let showSidebar = !isInjected && favviewerMaximized !== true

	function addTimeline(data: TimelineData) {
		let idNum = 0;
		while (timelines.hasOwnProperty(`Timeline ${idNum}`))
			idNum += 1;

		const id = `Timeline ${idNum}`;
		timelines[id] = data;
		timelines = timelines;
		timelineViews[timelineViewId].timelineIds = [...timelineViews[timelineViewId].timelineIds, id];

		updateTimelinesStorage(timelines);
	}

	function removeTimeline(id: string) {
		delete timelines[id];
		//We don't cache index since TimelineView.timelineIds might hold duplicates
		if (timelineViews[timelineViewId].fullscreen.index === timelineViews[timelineViewId].timelineIds.indexOf(id))
			timelineViews[timelineViewId].fullscreen.index = null;

		timelineViews[timelineViewId].timelineIds = timelineViews[timelineViewId].timelineIds.filter(viewId => viewId !== id);
		timelineViewId = timelineViewId;

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

	async function initialRefresh(...refreshingTimelines: TimelineData[]) {
		const services = new Set<string>(
			refreshingTimelines
				.flatMap(t => t.endpoints.map(e => (e.endpoint ?? get(endpoints[e.name]))))
				.map(e => (e.constructor as typeof Endpoint).service)
		);
		for (const serviceName of services) {
			const service = getServices()[serviceName];
			if (service.tabInfo !== null && get(service.tabInfo.tabId) === null)
				service.tabInfo.tabId.set(await fetchExtension('getTabId', {
					url: service.tabInfo.url,
					matchUrl: service.tabInfo.matchUrl
				}));
		}

		const endpointNames = new Set<string>()
		for (const timeline of refreshingTimelines)
			for (const timelineEndpoint of timeline.endpoints.filter(e => e.refreshTypes.has(RefreshType.RefreshStart)))
				if (timelineEndpoint.name !== undefined)
					endpointNames.add(timelineEndpoint.name)
				else if (timelineEndpoint.endpoint?.refreshTypes && get(timelineEndpoint.endpoint.refreshTypes).has(RefreshType.RefreshStart))
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
			bind:timelineViewId
			bind:timelineViews
			bind:timelines
			{setModalTimeline}
			{addTimeline}
		/>
	{/if}
	<TimelineContainer
		bind:timelines
		bind:timelineView={timelineViews[timelineViewId]}
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