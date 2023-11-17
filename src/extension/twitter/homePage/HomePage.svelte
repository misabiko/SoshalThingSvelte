<script lang='ts'>
	import SoshalThing from "../../../SoshalThing.svelte"
	import type {TimelineCollection, TimelineView} from '../../../timelines'
	import {defaultTimeline} from '../../../timelines'
	import MasonryContainer from '../../../containers/MasonryContainer.svelte'
	import {loadMainStorage} from '../../../storages'
	import portal from '../../../usePortal'

	const timelines: TimelineCollection = {
		'Home': {
			...defaultTimeline(),
			title: 'Home',
			endpoints: [],
			container: MasonryContainer,
			columnCount: 4,
			animatedAsGifs: true,
			sortInfo: {
				method: null,
				customMethod: null,
				reversed: false,
			},
		}
	}

	const mainStorage = loadMainStorage()

	let favviewerHidden = false
	let favviewerMaximized = mainStorage.maximized
	let activatorMount = document.querySelector('nav[aria-label="Primary"]')

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
		</style>
	{:else}
		<style>
			div[aria-label="Home timeline"] {
				height: 100%;
			}

			div[aria-label="Home timeline"] > div:nth-child(6) {
				display: none;
			}

			.soshalthing {
				flex-grow: 1;
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