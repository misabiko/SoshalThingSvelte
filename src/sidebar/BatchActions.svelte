<script lang='ts'>
	//TODO Fix/Test BatchActions
	import FiltersOptions from '../filters/FiltersOptions.svelte';
	import {type FilterInstance, useFilters} from '~/filters';
	import type {TimelineCollection} from '~/timelines';
	import {derived, type Readable, readonly} from 'svelte/store';
	import  {
		type ArticleIdPair,
		type ArticleWithRefs, flatDeriveArticle, getRootArticle,
	} from '~/articles';
	import {articleAction, STANDARD_ACTIONS} from '~/services/actions';

	export let timelines: TimelineCollection;
	export let filterInstances: FilterInstance[];

	let timelineId: string = Object.keys(timelines)[0];
	let action = 'markAsRead';
	let onlyListedArticles = true;

	let articleIdPairs: Readable<ArticleIdPair[]> = readonly(timelines[timelineId].articles);

	let articlesWithRefs: Readable<ArticleWithRefs[]>;
	$: articlesWithRefs = derived(
		$articleIdPairs.map(idPair => derived(flatDeriveArticle(idPair), articles => articles[0])),
		$articles => $articles.map(a => a.getArticleWithRefs())
	);

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