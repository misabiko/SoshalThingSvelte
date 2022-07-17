<script lang="ts">
	import type {TimelineData} from './index';
	import Timeline from './Timeline.svelte';
	import {getContext} from 'svelte'

	export let initTimelines: TimelineData[] = [];
	export let fullscreen: number | undefined;
	export let favviewerHidden;
	export let showSidebar;

	const isInjected = getContext('isInjected');
	let timelines: TimelineData[] = initTimelines;

	function removeTimeline(index: number) {
		timelines.splice(index, 1)
	}
</script>

<style lang='sass'>
	#timelineContainer
		height: 100%
		overflow-x: auto
		display: flex
		flex-grow: 1
</style>

<div id='timelineContainer'>
	{#if fullscreen !== undefined}
		{#if isInjected}
			<Timeline
				favviewerButtons={true}
				bind:favviewerHidden={favviewerHidden}
				bind:showSidebar={showSidebar}
				data={timelines[fullscreen]}
				fullscreen=true
				on:removeTimeline={() => removeTimeline(fullscreen)}
				on:toggleFullscreen={() => fullscreen = undefined}
			/>
		{:else}
			<Timeline
				data={timelines[fullscreen]}
				fullscreen=true
				on:removeTimeline={() => removeTimeline(fullscreen)}
				on:toggleFullscreen={() => fullscreen = undefined}
			/>
		{/if}
	{:else}
		<!--TODO Add id to timeline, just to use as key-->
		{#each timelines as data, i (`${data.name}/${i}`)}
			{#if isInjected && i === 0}
				<Timeline
					favviewerButtons={true}
					bind:favviewerHidden={favviewerHidden}
					bind:showSidebar={showSidebar}
					{data}
					fullscreen={false}
					on:removeTimeline={() => removeTimeline(i)}
					on:toggleFullscreen={() => fullscreen = i}
				/>
			{:else}
				<Timeline
					{data}
					fullscreen={false}
					on:removeTimeline={() => removeTimeline(i)}
					on:toggleFullscreen={() => fullscreen = i}
				/>
			{/if}
		{/each}
	{/if}
</div>