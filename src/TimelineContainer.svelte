<script>
	import Timeline from './Timeline.svelte';
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
	<Timeline title='Timeline43!'/>
</div>