export default class Article {
	readonly id: string;
	readonly text: string;
	readonly author?: ArticleAuthor;

	constructor(id: string, text: string) {
		this.id = id;
		this.text = text;
	}
}

export interface ArticleAuthor {
	username: string;
	name: string;
	url: string;
}