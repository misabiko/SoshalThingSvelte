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

<style lang='sass' global>
	.favviewer
		.injected
			height: 100%
			display: flex

		::-webkit-scrollbar
			width: 12px
			height: 12px

		::-webkit-scrollbar-thumb
			border-radius: 0
			background-color: $scheme-main-ter

		.input.is-static
			color: $text

		.svelte-fa
			color: $white-ter

		.svelte-fa.darkIcon
			color: $black-ter

		.dropdown-trigger .svelte-fa
			color: $button-color

		#soshal-notifications
			position: absolute
			right: 0
			bottom: 0
			padding: 15px
			z-index: 1

		img.emoji
			height: 1em
			width: 1em
			margin: 0 .05em 0 .1em
			vertical-align: -0.1em

		//#favviewer
		//	width: 100vw
		//	height: 90vh
		//	display: flex
		//	-webkit-font-smoothing: antialiased
		//	-moz-osx-font-smoothing: grayscale
</style>

<div class='favviewer' class:injected={isInjected}>
	{#if showSidebar}
		<Sidebar/>
	{/if}
	<TimelineContainer bind:favviewerHidden={favviewerHidden} bind:showSidebar={showSidebar} {initTimelines}/>
</div>