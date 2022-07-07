<script lang='ts'>
	import {setContext} from 'svelte'
	import Sidebar from "./sidebar/Sidebar.svelte"
	import type {TimelineData} from "./TimelineContainer.svelte"
	import TimelineContainer from "./TimelineContainer.svelte"

	export let initTimelines: TimelineData[]
	export let isInjected = true
	export let favviewerHidden = false

	setContext('isInjected', isInjected)
	let showSidebar = !isInjected
</script>

<style lang='sass'>
	.soshalthing
		display: flex
		width: 100%

		//.injected
		//	height: 100%
		//	display: flex

		//#soshal-notifications
		//	position: absolute
		//	right: 0
		//	bottom: 0
		//	padding: 15px
		//	z-index: 1

		//#favviewer
		//	width: 100vw
		//	height: 90vh
		//	display: flex
		//	-webkit-font-smoothing: antialiased
		//	-moz-osx-font-smoothing: grayscale
</style>

<div class='soshalthing' class:injected={isInjected}>
	{#if showSidebar}
		<Sidebar/>
	{/if}
	<TimelineContainer bind:favviewerHidden={favviewerHidden} bind:showSidebar={showSidebar} {initTimelines}/>
</div>