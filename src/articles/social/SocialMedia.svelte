<script lang='ts'>
	import Article from '../../services/article'
	import {MediaType} from "../../services/article.js";
	import type {TimelineArticleProps} from '../index'
	import {afterUpdate} from 'svelte'
	import {getWritable} from '../../services/service'
	import Fa from 'svelte-fa/src/fa.svelte'
	import {faImages} from "@fortawesome/free-solid-svg-icons";

	export let article: Article
	export let timelineProps: TimelineArticleProps
	export let showAllMedia: boolean;
	export let onMediaClick: (index: number) => void

	let divRef: HTMLDivElement | null = null

	afterUpdate(() => {
		const articleMediaEls = divRef?.querySelectorAll('.articleMedia')
		if (articleMediaEls) {
			const modifiedMedias = []
			for (let i = 0; i < article.medias.length; ++i)
				if (article.medias[i].ratio === null)
					modifiedMedias.push([i, articleMediaEls[i].clientHeight / articleMediaEls[i].clientWidth])

			getWritable(article.idPair).update(a => {
				for (const [i, ratio] of modifiedMedias)
					a.medias[i].ratio = ratio
				return a
			})
		}
	})
</script>

<style lang='sass'>
	.postMedia
		margin-top: 1rem

	.postVideo video
		width: 100%

	//TODO .postImagesCompact
	//	display: flex
	//	flex-wrap: wrap

	.mediaHolder
		overflow: hidden
		display: flex
		justify-content: center
		border-radius: 8px

		&:not(:last-child)
			margin-bottom: 2px

		img
			align-self: center
			width: 100%

	//&.mediaHolderCompact
	//	max-height: 16vh
	//	width: 100%
	//
	//	&:not(:only-child)
	//		margin: 2px
	//		max-width: 49%
	//
	//		&.landscape img
	//			width: unset
	//			height: 110%
	//
	//		&.portrait img
	//			width: 110%
	//			height: unset
	//
	//	img
	//		object-fit: cover
	//
	//	&.thirdImage
	//		max-width: unset
	//
	//		&.landscape img
	//			width: unset
	//			height: 175%
	//
	//		&.portrait img
	//			width: 175%
	//			height: unset

	.imgPlaceHolder
		width: 100%
		background-color: grey

	.moreMedia
		display: flex
	.moreMedia > button
		margin-left: auto
		margin-right: auto
		padding-top: 5px
</style>

<!--TODO Rename or get rid of postMedia, postImages etc-->
<div class='postMedia postImages' bind:this={divRef}>
	{#each article.medias.slice(0, !showAllMedia && timelineProps.maxMediaCount !== null ? timelineProps.maxMediaCount : undefined) as media, index (index)}
		{#if media.mediaType === MediaType.Image || media.mediaType === MediaType.Gif}
			<div class='mediaHolder'>
				<div class='is-hidden imgPlaceHolder' style:aspect-ratio={1 / media.ratio}></div>
				<img class='articleMedia' alt={`${article.id}/${index}`} src={media.src} on:click={() => onMediaClick(index)}/>
			</div>
		{:else if !timelineProps.animatedAsGifs && media.mediaType === MediaType.Video}
			<div class='postMedia postVideo'>
				<!-- svelte-ignore a11y-media-has-caption -->
				<video class='articleMedia' controls on:click|preventDefault={() => onMediaClick(index)}>
					<source src={media.src} type='video/mp4'/>
				</video>
			</div>
		{:else if media.mediaType === MediaType.VideoGif || timelineProps.animatedAsGifs && media.mediaType === MediaType.Video}
			<div class='postMedia postVideo'>
				<!-- svelte-ignore a11y-media-has-caption -->
				<video class='articleMedia' controls autoplay loop muted on:click|preventDefault={() => onMediaClick(index)}>
					<source src={media.src} type='video/mp4'/>
				</video>
			</div>
		{/if}
	{/each}
	{#if !showAllMedia && timelineProps.maxMediaCount !== null && article.medias.length > timelineProps.maxMediaCount}
		<div class='moreMedia'>
			<button class='borderless-button' title='Load more medias' on:click={() => showAllMedia = true}>
				<Fa icon={faImages} size='2x'/>
			</button>
		</div>
	{/if}
</div>