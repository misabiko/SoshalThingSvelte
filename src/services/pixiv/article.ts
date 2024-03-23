import Article from '~/articles';
import type {ArticleAuthor} from '~/articles';
import type {ArticleMedia} from '~/articles/media';

export default class PixivArticle extends Article {
	static service = 'Pixiv';

	likeCount: number | null = null;
	bookmarkCount: number | null = null;

	//TODO Add tags

	constructor(
		readonly id: number,
		medias: ArticleMedia[],
		title: string,
		readonly author: PixivUser,
		public creationTime: Date | undefined,
		markedAsReadStorage: string[],
		rawSource: any | undefined,
		public liked: boolean,
		public bookmarked: boolean | null,
		fetched: boolean,
	) {
		super({
			id,
			url: 'https://www.pixiv.net/en/artworks/' + id,
			medias,
			markedAsRead: false,
			markedAsReadStorage,
			text: title,
			rawSource,
			fetched,
		});
	}

	get numberId() {
		return this.id;
	}

	update(newArticle: this) {
		super.update(newArticle);

		this.liked ||= newArticle.liked;
		//Probably simplifiable
		if (this.bookmarked === null)
			this.bookmarked = newArticle.bookmarked;
		else
			this.bookmarked ||= newArticle.bookmarked;
	}
}

export interface PixivUser extends ArticleAuthor {
	id: number
}

export type CachedPixivArticle = {
	id: number
	medias?: ArticleMedia[]
	liked?: boolean
	likeCount?: number
	bookmarkCount?: number
};