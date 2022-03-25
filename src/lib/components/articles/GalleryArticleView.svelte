<script lang='ts'>
	import Article from '../../services/article'
	import Fa from 'svelte-fa/src/fa.svelte'
	import { faExternalLinkAlt, faExpandArrowsAlt, faHeart, faRetweet } from '@fortawesome/free-solid-svg-icons'
	import {createEventDispatcher} from 'svelte'
	import {ArticleIdPair, getWritable} from '../../services/service'

	export let idPair: ArticleIdPair;
	export let style: string = '';

	let article: Article;
	const unsubscribe = getWritable(idPair).subscribe(_ => article = _);
	$: actualArticle = article

	const dispatch = createEventDispatcher();
</script>

<style lang='sass' global>
	@use '../../styles/core' as *

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
		{#each actualArticle.medias as media}
			<img alt={actualArticle.id} class="articleThumb" src={media.src} on:click={() => dispatch('mediaClick', 0)}/><!--key={i}--> <!-- on:click={ctx.link().callback(|_| Msg::ParentCallback(ParentMsg::OnMediaClick))}-->
		{/each}
		<div class="holderBox holderBoxTop">
			<a class="button" title="External Link" href={actualArticle.url} target="_blank">
				<Fa icon={faExternalLinkAlt} class='darkIcon is-small'/>
			</a>
			<!--{#if !modal}-->
				<button class="button"><!--onclick={ctx.link().callback(|_| Msg::ParentCallback(ParentMsg::ToggleInModal))}-->
					<Fa icon={faExpandArrowsAlt} class='darkIcon is-small'/>
				</button>
			<!--{/if}-->

	<!--		<Dropdown on_expanded_change={ctx.link().callback(Msg::SetDrawOnTop)} is_right=true current_label={DropdownLabel::Icon(yew::props! { FAProps {icon: "ellipsis-h".to_owned()}})} label_classes={classes!("articleButton")}>-->
	<!--			<a class="dropdown-item" onclick={ctx.link().callback(|_| Msg::ParentCallback(ParentMsg::ToggleMarkAsRead))}> {"Mark as read"} </a>-->
	<!--			<a class="dropdown-item" onclick={ctx.link().callback(|_| Msg::ParentCallback(ParentMsg::ToggleHide))}> {"Hide"} </a>-->
	<!--			{ if let Some(index) = ctx.props().media_load_states.iter().enumerate().find_map(|(i, m)| if *m == MediaLoadState::NotLoaded { Some(i) } else { None }) {-->
	<!--				html! {-->
	<!--				<a class="dropdown-item" onclick={ctx.link().callback(move |_| Msg::ParentCallback(ParentMsg::LoadMedia(index)))}>{"Load Media"}</a>-->
	<!--			}-->
	<!--			}else {-->
	<!--				html! {}-->
	<!--			} }-->
	<!--			<a-->
	<!--				class="dropdown-item"-->
	<!--				href={ actualArticle.url() }-->
	<!--				target="_blank" rel="noopener noreferrer"-->
	<!--			>-->
	<!--				{ "External Link" }-->
	<!--			</a>-->
	<!--			<a class="dropdown-item" onclick={ctx.link().callback(|_| Msg::ParentCallback(ParentMsg::LogData))}>{"Log Data"}</a>-->
	<!--			<a class="dropdown-item" onclick={ctx.link().callback(|_| Msg::ParentCallback(ParentMsg::LogJsonData))}>{"Log Json Data"}</a>-->
	<!--			<a class="dropdown-item" onclick={ctx.link().callback(|_| Msg::ParentCallback(ParentMsg::FetchData))}>{"Fetch Data"}</a>-->
	<!--		</Dropdown>-->
		</div>
		<div class="holderBox holderBoxBottom">
			<button class="button" on:click={() => dispatch('action', 'favorite')}>
				<Fa icon={faHeart} class='darkIcon is-small'/>
			</button>
			<button class="button"> <!--onclick={ctx.link().callback(|_| Msg::ParentCallback(ParentMsg::Repost))}-->
				<Fa icon={faRetweet} class='darkIcon is-small'/>
			</button>
		</div>
	</div>
</article>