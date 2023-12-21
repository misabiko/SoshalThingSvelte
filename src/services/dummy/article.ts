import Article from '../../articles';

export default class DummyArticle extends Article {
	static service = 'Dummy';

	constructor(
		readonly id: number,
		text: string,
		public liked: boolean,
		public reposted: boolean,
		markedAsReadStorage: string[],
	) {
		super({
			id,
			text,
			url: 'https://github.com/misabiko/SoshalThingSvelte',
			medias: [],
			markedAsRead: false,
			markedAsReadStorage,
		});
	}

	get numberId() {
		return this.id;
	}
}