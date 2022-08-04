import Article from '../../articles'
import type {ArticleAuthor, ArticleMedia} from '../../articles'

export default class PixivArticle extends Article {
	static service: string

	liked = false

	constructor(
		readonly id: number,
		medias: ArticleMedia[],
		title: string,
		readonly author: PixivUser,
		public creationTime: Date | undefined,
		markedAsReadStorage: string[],
		hiddenStorage: string[],
		//TODO Rename to raw source
		json: any | undefined,
		public bookmarked: boolean,
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

	update(newArticle: this) {
		super.update(newArticle)

		this.liked ||= newArticle.liked
		this.bookmarked ||= newArticle.bookmarked
	}

	getLiked(): boolean {
		return this.liked
	}

	getReposted(): boolean {
		return this.bookmarked
	}
}

export interface PixivUser extends ArticleAuthor {
	id: number
}