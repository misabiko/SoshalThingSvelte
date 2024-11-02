<script lang='ts'>
	import Article, {getRootArticle} from '~/articles';
	import type {ArticleViewProps} from '../index';
	import type {ArticleProps} from '../index';
	import {shortTimestamp} from '../index';
	import SocialMedia from './SocialMedia.svelte';
	import SocialNav from './SocialNav.svelte';
	import Timestamp from './Timestamp.svelte';
	import {newUserTimeline} from '~/timelines';
	import SocialQuote from '~/articles/social/SocialQuote.svelte';

	let {
		timelineProps,
		articleProps,
		actualArticleProps,
		modal = $bindable(),
		rootArticle,
		actualArticle,
		onMediaClick,
		onLogData,
		onLogJSON,

		divRef = $bindable(),
		mediaRefs = $bindable(),
		loadingStates = $bindable(),
	}: ArticleViewProps = $props();

	//TODO Propagate article compact to the timeline
	let compact: boolean | null = $state(null);
	let quoteCompact: boolean | null = $state(null);

	let quoted: ArticleProps | null = $derived(
		actualArticleProps.type === 'quote'
			? actualArticleProps.quoted
			: null,
	);

	function onUsernameClick(clickedArticle: Article) {
		if (!clickedArticle.author)
			return;

		const data = newUserTimeline(clickedArticle.idPair.service, clickedArticle.author);
		if (!data)
			return;

		timelineProps.setModalTimeline(data);
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
</style>

<div class='socialArticle'>
	<div class='repostLabel'>
		{#if articleProps.type === 'reposts' && rootArticle.author}
			{@const timestamp = rootArticle.creationTime && (' - ' + shortTimestamp(rootArticle.creationTime))}
			<a href={rootArticle.author.url} target='_blank' rel='noreferrer' onclick={e => {e.preventDefault(); onUsernameClick(rootArticle);}}>
				{#if articleProps.reposts.length > 1}
					{articleProps.reposts.map(r => r.author?.name).filter(n => n).join(', ')} reposted{timestamp}
				{:else}
					{rootArticle.author.name} reposted{timestamp}
				{/if}
			</a>
		{/if}
	</div>
	<!--{ self.view_reply_label(ctx) }-->
	<div class='media'>
		{#if actualArticle.author?.avatarUrl}
			<figure class='avatar' class:sharedAvatar={articleProps.type === 'reposts'}>
				{#if articleProps.type === 'reposts' && rootArticle.author}
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
						onclick={e => {e.preventDefault(); onUsernameClick(actualArticle);}}
					>
						<strong>{ actualArticle.author?.name }</strong>
						<small>@{ actualArticle.author?.username }</small>
					</a>
					{#if actualArticle.creationTime !== undefined}
						<Timestamp date={actualArticle.creationTime}/>
					{/if}
				</div>
				{#if !timelineProps.hideText}
					<p class='articleParagraph'>
						{#if actualArticle.textHtml !== undefined}
							<!--eslint-disable-next-line svelte/no-at-html-tags-->
							{@html actualArticle.textHtml}
						{:else if actualArticle.text !== undefined}
							{actualArticle.text}
						{/if}
					</p>
				{/if}
			</div>
			{#if quoted !== null}
				<SocialQuote
					idPair={getRootArticle(quoted).idPair}
					{timelineProps}
					filteredOut={quoted.filteredOut}
					{modal}
					bind:compact={quoteCompact}
					{onMediaClick}
					{onLogData}
					{onLogJSON}
				/>
			{/if}
			<SocialNav
				idPair={actualArticle.idPair}
				bind:modal
				{timelineProps}
				repost={articleProps.type === 'reposts' ? rootArticle : undefined}
				{onLogData}
				{onLogJSON}
				bind:compact
			/>
		</div>
	</div>
	{#if actualArticle.medias.length}
		<SocialMedia
			idPair={actualArticle.idPair}
			mediaIndex={actualArticleProps.mediaIndex}
			{timelineProps}
			onMediaClick={index => onMediaClick(actualArticle.idPair, index)}
			bind:divRef
			bind:mediaRefs
			{loadingStates}
			{compact}
		/>
	{/if}
</div>