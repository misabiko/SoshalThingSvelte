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

	let {
		timelines,
		filterInstances,
	} = $props<{
		timelines: TimelineCollection,
		filterInstances: FilterInstance[],
	}>();

	//TODO Use timeline ids instead of indices?
	let timelineIndex = $state(0);
	let action = $state(STANDARD_ACTIONS.markAsRead.key);
	let onlyListedArticles = $state(true);

	let articleIdPairs = $state<Writable<ArticleIdPair[]>>(timelines[timelineIndex].articles);

	let articles = $state<Readable<Article[]>>();
	$effect(() => { articles = derived($articleIdPairs.map(getWritable), a => a); });

	let articlesWithRefs = $state<Readable<ArticleWithRefs[]>>();
	$effect(() => { articlesWithRefs = derived($articles.map(deriveArticleRefs), a => a.map(getDerivedArticleWithRefs)); });

	let filteredArticles = $state<Readable<ArticleWithRefs[]>>();
	$effect(() => {
		filteredArticles = derived(
			articlesWithRefs,
			articlesWithRefs => useFilters(articlesWithRefs, [
				...filterInstances,
				...(onlyListedArticles ? timelines[timelineIndex].filters : [])
			])
		)
	});

	function doAction() {
		for (const articleWithRefs of $filteredArticles) {
			articleAction(action, getRootArticle(articleWithRefs).idPair)
		}
	}
</script>

<label class='field'>
	Timeline
	<select bind:value={timelineIndex}>
		{#each timelines as t, index}
			<option value={index}>{t.title}</option>
		{/each}
	</select>
</label>

<div class='block'>
	<FiltersOptions bind:instances={filterInstances}/>
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