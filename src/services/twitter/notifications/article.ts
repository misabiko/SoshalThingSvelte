import Article from '~/articles';
import type {TwitterUser} from '../article';
import {notifications} from '~/notifications/store';

export default class TwitterNotificationArticle extends Article {
	static service = 'TwitterNotification';

	constructor(
		readonly id: string,
		readonly creationTime: Date,
		text: string,
		textHtml: string | undefined,
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
			textHtml,
			medias: [],
			markedAsRead,
			markedAsReadStorage,
			rawSource,
		});

		//Temporarily detecting unknown notification types
		if (!Object.values(NotificationType).includes(type)) {
			console.warn('Unknown notification type', type);
			notifications.notify({
				type: 'error',
				text: 'Unknown notification type: ' + type,
			});
		}
	}

	//TODO Use sortIndex
	get numberId() {
		return 0;
	}
}

export enum NotificationType {
	UsersLikedYourTweet = 'users_liked_your_tweet',
	UsersRetweetedYourTweet = 'users_retweeted_your_tweet',
	UserLikedMultipleTweets = 'user_liked_multiple_tweets',
	UsersRetweetedMultipleTweet = 'user_retweeted_multiple_tweets',
	UsersLikedYourRetweet = 'users_liked_your_retweet',
	UsersRetweetedYourRetweet = 'users_retweeted_your_retweet',
	UsersLikedMentionOfYou = 'users_liked_mention_of_you',
	UsersRetweetedMentionOfYou = 'users_retweeted_mention_of_you',
	UsersLikedMediaTagOfYou = 'users_liked_media_tag_of_you',
	UsersRetweetedMediaTagOfYou = 'users_retweeted_media_tag_of_you',
	UserRetweetedTweetsAboutYou = 'user_retweeted_tweets_about_you',
	UsersFollowedYou = 'users_followed_you',
	UserRepliedToYourTweet = 'user_replied_to_your_tweet',
	GenericMagicRecFirstDegreeTweetRecent = 'generic_magic_rec_first_degree_tweet_recent',
}