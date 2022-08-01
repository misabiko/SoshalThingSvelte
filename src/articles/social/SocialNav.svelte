<script lang='ts'>
	import Fa from 'svelte-fa/src/fa.svelte'
	import {faHeart} from '@fortawesome/free-regular-svg-icons'
	import {
		faRetweet,
		faHeart as faHeartFilled,
		faEyeSlash,
		faEllipsisH, faExpandAlt, faEye,
	} from '@fortawesome/free-solid-svg-icons'
	import Dropdown from '../../Dropdown.svelte'
	import {toggleMarkAsRead, toggleHide} from "../../services/service"
	import Article from '../../services/article'
	import type {TimelineArticleProps} from '../index'
	import {articleAction, getArticleAction, STANDARD_ACTIONS} from '../../services/actions'

	export let article: Article
	export let repost: Article | undefined = undefined
	export let isQuoted = false
	export let modal: boolean
	export let timelineProps: TimelineArticleProps
	export let onLogData: () => void
	export let onLogJSON: () => void
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

	//&:hover.commentButton span
	//	color: $comment-color

	button:disabled
		cursor: unset

	//.fade-enter-active, .fade-leave-active
	//	transition: opacity .5s
	//
	//.fade-enter, .fade-leave-to
	//	opacity: 0

	button.likeButton
		color: $light

		&:hover, &.likedPostButton
			span, :global(span > svg)
				color: $like-color

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

	button.repostButton
		color: $light

		&:hover, &.repostedPostButton
			span, :global(span > svg)
				color: $repost-color

	//:global(article.socialArticle .icon > svg)
	//	will-change: transform
	//	transition: transform .5s ease-in-out

	//:global(.repostedPostButton .icon > svg)
	//	transform: rotate(360deg)
</style>

<nav class='level is-mobile'>
	<div class='level-left'>
		{#if getArticleAction(STANDARD_ACTIONS.repost, article.idPair.service)}
			<button
				class='level-item articleButton repostButton borderless-button'
				class:repostedPostButton={article.getReposted()}
				title='Repost'
				on:click={() => articleAction(STANDARD_ACTIONS.repost, article.idPair)}
				disabled={article.getReposted() && !getArticleAction(STANDARD_ACTIONS.repost, article.idPair.service).togglable}
			>
							<span class='icon'>
								<Fa icon={faRetweet}/>
							</span>
				{#if article.getRepostCount()}
					<span>{article.getRepostCount()}</span>
				{/if}
			</button>
		{/if}
		{#if getArticleAction(STANDARD_ACTIONS.like, article.idPair.service)}
			<button
				class='level-item articleButton likeButton borderless-button'
				class:likedPostButton={article.getLiked()}
				title='Like'
				on:click={() => articleAction(STANDARD_ACTIONS.like, article.idPair)}
				disabled={article.getLiked() && !getArticleAction(STANDARD_ACTIONS.like, article.idPair.service).togglable}
			>
				<span class='icon'>
					<Fa icon={article.getLiked() ? faHeartFilled : faHeart}/>
				</span>
				{#if article.getLikeCount()}
					<span>{article.getLikeCount()}</span>
				{/if}
			</button>
		{/if}
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