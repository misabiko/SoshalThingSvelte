<script lang='ts'>
	import ArticleComponent from '../articles/ArticleComponent.svelte';
	import type {ContainerProps} from './index';
	import {articlesWithUniqueKeys} from './index';

	let {
		props,
		containerRef = $bindable(null),
	}: {
		props: ContainerProps
		containerRef: null | HTMLDivElement
	} = $props();
</script>

<div class='articlesContainer columnContainer' bind:this={containerRef}>
	{#each articlesWithUniqueKeys(props.articles) as [articleProps, key] (key)}
		<ArticleComponent
			view={props.articleView}
			{articleProps}
			timelineProps={props.timelineArticleProps}
		/>
	{/each}
</div>