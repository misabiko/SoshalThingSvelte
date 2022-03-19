<script>
	import ArticleComponent from "../articles/ArticleComponent.svelte";

	export let articles;
	export let articleView;
</script>

<div class='articlesContainer columnContainer'>
	{#each articles as article}
		<ArticleComponent {article} view={articleView}/>
	{/each}
</div>