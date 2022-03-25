<script lang="ts">
	import type {TimelineData} from './Timeline.svelte';
	import Timeline from './Timeline.svelte';
	import {getContext} from 'svelte'

	export let initTimelines: TimelineData[] = [];
	export let favviewerHidden;
	export let showSidebar;

	const isInjected = getContext('isInjected');
	let timelines: TimelineData[] = initTimelines;
</script>

<style lang='sass' global>
	@use '../styles/core' as *

	#timelineContainer
		height: 100%
		overflow-x: auto
		display: flex
		flex-grow: 1
</style>

<div id='timelineContainer'>
	{#each timelines as timelineData, i}
		{#if isInjected && i === 0}
			<Timeline
				favviewerButtons={true}
				bind:favviewerHidden={favviewerHidden}
				bind:showSidebar={showSidebar}
				{...timelineData}
			/>
		{:else}
			<Timeline {...timelineData}/>
		{/if}
	{/each}
</div>