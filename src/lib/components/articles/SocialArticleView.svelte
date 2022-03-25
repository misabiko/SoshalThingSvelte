<script lang='ts'>
	import Article from '../../services/article'
	import Fa from 'svelte-fa/src/fa.svelte';
	import { faHeart } from '@fortawesome/free-regular-svg-icons';
	import { faRetweet, faHeart as faHeartFilled, faCompress, faExpand, faEye, faEyeSlash, faExpandAlt, faEllipsisH } from '@fortawesome/free-solid-svg-icons';
	import {createEventDispatcher} from 'svelte'
	import {ArticleIdPair, getWritable} from '../../services/service'

	export let idPair: ArticleIdPair;
	export let hideText: boolean;
	export let style: string = '';

	let article: Article;
	const unsubscribe = getWritable(idPair).subscribe(_ => article = _);

	$: actualArticle = article;
	let minimized = false;

	const MONTH_ABBREVS: string[] = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	function shortTimestamp() {
		const timeSince = Date.now() - $actualArticle.creationTime.getTime();

		if (timeSince < 1000)
			return 'just now';
		else if (timeSince < 60_000)
			return `${Math.floor(timeSince / 1000)}s`
		else if (timeSince < 3_600_000)
			return `${Math.floor(timeSince / 60_000)}m`
		else if (timeSince < 86_400_000)
			return `${Math.floor(timeSince / 3_600_000)}h`
		else if (timeSince < 604_800_000)
			return `${Math.floor(timeSince / 86_400_000)}d`
		else
			return `${MONTH_ABBREVS[$actualArticle.creationTime.getMonth()]} ${$actualArticle.creationTime.getDate()} ${$actualArticle.creationTime.getFullYear()}`
	}

	function onUsernameClick() {

	}

	const dispatch = createEventDispatcher();
</script>

<style lang='sass' global>
	@use '../../styles/core' as *

	.favviewer article
		padding: 1rem
		background-color: $scheme-main-bis
		margin-bottom: 2px

		&.transparent
			opacity: 0.5

	article.socialArticle
		figure
			img
				border-radius: 4px

			p.sharedAvatar
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

			&.mediaHolderCompact
				max-height: 16vh
				width: 100%

				&:not(:only-child)
					margin: 2px
					max-width: 49%

					&.landscape img
						width: unset
						height: 110%

					&.portrait img
						width: 110%
						height: unset

				img
					object-fit: cover

				&.thirdImage
					max-width: unset

					&.landscape img
						width: unset
						height: 175%

					&.portrait img
						width: 175%
						height: unset

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

			i
				color: $white-ter

		button.articleButton
			@include borderless-button

		.svg-inline--fa.fa-w-14
			width: 0.875em

		.svg-inline--fa.fa-w-18
			width: 1.125em

		.svg-inline--fa.fa-w-20
			width: 1em

		.fade-enter-active, .fade-leave-active
			transition: opacity .5s

		.fade-enter, .fade-leave-to
			opacity: 0


		.svg-inline--fa.fa-w-16
			width: 1em

		.likeButton
			color: $light

			&:hover, &.likedPostButton
				span
					color: $like-color

		@keyframes heart
			0%, 17.5%
				width: 0

		.heart-enter-active
			will-change: width
			animation: heart .5s cubic-bezier(.17, .89, .32, 1.49)

		.heart-enter
			width: 0

		$bubble-d: 2em
		$bubble-r: .5 * $bubble-d

		.icon > svg
			position: relative

			&:before, &:after
				position: absolute
				z-index: -1
				top: 50%
				left: 50%
				border-radius: 50%
				content: ''

			&::before
				margin: -$bubble-r
				width: $bubble-d
				height: $bubble-d
				background: gold

		.svg-inline--fa.fa-w-20
			width: 1.25em

		.repostButton
			color: $light

			&:hover, &.repostedPostButton
				span
					color: $repost-color

		.icon > svg
			will-change: transform
			transition: transform .5s ease-in-out

		.repostedPostButton .icon > svg
			transform: rotate(360deg)

		.repostLabel, .replyLabel
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
</style>

<article class='socialArticle' articleId={article.id} {style}>
	<!--{ self.view_repost_label(ctx) }-->
	<!--{ self.view_reply_label(ctx) }-->
	<div class='media'>
		{#if actualArticle.author?.url}
			<figure class='media-left'>
				<p class='image is-64x64'>
					<img src={actualArticle.author.avatarUrl} alt={`{actualArticle.author.username}'s avatar`}/>
				</p>
			</figure>
		{/if}
		<div class='media-content'>
			<div class='content'>
				<div class='articleHeader'>
					<a class='names' href={actualArticle.author?.url} target='_blank' onclick={onUsernameClick}>
						<strong>{ actualArticle.author?.name }</strong>
						<small>@{ actualArticle.author?.username }</small>
					</a>
					{#if actualArticle.creationTime !== undefined}
						<span class='timestamp'>
							<small title={actualArticle.creationTime.toString()}>{shortTimestamp()}</small>
						</span>
					{/if}
				</div>
				{#if !hideText && !minimized}
					<p class='articleParagraph'>
						{actualArticle.text}
					</p>
				{/if}
			</div>
			<!--{ quoted_post }-->
			<nav class='level is-mobile'>
				<div class='level-left'>
					<a class='level-item articleButton repostButton' class:repostedPostButton={actualArticle.reposted}>
						<Fa icon={faRetweet}/>
						{#if actualArticle.repostCount}
							<span>{actualArticle.repostCount}</span>
						{/if}
					</a>
					<a class='level-item articleButton likeButton' class:likedPostButton={actualArticle.liked}>
						<Fa icon={faHeart}/>
						{#if actualArticle.likeCount}
							<span>{actualArticle.likeCount}</span>
						{/if}
					</a>
					<a class='level-item articleButton'>
						<Fa icon={faEyeSlash}/>
					</a>
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