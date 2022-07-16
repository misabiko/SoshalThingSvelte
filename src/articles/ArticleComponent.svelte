<script lang='ts'>
	import type {ArticleIdPair, ArticleRefIdPair, ArticleWithRefs} from "../services/article"
	import {toggleMarkAsRead, getWritable, fetchArticle} from "../services/service"
	import Article, {ArticleRefType, getActualArticle} from '../services/article'
	import type {ArticleProps} from './index'
	import type {SvelteComponent} from 'svelte'
	import {Modal} from 'svelma'

	export let articleWithRefs: ArticleWithRefs
	export let props: ArticleProps
	export let view: typeof SvelteComponent
	export let modal = false
	export let style = ''; style;

	let actualArticle: Readonly<Article>
	$: {
		actualArticle = getActualArticle(articleWithRefs)
		if (!actualArticle.fetched)
			fetchArticle(actualArticle.idPair)
	}

	function onLogData() {
		console.dir(articleWithRefs)
	}

	function onMediaClick(event: { detail: { idPair: ArticleIdPair, index: number } }) {
		toggleMarkAsRead(event.detail.idPair)
	}
</script>

<style lang='sass'>
	:global(.modal .modal-content)
		width: 75%
</style>

{#if modal}
	<Modal bind:active={modal}>
		<svelte:component
			this={view}
			{props}
			bind:modal
			{articleWithRefs}
			{actualArticle}
			on:logData={onLogData}
			on:mediaClick={onMediaClick}
		/>
	</Modal>
{/if}

<svelte:component
	this={view}
	{props}
	bind:modal
	{articleWithRefs}
	{actualArticle}
	on:logData={onLogData}
	on:mediaClick={onMediaClick}
/>