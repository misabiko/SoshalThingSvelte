import type {ArticleAuthor, ArticleIdPair, ArticleMedia, ArticleRefIdPair} from '../article'
import Article, {ArticleRefType} from '../article'
import type {TweetResponse} from './endpoints'
import {getWritable} from '../service'

export default class TwitterArticle extends Article {
	static service: string;

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

	updateAPIResponse(response: TweetResponse) {
		this.liked = response.favorited
		this.likeCount = response.favorite_count
		this.retweeted = response.retweeted
		this.retweetCount = response.retweet_count

		if (response.retweeted_status)
			getWritable((this.actualArticleRef as {type: ArticleRefType.Repost, reposted: ArticleIdPair}).reposted).update(a => {
				(a as TwitterArticle).updateAPIResponse(response.retweeted_status as TweetResponse)
				return a
			})

		if (response.quoted_status)
			getWritable((this.actualArticleRef as {type: ArticleRefType.Quote, quoted: ArticleIdPair}).quoted).update(a => {
				(a as TwitterArticle).updateAPIResponse(response.quoted_status as TweetResponse)
				return a
			})
	}
}

export interface TwitterUser extends ArticleAuthor {
	id: string;
	avatarUrl: string;
}