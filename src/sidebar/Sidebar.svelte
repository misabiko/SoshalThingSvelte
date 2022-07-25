<script lang='ts'>
	import {Button} from 'svelma'
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
	import EndpointOptions from "./EndpointOptions.svelte"
	import {loadingStore} from "../bufferedMediaLoading"
	import SettingsMenu from "./SettingsMenu.svelte"
	import {endpoints} from '../services/endpoints'
	import {undoables} from "../undo.js"
	import {SidebarMenu} from './index'

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
				<div class='box'>
					{#each Object.entries(endpoints) as [name, endpoint] (name)}
						<EndpointOptions {endpoint}/>
					{:else}
						No endpoints currently
					{/each}
				</div>
			{:else if menu === SidebarMenu.MediaLoader}
				<Button on:click={loadingStore.clearLoadings}>Clear loadings</Button>
				<Button on:click={loadingStore.clearQueue}>Clear queue</Button>
				<div class='box'>
					{#each [...$loadingStore.loadings] as idPair (idPair)}
						{idPair}
					{:else}
						No media currently loading
					{/each}
				</div>
				<div class='box'>
					{#each [...$loadingStore.queue] as idPair (idPair)}
						{idPair}
					{:else}
						No media currently queued
					{/each}
				</div>
			{:else if menu === SidebarMenu.Undoables}
				<!--TODO Add undoable ids-->
				{#each [...$undoables] as undoable, index (`${undoable.text}/${index}`)}
					<div class='box'>
						<p>{undoable.text}</p>
						<Button on:click={() => undoables.toggleDo(index)}>
							{undoable.undid ? 'Redo' : 'Undo'}
						</Button>
					</div>
				{:else}
					<div class='box'>
						Nothing to undo
					</div>
				{/each}
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