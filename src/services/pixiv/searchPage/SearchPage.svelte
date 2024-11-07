<script lang='ts'>
	import {defaultTimeline, defaultTimelineViewId, type TimelineCollection, type TimelineView} from '~/timelines';
	import {Mode} from '~/services/pixiv/endpoints';
	import {SearchAPIEndpoint} from '~/services/pixiv/endpoints/search.endpoint';
	import {getCurrentPage} from '~/services/pixiv/endpoints';
	import {everyRefreshType} from '~/services/endpoints';
	import portal from '~/usePortal';
	import {loadMainStorage} from '~/storages';
	import SoshalThing from '~/SoshalThing.svelte';
	import {PixivService} from '~/services/pixiv/service';

	const query = window.location.pathname.split('/')[3];
	if (!query)
		throw new Error('No query found');
	const searchParams = new URLSearchParams(window.location.search);
	const mode = searchParams.get('mode') as Mode | null ?? Mode.All;

	const timelines: TimelineCollection = {
		Follows: defaultTimeline({
			title: 'Search',
			endpoints: [{
				endpoint: new SearchAPIEndpoint(query, mode, getCurrentPage()),
				refreshTypes: everyRefreshType,
				filters: [],
			}],
			serviceTemplate: {
				service: PixivService.name,
				templateId: 'main',
			},
		}),
	};

	const mainStorage = loadMainStorage();

	let favviewerHidden = false;
	let favviewerMaximized = mainStorage.maximized;
	const activatorMount = document.querySelector('nav');
	if (activatorMount === null)
		throw new Error('Could not find activator mount');

	const timelineViews: Record<string, TimelineView> = {
		[defaultTimelineViewId]: {
			timelineIds: Object.keys(timelines),
			fullscreen: {
				...mainStorage.fullscreen,
				index: 0,
			},
		},
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

			#root {
				overflow-y: hidden;
				max-height: 100vh;
			}

			.charcoal-token > div > div:nth-child(3) > div > div {
				height: 100vh;
			}

			.charcoal-token > div > div:nth-child(2), .charcoal-token > div > div:nth-child(3) > div > div > :not(.soshalthing) {
				display: none;
			}
		</style>
	{:else}
		<style>
			#root section ul, .charcoal-token > div > div:nth-child(3) > div > div > div:nth-last-child(2) {
				display: none;
			}

			.soshalthing {
				overflow-y: visible
			}
		</style>
	{/if}
</svelte:head>

<!-- svelte-ignore a11y-no-static-element-interactions a11y_click_events_have_key_events -->
<a
		use:portal={{target: activatorMount}}
		id='favvieweractivator'
		class={activatorMount.children[0]!.className}
		onclick={() => favviewerHidden = !favviewerHidden}
>
	SoshalThing
</a>

<SoshalThing
		bind:favviewerHidden
		bind:favviewerMaximized
		{timelines}
		{timelineViews}
		isInjected={true}
/>