export default abstract class Article {
	readonly id: string;
	readonly text: string;
	readonly author?: ArticleAuthor;
	readonly creationTime?: Date;

	protected constructor(id: string, text: string) {
		this.id = id;
		this.text = text;
	}
}

export interface ArticleAuthor {
	username: string;
	name: string;
	url: string;	//TODO delegate to service
	avatarUrl?: string;
}