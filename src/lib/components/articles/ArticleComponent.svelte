<script lang="ts">
	import {ArticleIdPair, toggleMarkAsRead} from "../../services/service"

	export let idPair: ArticleIdPair;
	export let view;
	export let style: string;

	function onMediaClick(event: {detail: number}) {
		toggleMarkAsRead(idPair)
	}
</script>

<svelte:component this={view} {idPair} {style} on:mediaClick={onMediaClick}/>