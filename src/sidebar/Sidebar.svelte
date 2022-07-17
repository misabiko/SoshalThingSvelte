<script lang='ts'>
	import Fa from 'svelte-fa/src/fa.svelte';
	import {
		faAngleDoubleLeft,
		faAngleDoubleRight,
		faPlus,
		faCog,
		faSpinner,
		faCube,
	} from '@fortawesome/free-solid-svg-icons'
	import { faGithub } from '@fortawesome/free-brands-svg-icons';
	import EndpointOptions from "./EndpointOptions.svelte";
	import {loadingStore} from "../bufferedMediaLoading";
	import SettingsMenu from "./SettingsMenu.svelte";

	let menu: SidebarMenu | null = null;

	enum SidebarMenu {
		Endpoints,
		NewTimeline,
		MediaLoader,
		Settings,
	}

	function toggleSidebarMenu(newMenu: SidebarMenu) {
		menu = menu === newMenu ? null : newMenu;
	}
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
			{#if menu === SidebarMenu.Endpoints}
				<div class='box'>
					<EndpointOptions/>
				</div>
			{:else if menu === SidebarMenu.MediaLoader}
				{#each [...$loadingStore] as idPair (idPair)}
					{idPair}
				{:else}
					<div class='box'>
						No media currently loading
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
			<button class='borderless-button' title="Add new timeline" on:click={() => toggleSidebarMenu(SidebarMenu.NewTimeline)}>
				<Fa icon={faPlus} size='2x'/>
			</button>
			<button class='borderless-button' title="Loading medias" on:click={() => toggleSidebarMenu(SidebarMenu.MediaLoader)}>
				<Fa icon={faSpinner} size='2x'/>
			</button>
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