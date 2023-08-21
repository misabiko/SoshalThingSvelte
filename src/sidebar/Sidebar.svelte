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
	import TimelineEditMenu from "./TimelineEditMenu.svelte";
	import BatchActions from "./BatchActions.svelte";
	import type {TimelineData, TimelineView} from '../timelines'
	import type {FilterInstance} from '../filters'
	import {faTableColumns} from "@fortawesome/free-solid-svg-icons/faTableColumns";
	import TimelineViewEdit from "./TimelineViewEdit.svelte";

	enum SidebarMenu {
		TimelineEdit,
		BatchActions,
		Undoables,
	}

	let menu: typeof SvelteComponent | SidebarMenu | null = null;

	export let setModalTimeline: (data: TimelineData, width?: number) => void
	export let addTimeline: (data: TimelineData) => void
	export let timelines: TimelineData[]
	export let batchActionFilters: FilterInstance[]
	export let timelineViews: {[name: string]: TimelineView}
	export let timelineView: TimelineView

	function toggleSidebarMenu(newMenu: typeof SvelteComponent | SidebarMenu) {
		menu = menu === newMenu ? null : newMenu;
	}

	const buttons: {icon: IconDefinition, menu: typeof SvelteComponent | SidebarMenu, title: string}[] = [
		{icon: faPlus, menu: SidebarMenu.TimelineEdit, title: 'Add new timeline'},
		{icon: faBarsProgress, menu: Endpoints, title: 'Endpoints'},
		{icon: faRotateLeft, menu: SidebarMenu.Undoables, title: 'Undoables'},
		{icon: faSpinner, menu: MediaLoader, title: 'Loading medias'},
		{icon: faB, menu: SidebarMenu.BatchActions, title: 'Batch actions'},
	]
</script>

<style>
	#sidebar {
		background-color: var(--dark);
		z-index: 1;
		display: flex;
	}

	#sidebarButtons {
		width: 60px;
		padding: 1rem 0;
		text-align: center;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	#sidebarButtons > div {
		display: flex;
		flex-direction: column;
	}

	#sidebarButtons button {
		height: 45px;
	}

	#sidebarButtons button:not(:last-child) {
		margin-bottom: 1rem;
	}

	.sidebarMenu {
		width: var(--sidebar-menu-width);
		height: 100%;
		padding: 1rem;
		background-color: var(--scheme-main-ter);
		overflow-y: auto;
	}

	.sidebarMenu::-webkit-scrollbar-thumb {
		background-color: var(--dark);
	}
</style>

<nav id='sidebar'>
	{#if menu !== null}
		<div class='sidebarMenu'>
			{#if menu === SidebarMenu.TimelineEdit}
				<div class='box'>
					<TimelineEditMenu
						{setModalTimeline}
						{addTimeline}
					/>
				</div>
				<div class='box'>
					<TimelineViewEdit
						bind:timelineViews
						bind:timelineView
						bind:timelines
					/>
				</div>
			{:else if menu === SidebarMenu.BatchActions}
				<div class='box'>
					<BatchActions
						bind:filterInstances={batchActionFilters}
						{timelines}
					/>
				</div>
			{:else if menu === SidebarMenu.Undoables}
				<Undoables
					{setModalTimeline}
				/>
			{:else if !Object.values(SidebarMenu).includes(menu)}
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
			{#each Object.entries(timelineViews) as [name, view]}
				<button class='borderless-button' title={`Set view: ${name}`} on:click='{() => timelineView = view}'>
					<Fa icon={faTableColumns} size='2x'/>
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