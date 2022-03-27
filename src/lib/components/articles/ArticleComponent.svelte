<script lang='ts'>
	import type {Writable} from 'svelte/store'
	import type {ArticleIdPair, ArticleRefIdPair} from "../../services/article"
	import {toggleMarkAsRead, articleAction, getWritable} from "../../services/service"
	import Article, {ArticleRefType} from '../../services/article'
	import {derived} from 'svelte/store'

	export let idPair: ArticleIdPair
	export let view
	export let style: string
	export let animatedAsGifs
	export let socialSettings

	let article: Writable<Article> = getWritable(idPair)
	let actualArticle = derived(
		[
			article,
			getRepostedStore($article.articleRefs[0]),
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

	function onMediaClick(event: { detail: number }) {
		toggleMarkAsRead(idPair)
	}

	function onArticleAction(event: { detail: string }) {
		articleAction(event.detail, idPair)
	}
</script>

<svelte:component
	this={view}
	article={$article}
	actualArticle={$actualArticle}
	{style}
	{animatedAsGifs}
	on:mediaClick={onMediaClick}
	on:action={onArticleAction}
	{...socialSettings}
/>