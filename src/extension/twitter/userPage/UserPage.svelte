<script lang='ts'>
	import SoshalThing from "../../../SoshalThing.svelte"
	import type {TimelineCollection, TimelineView} from '../../../timelines'
	import {defaultTimeline} from '../../../timelines'
	import MasonryContainer from '../../../containers/MasonryContainer.svelte'
	import {loadMainStorage} from '../../../storages'
    import { everyRefreshType } from "services/endpoints";
    import UserTweetsAPI, { TimelineType } from "services/twitter/endpoints/domainEndpoints/UserTweetsAPI";
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

	const timelines: TimelineCollection = {
		username: {
			...defaultTimeline(),
			title: username,
			endpoints,
			container: ColumnContainer,
			columnCount: 4,
			animatedAsGifs: true,
			sortInfo: {
				method: SortMethod.Date,
				customMethod: null,
				reversed: true,
			},
		}
	};

	const mainStorage = loadMainStorage();

	let favviewerHidden = currentTimeline === null || userId === null;
	let favviewerMaximized = mainStorage.maximized;

	const timelineView: TimelineView = {
		timelineIds: Object.keys(timelines),
		fullscreen: {
			...mainStorage.fullscreen,
			index: 0
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
				position: absolute;
				z-index: 3;
				top: 0;
				left: 0;
				right: 0;
				bottom: 0;
				overflow-y: auto;
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
	{timelineView}
	isInjected={true}
/>