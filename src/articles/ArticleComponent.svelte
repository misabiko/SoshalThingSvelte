<script lang='ts'>
	import type {ArticleIdPair} from "./index"
	import {toggleMarkAsRead} from "../services/service"
	import Article, {getActualArticle} from '../articles'
	import type {ArticleProps, TimelineArticleProps} from './index'
	import type {SvelteComponent} from 'svelte'
	import {Modal} from 'svelma'
	import {getContext} from 'svelte'
	import {getRootArticle} from './index'

	export let articleProps: ArticleProps
	export let timelineProps: TimelineArticleProps
	export let view: typeof SvelteComponent
	export let style = ''; style;
	let modal = false
	let showAllMedia = false

	const isInjected = getContext('isInjected') as boolean

	let rootArticle: Readonly<Article>
	let actualArticle: Readonly<Article>
	$: {
		rootArticle = getRootArticle(articleProps)
		actualArticle = getActualArticle(articleProps)
	}

	function onLogData() {
		console.dir(articleProps)
	}

	function onLogJSON() {
		switch (articleProps.type) {
			case 'normal':
				console.dir({
					...articleProps,
					article: articleProps.article.rawSource,
				})
				break;
			case 'reposts':
				console.dir({
					...articleProps,
					reposted: getRootArticle(articleProps.reposted).rawSource
				})
				break;
			case 'quote':
				console.dir({
					article: getRootArticle(articleProps).rawSource,
					quoted: getRootArticle(articleProps.quoted).rawSource
				})
				break;
		}
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
				{rootArticle}
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
		{rootArticle}
		{actualArticle}
		{onLogData}
		{onLogJSON}
		{onMediaClick}
	/>
</article>