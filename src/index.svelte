<script lang='ts'>
	import 'styles/global.sass'
	import SoshalThing from "./components/SoshalThing.svelte"
	import {loadTimelines} from './storages'

	const initTimelines = loadTimelines();

	//TODO Column count won't update
	//TODO scroll wrong direction
</script>

<SoshalThing isInjected={false} {initTimelines}/>