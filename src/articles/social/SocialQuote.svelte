<script lang='ts'>
	import Article, {type ArticleIdPair, type TimelineArticleProps} from '../index';
	import Timestamp from './Timestamp.svelte';
	import SocialNav from './SocialNav.svelte';
	import SocialMedia from './SocialMedia.svelte';
	import {getReadableArticle} from '~/services/service';
	import {type Readable} from 'svelte/store';
	import {LoadingState, loadingStore} from '~/bufferedMediaLoading';
	import {tick} from 'svelte';

	let {
		idPair,
		timelineProps,
		filteredOut,
		modal,
		compact = $bindable(),
		onMediaClick,
		onLogData,
		onLogJSON,
	}: {
		idPair: ArticleIdPair
		timelineProps: TimelineArticleProps
		filteredOut: boolean
		modal: boolean
		compact: boolean | null
		onMediaClick: (idPair: ArticleIdPair, index: number) => void
		onLogData: () => void
		onLogJSON: () => void
	} = $props();

	let article: Readable<Article> = getReadableArticle(idPair);

	let showAllMediaArticles = $derived(timelineProps.showAllMediaArticles);
	let showAllMedia = $derived($showAllMediaArticles.has($article.idPairStr));

	let loadingStates: Record<number, LoadingState> = $state({});
	tick().then(() => {
		loadingStates = [];
		for (let mediaIndex = 0; mediaIndex < Math.min($article.medias.length, !showAllMedia && timelineProps.maxMediaCount !== null ? timelineProps.maxMediaCount : Infinity); ++mediaIndex)
			loadingStates[mediaIndex] = loadingStore.getLoadingState($article.idPair, mediaIndex, timelineProps.shouldLoadMedia);
	});
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
	/*Timestamp*/
	.quotedPost :global(span *) {
		vertical-align: middle;
	}
	.quotedPost p {
		white-space: pre-line;
	}
</style>

<div class='quotedPost'>
	<div class='articleHeader'>
		{#if $article.author}
			<a class='names' href={$article.author.url} target='_blank' rel='noreferrer'>
				<strong>{ $article.author.name }</strong>
				<small>{ `@${$article.author.username}` }</small>
			</a>
		{/if}
		{#if $article.creationTime !== undefined}
			<Timestamp date={$article.creationTime}/>
		{/if}
	</div>

	{#if !filteredOut}
		{#if !timelineProps.hideText}
			<p class='refArticleParagraph'>
				{#if $article.textHtml !== undefined}
					<!--eslint-disable-next-line svelte/no-at-html-tags-->
					{@html $article.textHtml}
				{:else if $article.text !== undefined}
					{$article.text}
				{/if}
			</p>
		{/if}
		{#if !timelineProps.hideQuoteMedia && $article.medias.length}
			<SocialMedia
					{idPair}
					{timelineProps}
					onMediaClick={index => onMediaClick($article.idPair, index)}
					{compact}
					{loadingStates}
			/>
		{/if}
	{/if}
	<SocialNav
			{idPair}
			isQuoted={true}
			{timelineProps}
			{modal}
			{onLogData}
			{onLogJSON}
			bind:compact
	/>
</div>