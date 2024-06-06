import Article, {type ArticleAuthor} from '~/articles';
import type {PostView} from '@atproto/api/dist/client/types/app/bsky/feed/defs';
import type {ViewImage} from '@atproto/api/src/client/types/app/bsky/embed/images';
import {getRatio, MediaType} from '~/articles/media';

export default class BlueskyArticle extends Article {
	static service = 'Bluesky';
	//TODO support null numberId
	numberId = 0;
	readonly uri: string;
	readonly author: BlueskyAuthor;
	readonly creationTime: Date;
	likeURI: string | null;
	likeCount: number | null;
	repostURI: string | null;
	repostCount: number | null;

	constructor(post: PostView, markedAsReadStorage: string[]) {
		super({
			id: post.cid,
			text: post.record['text'],
			textHtml: post.record['text'],
			url: `https://bsky.app/profile/${post.author.handle}/post/${post.uri.split('/').at(-1)}`,
			medias: post.embed?.images?.map((image: ViewImage) => {
				const ratio = getRatio(image.aspectRatio?.width, image.aspectRatio?.height);
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
					}
				});
			}) ?? [],
			markedAsReadStorage,
			rawSource: [post],
		});

		this.uri = post.uri;

		this.author = {
			username: post.author.handle,
			name: post.author.displayName ?? post.author.handle,
			url: 'https://bsky.app/profile/' + post.author.handle,
			avatarUrl: post.author.avatar,
		};

		this.creationTime = new Date(post.record['createdAt']);

		this.likeURI = post.viewer?.like ?? null;
		this.likeCount = post.likeCount ?? null;
		this.repostURI = post.viewer?.repost ?? null;
		this.repostCount = post.repostCount ?? null;
	}

	get liked() {
		return !!this.likeURI;
	}

	get reposted() {
		return !!this.repostURI;
	}
}

interface BlueskyAuthor extends ArticleAuthor {

}