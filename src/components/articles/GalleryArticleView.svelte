<script lang='ts'>
	import Article, {MediaQueueInfo, MediaType} from '../../services/article'
	import Fa from 'svelte-fa/src/fa.svelte'
	import {
		faExpandArrowsAlt,
		faExternalLinkAlt,
		faHeart,
		faRetweet,
		faEllipsisH,
	} from '@fortawesome/free-solid-svg-icons'
	import {afterUpdate, createEventDispatcher} from 'svelte'
	import {LoadingState, loadingStore} from '../../bufferedMediaLoading'
	import {derived} from 'svelte/store'
	import Dropdown from "../Dropdown.svelte"
	import {fetchArticle, toggleHide, toggleMarkAsRead} from "../../services/service"

	export let article: Readonly<Article>
	export let actualArticle: Readonly<Article>
	export let style: string = ''
	export let animatedAsGifs: boolean
	export let shouldLoadMedia: boolean

	const dispatch = createEventDispatcher()
	const mediaRefs: HTMLImageElement[] = []
	const loadingStates = derived(loadingStore, loadingSet => {
		const states = []
		for (let mediaIndex = 0; mediaIndex < actualArticle.medias.length; ++mediaIndex)
			states.push(loadingStore.getLoadingState(actualArticle, mediaIndex, shouldLoadMedia))
		return states
	})

	afterUpdate(() => {
		const count = actualArticle.medias.length
		for (let i = 0; i < count; ++i) {
			if (actualArticle.medias[i].queueLoadInfo === MediaQueueInfo.LazyLoad && !actualArticle.medias[i].loaded) {
				if (mediaRefs[i]?.complete)
					loadingStore.mediaLoaded(actualArticle.idPair, i)
			}
		}
	})
</script>

<style lang='sass' global>
	@import '../../styles/variables'

	.favviewer article
		padding: 1rem
		background-color: $scheme-main-bis
		margin-bottom: 2px

		&.transparent
			opacity: 0.5

	article.galleryArticle
		padding: 0px
		margin-bottom: 0px

		& > div
			position: relative

		img, video
			width: 100%

		&:hover .holderBox
			display: flex

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

			*
				pointer-events: auto

			//TODO Hack
			.dropdown-content
				overflow-x: hidden

		.holderBoxTop
			top: 0px

		.holderBoxBottom
			bottom: 0px
			justify-content: space-around

		img.articleMediaLoading
			position: absolute

		.articleThumb
			z-index: -1

		ul.articleTags
			list-style-type: none
</style>

<article class='galleryArticle' articleId={article.id} {style}>
	<div>
		{#each actualArticle.medias as media, i (i)}
			{@const isLoading = $loadingStates[i] === LoadingState.Loading}
			{#if media.thumbnail !== undefined && $loadingStates[i] === LoadingState.NotLoaded}
				<img
					alt={`${actualArticle.id} thumbnail`}
					class='articleThumb'
					src={media.thumbnail}
					on:click={() => dispatch('mediaClick', i)}
				/>
			{:else if media.mediaType === MediaType.Image || media.mediaType === MediaType.Gif}
				<img
					alt={actualArticle.id}
					src={media.src}
					on:click={() => dispatch('mediaClick', i)}
					on:load={() => isLoading ? loadingStore.mediaLoaded(actualArticle.idPair, i) : undefined}
					class:articleMediaLoading={isLoading}
					bind:this={mediaRefs[i]}
				/>
				{#if isLoading}
					<img
						alt={`${actualArticle.id} thumbnail`}
						class='articleThumb'
						src={media.thumbnail}
						on:click={() => dispatch('mediaClick', i)}
					/>
				{/if}
			{:else if !animatedAsGifs && media.mediaType === MediaType.Video}
				<video
					controls
					on:click={() => dispatch('mediaClick', i)}
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
					on:click={() => dispatch('mediaClick', i)}
					on:loadeddata={() => isLoading ? loadingStore.mediaLoaded(actualArticle.idPair, i) : undefined}
					on:load={() => isLoading ? loadingStore.mediaLoaded(actualArticle.idPair, i) : undefined}
				>
					<source src={media.src} type='video/mp4'/>
				</video>
			{/if}
		{/each}
		<div class='holderBox holderBoxTop'>
			<a class='button' title='External Link' href={actualArticle.url} target='_blank'>
				<Fa icon={faExternalLinkAlt} class='darkIcon is-small'/>
			</a>
			<!--{#if !modal}-->
			<button class='button'>
				<!--onclick={ctx.link().callback(|_| Msg::ParentCallback(ParentMsg::ToggleInModal))}-->
				<Fa icon={faExpandArrowsAlt} class='darkIcon is-small'/>
			</button>
			<!--{/if}-->

			<Dropdown isRight={true} labelClasses='articleButton'>
				<!--on_expanded_change={ctx.link().callback(Msg::SetDrawOnTop)}-->
				<Fa slot='triggerIcon' icon={faEllipsisH} class='level-item'/>

				<a class='dropdown-item' on:click={() => toggleMarkAsRead(actualArticle.idPair)}>
					Mark as read
				</a>
				<a class='dropdown-item' on:click={() => toggleHide(actualArticle.idPair)}>
					Hide
				</a>
				{#if !actualArticle.fetched }
					<a class='dropdown-item' on:click={() => fetchArticle(actualArticle.idPair)}>{"Load Media"}</a>
				{/if}
				<a
					class='dropdown-item'
					href={ actualArticle.url }
					target='_blank'
				>
					External Link
				</a>
				<a class='dropdown-item' on:click={() => console.dir(article)}>
					Log Data
				</a>
				<!--				<a class='dropdown-item' on:click={ctx.link().callback(|_| Msg::ParentCallback(ParentMsg::LogJsonData))}>{"Log Json Data"}</a>-->
				<!--				<a class='dropdown-item' on:click={ctx.link().callback(|_| Msg::ParentCallback(ParentMsg::FetchData))}>{"Fetch Data"}</a>-->
			</Dropdown>
		</div>
		<div class='holderBox holderBoxBottom'>
			<button class='button' on:click={() => dispatch('action', 'favorite')}>
				<Fa icon={faHeart} class='darkIcon is-small'/>
			</button>
			<button class='button'> <!--onclick={ctx.link().callback(|_| Msg::ParentCallback(ParentMsg::Repost))}-->
				<Fa icon={faRetweet} class='darkIcon is-small'/>
			</button>
		</div>
	</div>
</article>