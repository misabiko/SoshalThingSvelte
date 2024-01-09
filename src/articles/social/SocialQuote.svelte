<script lang='ts'>
	import Article, {type ArticleIdPair, type ArticleProps, getRootArticle, type TimelineArticleProps} from '../index';
	import Timestamp from './Timestamp.svelte';
	import SocialNav from './SocialNav.svelte';
	import SocialMedia from './SocialMedia.svelte';

	export let articleProps: ArticleProps;
	export let timelineProps: TimelineArticleProps;
	export let modal: boolean;
	export let showAllMedia: boolean;
	export let compact: boolean | null;
	export let onMediaClick: (idPair: ArticleIdPair, index: number) => number;
	export let onLogData: () => void;
	export let onLogJSON: () => void;

	let article: Article;
	$: article = getRootArticle(articleProps);
</script>

<style>
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

<div class='quotedPost'>
	<div class='articleHeader'>
		{#if article.author}
			<a class='names' href={article.author.url} target='_blank' rel='noreferrer'>
				<strong>{ article.author.name }</strong>
				<small>{ `@${article.author.username}` }</small>
			</a>
		{/if}
		{#if article.creationTime !== undefined}
			<Timestamp date={article.creationTime}/>
		{/if}
	</div>

	{#if !articleProps.filteredOut}
		{#if !timelineProps.hideText}
			<p class='refArticleParagraph'>
				{#if article.textHtml !== undefined}
					<!--eslint-disable-next-line svelte/no-at-html-tags-->
					{@html article.textHtml}
				{:else if article.text !== undefined}
					{article.text}
				{/if}
			</p>
		{/if}
		{#if !timelineProps.hideQuoteMedia}
			<SocialMedia
					bind:showAllMedia
					article={article}
					{timelineProps}
					onMediaClick={index => onMediaClick(article.idPair, index)}
					{compact}
			/>
		{/if}
	{/if}
	<SocialNav
			{article}
			isQuoted={true}
			{timelineProps}
			{modal}
			{onLogData}
			{onLogJSON}
			bind:compact
	/>
</div>