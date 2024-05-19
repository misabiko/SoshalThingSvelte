import type {ArticleAuthor, ArticleRefIdPair} from '~/articles';
import Article from '~/articles';
import type {ArticleMedia} from '~/articles/media';

export default class TwitterArticle extends Article {
	//Giving up on using TwitterService.name, endpoints are safe, but too much race condition on articles
	static service = 'Twitter';
	deleted = false;

	constructor(
		readonly id: bigint,
		text: string,
		textHtml: string,
		readonly author: TwitterUser,
		readonly creationTime: Date,
		markedAsReadStorage: string[],
		refs: ArticleRefIdPair | null,
		medias: ArticleMedia[],
		public liked: boolean,
		public likeCount: number,
		public retweeted: boolean,
		public retweetCount: number,
		rawSource: any[]
	) {
		super({
			id,
			url: `https://twitter.com/${author.username}/status/${id}`,
			text,
			textHtml,
			medias,
			markedAsRead: false,
			markedAsReadStorage,
			refs,
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
}

export interface TwitterUser extends ArticleAuthor {
	id: string
	avatarUrl: string
}