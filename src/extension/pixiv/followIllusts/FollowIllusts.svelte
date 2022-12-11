<script lang='ts'>
	import '../../../styles/favviewerGlobal.sass'
	import SoshalThing from "../../../SoshalThing.svelte"
	import type {TimelineCollection, TimelineView} from '../../../timelines'
	import {defaultTimeline} from '../../../timelines'
	import MasonryContainer from '../../../containers/MasonryContainer.svelte'
	import {loadMainStorage} from '../../../storages'
	import {everyRefreshType} from '../../../services/endpoints'
	import portal from '../../../usePortal'
	import {SortMethod} from '../../../sorting'
	import {FollowAPIEndpoint} from '../../../services/pixiv/endpoints/follow'
	import {getCurrentPage} from '../../../services/pixiv/endpoints'

	const timelines: TimelineCollection = {
		'Follows': {
			...defaultTimeline(),
			title: 'Follows',
			endpoints: [{
				endpoint: new FollowAPIEndpoint(getCurrentPage()),
				refreshTypes: everyRefreshType,
				filters: [],
			}],
			container: MasonryContainer,
			columnCount: 3,
			animatedAsGifs: true,
			sortInfo: {
				method: SortMethod.Id,
				customMethod: null,
				reversed: true,
			},
		}
	}

	const mainStorage = loadMainStorage()

	let favviewerHidden = false
	let favviewerMaximized = mainStorage.maximized
	let activatorMount = document.querySelector('nav')

	const timelineView: TimelineView = {
		timelineIds: Object.keys(timelines),
		fullscreen: {
			...mainStorage.fullscreen,
			index: 0
		}
	}
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