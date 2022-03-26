<script lang='ts'>
	import FavViewer from "../lib/components/FavViewer.svelte"
	import {addEndpoint} from "../lib/services/service"
	import type {TimelineData} from '../lib/components/Timeline.svelte'
	import RowContainer from '../lib/components/containers/RowContainer.svelte'
	import {HomeTimelineEndpoint} from '../lib/services/twitter/endpoints'


	const endpoint = new HomeTimelineEndpoint()
	addEndpoint(endpoint)
	const timeline: TimelineData = {
		title: 'Home',
		fullscreen: true,
		endpoints: [endpoint.name],
		initArticles: [],
		initContainer: RowContainer,
	}
</script>

<style lang='sass' global>
	@import "../../node_modules/bulma/bulma.sass"

	html
		overflow-y: hidden
	//	height: -webkit-fill-available*/

	//TODO Fix 100% height on mobile, maybe using -webkit-fill-available
	body
		margin: 0
		height: 100vh
		//height: -webkit-fill-available
		-webkit-font-smoothing: antialiased
		-moz-osx-font-smoothing: grayscale
		display: flex

	.favviewer
		display: flex
		width: 100%
</style>

<FavViewer isInjected={false} initTimelines={[timeline]}/>