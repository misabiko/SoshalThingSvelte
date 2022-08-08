import Article from '../../articles'
import type {ArticleAuthor} from '../../articles'
import type {ArticleMedia} from '../../articles/media'

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
		rawSource: any | undefined,
		public bookmarked: boolean | null,
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
			rawSource,
		})
	}

	get numberId() {
		return this.id
	}

	update(newArticle: this) {
		super.update(newArticle)

		this.liked ||= newArticle.liked
		//Probably simplifiable
		if (this.bookmarked === null)
			this.bookmarked = newArticle.bookmarked
		else
			this.bookmarked ||= newArticle.bookmarked
	}

	getLiked(): boolean {
		return this.liked
	}

	getReposted(): boolean {
		return !!this.bookmarked
	}
}

export interface PixivUser extends ArticleAuthor {
	id: number
}