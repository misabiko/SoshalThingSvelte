<script lang='ts'>
	import type {ArticleIdPair, ArticleRefIdPair, ArticleWithRefs} from "../services/article"
	import {toggleMarkAsRead, getWritable, fetchArticle} from "../services/service"
	import Article, {ArticleRefType, getActualArticle} from '../services/article'
	import type {ArticleProps} from './index'
	import type {SvelteComponent} from 'svelte'

	export let articleWithRefs: ArticleWithRefs
	export let props: ArticleProps
	export let view: typeof SvelteComponent
	export let modal = false
	export let style = ''

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

<svelte:component
	this={view}
	{props}
	{modal}
	{articleWithRefs}
	{actualArticle}
	on:logData={onLogData}
	on:mediaClick={onMediaClick}
/>