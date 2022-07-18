<script lang='ts'>
	import type {ArticleIdPair} from "../services/article"
	import {toggleMarkAsRead, fetchArticle} from "../services/service"
	import Article, {getActualArticle} from '../services/article'
	import type {ArticleProps, TimelineArticleProps} from './index'
	import type {SvelteComponent} from 'svelte'
	//TODO Add type defs to svelma
	import {Modal} from 'svelma'

	export let articleProps: ArticleProps
	export let timelineProps: TimelineArticleProps
	export let view: typeof SvelteComponent
	export let modal = false
	export let style = ''; style;

	let actualArticle: Readonly<Article>
	$: {
		actualArticle = getActualArticle(articleProps)
		if (!actualArticle.fetched)
			fetchArticle(actualArticle.idPair)
	}

	function onLogData() {
		console.dir(articleProps)
	}

	function onLogJSON() {
		console.dir({
			article: articleProps.article.json,
			actualArticleRef: {
				reposted: (articleProps.actualArticleRef as {reposted?: Article})?.reposted?.json,
				quoted: (articleProps.actualArticleRef as {quoted?: Article})?.quoted?.json,
			},
			replyRef: articleProps.replyRef?.json,
		})
	}

	function onMediaClick(event: { detail: { idPair: ArticleIdPair, index: number } }) {
		toggleMarkAsRead(event.detail.idPair)
	}
</script>

<style lang='sass'>
	:global(.modal .modal-content)
		width: 75%

	:global(article.transparent)
		opacity: 20%
</style>

{#if modal}
	<Modal bind:active={modal}>
		<svelte:component
			this={view}
			{timelineProps}
			{style}
			bind:modal
			{articleProps}
			{actualArticle}
			on:logData={onLogData}
			on:mediaClick={onMediaClick}
		/>
	</Modal>
{/if}

<svelte:component
	this={view}
	{timelineProps}
	{style}
	bind:modal
	{articleProps}
	{actualArticle}
	on:logData={onLogData}
	on:logJSON={onLogJSON}
	on:mediaClick={onMediaClick}
	classNames={articleProps.filteredOut ? 'transparent' : ''}
/>