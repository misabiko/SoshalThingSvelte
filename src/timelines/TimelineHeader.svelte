<script lang='ts'>
	import Fa from 'svelte-fa';
	import {
		faArrowDown,
		faArrowUp, faColumns,
		faEllipsisV, faExpandAlt,
		faEyeSlash, faMaximize, faMinimize,
		faRandom,
		faScaleBalanced,
		faScroll,
		faSyncAlt,
	} from '@fortawesome/free-solid-svg-icons';
	import MasonryContainer from '../containers/MasonryContainer.svelte';
	import type {FullscreenInfo, TimelineData} from './index';
	import {RefreshType} from '~/services/endpoints';
	import {updateMaximized} from '~/storages';

	export let data: TimelineData;
	export let favviewerButtons: boolean;
	export let favviewerHidden: boolean;
	export let favviewerMaximized: boolean | null = null;
	export let fullscreen: FullscreenInfo | null = null;
	export let articleCountLabel: string;
	export let availableRefreshTypes: Readonly<Set<RefreshType>>;
	export let containerRebalance: boolean;
	export let showSidebar: boolean;
	export let showOptions: boolean;
	export let toggleFullscreen: (() => void) | null = null;
	export let shuffle: () => void;
	export let autoscroll: () => void;
	export let refresh: (refreshType: RefreshType) => void;
</script>

<style>
	.timelineHeader {
		height: 50px;
		line-height: 50px;
		padding-left: 25px;
		background-color: var(--dark);
		display: flex;
		justify-content: space-between;
	}
	.timelineHeader strong {
		vertical-align: middle;
	}

	.timelineLeftHeader {
		display: flex;
		flex-shrink: 8;
	}

	.timelineButtons {
		display: flex;
		flex-wrap: nowrap;
		/* noinspection CssInvalidPropertyValue */
		overflow-x: overlay;
		overflow-y: clip;
	}

	.timelineRightHeader.timelineButtons {
		flex-direction: row-reverse;
	}

	.timelineButtons > button {
		height: 100%;
		padding: 0 1rem;
	}
</style>

<div class='timelineHeader'>
	<div class='timelineLeftHeader'>
		<strong>{data.title + (data.showArticleCount ? ' - ' + articleCountLabel : '')}</strong>
		{#if favviewerButtons}
			<div class='timelineButtons'>
				<button class='borderless-button' title='Toggle SoshalThing' onclick={() => favviewerHidden = !favviewerHidden}>
					<Fa icon={faEyeSlash} size='lg'/>
				</button>
				{#if favviewerMaximized !== null}
					<button class='borderless-button'
							title={favviewerMaximized ? 'Minimize SoshalThing' : 'Maximize SoshalThing'}
							onclick={() => {
								favviewerMaximized = !favviewerMaximized;
								updateMaximized(favviewerMaximized);
							}}
					>
						<Fa icon={favviewerMaximized ? faMinimize : faMaximize} size='lg'/>
					</button>
				{/if}
				<button class='borderless-button' title='Show Sidebar' onclick={() => showSidebar = !showSidebar}>
					<Fa icon={faEllipsisV} size='lg'/>
				</button>
			</div>
		{/if}
	</div>
	<div class='timelineRightHeader timelineButtons'>
		<button class='borderless-button' title='Expand options' onclick={() => showOptions = !showOptions}>
			<Fa icon={faEllipsisV} size='lg'/>
		</button>
		{#if availableRefreshTypes.has(RefreshType.LoadTop)}
			<button class='borderless-button' title='Load Top'
					onclick={() => refresh(RefreshType.LoadTop)}>
				<Fa icon={faArrowUp} size='lg'/>
			</button>
		{/if}
		{#if availableRefreshTypes.has(RefreshType.LoadBottom)}
			<button class='borderless-button' title='Load Bottom'
					onclick={() => refresh(RefreshType.LoadBottom)}>
				<Fa icon={faArrowDown} size='lg'/>
			</button>
		{/if}
		{#if availableRefreshTypes.has(RefreshType.Refresh)}
			<button class='borderless-button' title='Refresh' onclick={() => refresh(RefreshType.Refresh)}>
				<Fa icon={faSyncAlt} size='lg'/>
			</button>
		{/if}
		<button class='borderless-button timelineAutoscroll' title='Autoscroll' onclick={autoscroll}>
			<Fa icon={faScroll} size='lg'/>
		</button>
		<button class='borderless-button' title='Shuffle' onclick={shuffle}>
			<Fa icon={faRandom} size='lg'/>
		</button>
		{#if data.container === MasonryContainer}
			<button class='borderless-button' title='Organize Container'
					onclick={() => containerRebalance = !containerRebalance}>
				<Fa icon={faScaleBalanced} size='lg'/>
			</button>
		{/if}
		{#if toggleFullscreen}
			<button
				class='borderless-button'
				title={fullscreen ? 'Disable fullscreen' : 'Make timeline fullscreen'}
				onclick={toggleFullscreen}
			>
				<Fa icon={fullscreen ? faColumns : faExpandAlt} size='lg'/>
			</button>
		{/if}
	</div>
</div>