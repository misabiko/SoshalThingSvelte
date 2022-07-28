<script lang='ts'>
	import Fa from 'svelte-fa/src/fa.svelte'
	import type {IconDefinition} from '@fortawesome/free-solid-svg-icons'
	import {
		faAngleDoubleLeft,
		faBarsProgress,
		faCog,
		faPlus,
		faRotateLeft,
		faSpinner,
	} from '@fortawesome/free-solid-svg-icons'
	import {faGithub} from '@fortawesome/free-brands-svg-icons'
	import SettingsMenu from "./SettingsMenu.svelte"
	import {SidebarMenu} from './index'
	import MediaLoader from "./MediaLoader.svelte";
	import Undoables from "./Undoables.svelte";
	import Endpoints from "./Endpoints.svelte";

	export let menu: SidebarMenu | null;

	function toggleSidebarMenu(newMenu: SidebarMenu) {
		menu = menu === newMenu ? null : newMenu;
	}

	const buttons: {icon: IconDefinition, menu: SidebarMenu, title: string}[] = [
		{icon: faPlus, menu: SidebarMenu.TimelineEdit, title: 'Add new timeline'},
		{icon: faBarsProgress, menu: SidebarMenu.Endpoints, title: 'Endpoints'},
		{icon: faRotateLeft, menu: SidebarMenu.Undoables, title: 'Undoables'},
		{icon: faSpinner, menu: SidebarMenu.MediaLoader, title: 'Loading medias'},
	]

	//TODO Batch action menu
</script>

<style lang='sass'>
	@use '../styles/variables' as *

	#sidebar
		background-color: $dark
		z-index: 1
		display: flex

	//.collapse-content
	//	height: 100%

	#sidebarButtons
		width: 60px
		padding: 1rem 0
		text-align: center
		display: flex
		flex-direction: column
		justify-content: space-between

		& > div
			display: flex
			flex-direction: column

		button
			height: 45px

			&:not(:last-child)
				margin-bottom: 1rem

			//span
			//	vertical-align: middle

	.sidebarMenu
		width: $sidebar-menu-width
		height: 100%
		padding: 1rem
		background-color: $scheme-main-ter
		overflow-y: auto

		&::-webkit-scrollbar-thumb
			background-color: $dark
</style>

<nav id='sidebar'>
	{#if menu !== null}
		<div class='sidebarMenu' class:timelineEdit={menu === SidebarMenu.TimelineEdit}>
			{#if menu === SidebarMenu.Endpoints}
				<Endpoints/>
			{:else if menu === SidebarMenu.MediaLoader}
				<MediaLoader/>
			{:else if menu === SidebarMenu.Undoables}
				<Undoables/>
			{:else if menu === SidebarMenu.Settings}
				<SettingsMenu/>
			{/if}
		</div>
	{/if}
	<div id='sidebarButtons'>
		<div>
			{#if menu !== null}
				<button class='borderless-button' title="Expand sidebar" on:click='{() => menu = null}'>
					<Fa icon={faAngleDoubleLeft} size='2x'/>
				</button>
			{/if}
			{#each buttons as {icon, menu, title}}
				<button class='borderless-button' {title} on:click={() => toggleSidebarMenu(menu)}>
					<Fa icon={icon} size='2x'/>
				</button>
			{/each}
		</div>
		<div>
			<button class='borderless-button' title="Settings" on:click={() => toggleSidebarMenu(SidebarMenu.Settings)}>
				<Fa icon={faCog} size='2x'/>
			</button>
			<a href="https://github.com/misabiko/SoshalThingSvelte" title="Github">
				<button class='borderless-button'>
					<Fa icon={faGithub} size='2x'/>
				</button>
			</a>
		</div>
	</div>
</nav>