<script lang='ts'>
	import {setContext} from 'svelte'
	import Sidebar from "./sidebar/Sidebar.svelte"
	import type {SidebarMenu} from "./sidebar"
	import type {FullscreenInfo, TimelineData} from "./timelines"
	import TimelineContainer from "./timelines/TimelineContainer.svelte"
	import {notifications} from './notifications/store'
	import Notification from "./notifications/Notification.svelte";

	(BigInt.prototype as any).toJSON = function () {
		return this.toString();
	};

	export let initTimelines: TimelineData[]
	export let fullscreen: FullscreenInfo = {
		index: null,
		columnCount: null,
		container: null,
	}
	export let isInjected = true
	export let favviewerHidden = false
	export let favviewerMaximized: boolean | undefined = undefined

	setContext('isInjected', isInjected)
	let showSidebar = !isInjected
	let sidebarMenu: SidebarMenu | null = null;
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
		<Sidebar bind:menu={sidebarMenu}/>
	{/if}
	<TimelineContainer
		bind:favviewerHidden
		bind:favviewerMaximized
		bind:showSidebar
		bind:sidebarMenu
		{initTimelines}
		{fullscreen}
	/>
</div>