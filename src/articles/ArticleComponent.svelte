<script lang='ts'>
	import type {ArticleIdPair} from "../services/article"
	import {toggleMarkAsRead} from "../services/service"
	import Article, {getActualArticle} from '../services/article'
	import type {ArticleProps, TimelineArticleProps} from './index'
	import type {SvelteComponent} from 'svelte'
	//TODO Add type defs to svelma
	import {Modal} from 'svelma'
	import {getContext} from 'svelte'

	export let articleProps: ArticleProps
	export let timelineProps: TimelineArticleProps
	export let view: typeof SvelteComponent
	export let style = ''; style;
	let modal = false
	let showAllMedia = false

	const isInjected = getContext('isInjected') as boolean

	let actualArticle: Readonly<Article>
	$: actualArticle = getActualArticle(articleProps)

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

	function onMediaClick(idPair: ArticleIdPair, _index: number) {
		//TODO Option for timeline local marked as read
		toggleMarkAsRead(idPair)
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
	<Modal bind:active={modal} onBody={!isInjected}>
		<article class:transparent={articleProps.filteredOut}>
			<svelte:component
				this={view}
				{timelineProps}
				bind:modal
				bind:showAllMedia
				{articleProps}
				{actualArticle}
				{onLogData}
				{onLogJSON}
				{onMediaClick}
			/>
		</article>
	</Modal>
{/if}

<article class={articleProps.filteredOut ? 'transparent' : ''} {style}>
	<svelte:component
		this={view}
		{timelineProps}
		bind:modal
		bind:showAllMedia
		{articleProps}
		{actualArticle}
		{onLogData}
		{onLogJSON}
		{onMediaClick}
	/>
</article>