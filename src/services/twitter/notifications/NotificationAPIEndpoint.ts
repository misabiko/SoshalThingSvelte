import {Endpoint, RefreshType} from '../../endpoints';
import type {ArticleWithRefs} from '../../../articles';
import {TwitterNotificationService} from './service';
import TwitterNotificationArticle, {NotificationType} from './article';
import {getMarkedAsReadStorage} from '../../../storages/serviceCache';
import {registerEndpointConstructor} from '../../service';
import type {TwitterUser} from '../article';

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
						throw new Error('Notification entry has no item');

					const id = entry.content.item.content.notification.id;
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

					articles.push({
						type: 'normal',
						article: new TwitterNotificationArticle(
							id,
							new Date(parseInt(notification.timestampMs)),
							notification.message.text,
							entry.content.item.clientEventInfo.element as NotificationType,
							user,
							false,
							markedAsReads,
							{
								entry,
								notification,
							}
						)
					});
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
				rtl: false
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
	clearCache: {}
	addEntries?: never
}
| {
	addEntries: {
		entries: NotificationEntry[]
	}
}
| {
	clearEntriesUnreadState: {}
	addEntries?: never
}
| {
	markEntriesUnreadGreaterThanSortIndex: {
		sortIndex: string
	}
	addEntries?: never
};

type NotificationEntry =
| {
	entryId: string	//'notification-' + notificationId
	sortIndex: string
	content: {
		item: {
			content: {
				notification: {
					id: string
					url: {
						urlType: 'ExternalUrl'
						url: string
					}
				}
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