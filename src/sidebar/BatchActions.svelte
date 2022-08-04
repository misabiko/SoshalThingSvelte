<script lang='ts'>
	import {Button, Field, Select, Switch} from 'svelma'
	import FiltersOptions from "../filters/FiltersOptions.svelte"
	import {type FilterInstance, useFilters} from '../filters'
	import {getWritable} from '../services/service'
	import {type TimelineData} from '../timelines'
	import {derived, type Readable, type Writable} from 'svelte/store'
	import Article, {
		type ArticleIdPair,
		type ArticleWithRefs, deriveArticleRefs, getDerivedArticleWithRefs, getRootArticle,
	} from '../articles'
	import {articleAction, STANDARD_ACTIONS} from '../services/actions'

	export let timelines: TimelineData[]
	export let filterInstances: FilterInstance[]

	let timelineIndex: number = 0
	let action = STANDARD_ACTIONS.markAsRead
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

<Field label='Timeline'>
	<Select bind:selected={timelineIndex} nativeSize={0}>
		{#each timelines as t, index}
			<option value={index}>{t.title}</option>
		{/each}
	</Select>
</Field>
<div class='block'>
	<FiltersOptions bind:instances={filterInstances}/>
</div>
<Field label='Only shown articles'>
	<Switch bind:checked={onlyListedArticles}/>
</Field>
<Field label='Action'>
	<Select bind:selected={action} nativeSize={0}>
		{#each [...Object.keys(STANDARD_ACTIONS)] as action}
			<option value={action}>{action}</option>
		{/each}
	</Select>
</Field>
<Button on:click={doAction}>Do Action</Button>