import Article from '../article'

export default class DummyArticle extends Article {
	static service: string;

	constructor(
		id: number,
		text: string,
		public liked: boolean,
		public reposted: boolean,
	) {
		super({
			id,
			text,
			url: 'https://github.com/misabiko/SoshalThingSvelte',
			medias: [],
			markedAsRead: false,
			hidden: false,
			markedAsReadStorage: [],
			articleRefs: [],
		})
	}

	getLikeCount(): number {
		return this.liked ? 1 : 0
	}
	getLiked(): boolean {
		return this.liked
	}

	getRepostCount(): number {
		return this.reposted ? 1 : 0
	}
	getReposted(): boolean {
		return this.reposted
	}
}