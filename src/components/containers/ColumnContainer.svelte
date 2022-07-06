<script lang='ts'>
	import ArticleComponent from "../articles/ArticleComponent.svelte";

	export let idPairs;
	export let articleView;
	export let containerRef;
	export let animatedAsGifs;
	export let compact;
	export let hideText;
	export let shouldLoadMedia: boolean;
</script>

<div class='columnContainer' bind:this={containerRef}>
	{#each idPairs as idPair (idPair)}
		<ArticleComponent
			{idPair}
			view={articleView}
			{compact}
			{hideText}
			{animatedAsGifs}
			{shouldLoadMedia}
		/>
	{/each}
</div>