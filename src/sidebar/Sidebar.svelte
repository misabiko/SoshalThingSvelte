<script lang='ts'>
	import Fa from 'svelte-fa/src/fa.svelte'
	import type {IconDefinition} from '@fortawesome/free-solid-svg-icons'
	import {
		faAngleDoubleLeft,
		faB,
		faBarsProgress,
		faCog,
		faPlus,
		faRotateLeft,
		faSpinner,
	} from '@fortawesome/free-solid-svg-icons'
	import {faGithub} from '@fortawesome/free-brands-svg-icons'
	import MediaLoader from "./MediaLoader.svelte"
	import Undoables from "./Undoables.svelte"
	import Endpoints from "./Endpoints.svelte"
	import {SvelteComponent} from 'svelte'
	import SettingsMenu from "./SettingsMenu.svelte"
	import {SidebarMenu} from './index'

	export let menu: typeof SvelteComponent | SidebarMenu | null;

	function toggleSidebarMenu(newMenu: typeof SvelteComponent | SidebarMenu) {
		menu = menu === newMenu ? null : newMenu;
	}

	const buttons: {icon: IconDefinition, menu: typeof SvelteComponent | SidebarMenu, title: string}[] = [
		{icon: faPlus, menu: SidebarMenu.TimelineEdit, title: 'Add new timeline'},
		{icon: faBarsProgress, menu: Endpoints, title: 'Endpoints'},
		{icon: faRotateLeft, menu: Undoables, title: 'Undoables'},
		{icon: faSpinner, menu: MediaLoader, title: 'Loading medias'},
		{icon: faB, menu: SidebarMenu.BatchActions, title: 'Batch actions'},
	]
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
		<div class='sidebarMenu'>
			{#if menu instanceof SvelteComponent}
				<svelte:component this={menu}/>
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
			<button class='borderless-button' title="Settings" on:click={() => toggleSidebarMenu(SettingsMenu)}>
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