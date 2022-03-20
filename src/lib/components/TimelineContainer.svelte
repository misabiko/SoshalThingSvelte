<script lang='ts' context="module">
	export interface TimelineData {
		title: string;
		fullscreen?: boolean;
	}
</script>

<script lang="ts">
	import Timeline from './Timeline.svelte';

	export let initTimelines: TimelineData[] = [];

	let timelines: TimelineData[] = initTimelines;
</script>

<style lang='sass'>
	#timelineContainer
		height: 100%
		overflow-x: auto
		display: flex
		flex-grow: 1
</style>

<div id='timelineContainer'>
	{#each timelines as timelineData}
		<Timeline {...timelineData}/>
	{/each}
</div>