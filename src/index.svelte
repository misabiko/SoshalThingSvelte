<script lang='ts'>
	import SoshalThing from "./components/SoshalThing.svelte"
	import {addEndpoint} from "./services/service"
	import type {TimelineData} from './components/Timeline.svelte'
	import MasonryContainer from './components/containers/MasonryContainer.svelte'
	import {HomeTimelineEndpoint} from './services/twitter/endpoints'

	const endpoint = new HomeTimelineEndpoint()
	addEndpoint(endpoint)
	const timeline: TimelineData = {
		title: 'Home',
		fullscreen: true,
		endpoints: [endpoint.name],
		initArticles: [],
		initContainer: MasonryContainer,
	}
</script>

<style lang='sass' global>
	@import "../node_modules/bulma/bulma"

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

	.soshalthing
		display: flex
		width: 100%
</style>

<SoshalThing isInjected={false} initTimelines={[timeline]}/>