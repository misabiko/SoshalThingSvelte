<script lang='ts'>
	import SoshalThing from "../../../SoshalThing.svelte"
	import {
		defaultTimelineView,
		type TimelineCollection,
		type TimelineView,
	} from '../../../timelines';
	import {defaultTimeline} from '../../../timelines'
	import MasonryContainer from '../../../containers/MasonryContainer.svelte'
	import {loadMainStorage} from '../../../storages'
    import { everyRefreshType } from "services/endpoints";
    import UserTweetsAPI, { TimelineType } from "services/twitter/endpoints/domainEndpoints/UserTweetsAPI.endpoint";
    import ColumnContainer from "containers/ColumnContainer.svelte";
    import { SortMethod } from "sorting";
    import SidebarActivator from "../SidebarActivator.svelte";

	const split = location.pathname.split('/');
	const username = split[1];

	let currentTimeline: TimelineType | null;
	switch (split[split.length - 1]) {
		case username:
			currentTimeline = TimelineType.Tweets;
			break;
		case 'media':
			currentTimeline = TimelineType.Media;
			break;
		default:
			currentTimeline = null;
			break;
	}

	const profileSchema = document.querySelector('script[data-testid="UserProfileSchema-test"]')?.textContent;
	let userId: string | null = null;
	if (!profileSchema)
		console.error('Could not find profile schema to get userId');
	else
		userId = JSON.parse(profileSchema).author.identifier;

	const endpoints = currentTimeline === null || userId === null ? [] : [{
		endpoint: new UserTweetsAPI(currentTimeline, username, userId),
		refreshTypes: everyRefreshType,
		filters: [],
	}];

	const mainStorage = loadMainStorage();

	let favviewerHidden = currentTimeline === null || userId === null;
	let favviewerMaximized = mainStorage.maximized;

	const timelines: TimelineCollection = {
		username: {
			...defaultTimeline(),
			title: username,
			endpoints,
			container: favviewerMaximized ? MasonryContainer : ColumnContainer,
			columnCount: 4,
			animatedAsGifs: true,
			sortInfo: {
				method: SortMethod.Date,
				customMethod: null,
				reversed: true,
			},
		}
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

			header[role="banner"], div[aria-label="Home timeline"] > div:first-child {
				z-index: unset;
			}

			body {
				overflow-y: hidden;
			}
		</style>
	{:else}
		<style>
			.soshalthing {
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