<script lang='ts'>
	import Fa from 'svelte-fa'
	import {
		faArrowDown,
		faArrowUp, faColumns,
		faEllipsisV, faExpandAlt,
		faEyeSlash, faMaximize, faMinimize,
		faRandom,
		faScaleBalanced,
		faScroll,
		faSyncAlt,
	} from "@fortawesome/free-solid-svg-icons"
	import MasonryContainer from "../containers/MasonryContainer.svelte"
	import type {FullscreenInfo, TimelineData} from './index'
	import {RefreshType} from '../services/endpoints'
	import {updateMaximized} from "../storages";

	let {
		data,
		favviewerButtons,
		favviewerHidden,
		favviewerMaximized = undefined,
		fullscreen = undefined,
		articleCountLabel,
		availableRefreshTypes,
		containerRebalance,
		showSidebar,
		showOptions,
		toggleFullscreen = undefined,
		shuffle,
		autoscroll,
		refresh,
	} = $props<{
		data: TimelineData,
		favviewerButtons: boolean,
		favviewerHidden: boolean,
		favviewerMaximized: boolean,
		fullscreen: FullscreenInfo,
		articleCountLabel: string,
		availableRefreshTypes: Set<RefreshType>,
		containerRebalance: boolean,
		showSidebar: boolean,
		showOptions: boolean,
		toggleFullscreen: () => void,
		shuffle: () => void,
		autoscroll: () => void,
		refresh: (refreshType: RefreshType) => void,
	}>();
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
				<button class='borderless-button' title='Toggle SoshalThing' on:click={() => favviewerHidden = !favviewerHidden}>
					<Fa icon={faEyeSlash} size='large'/>
				</button>
				{#if favviewerMaximized !== undefined}
					<button class='borderless-button'
							title={favviewerMaximized ? 'Minimize SoshalThing' : 'Maximize SoshalThing'}
							on:click={() => {favviewerMaximized = !favviewerMaximized; updateMaximized(favviewerMaximized)}}
					>
						<Fa icon={favviewerMaximized ? faMinimize : faMaximize} size='large'/>
					</button>
				{/if}
				<button class='borderless-button' title='Show Sidebar' on:click={() => showSidebar = !showSidebar}>
					<Fa icon={faEllipsisV} size='large'/>
				</button>
			</div>
		{/if}
	</div>
	<div class='timelineRightHeader timelineButtons'>
		<button class='borderless-button' title='Expand options' on:click='{() => showOptions = !showOptions}'>
			<Fa icon={faEllipsisV} size='large'/>
		</button>
		{#if availableRefreshTypes.has(RefreshType.LoadTop)}
			<button class='borderless-button' title='Load Top'
					on:click={() => refresh(RefreshType.LoadTop)}>
				<Fa icon={faArrowUp} size='large'/>
			</button>
		{/if}
		{#if availableRefreshTypes.has(RefreshType.LoadBottom)}
			<button class='borderless-button' title='Load Bottom'
					on:click={() => refresh(RefreshType.LoadBottom)}>
				<Fa icon={faArrowDown} size='large'/>
			</button>
		{/if}
		{#if availableRefreshTypes.has(RefreshType.Refresh)}
			<button class='borderless-button' title='Refresh' on:click={() => refresh(RefreshType.Refresh)}>
				<Fa icon={faSyncAlt} size='large'/>
			</button>
		{/if}
		<button class='borderless-button timelineAutoscroll' title='Autoscroll' on:click={autoscroll}>
			<Fa icon={faScroll} size='large'/>
		</button>
		<button class='borderless-button' title='Shuffle' on:click={shuffle}>
			<Fa icon={faRandom} size='large'/>
		</button>
		{#if data.container === MasonryContainer}
			<button class='borderless-button' title='Organize Container'
					on:click={() => containerRebalance = !containerRebalance}>
				<Fa icon={faScaleBalanced} size='large'/>
			</button>
		{/if}
		{#if toggleFullscreen}
			<button
				class='borderless-button'
				title={fullscreen ? 'Disable fullscreen' : 'Make timeline fullscreen'}
				on:click={toggleFullscreen}
			>
				<Fa icon={fullscreen ? faColumns: faExpandAlt} size='large'/>
			</button>
		{/if}
	</div>
</div>