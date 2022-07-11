<script lang='ts'>
	import {setContext} from 'svelte'
	import Sidebar from "./sidebar/Sidebar.svelte"
	import type {TimelineData} from "./timelines"
	import TimelineContainer from "./timelines/TimelineContainer.svelte"
	import {notifications} from './notifications/store'
	import Notification from "./notifications/Notification.svelte";

	export let initTimelines: TimelineData[]
	export let fullscreen: number | undefined
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

		//#favviewer
		//	width: 100vw
		//	height: 90vh
		//	display: flex
		//	-webkit-font-smoothing: antialiased
		//	-moz-osx-font-smoothing: grayscale

	#soshalNotifications
		position: absolute
		right: 0
		bottom: 0
		padding: 15px
		z-index: 1
</style>

<div class='soshalthing' class:injected={isInjected}>
	<div id='soshalNotifications'>
		{#each Object.entries($notifications) as [id, notif] (id)}
			<Notification data={notif} id={id}/>
		{/each}
	</div>
	{#if showSidebar}
		<Sidebar/>
	{/if}
	<TimelineContainer
		bind:favviewerHidden={favviewerHidden}
		bind:showSidebar={showSidebar}
		{initTimelines}
		{fullscreen}
	/>
</div>