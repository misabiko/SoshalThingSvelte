<script lang='ts'>
	import SoshalThing from '~/SoshalThing.svelte';
	import {
		defaultTimelineView,
		type TimelineCollection,
		type TimelineView,
	} from '~/timelines';
	import {defaultTimeline} from '~/timelines';
	import {loadMainStorage} from '~/storages';
	import {getUserId, UserAPIEndpoint} from '~/services/pixiv/endpoints/user.endpoint';
	import {everyRefreshType} from '~/services/endpoints';
	import portal from '~/usePortal';
	import {PixivService} from '~/services/pixiv/service';

	const timelines: TimelineCollection = {
		User: defaultTimeline({
			title: 'User',
			endpoints: [{
				endpoint: new UserAPIEndpoint(getUserId()),
				refreshTypes: everyRefreshType,
				filters: [],
			}],
			serviceTemplate: {
				service: PixivService.name,
				templateId: 'main',
			},
		})
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
			section > div > div > ul > li {
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