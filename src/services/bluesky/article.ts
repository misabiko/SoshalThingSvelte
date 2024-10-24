import Article, {type ArticleAuthor, type ArticleRefIdPair, type ArticleWithRefs} from '~/articles';
import type {ArticleMedia} from '~/articles/media';
import {getRatio, MediaLoadType, MediaType} from '~/articles/media';
import {type AppBskyActorDefs, AppBskyEmbedImages, type AppBskyFeedDefs, AppBskyFeedPost} from '@atproto/api';

export default class BlueskyArticle extends Article {
	static service = 'Bluesky';
	//TODO support null numberId
	numberId = 0;
	readonly uri: string | null;
	readonly author: BlueskyAuthor;
	readonly creationTime: Date;
	likeURI: string | null;
	likeCount: number | null;
	repostURI: string | null;
	repostCount: number | null;

	constructor(
		id: string,
		markedAsReadStorage: string[],
		params: BlueskyParams,
		rawSource: any[],
	) {
		super(params.type === 'post' ? {
			id,
			text: params.text,
			textHtml: params.text,
			url: params.url,
			medias: params.medias,
			markedAsReadStorage,
			rawSource,
		} : {
			id,
			medias: [],
			markedAsReadStorage,
			refs: params.refs,
			rawSource,
		});

		this.creationTime = params.creationTime;
		this.author = params.author;

		if (params.type === 'post') {
			this.uri = params.uri;

			this.likeURI = params.likeURI;
			this.likeCount = params.likeCount;
			this.repostURI = params.repostURI;
			this.repostCount = params.repostCount;
		}else {
			this.uri = null;
			this.likeURI = null;
			this.likeCount = null;
			this.repostURI = null;
			this.repostCount = null;
		}
	}

	get liked() {
		return !!this.likeURI;
	}

	get reposted() {
		return !!this.repostURI;
	}
}

export type BlueskyAuthor = ArticleAuthor;
// export interface BlueskyAuthor extends ArticleAuthor {
//
// }

type BlueskyParams = {
	type: 'post'
	text: string
	url: string
	medias: ArticleMedia[]
	author: BlueskyAuthor
	creationTime: Date
	uri: string
	likeURI: string | null
	likeCount: number | null
	repostURI: string | null
	repostCount: number | null
} | {
	type: 'repost'
	refs: ArticleRefIdPair
	author: BlueskyAuthor
	creationTime: Date
};

export function parseFeedViewPost(feedViewPost: AppBskyFeedDefs.FeedViewPost, markedAsReadStorage: string[]): ArticleWithRefs {
	const rawSource = [feedViewPost];
	const post = {
		type: 'normal',
		article: BlueskyPostToArticle(feedViewPost.post, markedAsReadStorage, rawSource),
	} satisfies ArticleWithRefs;

	if (feedViewPost.reason?.$type === 'app.bsky.feed.defs#reasonRepost') {
		const reason = feedViewPost.reason as AppBskyFeedDefs.ReasonRepost;
		const by = reason.by as AppBskyActorDefs.ProfileViewBasic;
		return {
			type: 'repost',
			article: new BlueskyArticle(
				feedViewPost.post.cid + '-repostBy-' + (by.handle),
				markedAsReadStorage,
				{
					type: 'repost',
					refs: {
						type: 'repost',
						reposted: post.article.idPair,
					},
					author: {
						username: by.handle,
						name: by.displayName ?? by.handle,
						url: 'https://bsky.app/profile/' + by.handle,
						avatarUrl: by.avatar,
					},
					creationTime: new Date(reason.indexedAt)
				},
				rawSource,
			),
			reposted: post,
		};
	}
	else if (feedViewPost.reason !== undefined){
		console.error({
			message: 'Unknown reason type',
			feedViewPost,
		});
		return post;
	}else {
		return post;
	}
}

export function BlueskyPostToArticle(post: AppBskyFeedDefs.PostView, markedAsReadStorage: string[], rawSource: any[]): BlueskyArticle {
	return new BlueskyArticle(
		post.cid,
		markedAsReadStorage,
		{
			type: 'post',
			text: (post.record as AppBskyFeedPost.Record).text,
			url: `https://bsky.app/profile/${post.author.handle}/post/${post.uri.split('/').at(-1)}`,
			medias: (post.embed?.images as AppBskyEmbedImages.ViewImage[] | undefined)?.map((image: AppBskyEmbedImages.ViewImage) => {
				const ratio = image.aspectRatio?.width && image.aspectRatio?.height ? getRatio(image.aspectRatio?.width, image.aspectRatio?.height) : null;
				return ({
					src: image.fullsize,
					mediaType: MediaType.Image,
					ratio,
					cropRatio: null,
					offsetX: null,
					offsetY: null,
					thumbnail: {
						src: image.thumb,
						offsetX: null,
						offsetY: null,
						ratio,
						cropRatio: null,
					},
					queueLoadInfo: MediaLoadType.LazyLoad,
					loaded: false,
				});
			}) ?? [],
			author: {
				username: post.author.handle,
				name: post.author.displayName ?? post.author.handle,
				url: 'https://bsky.app/profile/' + post.author.handle,
				avatarUrl: post.author.avatar,
			},
			creationTime: new Date((post.record as AppBskyFeedPost.Record).createdAt),

			uri: post.uri,

			likeURI: post.viewer?.like ?? null,
			likeCount: post.likeCount ?? null,
			repostURI: post.viewer?.repost ?? null,
			repostCount: post.repostCount ?? null,
		},
		rawSource,
	);
}