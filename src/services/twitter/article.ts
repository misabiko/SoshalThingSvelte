import type {ArticleAuthor, ArticleIdPair, ArticleMedia, ArticleRefIdPair} from '../article'
import Article from '../article'

export default class TwitterArticle extends Article {
	static service: string;

	constructor(
		id: string,
		text: string,
		textHtml: string,
		readonly author: TwitterUser,
		readonly creationTime: Date,
		markedAsReadStorage: string[],
		articleRefs: ArticleRefIdPair[],
		medias: ArticleMedia[],
		public liked: boolean,
		public likeCount: number,
		public retweeted: boolean,
		public retweetCount: number,
	) {
		super({
			id,
			url: `https://twitter.com/${author.username}/status/${id}`,
			text,
			textHtml,
			medias,
			markedAsRead: false,
			hidden: false,
			markedAsReadStorage,
			articleRefs,
		});
	}

	getLikeCount(): number {
		return this.likeCount
	}
	getLiked(): boolean {
		return this.liked
	}

	getRepostCount(): number {
		return this.retweetCount
	}
	getReposted(): boolean {
		return this.retweeted
	}
}

export interface TwitterUser extends ArticleAuthor {
	id: string;
	avatarUrl: string;
}

export type Id = string;