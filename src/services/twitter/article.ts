import type {ArticleAuthor, ArticleIdPair, ArticleMedia, ArticleRefIdPair} from '../article'
import Article from '../article'

export default class TwitterArticle extends Article {
	static service: string;
	//TODO deleted = false
	//TODO Disable like/retweet actions for deleted articles

	constructor(
		readonly id: bigint,
		text: string,
		textHtml: string,
		readonly author: TwitterUser,
		readonly creationTime: Date,
		markedAsReadStorage: string[],
		hiddenStorage: string[],
		actualArticleRef: ArticleRefIdPair | undefined,
		replyRef: ArticleIdPair | undefined,
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
			hiddenStorage,
			actualArticleRef,
			replyRef,
		});
	}

	get numberId() {
		return BigInt(this.id)
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