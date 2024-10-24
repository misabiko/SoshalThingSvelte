<script lang='ts'>
	import type {ArticleMedia} from '../media';
	import type {ArticleIdPair} from '../index';
	import Article from '../index';

	export let actualArticle: Readonly<Article>;
	export let mediaIndex: number;
	export let media: ArticleMedia;
	export let onMediaClick: (idPair: ArticleIdPair, index: number) => number;

	const cropped = !!(media.thumbnail?.offsetX || media.thumbnail?.offsetY);
</script>

<style>
	img {
		width: 100%;
	}

	.articleThumb {
		z-index: -1;
	}

	.articleMediaCrop {
		overflow-y: hidden;
	}

	.imgPlaceHolder {
		width: 100%;
		background-color: grey;
	}
</style>

{#if media.thumbnail}
	{#if cropped}
		<div class='articleMediaCrop' style:aspect-ratio='{`${media.thumbnail.cropRatio}`}'>
			<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
			<img
				alt='{`${actualArticle.idPair.id}/${mediaIndex} thumbnail`}'
				class='articleThumb articleMedia'
				src={media.thumbnail.src}
				onclick='{() => onMediaClick(actualArticle.idPair, mediaIndex)}'
				style:object-fit="{'cover'}"
				style:object-position='{`${media.thumbnail.offsetX ?? 0} ${media.thumbnail.offsetY ?? 0}`}'
				style:aspect-ratio='{`1 / ${media.thumbnail.ratio}`}'
				style:width="{'100%'}"
			/>
		</div>
	{:else}
		<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
		<img
			alt='{`${actualArticle.idPair.id}/${mediaIndex} thumbnail`}'
			class='articleThumb articleMedia'
			src={media.thumbnail.src}
			onclick='{() => onMediaClick(actualArticle.idPair, mediaIndex)}'
		/>
	{/if}
{:else}
	<div class='imgPlaceHolder' style:aspect-ratio='{1 / (media.ratio ?? 1)}'></div>
{/if}