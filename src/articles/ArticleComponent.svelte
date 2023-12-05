<script lang='ts'>
	import type {ArticleIdPair} from "./index"
	import {toggleMarkAsRead} from "../services/service"
	import Article, {getActualArticle} from '../articles'
	import type {ArticleProps, TimelineArticleProps} from './index'
	import type {SvelteComponent} from 'svelte'
	import {getContext} from 'svelte'
	import {getRootArticle} from './index'
	import Modal from '../Modal.svelte'

	let {
		articleProps,
		timelineProps,
		view,
		style,
	} = $props<{
		articleProps: ArticleProps,
		timelineProps: TimelineArticleProps,
		view: new (...args: any[]) => SvelteComponent,
		style: string,
	}>();

	let modal = $state(false);
	let showAllMedia = $state(false);

	const isInjected = getContext('isInjected') as boolean

	let rootArticle: Readonly<Article>
	let actualArticle: Readonly<Article>
	$effect(() => {
		rootArticle = getRootArticle(articleProps)
		actualArticle = getActualArticle(articleProps)
	});

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
		toggleMarkAsRead(idPair)
	}
</script>

<style>
	article {
		background-color: var(--scheme-main-bis);
	}

	article.transparent {
		opacity: 20%;
	}

	:global(.modal .modal-content) {
		width: 75%;
	}
</style>

{#if modal}
<!-- TODO Find way to get specific parent soshalthing -->
	<Modal bind:active={modal} mountElement={document.getElementsByClassName('soshalthing')[0]}>
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