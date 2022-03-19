import type {ArticleAuthor} from '../article'
import Article from '../article'

export default class TwitterArticle extends Article {
	readonly author: ArticleAuthor;

	constructor(id: string, text: string, user: TwitterUser) {
		super(id, text);

		this.author = user;
	}

}

export interface TwitterUser extends ArticleAuthor {
	id: string;
}

export type Id = string;