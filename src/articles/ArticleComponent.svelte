<script lang='ts'>
	import type {ArticleIdPair, ArticleRefIdPair, ArticleWithRefs} from "../services/article"
	import {toggleMarkAsRead, getWritable, fetchArticle} from "../services/service"
	import Article, {ArticleRefType, getActualArticle} from '../services/article'
	import {SvelteComponent} from 'svelte'

	export let articleWithRefs: Readonly<ArticleWithRefs>
	export let view: SvelteComponent
	export let style = ''
	export let animatedAsGifs: boolean
	export let compact: boolean
	export let hideText: boolean
	export let shouldLoadMedia: boolean

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
	{articleWithRefs}
	{actualArticle}
	{style}
	{animatedAsGifs}
	on:logData={onLogData}
	on:mediaClick={onMediaClick}
	{hideText}
	{compact}
	{shouldLoadMedia}
/>