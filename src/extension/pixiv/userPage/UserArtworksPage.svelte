<script lang='ts'>
	import '../../../styles/favviewerGlobal.sass'
	import SoshalThing from "../../../SoshalThing.svelte"
	import type {TimelineData} from '../../../timelines'
	import {defaultTimeline} from '../../../timelines'
	import MasonryContainer from '../../../containers/MasonryContainer.svelte'
	import {loadMainStorage} from '../../../storages'
	import UserPageEndpoint from '../../../services/pixiv/endpoints/user'
	import {everyRefreshType} from '../../../services/endpoints'
	import portal from '../../../usePortal'
	import {SortMethod} from '../../../sorting'

	const timeline: TimelineData = {
		...defaultTimeline(),
		title: 'User',
		endpoints: [{
			endpoint: new UserPageEndpoint(),
			refreshTypes: everyRefreshType,
			filters: [],
		}],
		container: MasonryContainer,
		columnCount: 4,
		animatedAsGifs: true,
		sortInfo: {
			method: SortMethod.Id,
			reversed: true,
		},
	}

	let favviewerHidden = false
	let maximized = false
	let activatorMount = document.querySelector('nav')

	let fullscreen = {
		...loadMainStorage().fullscreen,
		index: 0
	}
</script>

<svelte:head>
	{#if favviewerHidden}
		<style>
			.soshalthing.injected {
				display: none;
			}
		</style>
	{:else if maximized}
		<style>
			.soshalthing {
				height: 90.8vh;
			}
		</style>
	{:else}
		<style>
			section:nth-of-type(1) > div:nth-child(4) {
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
	initTimelines={[timeline]}
	isInjected={true}
	{fullscreen}
/>