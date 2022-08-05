<script lang='ts'>
	import Fa from 'svelte-fa/src/fa.svelte'
	import {
		faEyeSlash,
		faEllipsisH, faExpandAlt, faEye,
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
</script>

<style lang='sass'>
	@use '../../styles/variables' as *

	.articleButton
		color: $light
		font-size: unset

		&:focus
			outline: none

		&:hover span
			color: $primary

	:global(button.articleButton.borderless-button.actionned > span > svg)
		color: $primary

	//&:hover.commentButton span
	//	color: $comment-color

	button:disabled
		cursor: unset

	//.fade-enter-active, .fade-leave-active
	//	transition: opacity .5s
	//
	//.fade-enter, .fade-leave-to
	//	opacity: 0

	//@keyframes heart
	//	0%, 17.5%
	//		width: 0
	//
	//.heart-enter-active
	//	will-change: width
	//	animation: heart .5s cubic-bezier(.17, .89, .32, 1.49)
	//
	//.heart-enter
	//	width: 0
	//
	//$bubble-d: 2em
	//$bubble-r: .5 * $bubble-d
	//
	//.icon > svg
	//	position: relative
	//
	//	&:before, &:after
	//		position: absolute
	//		z-index: -1
	//		top: 50%
	//		left: 50%
	//		border-radius: 50%
	//		content: ''
	//
	//	&::before
	//		margin: -$bubble-r
	//		width: $bubble-d
	//		height: $bubble-d
	//		background: gold

	//:global(article.socialArticle .icon > svg)
	//	will-change: transform
	//	transition: transform .5s ease-in-out

	//:global(.repostedPostButton .icon > svg)
	//	transform: rotate(360deg)
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
			<a class='dropdown-item' href={ article.url } target='_blank'>
				External Link
			</a>
			{#if repost}
				<a class='dropdown-item' href={ repost.url } target='_blank'>
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
</nav>