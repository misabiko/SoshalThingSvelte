import type {ArticleAuthor} from '../article'
import Article from '../article'

export default class TwitterArticle extends Article {
	static service: string;

	readonly author: TwitterUser;
	readonly creationTime: Date;

	constructor(id: string, text: string, user: TwitterUser, creationTime: Date, markedAsReadStorage: string[]) {
		super({
			id,
			text,
			url: `https://twitter.com/${user.username}/${id}`,
			medias: [],
			markedAsRead: false,
			hidden: false,
			markedAsReadStorage,
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