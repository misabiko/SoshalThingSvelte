<script lang='ts'>
	import Article from '../../articles'
	import type {ArticleIdPair} from '../index'
	import type {ArticleProps, TimelineArticleProps} from '../index'
	import {shortTimestamp} from "../index";
	import SocialMedia from "./SocialMedia.svelte";
	import SocialNav from "./SocialNav.svelte";
	import Timestamp from "./Timestamp.svelte";
	import {newUserTimeline} from '../../timelines'

	export let timelineProps: TimelineArticleProps
	export let articleProps: ArticleProps
	export let modal: boolean; modal;
	export let showAllMedia: boolean;
	export let rootArticle: Readonly<Article>
	export let actualArticle: Readonly<Article>
	export let onMediaClick: (idPair: ArticleIdPair, index: number) => number
	export let onLogData: () => void
	export let onLogJSON: () => void

	let minimized = false
	const isArticleRepost = articleProps.type === 'reposts'

	function onUsernameClick(clickedArticle: Article) {
		if (!clickedArticle.author)
			return

		const data = newUserTimeline(clickedArticle.idPair.service, clickedArticle.author)
		if (!data)
			return

		timelineProps.setModalTimeline(data)
	}
</script>

<style lang='sass'>
	@use '../../styles/variables' as *

	.socialArticle
		padding: 1rem
		margin-bottom: 2px

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

	p.articleParagraph
		white-space: pre-line
		overflow-wrap: anywhere

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
</style>

<div class='socialArticle'>
	<div class='repostLabel'>
		{#if isArticleRepost && rootArticle.author}
			<a href={rootArticle.author.url} target='_blank' on:click|preventDefault={() => onUsernameClick(rootArticle)}>
				{#if articleProps.reposts.length > 1}
					{articleProps.reposts.map(r => r.author.name).join(', ')} reposted - {shortTimestamp(rootArticle.creationTime)}
				{:else}
					{rootArticle.author.name} reposted - {shortTimestamp(rootArticle.creationTime)}
				{/if}
			</a>
		{/if}
	</div>
	<!--{ self.view_reply_label(ctx) }-->
	<div class='media'>
		<div class='media-left'>
			{#if actualArticle.author?.avatarUrl}
				<figure class='image is-64x64' class:sharedAvatar={isArticleRepost}>
					{#if isArticleRepost}
						<img src={actualArticle.author.avatarUrl} alt={`${actualArticle.author.username}'s avatar`}/>
						<img src={rootArticle.author.avatarUrl} alt={`${rootArticle.author.username}'s avatar`}/>
					{:else}
						<img src={actualArticle.author.avatarUrl} alt={`${actualArticle.author.username}'s avatar`}/>
					{/if}
				</figure>
			{/if}
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
						<Timestamp date={actualArticle.creationTime}/>
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
			{#if articleProps.type === 'quote'}
				{@const quoted = articleProps.quoted.article}
				<div class='quotedPost'>
					<div class='articleHeader'>
						<a class='names' href={quoted.author.url} target='_blank'>
							<strong>{ quoted.author.name }</strong>
							<small>{ `@${quoted.author.username}` }</small>
						</a>
						<Timestamp date={quoted.creationTime}/>
					</div>
					{#if !(minimized || articleProps.quoted.filteredOut)}
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
							bind:showAllMedia
							article={quoted}
							{timelineProps}
							onMediaClick={index => onMediaClick(actualArticle.idPair, index)}
						/>
					{/if}
					<SocialNav
						article={quoted}
						isQuoted={true}
						{timelineProps}
						{modal}
						{onLogData}
						{onLogJSON}
					/>
				</div>
			{/if}
			<SocialNav
				article={actualArticle}
				bind:modal
				{timelineProps}
				repost={isArticleRepost ? rootArticle : undefined}
				{onLogData}
				{onLogJSON}
			/>
		</div>
	</div>
	{#if actualArticle.medias.length && !minimized}
		<SocialMedia
			bind:showAllMedia
			article={actualArticle}
			{timelineProps}
			onMediaClick={index => onMediaClick(actualArticle.idPair, index)}
		/>
	{/if}
</div>