import type {ArticleAuthor, ArticleIdPair, ArticleRefIdPair} from '../article'
import Article from '../article'

export default class TwitterArticle extends Article {
	static service: string;

	readonly author: TwitterUser;
	readonly creationTime: Date;

	constructor(id: string, text: string, textHtml: string, user: TwitterUser, creationTime: Date, markedAsReadStorage: string[], articleRefs: ArticleRefIdPair[]) {
		super({
			id,
			url: `https://twitter.com/${user.username}/${id}`,
			text,
			textHtml,
			medias: [],
			markedAsRead: false,
			hidden: false,
			markedAsReadStorage,
			articleRefs,
		});

		this.author = user;
		this.creationTime = creationTime;
	}
}

export interface TwitterUser extends ArticleAuthor {
	id: string;
	avatarUrl: string;
}

export type Id = string;