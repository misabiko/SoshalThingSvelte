<script lang='ts'>
	import Fa from 'svelte-fa/src/fa.svelte'
	import {faHeart} from '@fortawesome/free-regular-svg-icons'
	import {
		faRetweet,
		faHeart as faHeartFilled,
		faCompress,
		faExpand,
		faEye,
		faEyeSlash,
		faExpandAlt,
		faEllipsisH,
	} from '@fortawesome/free-solid-svg-icons'
	import {createEventDispatcher} from 'svelte'
	import Article from '../../services/article'
	import Dropdown from '../Dropdown.svelte'
	import {toggleMarkAsRead, toggleHide, articleAction, getWritable, STANDARD_ACTIONS} from "../../services/service"

	export let article: Readonly<Article>
	export let actualArticle: Readonly<Article>
	//TODO export let animatedAsGifs: boolean
	export let compact: boolean
	export let hideText: boolean
	export let style: string = ''

	let minimized = false
	$: isReposted = article.id !== actualArticle.id

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
	@use '../../styles/variables' as *

	article
		padding: 1rem
		background-color: $scheme-main-bis
		margin-bottom: 2px

		//TODO &.transparent
		//	opacity: 0.5

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

	//TODO .postVideo video
	//	width: 100%

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

	//TODO .postImagesCompact
	//	display: flex
	//	flex-wrap: wrap

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

		&:focus
			outline: none

		&:hover span
			color: $primary

		&:hover.commentButton span
			color: $comment-color

	.dropdown-trigger .articleButton
		width: 24px
		height: unset

		//i
		//	color: $white-ter

	//TODO .svg-inline--fa.fa-w-14
	//	width: 0.875em
	//
	//.svg-inline--fa.fa-w-18
	//	width: 1.125em
	//
	//.svg-inline--fa.fa-w-20
	//	width: 1em

	//.fade-enter-active, .fade-leave-active
	//	transition: opacity .5s
	//
	//.fade-enter, .fade-leave-to
	//	opacity: 0


	//.svg-inline--fa.fa-w-16
	//	width: 1em

	.likeButton
		color: $light

		&:hover, &.likedPostButton
			span
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

	//.svg-inline--fa.fa-w-20
	//	width: 1.25em

	.repostButton
		color: $light

		&:hover, &.repostedPostButton
			span
				color: $repost-color

	//.icon > svg
	//	will-change: transform
	//	transition: transform .5s ease-in-out
	//
	//.repostedPostButton .icon > svg
	//	transform: rotate(360deg)

	//TODO .repostLabel, .replyLabel
	//	margin-left: 64px
	//	color: $light
	//	font-size: smaller
	//
	//	a
	//		margin-left: 1rem
	//		color: $light
	//
	//		&:hover
	//			text-decoration: underline

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
</style>

<article class='socialArticle' {style}>
	<div class='repostLabel'>
		<a href={article.author.url} target='_blank' on:click|preventDefault={() => onUsernameClick(article)}>
			{article.author.name} reposted - {shortTimestamp(article.creationTime)}
		</a>
	</div>
	<!--{ self.view_reply_label(ctx) }-->
	<div class='media'>
		<div class='media-left'>
			<figure class='image is-64x64' class:sharedAvatar={isReposted}>
				{#if actualArticle.author?.url}
					{#if isReposted}
						<img src={actualArticle.author.avatarUrl} alt={`${actualArticle.author.username}'s avatar`}/>
						<img src={article.author.avatarUrl} alt={`${article.author.username}'s avatar`}/>
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
				{#if !hideText && !minimized}
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
					<button class='level-item articleButton repostButton borderless-button'
							class:repostedPostButton={actualArticle.reposted}>
						<Fa icon={faRetweet}/>
						{#if actualArticle.repostCount}
							<span>{actualArticle.repostCount}</span>
						{/if}
					</button>
					<button class='level-item articleButton likeButton borderless-button' class:likedPostButton={actualArticle.liked}
							on:click={() => dispatch('action', STANDARD_ACTIONS.favorite)}>
						<Fa icon={faHeart}/>
						{#if actualArticle.likeCount}
							<span>{actualArticle.likeCount}</span>
						{/if}
					</button>
					<button class='level-item articleButton borderless-button'>
						<Fa icon={faEyeSlash}/>
					</button>
					<Dropdown labelClasses='articleButton borderless-button'>
						<Fa slot='triggerIcon' icon={faEllipsisH} class='level-item'/>

						<!-- svelte-ignore a11y-missing-attribute -->
						<a class='dropdown-item' on:click={() => toggleMarkAsRead(actualArticle.idPair)}>
							Mark as read
						</a>
						<!-- svelte-ignore a11y-missing-attribute -->
						<a class='dropdown-item' on:click={() => toggleHide(actualArticle.idPair)}>
							Hide
						</a>
						<!-- svelte-ignore a11y-missing-attribute -->
						<a class='dropdown-item' on:click={() => compact = !compact}>
							{ compact ? 'Show expanded' : 'Show compact' }
						</a>
						<a class='dropdown-item' href={ actualArticle.url } target='_blank'>
							External Link
						</a>
						{#if isReposted}
							<a class='dropdown-item' href={ article.url } target='_blank'>
								Repost's external Link
							</a>
						{/if}
						<!-- svelte-ignore a11y-missing-attribute -->
						<a class='dropdown-item' on:click={() => console.dir(article)}>
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
	{#if !minimized}
		<div class='postMedia postImages'>
			{#each actualArticle.medias as media}
				<div class='mediaHolder'>
					<div class='is-hidden imgPlaceHolder'></div>
					<img alt={actualArticle.id} src={media.src} on:click={() => dispatch('mediaClick', 0)}/>
				</div>
			{/each}
		</div>
	{/if}
</article>