<script lang='ts'>
	import './partialGlobal.css';
	import {setContext} from 'svelte';
	import Sidebar from './sidebar/Sidebar.svelte';
	import {
		addArticlesToTimeline,
		defaultTimelineViewId,
		type TimelineCollection,
		type TimelineData,
		type TimelineView,
	} from './timelines';
	import TimelineContainer from './timelines/TimelineContainer.svelte';
	import {notifications} from './notifications/store';
	import Notification from './notifications/Notification.svelte';
	import {Endpoint, endpoints, refreshEndpoint, refreshEndpointName, RefreshType} from './services/endpoints';
	import type {FilterInstance} from './filters';
	import {getRootArticle} from './articles';
	import {updateTimelinesStorage} from '~/storages';
	import {get, type Writable, writable} from 'svelte/store';
	import {FetchType, getService} from './services/service';
	import {fetchExtension} from './services/extension';

	(BigInt.prototype as any).toJSON = function () {
		return this.toString();
	};

	let {
		timelines,
		//Can't make reactive state outside, so splitting
		timelineViews: inputTimelineViews = {
			[defaultTimelineViewId]: {
				timelineIds: [],
				fullscreen: {
					index: null,
					columnCount: null,
					container: null,
				},
			},
		},
		timelineViewId = defaultTimelineViewId,
		isInjected = true,
		favviewerHidden = $bindable(false),
		favviewerMaximized = $bindable(null),
	}: {
		timelines: TimelineCollection
		timelineViews?: Record<string, TimelineView>
		timelineViewId?: string
		isInjected?: boolean
		favviewerHidden?: boolean
		favviewerMaximized?: boolean | null
	} = $props();

	for (const [viewName, view] of Object.entries(inputTimelineViews)) {
		if (view.fullscreen.index !== null && !Object.hasOwn(view.timelineIds, view.fullscreen.index)) {
			console.warn(`TimelineView ${viewName} has invalid fullscreen.index ${view.fullscreen.index}`);
			view.fullscreen.index = null;
		}
	}

	let timelineViews = $state(inputTimelineViews);

	let modalTimeline = $state<TimelineData | null>(null);
	let modalTimelineActive = $state(false);

	const batchActionFilters: Writable<FilterInstance[]> = writable([]);

	setContext('isInjected', isInjected);
	let showSidebar = $state(!isInjected && favviewerMaximized !== true);

	function addTimeline(data: TimelineData) {
		let idNum = 0;
		while (Object.hasOwn(timelines, `Timeline ${idNum}`))
			idNum += 1;

		const id = `Timeline ${idNum}`;
		timelines[id] = data;
		timelines = timelines;
		timelineViews[timelineViewId]!.timelineIds = [...timelineViews[timelineViewId]!.timelineIds, id];

		updateTimelinesStorage(timelines);
	}

	function removeTimeline(id: string) {
		delete timelines[id];
		const view = timelineViews[timelineViewId];
		if (!view)
			throw new Error(`TimelineView ${timelineViewId} does not exist`);
		//We don't cache index since TimelineView.timelineIds might hold duplicates
		if (view.fullscreen.index === view.timelineIds.indexOf(id))
			view.fullscreen.index = null;

		view.timelineIds = view.timelineIds.filter(viewId => viewId !== id);
		timelineViewId = timelineViewId;

		updateTimelinesStorage(timelines);
	}

	function setModalTimeline(data: TimelineData, width = 3) {
		modalTimeline = {
			...data,
			width,
		};
		modalTimelineActive = true;

		initialRefresh(modalTimeline);
	}

	async function initialRefresh(...refreshingTimelines: TimelineData[]) {
		const services = new Set<string>(
			refreshingTimelines
				.flatMap(t => t.endpoints.map(e => (e.endpoint ?? get(endpoints[e.name]!))))
				.map(e => (e.constructor as typeof Endpoint).service),
		);
		for (const serviceName of services) {
			const service = getService(serviceName);
			if (!service.isOnDomain && service.fetchInfo.type === FetchType.Tab && get(service.fetchInfo.tabInfo.tabId) === null)
				service.fetchInfo.tabInfo.tabId.set(await fetchExtension('getTabId', {
					url: service.fetchInfo.tabInfo.url,
					matchUrl: service.fetchInfo.tabInfo.matchUrl,
				}));
		}

		const refreshPromises = [];

		const endpointNames = new Set<string>();
		for (const timeline of refreshingTimelines)
			for (const timelineEndpoint of timeline.endpoints.filter(e => e.refreshTypes.has(RefreshType.RefreshStart)))
				if (timelineEndpoint.name !== undefined)
					endpointNames.add(timelineEndpoint.name);
				else if (/*timelineEndpoint.endpoint.refreshTypes &&*/ get(timelineEndpoint.endpoint.refreshTypes).has(RefreshType.RefreshStart))
					refreshPromises.push(
						refreshEndpoint(timelineEndpoint.endpoint, RefreshType.RefreshStart)
							.then(articles => addArticlesToTimeline(timeline, ...articles.map(a => getRootArticle(a).idPair))),
					);

		for (const endpointName of endpointNames)
			refreshPromises.push(refreshEndpointName(endpointName, RefreshType.RefreshStart));

		const results = await withTimeout(Promise.allSettled(refreshPromises), 5000, new Error('Initial refresh timed out'));

		for (const result of results)
			if (result.status === 'rejected')
				console.error(result.reason);
	}

	function withTimeout<T>(
		promise: Promise<T>,
		ms: number,
		timeoutError = new Error('Promise timed out'),
	): Promise<T> {
		// create a promise that rejects in milliseconds
		const timeout = new Promise<never>((_, reject) => {
			setTimeout(() => {
				reject(timeoutError);
			}, ms);
		});

		// returns a race between timeout and the passed promise
		return Promise.race<T>([promise, timeout]);
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
		gap: 1px;
		display: flex;
		flex-direction: column;
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
				{batchActionFilters}
				bind:timelineViewId
				bind:timelineViews
				bind:timelines
				{setModalTimeline}
				{addTimeline}
		/>
	{/if}
	<TimelineContainer
			bind:timelines
			bind:timelineView={timelineViews[timelineViewId]!}
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