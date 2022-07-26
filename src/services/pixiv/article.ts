import Article from '../article'
import type {ArticleAuthor, ArticleMedia} from '../article'

export default class PixivArticle extends Article {
	static service: string

	constructor(
		readonly id: number,
		medias: ArticleMedia[],
		title: string,
		readonly author: PixivUser,
		readonly creationTime: Date | undefined,
		markedAsReadStorage: string[],
		hiddenStorage: string[],
		//TODO Rename to raw source
		json: any | undefined
	) {
		super({
			id,
			url: 'https://www.pixiv.net/en/artworks/' + id,
			medias,
			markedAsRead: false,
			hidden: false,
			markedAsReadStorage,
			hiddenStorage,
			text: title,
			json,
		})
	}

	get numberId() {
		return this.id
	}
}

export interface PixivUser extends ArticleAuthor {
	id: number
}