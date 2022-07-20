<script lang="ts">
	import type {TimelineData} from './index';
	import Timeline from './Timeline.svelte';
	import {afterUpdate, getContext} from 'svelte'
	import {Modal} from 'svelma'
	import {defaultTimeline} from './index'

	export let initTimelines: TimelineData[] = [];
	export let fullscreen: number | undefined;
	export let favviewerHidden;
	export let showSidebar;

	//We could make this a stack of timelines
	let modalTimeline: TimelineData | null = null
	let modalTimelineActive = false

	const isInjected = getContext('isInjected');
	let timelines: TimelineData[] = initTimelines;

	function removeTimeline(index: number) {
		timelines.splice(index, 1)
	}

	function setModalTimeline(data: Partial<TimelineData>) {
		modalTimeline = {
			...defaultTimeline(),
			...data,
		}
		modalTimelineActive = true
	}

	afterUpdate(() => {
		//Workaround for https://github.com/sveltejs/svelte/issues/5268
		//During Modal's close transition, the child Timeline still calls reactive statements for modalTimeline
		if (!modalTimelineActive)
			modalTimeline = null
	})
</script>

<style lang='sass'>
	#timelineContainer
		height: 100%
		overflow-x: auto
		display: flex
		flex-grow: 1
</style>

<div id='timelineContainer'>
	{#if modalTimeline !== null}
		<Modal bind:active={modalTimelineActive}>
			<Timeline
				data={modalTimeline}
				{setModalTimeline}
				fullscreen={false}
				removeTimeline={() => modalTimeline = null}
			/>
		</Modal>
	{/if}
	{#if fullscreen !== undefined}
		{#if isInjected}
			<Timeline
				favviewerButtons=true
				bind:favviewerHidden={favviewerHidden}
				bind:showSidebar={showSidebar}
				data={timelines[fullscreen]}
				{setModalTimeline}
				fullscreen={true}
				removeTimeline={() => removeTimeline(fullscreen)}
				toggleFullscreen={() => fullscreen = undefined}
			/>
		{:else}
			<Timeline
				data={timelines[fullscreen]}
				{setModalTimeline}
				fullscreen={true}
				removeTimeline={() => removeTimeline(fullscreen)}
				toggleFullscreen={() => fullscreen = undefined}
			/>
		{/if}
	{:else}
		<!--TODO Add id to timeline, just to use as key-->
		{#each timelines as data, i (`${data.name}/${i}`)}
			{#if isInjected && i === 0}
				<Timeline
					favviewerButtons=true
					bind:favviewerHidden={favviewerHidden}
					bind:showSidebar={showSidebar}
					{data}
					{setModalTimeline}
					fullscreen={false}
					removeTimeline={() => removeTimeline(i)}
					toggleFullscreen={() => fullscreen = i}
				/>
			{:else}
				<Timeline
					{data}
					{setModalTimeline}
					fullscreen={false}
					removeTimeline={() => removeTimeline(i)}
					toggleFullscreen={() => fullscreen = i}
				/>
			{/if}
		{/each}
	{/if}
</div>