<script lang='ts'>
	//TODO Fix/Test BatchActions
	import FiltersOptions from '../filters/FiltersOptions.svelte';
	import {type FilterInstance, useFilters} from '~/filters';
	import type {TimelineCollection} from '~/timelines';
	import {derived as storeDerived, type Readable, readonly, type Writable} from 'svelte/store';
	import {
		type ArticleIdPair,
		type ArticleWithRefs, flatDeriveArticle, getRootArticle,
	} from '~/articles';
	import {articleAction, STANDARD_ACTIONS} from '~/services/actions';

	let {
		timelines,
		filterInstances = $bindable(),
	}: {
		timelines: TimelineCollection
		filterInstances: Writable<FilterInstance[]>
	} = $props();

	let timelineId: string = $state(Object.keys(timelines)[0]!);
	let action = $state('markAsRead');
	let onlyListedArticles = $state(true);

	let articleIdPairs: Readable<ArticleIdPair[]> = $derived(readonly(timelines[timelineId]!.articles));

	let articlesWithRefs: Readable<ArticleWithRefs[]> = $derived(storeDerived(
		$articleIdPairs.map(idPair => storeDerived(flatDeriveArticle(idPair), articles => articles[0]!)),
		articles => articles.map(a => a.getArticleWithRefs()),
	));

	let filteredArticles: Readable<ArticleWithRefs[]> = $derived(storeDerived(
		[articlesWithRefs, filterInstances, timelines[timelineId]!.filters],
		([articlesWithRefs, filterInstances, filters]) => useFilters(articlesWithRefs, [
			...filterInstances,
			...(onlyListedArticles ? filters : []),
		]),
	));

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
	<FiltersOptions
		onInstancesUpdate={() => {}}
		instances={filterInstances}
	/>
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

<button onclick={doAction}>Do Action</button>