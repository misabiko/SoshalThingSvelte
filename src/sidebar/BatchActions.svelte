<script lang='ts'>
	//TODO Fix/Test BatchActions
	import FiltersOptions from '../filters/FiltersOptions.svelte';
	import {type FilterInstance, useFilters} from '~/filters';
	import {getWritable} from '~/services/service';
	import type {TimelineCollection} from '~/timelines';
	import {derived, type Readable, type Writable} from 'svelte/store';
	import Article, {
		type ArticleIdPair,
		type ArticleWithRefs, deriveArticleRefs, getDerivedArticleWithRefs, getRootArticle,
	} from '../articles';
	import {articleAction, STANDARD_ACTIONS} from '~/services/actions';

	export let timelines: TimelineCollection;
	export let filterInstances: FilterInstance[];

	let timelineId: string = Object.keys(timelines)[0];
	let action = 'markAsRead';
	let onlyListedArticles = true;

	let articleIdPairs: Writable<ArticleIdPair[]> = timelines[timelineId].articles;

	let articles: Readable<Article[]>;
	$: articles = derived($articleIdPairs.map(getWritable), a => a);

	let articlesWithRefs: Readable<ArticleWithRefs[]>;
	$: articlesWithRefs = derived($articles.map(deriveArticleRefs), a => a.map(getDerivedArticleWithRefs));

	let filteredArticles: Readable<ArticleWithRefs[]>;
	$: filteredArticles = derived(
		articlesWithRefs,
		articlesWithRefs => useFilters(articlesWithRefs, [
			...filterInstances,
			...(onlyListedArticles ? timelines[timelineId].filters : [])
		])
	);

	function doAction() {
		for (const articleWithRefs of $filteredArticles) {
			articleAction(action, getRootArticle(articleWithRefs).idPair);
		}
	}
</script>

<label class='field'>
	Timeline
	<select bind:value={timelineId}>
		{#each Object.entries(timelines) as [id, t] (id)}
			<option value={id}>{t.title}</option>
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