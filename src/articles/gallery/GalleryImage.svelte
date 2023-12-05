<script lang="ts">
	import type {ArticleMedia} from "../media";
	import type {ArticleIdPair} from "../index";
	import Article from "../index";
	import {loadingStore} from '../../bufferedMediaLoading';
	import GalleryThumbnail from "./GalleryThumbnail.svelte";

	let {
		actualArticle,
		mediaIndex,
		media,
		onMediaClick,
		isLoading,
		ref,
	} = $props<{
		actualArticle: Readonly<Article>,
		mediaIndex: number,
		media: ArticleMedia,
		onMediaClick: (idPair: ArticleIdPair, index: number) => number,
		isLoading: boolean,
		ref: HTMLImageElement | undefined,
	}>();

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