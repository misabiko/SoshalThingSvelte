<script lang='ts'>
	import '../../../styles/favviewerGlobal.sass'
	import SoshalThing from "../../../SoshalThing.svelte";
	import type {TimelineData} from '../../../timelines'
	import {defaultTimeline} from '../../../timelines'
	import MasonryContainer from '../../../containers/MasonryContainer.svelte'
	import {loadMainStorage} from '../../../storages'
	import UserPageEndpoint from '../../../services/pixiv/endpoints/user'
	import {everyRefreshType} from '../../../services/endpoints'

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
	}

	let favviewerHidden = false
	let maximized = false

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

<SoshalThing
	bind:favviewerHidden
	initTimelines={[timeline]}
	isInjected={true}
	{fullscreen}
/>