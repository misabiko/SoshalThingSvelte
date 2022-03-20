<script>
	import TimelineContainer from "../lib/components/TimelineContainer.svelte";
	import Sidebar from "../lib/components/sidebar/Sidebar.svelte";
	import FavViewer from "../lib/components/FavViewer.svelte";
</script>

<style lang="sass" global>
	@import "../../node_modules/bulma/bulma.sass"

	html
		overflow-y: hidden
		//height: -webkit-fill-available*/

	//TODO Fix 100% height on mobile, maybe using -webkit-fill-available
	body
		margin: 0
		height: 100vh
		//height: -webkit-fill-available
		-webkit-font-smoothing: antialiased
		-moz-osx-font-smoothing: grayscale
		display: flex
</style>

<FavViewer showSidebar={true}/>