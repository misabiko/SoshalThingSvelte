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
	@use '../styles/variables' as *

	article
		background-color: $scheme-main-bis

	article.transparent
		opacity: 20%

	:global(.modal .modal-content)
		width: 75%
</style>

{#if modal}
	<Modal bind:active={modal}>
		<article class:transparent={articleProps.filteredOut}>
			<svelte:component
				this={view}
				{timelineProps}
				bind:modal
				{articleProps}
				{actualArticle}
				on:logData={onLogData}
				on:mediaClick={onMediaClick}
			/>
		</article>
	</Modal>
{/if}

<article class={articleProps.filteredOut ? 'transparent' : ''} {style}>
	<svelte:component
		this={view}
		{timelineProps}
		bind:modal
		{articleProps}
		{actualArticle}
		on:logData={onLogData}
		on:logJSON={onLogJSON}
		on:mediaClick={onMediaClick}
	/>
</article>