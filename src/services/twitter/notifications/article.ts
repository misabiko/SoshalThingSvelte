import Article, {type ArticleRefIdPair} from '~/articles';
import type {TwitterUser} from '../article';
import {notifications} from '~/notifications/store';

export default class TwitterNotificationArticle extends Article {
	static service = 'TwitterNotification';
	deleted = false;

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
		actualArticleRef: ArticleRefIdPair | null,
		rawSource: any,
	) {
		super({
			id,
			text,
			textHtml,
			medias: [],
			markedAsRead,
			markedAsReadStorage,
			actualArticleRef: actualArticleRef ?? undefined,
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

	update(newArticle: this) {
		super.update(newArticle);

		this.deleted ||= newArticle.deleted;
	}
}

export enum NotificationType {
	UsersLikedYourTweet = 'users_liked_your_tweet',
	UsersRetweetedYourTweet = 'users_retweeted_your_tweet',
	UserLikedMultipleTweets = 'user_liked_multiple_tweets',
	UserRetweetedMultipleTweets = 'user_retweeted_multiple_tweets',
	UsersLikedYourRetweet = 'users_liked_your_retweet',
	UsersRetweetedYourRetweet = 'users_retweeted_your_retweet',
	UsersLikedMentionOfYou = 'users_liked_mention_of_you',
	UsersRetweetedMentionOfYou = 'users_retweeted_mention_of_you',
	UserMentionedYou = 'user_mentioned_you',
	UsersLikedMediaTagOfYou = 'users_liked_media_tag_of_you',
	UsersRetweetedMediaTagOfYou = 'users_retweeted_media_tag_of_you',
	UserMediaTaggedYou = 'user_media_tagged_you',
	UserLikedTweetsAboutYou = 'user_liked_tweets_about_you',
	UserRetweetedTweetsAboutYou = 'user_retweeted_tweets_about_you',
	UsersFollowedYou = 'users_followed_you',
	FollowFromRecommendedUser = 'follow_from_recommended_user',
	UserRepliedToYourTweet = 'user_replied_to_your_tweet',
	GenericMagicRecFirstDegreeTweetRecent = 'generic_magic_rec_first_degree_tweet_recent',

	//Custom, because twitter marks liked/retweeted retweets as "multiple tweets"
	UserLikedMultipleOfYourRetweets = 'user_liked_multiple_of_your_retweets',
	UserRetweetedMultipleOfYourRetweets = 'user_retweeted_multiple_of_your_retweets',
}