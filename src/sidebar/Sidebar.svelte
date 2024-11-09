<script lang='ts'>
	import Fa from 'svelte-fa';
	import { faNewspaper, type IconDefinition } from '@fortawesome/free-solid-svg-icons';
	import {
		faAngleDoubleLeft,
		faB,
		faBarsProgress,
		faCog,
		faPlus,
		faRotateLeft,
		faSpinner,
	} from '@fortawesome/free-solid-svg-icons';
	import { faGithub } from '@fortawesome/free-brands-svg-icons';
	import MediaLoader from './MediaLoader.svelte';
	import Undoables from './Undoables.svelte';
	import Endpoints from './Endpoints.svelte';
	import type { Component } from 'svelte';
	import SettingsMenu from './SettingsMenu.svelte';
	import TimelineEditMenu from './TimelineEditMenu.svelte';
	import BatchActions from './BatchActions.svelte';
	import type { TimelineCollection, TimelineData, TimelineView } from '~/timelines';
	import type { FilterInstance } from '~/filters';
	import { faTableColumns } from '@fortawesome/free-solid-svg-icons/faTableColumns';
	import TimelineViewEdit from './TimelineViewEdit.svelte';
	import { updateMainStorage } from '~/storages';
	import LoadArticle from './LoadArticle.svelte';
	import type { Writable } from 'svelte/store';

	//https://github.com/sveltejs/svelte/issues/13811
	//svelte-ignore non_reactive_update
	enum SidebarMenu {
		TimelineEdit,
		BatchActions,
		Undoables,
	}

	let Menu = $state<Component | SidebarMenu | null>(null);

	let {
		setModalTimeline,
		addTimeline,
		timelines = $bindable(),
		batchActionFilters,
		timelineViews = $bindable(),
		timelineViewId = $bindable(),
	}: {
		setModalTimeline: (data: TimelineData, width?: number) => void
		addTimeline: (data: TimelineData) => void
		timelines: TimelineCollection
		batchActionFilters: Writable<FilterInstance[]>
		timelineViews: Record<string, TimelineView>
		timelineViewId: string
	} = $props();

	function toggleSidebarMenu(newMenu: Component | SidebarMenu) {
		Menu = Menu === newMenu ? null : newMenu;
	}

	const buttons: {icon: IconDefinition, menu: Component | SidebarMenu, title: string}[] = [
		{icon: faPlus, menu: SidebarMenu.TimelineEdit, title: 'Add new timeline'},
		{icon: faBarsProgress, menu: Endpoints, title: 'Endpoints'},
		{icon: faNewspaper, menu: LoadArticle, title: 'Load article'},
		{icon: faRotateLeft, menu: SidebarMenu.Undoables, title: 'Undoables'},
		{icon: faSpinner, menu: MediaLoader, title: 'Loading medias'},
		{icon: faB, menu: SidebarMenu.BatchActions, title: 'Batch actions'},
	];

	//TODO Add article list menu
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
		box-sizing: border-box;
	}

	.sidebarMenu::-webkit-scrollbar-thumb {
		background-color: var(--dark);
	}
</style>

<nav id='sidebar'>
	{#if Menu !== null}
		<div class='sidebarMenu'>
			{#if Menu === SidebarMenu.TimelineEdit}
				<section>
					<h1>Add new timeline</h1>
					<TimelineEditMenu
						{setModalTimeline}
						{addTimeline}
					/>
				</section>
				<section>
					<h1>Timeline Views</h1>
					<TimelineViewEdit
						bind:timelineViews
						bind:timelineViewId
						bind:timelines
					/>
				</section>
			{:else if Menu === SidebarMenu.BatchActions}
				<section>
					<BatchActions
						bind:filterInstances={batchActionFilters}
						{timelines}
					/>
				</section>
			{:else if Menu === SidebarMenu.Undoables}
				<Undoables
					{setModalTimeline}
				/>
			{:else}
				<Menu/>
			{/if}
		</div>
	{/if}
	<div id='sidebarButtons'>
		<div>
			{#if Menu !== null}
				<button class='borderless-button' title='Expand sidebar' onclick={() => Menu = null}>
					<Fa icon={faAngleDoubleLeft} size='2x'/>
				</button>
			{/if}
			{#each buttons as { icon, menu, title }}
				<button class='borderless-button' {title} onclick={() => toggleSidebarMenu(menu)}>
					<Fa icon={icon} size='2x'/>
				</button>
			{/each}
			{#each Object.entries(timelineViews) as [id, _]}
				<button
						class='borderless-button'
						title={`Set view: ${id}`}
						onclick={() => {
							timelineViewId = id;
							updateMainStorage('currentTimelineView', timelineViewId);
						}}
				>
					<Fa icon={faTableColumns} size='2x'/>
				</button>
			{/each}
		</div>
		<div>
			<button class='borderless-button' title='Settings' onclick={() => toggleSidebarMenu(SettingsMenu)}>
				<Fa icon={faCog} size='2x'/>
			</button>
			<a href='https://github.com/misabiko/SoshalThingSvelte' title='Github'>
				<button class='borderless-button'>
					<Fa icon={faGithub} size='2x'/>
				</button>
			</a>
		</div>
	</div>
</nav>