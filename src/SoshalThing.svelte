<script lang='ts'>
	import Sidebar from "./components/sidebar/Sidebar.svelte";
	import TimelineContainer from "./components/TimelineContainer.svelte";
</script>

<style lang='sass' global>
	@import 'styles/global'

	#soshalthing
		height: 100vh
		display: flex
</style>

<div id='soshalthing'>
	<Sidebar/>
	<TimelineContainer/>
</div>