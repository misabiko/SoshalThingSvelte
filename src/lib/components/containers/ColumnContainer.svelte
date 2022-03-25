<script>
	import ArticleComponent from "../articles/ArticleComponent.svelte";

	export let idPairs;
	export let articleView;
</script>

<div class='columnContainer'>
	{#each idPairs as idPair (idPair)}
		<ArticleComponent {idPair} view={articleView}/>
	{/each}
</div>