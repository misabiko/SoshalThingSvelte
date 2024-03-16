<script lang='ts'>
	import Article, {type ArticleIdPair, type TimelineArticleProps} from '../index';
	import Timestamp from './Timestamp.svelte';
	import SocialNav from './SocialNav.svelte';
	import SocialMedia from './SocialMedia.svelte';
	import {getReadable} from '~/services/service';
	import {derived, type Readable, writable, type Writable} from 'svelte/store';
	import {LoadingState, loadingStore} from '~/bufferedMediaLoading';

	export let idPair: ArticleIdPair;
	export let timelineProps: TimelineArticleProps;
	export let filteredOut: boolean;
	export let modal: boolean;
	export let compact: boolean | null;
	export let onMediaClick: (idPair: ArticleIdPair, index: number) => number;
	export let onLogData: () => void;
	export let onLogJSON: () => void;

	let article: Readable<Article> = getReadable(idPair);

	let showAllMedia = derived(timelineProps.showAllMediaArticles, articles => articles.has($article.idPairStr));

	let loadingStates: Writable<Record<number, LoadingState>> = writable({});
	$: {
		$loadingStates = [];
		for (let mediaIndex = 0; mediaIndex < Math.min($article.medias.length, !$showAllMedia && timelineProps.maxMediaCount !== null ? timelineProps.maxMediaCount : Infinity); ++mediaIndex)
			$loadingStates[mediaIndex] = loadingStore.getLoadingState($article.idPair, mediaIndex, timelineProps.shouldLoadMedia);
	}
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
					onMediaClick='{index => onMediaClick($article.idPair, index)}'
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