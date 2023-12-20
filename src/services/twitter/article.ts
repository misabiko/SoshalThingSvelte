import type {ArticleAuthor, ArticleRefIdPair} from '../../articles';
import Article from '../../articles';
import type {ArticleMedia} from '../../articles/media';
import {TWITTER_SERVICE_NAME} from './service';

export default class TwitterArticle extends Article {
	static service = TWITTER_SERVICE_NAME;
	deleted = false;

	constructor(
		readonly id: bigint,
		text: string,
		textHtml: string,
		readonly author: TwitterUser,
		readonly creationTime: Date,
		markedAsReadStorage: string[],
		hiddenStorage: string[],
		actualArticleRef: ArticleRefIdPair | undefined,
		//replyRef: ArticleIdPair | undefined,
		medias: ArticleMedia[],
		public liked: boolean,
		public likeCount: number,
		public retweeted: boolean,
		public retweetCount: number,
		rawSource: any
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
			//replyRef,
			rawSource,
		});
	}

	get numberId() {
		return BigInt(this.id);
	}

	update(newArticle: this) {
		super.update(newArticle);

		this.deleted ||= newArticle.deleted;
	}

	getLikeCount(): number {
		return this.likeCount;
	}
	getLiked(): boolean {
		return this.liked;
	}

	getRepostCount(): number {
		return this.retweetCount;
	}
	getReposted(): boolean {
		return this.retweeted;
	}
}

export interface TwitterUser extends ArticleAuthor {
	id: string;
	avatarUrl: string;
}