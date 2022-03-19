import type {ArticleAuthor} from '../article'
import Article from '../article'

export default class TwitterArticle extends Article {
	readonly author: TwitterUser;
	readonly creationTime: Date;

	constructor(id: string, text: string, user: TwitterUser, creationTime: Date) {
		super(id, text);

		this.author = user;
		this.creationTime = creationTime;
	}

}

export interface TwitterUser extends ArticleAuthor {
	id: string;
	avatarUrl: string;
}

export type Id = string;