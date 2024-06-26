<script lang='ts'>
	import SoshalThing from '~/SoshalThing.svelte';
	import {
		defaultTimelineView,
		type TimelineCollection,
		type TimelineView
	} from '~/timelines';
	import {defaultTimeline} from '~/timelines';
	import {loadMainStorage} from '~/storages';
    import TimelineAPI, { TimelineType } from '~/services/twitter/endpoints/domainEndpoints/TimelineAPI.endpoint';
    import { everyRefreshType } from '~/services/endpoints';
    import SidebarActivator from '../SidebarActivator.svelte';
	import {TwitterService} from '~/services/twitter/service';

	let currentTimeline: TimelineType | null;
	switch (document.querySelector('div[role="presentation"] > a[aria-selected="true"] span')!.textContent) {
		case 'For you':
			currentTimeline = TimelineType.ForYou;
			break;
		case 'Following':
			currentTimeline = TimelineType.Following;
			break;
		default:
			currentTimeline = null;
			break;
	}

	const endpoints = [];
	try {
		if (currentTimeline !== null)
			endpoints.push({
				endpoint: new TimelineAPI(currentTimeline),
				refreshTypes: everyRefreshType,
				filters: [],
			});
	}catch(e) {
		console.error(e);
	}

	const mainStorage = loadMainStorage();

	let favviewerHidden = currentTimeline === null;
	let favviewerMaximized = mainStorage.maximized;

	const timelines: TimelineCollection = {
		Home: defaultTimeline({
			endpoints,
			columnCount: favviewerMaximized ? 4 : 2,
			serviceTemplate: {
				service: TwitterService.name,
				templateId: 'main',
			},
		})
	};

	const timelineViews: Record<string, TimelineView> = {
		[defaultTimelineView]: {
			timelineIds: Object.keys(timelines),
			fullscreen: {
				...mainStorage.fullscreen,
				index: 0
			}
		}
	};
</script>

<svelte:head>
	{#if favviewerHidden}
		<style>
			.soshalthing.injected {
				display: none;
			}
		</style>
	{:else if favviewerMaximized}
		<style>
			.soshalthing {
				position: fixed;
				z-index: 3;
				top: 0;
				left: 0;
				right: 0;
				bottom: 0;
				height: 100vh;
			}

			header[role="banner"] {
				z-index: unset;
			}

			body {
				overflow-y: hidden;
			}
		</style>
	{:else}
		<style>
			/* div[aria-label="Home timeline"] {
				height: 100%;
			} */

			/* I think making the timeline stop at viewport forces twitter to spam refresh */
			/* div[aria-label="Home timeline"] > div:nth-child(6) {
				display: none;
			} */

			.soshalthing {
				/* flex-grow: 1; */
				height: 80vh;
			}
		</style>
	{/if}
</svelte:head>

<SidebarActivator bind:favviewerHidden/>

<SoshalThing
	bind:favviewerHidden
	bind:favviewerMaximized
	{timelines}
	{timelineViews}
	isInjected={true}
/>