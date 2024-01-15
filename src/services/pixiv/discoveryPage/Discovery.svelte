<script lang='ts'>
	import {defaultTimeline, defaultTimelineView, type TimelineCollection, type TimelineView} from '~/timelines';
	import DiscoveryEndpoint, {Mode} from '~/services/pixiv/endpoints/discovery.endpoint';
	import {getCurrentPage} from '~/services/pixiv/endpoints';
	import {everyRefreshType} from '~/services/endpoints';
	import portal from '~/usePortal';
	import MasonryContainer from '~/containers/MasonryContainer.svelte';
	import {SortMethod} from '~/sorting';
	import {loadMainStorage} from '~/storages';
	import SoshalThing from '~/SoshalThing.svelte';

	const searchParams = new URLSearchParams(window.location.search);
	const mode = searchParams.get('mode') as Mode ?? Mode.All;

	const timelines: TimelineCollection = {
		Follows: {
			...defaultTimeline(),
			title: 'Discovery',
			endpoints: [{
				endpoint: new DiscoveryEndpoint(getCurrentPage(), mode),
				refreshTypes: everyRefreshType,
				filters: [],
			}],
			container: MasonryContainer,
			columnCount: 4,
			animatedAsGifs: true,
			sortInfo: {
				method: SortMethod.Id,
				customMethod: null,
				reversed: true,
			},
			compact: true,
			fullMedia: 1,
		}
	};

	const mainStorage = loadMainStorage();

	let favviewerHidden = false;
	let favviewerMaximized = mainStorage.maximized;
	const activatorMount = document.querySelector('nav');
	if (activatorMount === null)
		throw new Error('Could not find activator mount');

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
		</style>
	{:else}
		<style>
			#root section ul {
				display: none;
			}
			.soshalthing {
				overflow-y: visible
			}
		</style>
	{/if}
</svelte:head>

<!-- svelte-ignore a11y-no-static-element-interactions a11y-click-events-have-key-events -->
<a
		use:portal='{{ target: activatorMount }}'
		id='favvieweractivator'
		class={activatorMount.children[0].className}
		on:click='{() => favviewerHidden = !favviewerHidden}'
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