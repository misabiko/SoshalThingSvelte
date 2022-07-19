<script lang='ts'>
	import Fa from 'svelte-fa/src/fa.svelte'
	import {faHeart} from '@fortawesome/free-regular-svg-icons'
	import {
		faRetweet,
		faHeart as faHeartFilled,
		faEyeSlash,
		faEllipsisH, faExpandAlt, faEye,
	} from '@fortawesome/free-solid-svg-icons'
	import {createEventDispatcher} from 'svelte'
	import Article from '../../services/article'
	import Dropdown from '../../Dropdown.svelte'
	import {toggleMarkAsRead, toggleHide, articleAction, getArticleAction, STANDARD_ACTIONS} from "../../services/service"
	import {MediaType} from "../../services/article.js";
	import type {ArticleProps, TimelineArticleProps} from '../index'
	import {shortTimestamp} from "../index";
	import SocialMedia from "./SocialMedia.svelte";

	export let timelineProps: TimelineArticleProps
	export let articleProps: ArticleProps
	export let style = ''
	export let modal: boolean; modal;
	export let actualArticle: Readonly<Article>
	export let classNames = ''

	let minimized = false
	const isArticleRepost = articleProps.actualArticleRef && 'reposted' in articleProps.actualArticleRef

	function onUsernameClick(clickedArticle: Article) {
		console.log(clickedArticle.author?.username + ' click')
	}

	const dispatch = createEventDispatcher()
</script>

<style lang='sass'>
	@use '../../styles/variables' as *

	article
		padding: 1rem
		background-color: $scheme-main-bis
		margin-bottom: 2px

		//TODO &.transparent
		//	opacity: 0.5

	article.socialArticle
		:global(.dropdown-trigger .articleButton)
			width: 24px
			height: unset

		:global(i), :global(svg)
			color: $white-ter

	figure
		img
			border-radius: 4px

		&.sharedAvatar
			position: relative

			img:first-child
				position: absolute
				width: 85%

			img:last-child
				position: absolute
				width: 40%
				bottom: 0
				right: 0

	.articleHeader *
		vertical-align: middle

		small
			color: $light

	.names
		text-overflow: ellipsis
		white-space: nowrap
		overflow: hidden
		display: inline-block
		max-width: 300px

		strong
			margin-right: 0.5rem
			color: $white-ter

		&:hover > *
			text-decoration: underline

	.timestamp
		float: right

	p.articleParagraph
		white-space: pre-line
		overflow-wrap: anywhere


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

	//, .replyLabel
	.repostLabel
		margin-left: 64px
		color: $light
		font-size: smaller

		a
			margin-left: 1rem
			color: $light

			&:hover
				text-decoration: underline

	.quotedPost
		border: 2px solid $scheme-main-ter
		border-radius: 6px
		padding: 16px

		.names
			text-overflow: ellipsis
			white-space: nowrap
			overflow: hidden
			display: inline-block
			max-width: 300px

			strong
				margin-right: 0.5rem
				color: $white-ter

			&:hover > *
				text-decoration: underline

		span *
			vertical-align: middle

		p
			white-space: pre-line

	.imgPlaceHolder
		width: 100%
		background-color: grey
</style>

<article class={`socialArticle ${classNames}`} {style}>
	<div class='repostLabel'>
		{#if isArticleRepost && articleProps.article.author}
			<a href={articleProps.article.author.url} target='_blank' on:click|preventDefault={() => onUsernameClick(articleProps.article)}>
				{articleProps.article.author.name} reposted - {shortTimestamp(articleProps.article.creationTime)}
			</a>
		{/if}
	</div>
	<!--{ self.view_reply_label(ctx) }-->
	<div class='media'>
		<div class='media-left'>
			<figure class='image is-64x64' class:sharedAvatar={isArticleRepost}>
				{#if actualArticle.author?.url}
					{#if isArticleRepost}
						<img src={actualArticle.author.avatarUrl} alt={`${actualArticle.author.username}'s avatar`}/>
						<img src={articleProps.article.author.avatarUrl} alt={`${articleProps.article.author.username}'s avatar`}/>
					{:else}
						<img src={actualArticle.author.avatarUrl} alt={`${actualArticle.author.username}'s avatar`}/>
					{/if}
				{/if}
			</figure>
		</div>
		<div class='media-content'>
			<div class='content'>
				<div class='articleHeader'>
					<a
						class='names'
						href={actualArticle.author?.url}
						target='_blank'
						on:click|preventDefault={() => onUsernameClick(actualArticle)}
					>
						<strong>{ actualArticle.author?.name }</strong>
						<small>@{ actualArticle.author?.username }</small>
					</a>
					{#if actualArticle.creationTime !== undefined}
						<span class='timestamp'>
							<small
								title={actualArticle.creationTime.toString()}>{shortTimestamp(actualArticle.creationTime)}</small>
						</span>
					{/if}
				</div>
				{#if !timelineProps.hideText && !minimized}
					<p class='articleParagraph'>
						{#if actualArticle.textHtml}
							{@html actualArticle.textHtml}
						{:else}
							{actualArticle.text}
						{/if}
					</p>
				{/if}
			</div>
			{#if articleProps.actualArticleRef?.quoted}
				{@const quoted = articleProps.actualArticleRef.quoted}
				<div class='quotedPost'>
					<div class='articleHeader'>
						<a class='names' href={quoted.author.url} target='_blank'>
							<strong>{ quoted.author.name }</strong>
							<small>{ `@${quoted.author.username}` }</small>
						</a>
						<span class='timestamp'>
							<small
								title={quoted.creationTime.toString()}
							>
								{shortTimestamp(quoted.creationTime)}
							</small>
						</span>
					</div>
					{#if !minimized}
						{#if !timelineProps.hideText}
							<p class='refArticleParagraph'>
								{#if quoted.textHtml}
									{@html quoted.textHtml}
								{:else}
									{quoted.text}
								{/if}
							</p>
						{/if}
						<SocialMedia
							article={quoted}
							{timelineProps}
							on:mediaClick={e => dispatch('mediaClick', e.detail)}
						/>
					{/if}
					<!--TODO SocialNav-->
				</div>
			{/if}
			<nav class='level is-mobile'>
				<div class='level-left'>
					{#if getArticleAction(STANDARD_ACTIONS.repost, actualArticle.idPair.service)}
						<button
							class='level-item articleButton repostButton borderless-button'
							class:repostedPostButton={actualArticle.getReposted()}
							title='Repost'
							on:click={() => articleAction(STANDARD_ACTIONS.repost, actualArticle.idPair)}
							disabled={actualArticle.getReposted() && !getArticleAction(STANDARD_ACTIONS.repost, actualArticle.idPair.service).togglable}
						>
							<span class='icon'>
								<Fa icon={faRetweet}/>
							</span>
							{#if actualArticle.getRepostCount()}
								<span>{actualArticle.getRepostCount()}</span>
							{/if}
						</button>
					{/if}
					{#if getArticleAction(STANDARD_ACTIONS.like, actualArticle.idPair.service)}
						<button
							class='level-item articleButton likeButton borderless-button'
							class:likedPostButton={actualArticle.getLiked()}
							title='Like'
							on:click={() => articleAction(STANDARD_ACTIONS.like, actualArticle.idPair)}
							disabled={actualArticle.getLiked() && !getArticleAction(STANDARD_ACTIONS.like, actualArticle.idPair.service).togglable}
						>
							<span class='icon'>
								<Fa icon={actualArticle.getLiked() ? faHeartFilled : faHeart}/>
							</span>
							{#if actualArticle.getLikeCount()}
								<span>{actualArticle.getLikeCount()}</span>
							{/if}
						</button>
					{/if}
					<button
						class='level-item articleButton borderless-button'
						title='Mark as read'
						on:click={() => toggleMarkAsRead(actualArticle.idPair)}
					>
						<span class='icon'>
							<Fa icon={actualArticle.markedAsRead ? faEye : faEyeSlash}/>
						</span>
					</button>
					{#if !modal}
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
						<a class='dropdown-item' on:click={() => toggleMarkAsRead(actualArticle.idPair)}>
							Mark as read
						</a>
						<!-- svelte-ignore a11y-missing-attribute -->
						<a class='dropdown-item' on:click={() => toggleHide(actualArticle.idPair)}>
							Hide
						</a>
						<!-- svelte-ignore a11y-missing-attribute -->
						<a class='dropdown-item' on:click={() => timelineProps.compact = !timelineProps.compact}>
							{ timelineProps.compact ? 'Show expanded' : 'Show compact' }
						</a>
						<a class='dropdown-item' href={ actualArticle.url } target='_blank'>
							External Link
						</a>
						{#if isArticleRepost}
							<a class='dropdown-item' href={ articleProps.article.url } target='_blank'>
								Repost's external Link
							</a>
						{/if}
						<!-- svelte-ignore a11y-missing-attribute -->
						<a class='dropdown-item' on:click={() => dispatch('logData')}>
							Log Data
						</a>
						<!-- svelte-ignore a11y-missing-attribute -->
						<a class='dropdown-item' on:click={() => dispatch('logJSON')}>
							Log Json Data
						</a>
						<!--	<a class='dropdown-item'>-->
						<!--		Fetch Data-->
						<!--	</a>-->
					</Dropdown>
				</div>
			</nav>
		</div>
	</div>
	{#if actualArticle.medias.length && !minimized}
		<SocialMedia
			article={actualArticle}
			{timelineProps}
			on:mediaClick={e => dispatch('mediaClick', e.detail)}
		/>
	{/if}
</article>