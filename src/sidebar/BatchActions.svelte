<script lang='ts'>
	//TODO Fix opening BatchActions? (Cannot read properties of undefined (reading 'articles'))
	import FiltersOptions from "../filters/FiltersOptions.svelte"
	import {type FilterInstance, useFilters} from '../filters'
	import {getWritable} from '../services/service'
	import type {TimelineCollection} from '../timelines'
	import {derived, type Readable, type Writable} from 'svelte/store'
	import Article, {
		type ArticleIdPair,
		type ArticleWithRefs, deriveArticleRefs, getDerivedArticleWithRefs, getRootArticle,
	} from '../articles'
	import {articleAction, STANDARD_ACTIONS} from '../services/actions'

	export let timelines: TimelineCollection
	export let filterInstances: FilterInstance[]

	//TODO Use timeline ids instead of indices?
	let timelineIndex: number = 0
	let action = STANDARD_ACTIONS.markAsRead.key
	let onlyListedArticles = true

	let articleIdPairs: Writable<ArticleIdPair[]> = timelines[timelineIndex].articles

	let articles: Readable<Article[]>
	$: articles = derived($articleIdPairs.map(getWritable), a => a)

	let articlesWithRefs: Readable<ArticleWithRefs[]>
	$: articlesWithRefs = derived($articles.map(deriveArticleRefs), a => a.map(getDerivedArticleWithRefs))

	let filteredArticles: Readable<ArticleWithRefs[]>
	$: filteredArticles = derived(
		articlesWithRefs,
		articlesWithRefs => useFilters(articlesWithRefs, [
			...filterInstances,
			...(onlyListedArticles ? timelines[timelineIndex].filters : [])
		])
	)

	function doAction() {
		for (const articleWithRefs of $filteredArticles) {
			articleAction(action, getRootArticle(articleWithRefs).idPair)
		}
	}
</script>

<label class='field'>
	Timeline
	<select bind:value={timelineIndex}>
		{#each Object.values(timelines) as t, index}
			<option value={index}>{t.title}</option>
		{/each}
	</select>
</label>

<div class='block'>
	<FiltersOptions timelineId={null} bind:instances={filterInstances}/>
</div>

<label class='field'>
	<input type='checkbox' bind:checked={onlyListedArticles}/>
	Only shown articles
</label>

<label class='field'>
	Action
	<select bind:value={action}>
		{#each [...Object.keys(STANDARD_ACTIONS)] as action}
			<option value={action}>{action}</option>
		{/each}
	</select>
</label>

<button on:click={doAction}>Do Action</button>