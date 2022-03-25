<script lang="ts">
	import {ArticleIdPair, toggleMarkAsRead, articleAction} from "../../services/service"

	export let idPair: ArticleIdPair;
	export let view;
	export let style: string;

	function onMediaClick(event: {detail: number}) {
		toggleMarkAsRead(idPair)
	}

	function onArticleAction(event: {detail: string}) {
		articleAction(event.detail, idPair);
	}
</script>

<svelte:component this={view} {idPair} {style} on:mediaClick={onMediaClick} on:action={onArticleAction}/>