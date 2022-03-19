<script>
	import Timeline from './Timeline.svelte';

	let timelines = [{
		title: 'Home',
	}, {
		title: 'misabiko',
	}, {
		title: 'Likes',
	}];
</script>

<style lang='sass'>
	#timelineContainer
		@include pretty-scrollbar
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