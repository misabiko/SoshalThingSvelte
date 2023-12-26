import Article from '../../../articles';
import type {TwitterUser} from '../article';
import {notifications} from '../../../notifications/store';

export default class TwitterNotificationArticle extends Article {
	static service = 'TwitterNotification';

	constructor(
		readonly id: string,
		readonly creationTime: Date,
		text: string,
		readonly type: NotificationType,
		//TODO Support multiple users (especially in SocialArticleView)
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
		});

		//temp
		switch (type) {
			case NotificationType.UsersRetweetedYourTweet:
			case NotificationType.UserLikedMultipleTweets:
			case NotificationType.UsersRetweetedMultipleTweet:
			case NotificationType.UsersLikedYourRetweet:
			case NotificationType.UsersRetweetedYourRetweet:
			case NotificationType.UsersFollowedYou:
				break;
			default:
				console.warn('Unknown notification type', type);
				notifications.notify({
					type: 'error',
					text: 'Unknown notification type: ' + type,
				});
		}
	}

	//TODO See if we can make this optional
	get numberId() {
		return 0;
	}
}

export enum NotificationType {
	UsersRetweetedYourTweet = 'users_retweeted_your_tweet',
	UserLikedMultipleTweets = 'user_liked_multiple_tweets',
	UsersRetweetedMultipleTweet = 'user_retweeted_multiple_tweets',
	UsersLikedYourRetweet = 'users_liked_your_retweet',
	UsersRetweetedYourRetweet = 'users_retweeted_your_retweet',
	UsersFollowedYou = 'users_followed_you',
}