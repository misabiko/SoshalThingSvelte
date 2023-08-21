<script lang='ts'>
	import Fa from 'svelte-fa/src/fa.svelte'
	import {
		faEyeSlash,
		faEllipsisH, faExpandAlt, faEye, faSpinner,
	} from '@fortawesome/free-solid-svg-icons'
	import Dropdown from '../../Dropdown.svelte'
	import {toggleMarkAsRead, toggleHide} from "../../services/service"
	import Article from '../../articles'
	import type {TimelineArticleProps} from '../index'
	import {getServices} from "../../services/service.js";

	export let article: Article
	export let repost: Article | undefined = undefined
	export let isQuoted = false
	export let modal: boolean
	export let timelineProps: TimelineArticleProps
	export let onLogData: () => void
	export let onLogJSON: () => void

	let actions = Object.values(getServices()[article.idPair.service].articleActions)
		.filter(a => a.icon !== undefined)
		.sort((a, b) => a.index - b.index)

	let hoveredActions = new Set<string>()
	function updateActionHover(key: string, hovered: boolean) {
		if (hovered)
			hoveredActions.add(key)
		else
			hoveredActions.delete(key)

		hoveredActions = hoveredActions
	}

	let status: string | null = null
</script>

<style>
	.articleButton {
		color: var(--light);
		font-size: unset;
	}
	.articleButton:focus {
		outline: none;
	}
	.articleButton:hover span {
		color: var(--primary);
	}

	:global(button.articleButton.borderless-button.actionned > span > svg) {
		color: var(--primary);
	}

	button:disabled {
		cursor: unset;
	}
</style>

<nav class='level is-mobile'>
	<div class='level-left'>
		{#each actions as action (action.key)}
			{@const count = action.count ? action.count(article) : 0}
			{@const disabled = action.disabled ? action.disabled(article) : false}
			{@const actionned = action.actionned(article)}
			{@const isHovered = hoveredActions.has(action.key)}
			<!-- svelte-ignore a11y-mouse-events-have-key-events -->
			<button
				class='level-item articleButton borderless-button'
				class:actionned
				title={action.name}
				on:click={() => action.action(article.idPair)}
				disabled={disabled || (actionned && !action.togglable)}
				on:mouseover={() => updateActionHover(action.key, true)}
				on:mouseout={() => updateActionHover(action.key, false)}
			>
				<span class='icon'>
					<Fa
						icon={action.actionnedIcon && actionned ? action.actionnedIcon : action.icon}
						color={!disabled && (actionned || isHovered) ? action.color : undefined}
					/>
				</span>
				{#if count}
					<span style:color={!disabled && (actionned || isHovered) ? action.color : 'inherit'}>{count}</span>
				{/if}
			</button>
		{/each}
		<button
			class='level-item articleButton borderless-button'
			title='Mark as read'
			on:click={() => toggleMarkAsRead(article.idPair)}
		>
			<span class='icon'>
				<Fa icon={article.markedAsRead ? faEye : faEyeSlash}/>
			</span>
		</button>
		{#if !isQuoted && !modal}
			<button
				class='level-item articleButton borderless-button'
				title='Expand article as modal'
				on:click={() => modal = true}
			>
				<span class='icon'>
					<Fa icon={faExpandAlt}/>
				</span>
			</button>
		{/if}
		<Dropdown labelClasses='articleButton borderless-button'>
						<span slot='triggerIcon' class='icon'>
							<Fa icon={faEllipsisH} class='level-item'/>
						</span>

			<!-- svelte-ignore a11y-missing-attribute -->
			<a class='dropdown-item' on:click={() => toggleMarkAsRead(article.idPair)}>
				Mark as read
			</a>
			<!-- svelte-ignore a11y-missing-attribute -->
			<a class='dropdown-item' on:click={() => toggleHide(article.idPair)}>
				Hide
			</a>
			<!-- svelte-ignore a11y-missing-attribute -->
			<a class='dropdown-item' on:click={() => timelineProps.compact = !timelineProps.compact}>
				{ timelineProps.compact ? 'Show expanded' : 'Show compact' }
			</a>
			<a class='dropdown-item' href={ article.url } target='_blank' rel='noreferrer'>
				External Link
			</a>
			{#if repost}
				<a class='dropdown-item' href={ repost.url } target='_blank' rel='noreferrer'>
					Repost's external Link
				</a>
			{/if}
			{#if !isQuoted}
				<!-- svelte-ignore a11y-missing-attribute -->
				<a class='dropdown-item' on:click={onLogData}>
					Log Data
				</a>
				<!-- svelte-ignore a11y-missing-attribute -->
				<a class='dropdown-item' on:click={onLogJSON}>
					Log Json Data
				</a>
				<!--	<a class='dropdown-item'>-->
				<!--		Fetch Data-->
				<!--	</a>-->
			{/if}
		</Dropdown>
	</div>
	{#if status !== null}
		<div class='level-right'>
			<button class='level-item' title={status}>
				<span class='icon'>
					<Fa icon={faSpinner}/>
				</span>
			</button>
		</div>
	{/if}
</nav>