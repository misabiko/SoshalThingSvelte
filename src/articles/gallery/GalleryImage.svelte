<script lang='ts'>
	import {type ArticleMedia, extensionToMediaType, MediaType} from '../media';
	import type {ArticleIdPair} from '../index';
	import Article from '../index';
	import {loadingStore} from '~/bufferedMediaLoading';
	import GalleryThumbnail from './GalleryThumbnail.svelte';
	import {faCirclePlay} from '@fortawesome/free-regular-svg-icons';
	import Fa from 'svelte-fa';

	export let actualArticle: Readonly<Article>;
	export let mediaIndex: number;
	export let media: ArticleMedia;
	export let onMediaClick: (idPair: ArticleIdPair, index: number) => number;
	export let isLoading: boolean;
	export let ref;

	const cropped = !!(media.offsetX ?? media.offsetY);

	let firstMediaExtension = media.src.split('.').at(-1);
	let isFakeGif = firstMediaExtension && media.mediaType === MediaType.Gif && extensionToMediaType(firstMediaExtension) === MediaType.Image;
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

	.fakeGifPlayButton {
		position: absolute;
		left: 50%;
		top: 50%;
		opacity: 0.5;
		transform: translate(-50%, -50%);
		pointer-events: none;
	}

	:global(.fakeGifPlayButton > svg) {
		color: grey;
	}
</style>

{#if cropped}
	<div class='articleMediaCrop' style:aspect-ratio='{`${media.cropRatio}`}'>
		<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
		<img
			alt='{`${actualArticle.idPair.id}/${mediaIndex}`}'
			class='articleMedia'
			src={media.src}
			onclick='{() => onMediaClick(actualArticle.idPair, mediaIndex)}'
			onload='{() => isLoading ? loadingStore.mediaLoaded(actualArticle.idPair, mediaIndex) : undefined}'
			class:articleMediaLoading={isLoading}
			bind:this={ref}
			style:object-fit="{'cover'}"
			style:object-position='{`${media.offsetX ?? 0} ${media.offsetY ?? 0}`}'
			style:aspect-ratio='{`1 / ${media.ratio}`}'
			style:width="{'100%'}"
		/>
		{#if isLoading}
			<GalleryThumbnail
				{actualArticle}
				mediaIndex={mediaIndex}
				{media}
				{onMediaClick}
			/>
		{/if}
		{#if isFakeGif}
			<div class='fakeGifPlayButton'>
				<Fa icon={faCirclePlay} size='6x'/>
			</div>
		{/if}
	</div>
{:else}
	<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
	<img
		alt='{`${actualArticle.idPair.id}/${mediaIndex}`}'
		class='articleMedia'
		src={media.src}
		onclick='{() => onMediaClick(actualArticle.idPair, mediaIndex)}'
		onload='{() => isLoading ? loadingStore.mediaLoaded(actualArticle.idPair, mediaIndex) : undefined}'
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
	{#if isFakeGif}
		<Fa icon={faCirclePlay} size='2x' class='fakeGifPlayButton'/>
	{/if}
{/if}