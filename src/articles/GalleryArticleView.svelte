<script lang='ts'>
	import Article, {MediaQueueInfo, MediaType} from '../services/article'
	import type {ArticleIdPair} from '../services/article'
	import Fa from 'svelte-fa/src/fa.svelte'
	import {
		faExpandArrowsAlt,
		faExternalLinkAlt,
		faHeart,
		faRetweet,
		faEllipsisH,
	} from '@fortawesome/free-solid-svg-icons'
	import {afterUpdate} from 'svelte'
	import {LoadingState, loadingStore} from '../bufferedMediaLoading'
	import Dropdown from "../Dropdown.svelte"
	import {fetchArticle, toggleHide, toggleMarkAsRead, articleAction, getArticleAction, STANDARD_ACTIONS} from "../services/service"
	import type {TimelineArticleProps} from './index'
	import type {ArticleProps} from './index'

	export let timelineProps: TimelineArticleProps
	export let articleProps: ArticleProps; articleProps;
	export let style = ''; style;
	export let modal: boolean; modal;
	export let actualArticle: Readonly<Article>
	export let onMediaClick: (idPair: ArticleIdPair, index: number) => number
	export let onLogData: () => void
	export let onLogJSON: () => void

	const mediaRefs: HTMLImageElement[] = []
	let loadingStates: LoadingState[]
	$: {
		loadingStates = []
		for (let mediaIndex = 0; mediaIndex < actualArticle.medias.length; ++mediaIndex)
			loadingStates.push(loadingStore.getLoadingState(actualArticle.idPair, mediaIndex, timelineProps.shouldLoadMedia))
	}

	afterUpdate(() => {
		const count = actualArticle.medias.length
		for (let i = 0; i < count; ++i) {
			if (actualArticle.medias[i].queueLoadInfo === MediaQueueInfo.LazyLoad && !actualArticle.medias[i].loaded) {
				if (mediaRefs[i]?.complete)
					loadingStore.mediaLoaded(actualArticle.idPair, i)
			}
		}
	})

	const likeAction = getArticleAction(STANDARD_ACTIONS.like, actualArticle.idPair.service)
	const repostAction = getArticleAction(STANDARD_ACTIONS.repost, actualArticle.idPair.service)
</script>

<style lang='sass'>
	@use '../styles/variables' as *

	.galleryArticle
		padding: 0
		margin-bottom: 0

		& > div
			position: relative

		&:hover .holderBox
			display: flex

	img, video
		width: 100%

	.holderBox
		justify-content: space-between
		flex-wrap: nowrap
		position: absolute
		height: 56px
		width: 100%
		opacity: 0.5
		display: none
		direction: ltr
		pointer-events: none

		& > *
			height: inherit
			padding-top: unset
			padding-bottom: unset

		:global(.dropdown-trigger > button)
			height: 100%

		:global(*)
			pointer-events: auto

		//TODO Hack
		:global(.dropdown-content)
			overflow-x: hidden

	.holderBoxTop
		top: 0

	.holderBoxBottom
		bottom: 0
		justify-content: space-around

	img.articleMediaLoading
		position: absolute

	.articleThumb
		z-index: -1

	//ul.articleTags
	//	list-style-type: none
</style>

<div class='galleryArticle'>
	<div>
		{#each actualArticle.medias as media, i (i)}
			{@const isLoading = loadingStates[i] === LoadingState.Loading}
			{#if loadingStates[i] === LoadingState.NotLoaded}
				<img
					alt={`${actualArticle.idPair.id} thumbnail`}
					class='articleThumb'
					src={media.thumbnail}
					on:click={() => onMediaClick(actualArticle.idPair, i)}
				/>
			{:else if media.mediaType === MediaType.Image || media.mediaType === MediaType.Gif}
				<img
					alt={actualArticle.idPair.id}
					src={media.src}
					on:click={() => onMediaClick(actualArticle.idPair, i)}
					on:load={() => isLoading ? loadingStore.mediaLoaded(actualArticle.idPair, i) : undefined}
					class:articleMediaLoading={isLoading}
					bind:this={mediaRefs[i]}
				/>
				{#if isLoading}
					<img
						alt={`${actualArticle.idPair.id} thumbnail`}
						class='articleThumb'
						src={media.thumbnail}
						on:click={() => onMediaClick(actualArticle.idPair, i)}
					/>
				{/if}
			{:else if !timelineProps.animatedAsGifs && media.mediaType === MediaType.Video}
				<!-- svelte-ignore a11y-media-has-caption -->
				<video
					controls
					on:click|preventDefault={() => onMediaClick(actualArticle.idPair, i)}
					on:loadeddata={() => isLoading ? loadingStore.mediaLoaded(actualArticle.idPair, i) : undefined}
					on:load={() => isLoading ? loadingStore.mediaLoaded(actualArticle.idPair, i) : undefined}
				>
					<source src={media.src} type='video/mp4'/>
				</video>
			{:else}
				<video
					controls
					autoplay
					loop
					muted
					on:click|preventDefault={() => onMediaClick(actualArticle.idPair, i)}
					on:loadeddata={() => isLoading ? loadingStore.mediaLoaded(actualArticle.idPair, i) : undefined}
					on:load={() => isLoading ? loadingStore.mediaLoaded(actualArticle.idPair, i) : undefined}
				>
					<source src={media.src} type='video/mp4'/>
				</video>
			{/if}
		{/each}
		<div class='holderBox holderBoxTop'>
			<a class='button' title='External Link' href={actualArticle.url} target='_blank'>
				<span class='icon darkIcon'>
					<Fa icon={faExternalLinkAlt} class='is-small'/>
				</span>
			</a>
			{#if !modal}
				<button class='button'>
					<span class='icon darkIcon' on:click={() => modal = !modal}>
						<Fa icon={faExpandArrowsAlt} class='is-small'/>
					</span>
				</button>
			{/if}

			<Dropdown isRight={true} labelClasses='articleButton'>
				<!--on_expanded_change={ctx.link().callback(Msg::SetDrawOnTop)}-->
				<span slot='triggerIcon' class='icon darkIcon'>
					<Fa icon={faEllipsisH} class='level-item'/>
				</span>
				<!-- svelte-ignore a11y-missing-attribute -->
				<a class='dropdown-item' on:click={() => toggleMarkAsRead(actualArticle.idPair)}>
					Mark as read
				</a>
				<!-- svelte-ignore a11y-missing-attribute -->
				<a class='dropdown-item' on:click={() => toggleHide(actualArticle.idPair)}>
					Hide
				</a>
				{#if actualArticle.medias.some(m => !m.loaded) }
					<!-- svelte-ignore a11y-missing-attribute -->
					<a class='dropdown-item' on:click={() => {for (let i = 0; i < actualArticle.medias.length; ++i) loadingStore.forceLoading(actualArticle, i)}}>
						Load Media
					</a>
				{/if}
				<a
					class='dropdown-item'
					href={ actualArticle.url }
					target='_blank'
				>
					External Link
				</a>
				<!-- svelte-ignore a11y-missing-attribute -->
				<a class='dropdown-item' on:click={onLogData}>
					Log Data
				</a>
				<!-- svelte-ignore a11y-missing-attribute -->
				<a class='dropdown-item' on:click={onLogJSON}>
					Log JSON Data
				</a>
				{#if !actualArticle.fetched }
					<!-- svelte-ignore a11y-missing-attribute -->
					<a class='dropdown-item' on:click={() => fetchArticle(actualArticle.idPair)}>
						Fetch Article
					</a>
				{/if}
			</Dropdown>
		</div>
		<div class='holderBox holderBoxBottom'>
			{#if likeAction && !(actualArticle.getLiked() && !likeAction.togglable)}
				<button
					class='button'
					on:click={() => articleAction(STANDARD_ACTIONS.like, actualArticle.idPair)}
				>
					<span class='icon darkIcon'>
						<Fa icon={faHeart} class='is-small'/>
					</span>
				</button>
			{/if}
			{#if repostAction && !(actualArticle.getReposted() && !repostAction.togglable)}
				<button
					class='button'
					on:click={() => articleAction(STANDARD_ACTIONS.repost, actualArticle.idPair)}
				>
					<span class='icon darkIcon'>
						<Fa icon={faRetweet} class='is-small'/>
					</span>
				</button>
			{/if}
		</div>
	</div>
</div>