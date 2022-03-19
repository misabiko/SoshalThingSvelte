<script lang='ts'>
	import Article from '../../services/article';
	export let article: Article;

	let actualArticle = article;

	function onUsernameClick() {

	}
</script>

<!--{ self.view_repost_label(ctx) }-->
<!--{ self.view_reply_label(ctx) }-->
<div class="media">
	<!--{ self.view_avatar(ctx) }-->
	<div class="media-content">
		<div class="content">
			<div class="articleHeader">
				<a class="names" href={$actualArticle.author?.url} target="_blank" rel="noopener noreferrer" onclick={onUsernameClick}>
					<strong>{ $actualArticle.author?.name }</strong>
					<small>@{ $actualArticle.author?.username }</small>
				</a>
				{$actualArticle.text}
				<!--{ self.view_timestamp(&actualArticle) }-->
			</div>
			<!--{ match ctx.props().hide_text || self.is_minimized(ctx) {-->
			<!--	false => html! {<p class="articleParagraph">{ actualArticle.view_text() }</p>},-->
			<!--	true => html! {},-->
			<!--} }-->
		</div>
		<!--{ quoted_post }-->
		<!--{ self.view_nav(ctx, &actualArticle) }-->
	</div>
</div>
<!--{ match self.is_minimized(ctx) {-->
<!--	false => self.view_media(ctx, &actualArticle),-->
<!--	true => html! {},-->
<!--} }-->