<script lang='ts'>
	import type {Writable} from 'svelte/store'
	import type {ArticleIdPair, ArticleRefIdPair} from "../services/article"
	import {toggleMarkAsRead, getWritable, fetchArticle} from "../services/service"
	import Article, {ArticleRefType} from '../services/article'
	import {derived} from 'svelte/store'

	export let idPair: ArticleIdPair
	export let view
	export let style = ''
	export let animatedAsGifs
	export let compact
	export let hideText
	export let shouldLoadMedia: boolean

	let article: Writable<Article> = getWritable(idPair)
	let actualArticle = derived(
		[
			article,
			getRepostedStore($article.actualArticleRef),
		]
			.filter(store => store !== undefined),
		([a, ref]) => ref === undefined ? a : ref,
	)

	function getRepostedStore(ref?: ArticleRefIdPair): Writable<Article> | undefined {
		if (ref !== undefined && (ref.type === ArticleRefType.Repost || ref.type === ArticleRefType.QuoteRepost))
			return getWritable(ref.reposted)
		else
			return undefined
	}

	function onMediaClick(event: { detail: { idPair: ArticleIdPair, index: number } }) {
		toggleMarkAsRead(event.detail.idPair)
	}

	if (!$actualArticle.fetched)
		fetchArticle($actualArticle.idPair)
</script>

<svelte:component
	this={view}
	article={$article}
	actualArticle={$actualArticle}
	{style}
	{animatedAsGifs}
	on:mediaClick={onMediaClick}
	{hideText}
	{compact}
	{shouldLoadMedia}
/>