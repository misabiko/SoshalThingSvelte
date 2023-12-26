import Article from '../../../articles';
import type {TwitterUser} from '../article';

export default class TwitterNotificationArticle extends Article {
	static service = 'TwitterNotification';

	constructor(
		readonly id: string,
		readonly creationTime: Date,
		text: string,
		readonly author: TwitterUser,
		markedAsRead: boolean,
		markedAsReadStorage: string[],
		rawSource: any,
	) {
		super({
			id,
			text,
			medias: [],
			markedAsRead,
			markedAsReadStorage,
			rawSource,
		})
	}

	//TODO See if we can make this optional
	get numberId() {
		return 0;
	}
}