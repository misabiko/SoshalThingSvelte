<script lang='ts'>
	import Article from '../../services/article'
	import type {ArticleIdPair} from '../../services/article'
	import type {ArticleProps, TimelineArticleProps} from '../index'
	import {shortTimestamp} from "../index";
	import SocialMedia from "./SocialMedia.svelte";
	import SocialNav from "./SocialNav.svelte";
	import Timestamp from "./Timestamp.svelte";
	import {defaultFilterInstances} from '../../filters'
	import {getServices} from '../../services/service'
	import MasonryContainer from '../../containers/MasonryContainer.svelte'
	import {everyRefreshType} from '../../services/endpoints'

	export let timelineProps: TimelineArticleProps
	export let articleProps: ArticleProps
	export let modal: boolean; modal;
	export let actualArticle: Readonly<Article>
	export let onMediaClick: (idPair: ArticleIdPair, index: number) => number
	export let onLogData: () => void
	export let onLogJSON: () => void

	let minimized = false
	const isArticleRepost = articleProps.actualArticleRef && 'reposted' in articleProps.actualArticleRef

	function onUsernameClick(clickedArticle: Article) {
		const username = clickedArticle.author?.username
		const endpointConstructor = getServices()[clickedArticle.idPair.service].userEndpoint
		if (!username || !endpointConstructor)
			return

		timelineProps.setModalTimeline({
			title: username,
			endpoints: [{
				endpoint: endpointConstructor(username),
				refreshTypes: everyRefreshType,
				filters: [],
			}],
			filters: [
				...defaultFilterInstances,
				{
					filter: {type: 'media'},
					enabled: true,
					inverted: false,
				},
				{
					filter: {type: 'noRef'},
					enabled: true,
					inverted: false,
				}
			],
			container: MasonryContainer,
			columnCount: 3,
		})
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
			{#if articleProps.actualArticleRef?.quoted}
				{@const quoted = articleProps.actualArticleRef.quoted}
				<div class='quotedPost'>
					<div class='articleHeader'>
						<a class='names' href={quoted.author.url} target='_blank'>
							<strong>{ quoted.author.name }</strong>
							<small>{ `@${quoted.author.username}` }</small>
						</a>
						<Timestamp date={quoted.creationTime}/>
					</div>
					{#if !(minimized || quoted.markedAsRead || quoted.hidden)} <!--	TODO Filter from timeline-->
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
				repost={isArticleRepost ? articleProps.article : undefined}
				{onLogData}
				{onLogJSON}
			/>
		</div>
	</div>
	{#if actualArticle.medias.length && !minimized}
		<SocialMedia
			article={actualArticle}
			{timelineProps}
			onMediaClick={index => onMediaClick(actualArticle.idPair, index)}
		/>
	{/if}
</div>