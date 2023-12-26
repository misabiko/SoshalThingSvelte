<script lang='ts'>
	import type Article from '../../articles';
	import type {ArticleIdPair} from '../index'
	import type {ArticleProps, TimelineArticleProps} from '../index'
	import {shortTimestamp} from "../index";
	import SocialMedia from "./SocialMedia.svelte";
	import SocialNav from "./SocialNav.svelte";
	import Timestamp from "./Timestamp.svelte";
	import {newUserTimeline} from '../../timelines'
	import {LoadingState} from '../../bufferedMediaLoading';
	import {getWritable} from '../../services/service';
	import {get} from 'svelte/store';

	export let timelineProps: TimelineArticleProps
	export let articleProps: ArticleProps
	export let modal: boolean; modal;
	export let showAllMedia: boolean;
	export let rootArticle: Readonly<Article>
	export let actualArticle: Readonly<Article>
	export let onMediaClick: (idPair: ArticleIdPair, index: number) => number
	export let onLogData: () => void
	export let onLogJSON: () => void

	export let divRef: HTMLDivElement | null;
	export let mediaRefs: HTMLImageElement[];
	export let loadingStates: LoadingState[];

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

<style>
	.socialArticle {
		padding: 1rem;
		margin-bottom: 2px;
	}
	.socialArticle :global(.dropdown-trigger .articleButton){
		width: 24px;
		height: unset;
	}

	.socialArticle :global(i), :global(svg) {
		color: var(--white-ter);
	}

	.media {
		display: flex;
		align-items: flex-start;
	}

	.media-content {
		flex-grow: 1;
	}

	.avatar {
		width: 64px;
		min-width: 64px;
		height: 64px;
		margin: 0 1rem 0 0;
	}

	.avatar img:first-child {
		width: 100%;
		height: auto;
	}

	figure {
		overflow: hidden;
		border-radius: 4px;
	}
	figure.sharedAvatar {
		position: relative;
	}
	figure.sharedAvatar img:first-child {
		position: absolute;
		width: 85%;
	}
	figure.sharedAvatar img:last-child {
		position: absolute;
		width: 40%;
		bottom: 0;
		right: 0;
	}

	.articleHeader * {
		vertical-align: middle;
	}
	.articleHeader * small {
		color: var(--light);
	}

	.names {
		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;
		display: inline-block;
		max-width: 300px;
		text-decoration: none;
	}
	.names strong {
		margin-right: 0.5rem;
		color: var(--white-ter);
	}
	.names:hover > * {
		text-decoration: underline;
	}

	p.articleParagraph {
		white-space: pre-line;
		overflow-wrap: anywhere;
		padding: 0.5rem 0;
		margin-block-start: 0;
		margin-block-end: 0;
	}

	/* , .replyLabel */
	.repostLabel {
		margin-left: 64px;
		color: var(--light);
		font-size: smaller;
	}
	.repostLabel a {
		margin-left: 1rem;
		color: var(--light);
		text-decoration: none;
	}

	.repostLabel a:hover {
		text-decoration: underline;
	}

	.quotedPost {
		border: 2px solid var(--scheme-main-ter);
		border-radius: 6px;
		padding: 16px;
	}
	.quotedPost .names {
		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;
		display: inline-block;
		max-width: 300px;
	}
	.quotedPost .names strong {
		margin-right: 0.5rem;
		color: var(--white-ter);
	}
	.quotedPost .names:hover > * {
		text-decoration: underline;
	}
	.quotedPost span * {
		vertical-align: middle;
	}
	.quotedPost p {
		white-space: pre-line;
	}
</style>

<div class='socialArticle'>
	<div class='repostLabel'>
		{#if isArticleRepost && rootArticle.author}
			<a href={rootArticle.author.url} target='_blank' rel='noreferrer' on:click|preventDefault={() => onUsernameClick(rootArticle)}>
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
		{#if actualArticle.author?.avatarUrl}
			<figure class='avatar' class:sharedAvatar={isArticleRepost}>
				{#if isArticleRepost}
					<img src={actualArticle.author.avatarUrl} alt={`${actualArticle.author.username}'s avatar`}/>
					<img src={rootArticle.author.avatarUrl} alt={`${rootArticle.author.username}'s avatar`}/>
				{:else}
					<img src={actualArticle.author.avatarUrl} alt={`${actualArticle.author.username}'s avatar`}/>
				{/if}
			</figure>
		{/if}
		<div class='media-content'>
			<div class='content'>
				<div class='articleHeader'>
					<a
						class='names'
						href={actualArticle.author?.url}
						target='_blank'
						rel='noreferrer'
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
						{#if actualArticle.textHtml !== undefined}
							{@html actualArticle.textHtml}
						{:else if actualArticle.text !== undefined}
							{actualArticle.text}
						{/if}
					</p>
				{/if}
			</div>
			{#if actualArticle.actualArticleRef?.type === 'quote'}
				{@const quoted = get(getWritable(actualArticle.actualArticleRef.quoted))}
				<div class='quotedPost'>
					<div class='articleHeader'>
						<a class='names' href={quoted.author.url} target='_blank' rel='noreferrer'>
							<strong>{ quoted.author.name }</strong>
							<small>{ `@${quoted.author.username}` }</small>
						</a>
						<Timestamp date={quoted.creationTime}/>
					</div>
					{#if !minimized}<!--&& !actualArticleProps.quoted.filteredOut-->
						{#if !timelineProps.hideText}
							<p class='refArticleParagraph'>
								{#if quoted.textHtml !== undefined}
									{@html quoted.textHtml}
								{:else if quoted.text !== undefined}
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
			bind:divRef
			bind:mediaRefs
			bind:loadingStates
		/>
	{/if}
</div>