<script lang='ts'>
	import SoshalThing from "../../../SoshalThing.svelte"
	import type {TimelineCollection, TimelineView} from '../../../timelines'
	import {defaultTimeline} from '../../../timelines'
	import MasonryContainer from '../../../containers/MasonryContainer.svelte'
	import {loadMainStorage} from '../../../storages'
	import portal from '../../../usePortal'
    import { everyRefreshType } from "services/endpoints";
    import UserTweetsAPI, { TimelineType } from "services/twitter/endpoints/domainEndpoints/UserTweetsAPI";
    import ColumnContainer from "containers/ColumnContainer.svelte";
    import { SortMethod } from "sorting";

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
	let activatorMount = document.querySelector('nav[aria-label="Primary"]');

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

<!-- svelte-ignore a11y-no-static-element-interactions -->
<a
	use:portal={activatorMount}
	id='favvieweractivator'
	class={activatorMount.children[0].className}
	on:click={() => favviewerHidden = !favviewerHidden}
>
	SoshalThing
</a>

<SoshalThing
	bind:favviewerHidden
	bind:favviewerMaximized
	{timelines}
	{timelineView}
	isInjected={true}
/>