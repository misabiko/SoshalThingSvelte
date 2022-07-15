<script lang='ts'>
	import Fa from 'svelte-fa/src/fa.svelte'
	import {faHeart} from '@fortawesome/free-regular-svg-icons'
	import {
		faRetweet,
		faHeart as faHeartFilled,
		faEyeSlash,
		faEllipsisH,
	} from '@fortawesome/free-solid-svg-icons'
	import {createEventDispatcher} from 'svelte'
	import Article from '../services/article'
	import type {ArticleWithRefs} from '../services/article'
	import Dropdown from '../Dropdown.svelte'
	import {toggleMarkAsRead, toggleHide, articleAction, getArticleAction, STANDARD_ACTIONS} from "../services/service"
	import {MediaType} from "../services/article.js";
	import type {ArticleProps} from './index'

	export let props: ArticleProps
	export let style = ''
	export let modal: boolean; modal;
	export let articleWithRefs: Readonly<ArticleWithRefs>
	export let actualArticle: Readonly<Article>

	let minimized = false
	const isArticleRepost = 'reposted' in articleWithRefs

	const MONTH_ABBREVS: string[] = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

	function shortTimestamp(date: Date) {
		const timeSince = Date.now() - date.getTime()

		if (timeSince < 1000)
			return 'just now'
		else if (timeSince < 60_000)
			return `${Math.floor(timeSince / 1000)}s`
		else if (timeSince < 3_600_000)
			return `${Math.floor(timeSince / 60_000)}m`
		else if (timeSince < 86_400_000)
			return `${Math.floor(timeSince / 3_600_000)}h`
		else if (timeSince < 604_800_000)
			return `${Math.floor(timeSince / 86_400_000)}d`
		else
			return `${MONTH_ABBREVS[date.getMonth()]} ${date.getDate()} ${date.getFullYear()}`
	}

	function onUsernameClick(clickedArticle: Article) {
		console.log(clickedArticle.author?.username + ' click')
	}

	const dispatch = createEventDispatcher()
</script>

<style lang='sass'>
	@use '../styles/variables' as *

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

	.postMedia
		margin-top: 1rem

	.postVideo video
		width: 100%

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

	.postImagesCompact
		display: flex
		flex-wrap: wrap

	.mediaHolder
		overflow: hidden
		display: flex
		justify-content: center
		border-radius: 8px

		&:not(:last-child)
			margin-bottom: 2px

		img
			align-self: center
			width: 100%

		//&.mediaHolderCompact
		//	max-height: 16vh
		//	width: 100%
		//
		//	&:not(:only-child)
		//		margin: 2px
		//		max-width: 49%
		//
		//		&.landscape img
		//			width: unset
		//			height: 110%
		//
		//		&.portrait img
		//			width: 110%
		//			height: unset
		//
		//	img
		//		object-fit: cover
		//
		//	&.thirdImage
		//		max-width: unset
		//
		//		&.landscape img
		//			width: unset
		//			height: 175%
		//
		//		&.portrait img
		//			width: 175%
		//			height: unset

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

	//TODO .quotedPost
	//	border: 2px solid $scheme-main-ter
	//	border-radius: 6px
	//	padding: 16px
	//
	//	.names
	//		text-overflow: ellipsis
	//		white-space: nowrap
	//		overflow: hidden
	//		display: inline-block
	//		max-width: 300px
	//
	//		strong
	//			margin-right: 0.5rem
	//			color: $white-ter
	//
	//		&:hover > *
	//			text-decoration: underline
	//
	//	span *
	//		vertical-align: middle
	//
	//	p
	//		white-space: pre-line

	.imgPlaceHolder
		width: 100%
		background-color: grey
</style>

<article class='socialArticle' {style}>
	<div class='repostLabel'>
		{#if isArticleRepost && articleWithRefs.article.author}
			<a href={articleWithRefs.article.author.url} target='_blank' on:click|preventDefault={() => onUsernameClick(articleWithRefs.article)}>
				{articleWithRefs.article.author.name} reposted - {shortTimestamp(articleWithRefs.article.creationTime)}
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
						<img src={articleWithRefs.article.author.avatarUrl} alt={`${articleWithRefs.article.author.username}'s avatar`}/>
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
				{#if !props.hideText && !minimized}
					<p class='articleParagraph'>
						{#if actualArticle.textHtml}
							{@html actualArticle.textHtml}
						{:else}
							{actualArticle.text}
						{/if}
					</p>
				{/if}
			</div>
			<!--{ quoted_post }-->
			<nav class='level is-mobile'>
				<div class='level-left'>
					<button
						class='level-item articleButton repostButton borderless-button'
						class:repostedPostButton={actualArticle.getReposted()}
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
					<button
						class='level-item articleButton likeButton borderless-button'
						class:likedPostButton={actualArticle.getLiked()}
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
					<button class='level-item articleButton borderless-button' on:click={() => toggleMarkAsRead(actualArticle.idPair)}>
						<span class='icon'>
							<Fa icon={faEyeSlash}/>
						</span>
					</button>
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
						<a class='dropdown-item' on:click={() => props.compact = !props.compact}>
							{ props.compact ? 'Show expanded' : 'Show compact' }
						</a>
						<a class='dropdown-item' href={ actualArticle.url } target='_blank'>
							External Link
						</a>
						{#if isArticleRepost}
							<a class='dropdown-item' href={ articleWithRefs.article.url } target='_blank'>
								Repost's external Link
							</a>
						{/if}
						<!-- svelte-ignore a11y-missing-attribute -->
						<a class='dropdown-item' on:click={() => dispatch('logData')}>
							Log Data
						</a>
						<!--	<a class='dropdown-item'>-->
						<!--		Log Json Data-->
						<!--	</a>-->
						<!--	<a class='dropdown-item'>-->
						<!--		Fetch Data-->
						<!--	</a>-->
					</Dropdown>
				</div>
			</nav>
		</div>
	</div>
	{#if actualArticle.medias.length && !minimized}
		<div class='postMedia postImages'>
			{#each actualArticle.medias as media, index (index)}
				{#if media.mediaType === MediaType.Image || media.mediaType === MediaType.Gif}
					<div class='mediaHolder'>
						<div class='is-hidden imgPlaceHolder' style:aspect-ratio={1 / media.ratio}></div>
						<img alt={actualArticle.id} src={media.src} on:click={() => dispatch('mediaClick', {idPair: actualArticle.idPair, index})}/>
					</div>
				{:else if !props.animatedAsGifs && media.mediaType === MediaType.Video}
					<div class="postMedia postVideo">
						<!-- svelte-ignore a11y-media-has-caption -->
						<video controls on:click|preventDefault={() => dispatch('mediaClick', {idPair: actualArticle.idPair, index})}>
							<source src={media.src} type="video/mp4"/>
						</video>
					</div>
				{:else if media.mediaType === MediaType.VideoGif || props.animatedAsGifs && media.mediaType === MediaType.Video}
					<div class="postMedia postVideo">
						<!-- svelte-ignore a11y-media-has-caption -->
						<video controls autoplay loop muted on:click|preventDefault={() => dispatch('mediaClick', {idPair: actualArticle.idPair, index})}>
							<source src={media.src} type="video/mp4"/>
						</video>
					</div>
				{/if}
			{/each}
		</div>
	{/if}
</article>