<script lang="ts">
	import type {ArticleMedia} from "../media";
	import type {ArticleIdPair} from "../index";
	import Article from "../index";
	import {loadingStore} from '../../bufferedMediaLoading';
	import GalleryThumbnail from "./GalleryThumbnail.svelte";

	export let actualArticle: Readonly<Article>;
	export let mediaIndex: number;
	export let media: ArticleMedia;
	export let onMediaClick: (idPair: ArticleIdPair, index: number) => number;
	export let isLoading: boolean;
	export let ref;

	const cropped = !!(media.offsetX || media.offsetY);
</script>

<style>
	img {
		width: 100%;
	}

	img.articleMediaLoading {
		position: absolute;
		left: 0;
		top: 0;
	}

	.articleMediaCrop {
		overflow-y: hidden;
	}
</style>

{#if cropped}
	<div class="articleMediaCrop" style:aspect-ratio={`${media.cropRatio}`}>
		<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
		<img
			alt={`${actualArticle.idPair.id}/${mediaIndex}`}
			class='articleMedia'
			src={media.src}
			on:click={() => onMediaClick(actualArticle.idPair, mediaIndex)}
			on:load={() => isLoading ? loadingStore.mediaLoaded(actualArticle.idPair, mediaIndex) : undefined}
			class:articleMediaLoading={isLoading}
			bind:this={ref}
			style:object-fit={'cover'}
			style:object-position={`${media.offsetX ?? 0} ${media.offsetY ?? 0}`}
			style:aspect-ratio={`1 / ${media.ratio}`}
			style:width={'100%'}
		/>
		{#if isLoading}
			<GalleryThumbnail
				{actualArticle}
				mediaIndex={mediaIndex}
				{media}
				{onMediaClick}
			/>
		{/if}
	</div>
{:else}
	<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
	<img
		alt={`${actualArticle.idPair.id}/${mediaIndex}`}
		class='articleMedia'
		src={media.src}
		on:click={() => onMediaClick(actualArticle.idPair, mediaIndex)}
		on:load={() => isLoading ? loadingStore.mediaLoaded(actualArticle.idPair, mediaIndex) : undefined}
		class:articleMediaLoading={isLoading}
		bind:this={ref}
	/>
	{#if isLoading}
		<GalleryThumbnail
				{actualArticle}
				mediaIndex={mediaIndex}
				{media}
				{onMediaClick}
		/>
	{/if}
{/if}