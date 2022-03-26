<script lang='ts'>
	import type {ArticleIdPair} from "../../services/service"
	import {toggleMarkAsRead, articleAction} from "../../services/service"

	export let idPair: ArticleIdPair
	export let view
	export let style: string
	export let socialSettings

	function onMediaClick(event: { detail: number }) {
		toggleMarkAsRead(idPair)
	}

	function onArticleAction(event: { detail: string }) {
		articleAction(event.detail, idPair)
	}
</script>

<svelte:component this={view} {idPair} {style} on:mediaClick={onMediaClick} on:action={onArticleAction} {...socialSettings}/>