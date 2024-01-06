import {Endpoint, RefreshType} from '../../endpoints';
import type {ArticleWithRefs} from '~/articles';
import {TwitterNotificationService} from './service';
import TwitterNotificationArticle, {NotificationType} from './article';
import {getMarkedAsReadStorage} from '~/storages/serviceCache';
import {getWritable, registerEndpointConstructor} from '../../service';
import type {TwitterUser} from '../article';
import {articleFromV1, type Entities, type ExtendedEntities, parseText, type TweetResponse} from '../apiV1';

export default class NotificationAPIEndpoint extends Endpoint {
	static service = 'TwitterNotification';
	readonly name = 'NotificationAPIEndpoint';
	params = {};

	topCursor: string | null = null;
	bottomCursor: string | null = null;

	constructor() {
		super();
	}

	async refresh(refreshType: RefreshType): Promise<ArticleWithRefs[]> {
		let cursor: string | null = null;
		switch (refreshType) {
			case RefreshType.LoadTop:
				if (this.topCursor)
					cursor = this.topCursor;
				break;
			case RefreshType.LoadBottom:
				if (this.bottomCursor)
					cursor = this.bottomCursor;
				break;
		}

		const data: NotificationResponse = await TwitterNotificationService.fetch('https://twitter.com/i/api/2/notifications/all.json' + (cursor ? '?cursor=' + cursor : ''));
		const markedAsReads = getMarkedAsReadStorage(TwitterNotificationService);

		const deleteInstructions = data.timeline.instructions.filter(i => i.removeEntries);
		for (const deleteInstruction of deleteInstructions) {
			for (const entryId of deleteInstruction.removeEntries!.entryIds) {
				const article = getWritable<TwitterNotificationArticle>({service: TwitterNotificationService.name, id: entryId})
				//Maybe we could cache deleted article id if we don't have them yet and mark them when we find them
				article?.update(a => {
					a.deleted = true;
					return a;
				});
			}
		}

		const entriesInstructions: NotificationInstruction | undefined = data.timeline.instructions.find(i => i.addEntries?.entries);
		const articles: ArticleWithRefs[] = [];

		if (!entriesInstructions)
			return articles;
		else {
			let foundTopCursor = false;
			let foundBottomCursor = false;
			for (const entry of entriesInstructions.addEntries!.entries) {
				if (entry.content.operation?.cursor.cursorType === 'Top') {
					this.topCursor = entry.content.operation.cursor.value;
					this.refreshTypes.update(rt => {
						rt.add(RefreshType.LoadTop);
						return rt;
					});
					foundTopCursor = true;
				}else if (entry.content.operation?.cursor.cursorType === 'Bottom') {
					this.bottomCursor = entry.content.operation.cursor.value;
					this.refreshTypes.update(rt => {
						rt.add(RefreshType.LoadBottom);
						return rt;
					});
					foundBottomCursor = true;
				}else {
					if (!entry.content.item)
						throw new Error('Unknown notification entry type');

					let id;
					if (entry.content.item.content.notification) {
						id = entry.content.item.content.notification.id;

						const notification = data.globalObjects.notifications[id];
						const firstUserId = notification.template.aggregateUserActionsV1.fromUsers[0].user.id;
						const firstUser = data.globalObjects.users[firstUserId];
						const user: TwitterUser = {
							username: firstUser.screen_name,
							name: firstUser.name,
							id: firstUserId,
							avatarUrl: firstUser.profile_image_url_https,
							url: `https://twitter.com/${firstUser.screen_name}`,
						};

						// TODO Support quoting multiple articles
						const quotedTweetId = notification.template.aggregateUserActionsV1.targetObjects[0]?.tweet?.id ?? null;
						if (quotedTweetId !== null) {
							const rawQuoted = data.globalObjects.tweets[quotedTweetId];
							(rawQuoted as any).user = data.globalObjects.users[rawQuoted.user_id_str] as any;
							const quoted = articleFromV1(rawQuoted as unknown as TweetResponse, true);
							if (quoted.type === 'repost' || quoted.type === 'reposts')
								throw new Error('Notification ref is a retweet: ' + JSON.stringify(quoted));

							articles.push({
								type: 'quote',
								article: new TwitterNotificationArticle(
									id,
									new Date(parseInt(notification.timestampMs)),
									notification.message.text,
									undefined,
									entry.content.item.clientEventInfo.element as NotificationType,
									user,
									false,
									markedAsReads,
									{
										type: 'quote',
										quoted: quoted.article.idPair,
									},
									{
										entry,
										notification,
									}
								),
								quoted,
							});
						}else {
							articles.push({
								type: 'normal',
								article: new TwitterNotificationArticle(
									id,
									new Date(parseInt(notification.timestampMs)),
									notification.message.text,
									undefined,
									entry.content.item.clientEventInfo.element as NotificationType,
									user,
									false,
									markedAsReads,
									null,
									{
										entry,
										notification,
									}
								),
							});
						}
					}else {
						id = entry.entryId.replace('notification-', '');

						const tweet = data.globalObjects.tweets[entry.content.item.content.tweet.id];
						const userId = tweet.user_id_str;
						const globalUser = data.globalObjects.users[userId];
						const user: TwitterUser = {
							username: globalUser.screen_name,
							name: globalUser.name,
							id: userId,
							avatarUrl: globalUser.profile_image_url_https,
							url: `https://twitter.com/${globalUser.screen_name}`,
						};

						const { text, textHtml } = parseText(tweet.full_text ?? tweet.text ?? '', tweet.entities, tweet.extended_entities);

						(tweet as any).user = data.globalObjects.users[tweet.user_id_str] as any;
						const quoted = articleFromV1(tweet as unknown as TweetResponse, true);
						if (quoted.type === 'repost' || quoted.type === 'reposts')
							throw new Error('Notification ref is a retweet: ' + JSON.stringify(quoted));

						articles.push({
							type: 'quote',
							article: new TwitterNotificationArticle(
								id,
								new Date(tweet.created_at),
								text,
								textHtml,
								entry.content.item.clientEventInfo.element as NotificationType,
								user,
								false,
								markedAsReads,
								{
									type: 'quote',
									quoted: quoted.article.idPair,
								},
								{
									entry,
									tweet,
								},
							),
							quoted,
						});
					}
				}
			}

			if (!foundTopCursor) {
				this.topCursor = null;
				this.refreshTypes.update(rt => {
					rt.delete(RefreshType.LoadTop);
					return rt;
				});
			}
			if (!foundBottomCursor) {
				this.bottomCursor = null;
				this.refreshTypes.update(rt => {
					rt.delete(RefreshType.LoadBottom);
					return rt;
				});
			}
		}

		return articles;
	}

	matchParams(_params: any): boolean {
		return true;
	}

	static readonly constructorInfo = {
		name: 'NotificationAPIEndpoint',
		paramTemplate: [],
		constructor: () => new NotificationAPIEndpoint(),
	};
}

registerEndpointConstructor(NotificationAPIEndpoint);

type NotificationResponse = {
	globalObjects: {
		//V1 Twitter User
		users: Record<string, {
			// id: number
			// id_str: string
			name: string
			screen_name: string
			// location: string
			// description: string
			// url: null
			// entities: {
			// 	description: {
			// 		urls: []
			// 	}
			// },
			// protected: boolean
			// followers_count: number
			// friends_count: number
			// listed_count: number
			// created_at: string
			// favourites_count: number
			// utc_offset: null
			// time_zone: null
			// geo_enabled: boolean
			// verified: boolean
			// statuses_count: number
			// lang: null
			// contributors_enabled: boolean
			// is_translator: boolean
			// is_translation_enabled: boolean
			// profile_background_color: string
			// profile_background_image_url: string
			// profile_background_image_url_https: string
			// profile_background_tile: boolean
			// profile_image_url: string
			profile_image_url_https: string
			// profile_banner_url: string
			// profile_link_color: string
			// profile_sidebar_border_color: string
			// profile_sidebar_fill_color: string
			// profile_text_color: string
			// profile_use_background_image: boolean
			// default_profile: boolean
			// default_profile_image: boolean
			// following: boolean
			// follow_request_sent: null
			// notifications: null
			// blocking: boolean
			// blocked_by: boolean
			// want_retweets: boolean
			// profile_interstitial_type: string
			// translator_type: string
			// withheld_in_countries: []
			// followed_by: boolean
			// ext_is_blue_verified: boolean
			// ext_highlighted_label: {}
		}>
		tweets: Record<string, {
			created_at: string
			id: number
			id_str: string
			text?: string
			full_text?: string
			truncated: boolean
			display_text_range: [number, number]
			entities: Entities
			extended_entities?: ExtendedEntities
			source: string
			in_reply_to_status_id: number
			in_reply_to_status_id_str: string
			in_reply_to_user_id: number
			in_reply_to_user_id_str: string
			in_reply_to_screen_name: string
			user_id: number
			user_id_str: string
			geo: null
			coordinates: null
			place: null
			contributors: null
			is_quote_status: boolean
			retweet_count: number
			favorite_count: number
			conversation_id: number
			conversation_id_str: string
			conversation_muted: boolean
			favorited: boolean
			retweeted: boolean
			lang: string
		}>
		notifications: Record<string, {
			id: string
			timestampMs: string
			icon: {
				id: string // "heart_icon"
			},
			message: {
				text: string
				entities: {
					fromIndex: number
					toIndex: number
					ref: {
						user: {
							id: string
						}
					}
				}[],
				rtl: boolean
			},
			template: {
				aggregateUserActionsV1: {
					targetObjects: {
						tweet: {
							id: string
						}
					}[],
					fromUsers: {
						user: {
							id: string
						}
					}[]
				}
			}
		}>
	}
	timeline: {
		id: string
		instructions: NotificationInstruction[]
	}
};

type NotificationInstruction =
| {
	clearCache: object
	addEntries?: never
	removeEntries?: never
}
| {
	addEntries: {
		entries: NotificationEntry[]
	}
	removeEntries?: never
}
| {
	clearEntriesUnreadState: object
	addEntries?: never
	removeEntries?: never
}
| {
	markEntriesUnreadGreaterThanSortIndex: {
		sortIndex: string
	}
	addEntries?: never
	removeEntries?: never
}
| {
	addEntries?: never
	removeEntries: {
		entryIds: string[]
	}
};

type NotificationEntry =
| {
	entryId: string	//'notification-' + notificationId
	sortIndex: string
	content: {
		item: {
			content:
			| {
				notification: {
					id: string
					url: {
						urlType: 'ExternalUrl'
						url: string
					}
				}
				tweet?: never
			}
			| {
				tweet: {
					id: string
					displayType: string	//'Tweet'
				}
				notification?: never
			}
			clientEventInfo: {
				component: string	//'urt'
				element:
					| 'user_liked_multiple_tweets'
					| 'users_liked_your_retweet'
					| 'users_retweeted_your_retweet'
					| string
				details: {
					notificationDetails: {
						impressionId: string
						metadata: string
					}
				}
			}
		}
		operation?: never
	}
}
| {
	entryId: string	//'cursor-' + ('top-' | 'bottom-') + cursorId
	sortIndex: string
	content: {
		operation: {
			cursor: {
				value: string
				cursorType: 'Top' | 'Bottom'
			}
		}
		item?: never
	}
};

// type NotificationParams = {
// 	include_profile_interstitial_type: 1
// 	include_blocking: 1
// 	include_blocked_by: 1
// 	include_followed_by: 1
// 	include_want_retweets: 1
// 	include_mute_edge: 1
// 	include_can_dm: 1
// 	include_can_media_tag: 1
// 	include_ext_has_nft_avatar: 1
// 	include_ext_is_blue_verified: 1
// 	include_ext_verified_type: 1
// 	include_ext_profile_image_shape: 1
// 	skip_status: 1
// 	cards_platform: 'Web - 12'
// 	include_cards: 1
// 	include_ext_alt_text: true
// 	include_ext_limited_action_results: true
// 	include_quote_count: true
// 	include_reply_count: 1
// 	tweet_mode: 'extended'
// 	include_ext_views: true
// 	include_entities: true
// 	include_user_entities: true
// 	include_ext_media_color: true
// 	include_ext_media_availability: true
// 	include_ext_sensitive_media_warning: true
// 	include_ext_trusted_friends_metadata: true
// 	send_error_codes: true
// 	simple_quoted_tweet: true
// 	count: 20
// 	requestContext: 'launch'
// 	ext: ['mediaStats', 'highlightedLabel', 'hasNftAvatar', 'voiceInfo', 'birdwatchPivot', 'superFollowMetadata', 'unmentionInfo', 'editControl']
// }