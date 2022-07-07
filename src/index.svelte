<script lang='ts'>
	import 'styles/global.sass'
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
		columnCount: 4,
	}
</script>

<SoshalThing isInjected={false} initTimelines={[timeline]}/>