<script lang="ts">
	import ArticleComponent from "../articles/ArticleComponent.svelte";
	import type {ContainerProps} from './index'
	import {articlesWithUniqueKeys} from "./index.js";

	export let containerRef = undefined;
	export let props: ContainerProps;
</script>

<style lang='sass'>
	@use '../styles/variables' as *

	.articlesContainer.rowContainer
		display: flex
		flex-wrap: wrap
		align-items: flex-start
</style>

<div class='articlesContainer rowContainer' bind:this={containerRef}>
	{#each articlesWithUniqueKeys(props.articles) as [articleWithRefs, key] (key)}
		<ArticleComponent
			view={props.articleView}
			{articleWithRefs}
			props={props.articleProps}
			style={`width: calc(100% / ${props.columnCount})`}
		/>
	{/each}
</div>