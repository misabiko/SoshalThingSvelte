<script lang='ts'>
	import Fa from 'svelte-fa/src/fa.svelte'
	import {
		faArrowDown,
		faArrowUp, faColumns,
		faEllipsisV, faExpandAlt,
		faEyeSlash,
		faRandom,
		faScaleBalanced,
		faScroll,
		faSyncAlt,
	} from "@fortawesome/free-solid-svg-icons"
	import MasonryContainer from "../containers/MasonryContainer.svelte"
	import type {TimelineData} from './index'
	import {RefreshType} from '../services/endpoints'

	export let data: TimelineData
	export let favviewerButtons: boolean
	export let favviewerHidden: boolean
	export let fullscreen: boolean
	export let availableRefreshTypes: Set<RefreshType>
	export let containerRebalance: boolean
	export let showSidebar: boolean
	export let showOptions: boolean
	export let toggleFullscreen: () => void | undefined = undefined
	export let shuffle: () => void
	export let autoscroll: () => void
	export let refresh: (refreshType: RefreshType) => void
</script>

<style lang='sass'>
	@use '../styles/variables' as *

	.timelineHeader
		height: 50px
		line-height: 50px
		padding-left: 25px
		background-color: $dark
		display: flex
		justify-content: space-between

		strong
			vertical-align: middle

		//TODO &.timelineInvalid
		//	background-color: $dark-error

	.timelineLeftHeader
		display: flex
		flex-shrink: 8

	.timelineButtons
		display: flex
		flex-wrap: nowrap

	.timelineButtons > button
		height: 100%
		padding: 0 1rem
</style>

<div class='timelineHeader'>
	<div class='timelineLeftHeader'>
		<strong>{data.title}</strong>
		{#if favviewerButtons}
			<div class='timelineButtons'>
				<button class='borderless-button' title='Toggle SoshalThing' on:click={() => favviewerHidden = !favviewerHidden}>
					<Fa icon={faEyeSlash} size='large'/>
				</button>
				<button class='borderless-button' title='Show Sidebar' on:click={() => showSidebar = !showSidebar}>
					<Fa icon={faEllipsisV} size='large'/>
				</button>
			</div>
		{/if}
	</div>
	<div class='timelineButtons'>
		{#if toggleFullscreen}
			<button
				class='borderless-button'
				title={fullscreen ? 'Disable fullscreen' : 'Make timeline fullscreen'}
				on:click={toggleFullscreen}
			>
				<Fa icon={fullscreen ? faColumns: faExpandAlt} size='large'/>
			</button>
		{/if}
		{#if data.container === MasonryContainer}
			<button class='borderless-button' title='Organize Container'
					on:click={() => containerRebalance = !containerRebalance}>
				<Fa icon={faScaleBalanced} size='large'/>
			</button>
		{/if}
		<button class='borderless-button' title='Shuffle' on:click={shuffle}>
			<Fa icon={faRandom} size='large'/>
		</button>
		<button class='borderless-button timelineAutoscroll' title='Autoscroll' on:click={autoscroll}>
			<Fa icon={faScroll} size='large'/>
		</button>
		{#if availableRefreshTypes.has(RefreshType.Refresh)}
			<button class='borderless-button' title='Refresh' on:click={() => refresh(RefreshType.Refresh)}>
				<Fa icon={faSyncAlt} size='large'/>
			</button>
		{/if}
		{#if availableRefreshTypes.has(RefreshType.LoadBottom)}
			<button class='borderless-button' title='Load Bottom'
					on:click={() => refresh(RefreshType.LoadBottom)}>
				<Fa icon={faArrowDown} size='large'/>
			</button>
		{/if}
		{#if availableRefreshTypes.has(RefreshType.LoadTop)}
			<button class='borderless-button' title='Load Top'
					on:click={() => refresh(RefreshType.LoadTop)}>
				<Fa icon={faArrowUp} size='large'/>
			</button>
		{/if}
		<button class='borderless-button' title='Expand options' on:click='{() => showOptions = !showOptions}'>
			<Fa icon={faEllipsisV} size='large'/>
		</button>
	</div>
</div>