import type { ArticleWithRefs } from 'articles';
import { Endpoint, RefreshType } from 'services/endpoints';
import { parseResponse, type Instruction, type ResponseError } from 'services/twitter/pageAPI';
import { TwitterService } from 'services/twitter/service';
import { getServiceStorage } from 'storages';

export default class UserTweetsAPI extends Endpoint {
	readonly service = TwitterService.name;
	readonly name: string;
	readonly endpointPath: string;

	constructor(readonly timelineType: TimelineType, readonly username: string, readonly userId: string) {
		super(new Set([RefreshType.RefreshStart, RefreshType.Refresh]));

		switch (timelineType) {
			case TimelineType.Tweets:
				this.name = 'UserTweetsAPI(' + username + ')';
				this.endpointPath = 'VgitpdpNZ-RUIp5D1Z_D-A/UserTweets';
				break;
			case TimelineType.Media:
				this.name = 'UserMediaAPI(' + username + ')';
				this.endpointPath = '7_ZP_xN3Bcq1I2QkK5yc2w/UserMedia';
				break;
			default:
				throw new Error('Unsupported timeline type');
		}
	}

	async refresh(_refreshType: RefreshType): Promise<ArticleWithRefs[]> {
		const response = await fetch(`https://twitter.com/i/api/graphql/${this.endpointPath}${fetchParams(this.userId)}`, {
			headers: {
				'Authorization': 'Bearer ' + getServiceStorage(TwitterService.name).bearerToken,
				//TODO Redo typescript friendly cookie thing
				'X-Csrf-Token': (await cookieStore.get('ct0')).value,
			}
		});
		const data: UserTweetsResponse = await response.json();

		if ('errors' in data)
			throw new Error('Error fetching tweets: ' + data.errors.map(e => e.message).join('\n'));

		return parseResponse(data.data.user.result.timeline_v2.timeline.instructions);
	}

	matchParams(_params: any): boolean {
		throw new Error('Method not implemented.');
	}
}

export enum TimelineType {
	Tweets,
	//Replies,
	Media,
	//Likes,
}

const fetchParams = (userId: string) => '?variables='
	+ encodeURIComponent(JSON.stringify({
		userId,
		// count: number,
		// cursor: string,
		includePromotedContent: true,
		// withQuickPromoteEligibilityTweetFields: true,
		withVoice: false,
		//withV2Timeline is optional and false by default, but we parse in v2 anyway
		withV2Timeline: true,
	}))
	+ '&features='
	+ encodeURIComponent(JSON.stringify({
		responsive_web_graphql_exclude_directive_enabled: true,
		verified_phone_label_enabled: false,
		responsive_web_home_pinned_timelines_enabled: true,
		creator_subscriptions_tweet_preview_api_enabled: true,
		responsive_web_graphql_timeline_navigation_enabled: true,
		responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
		c9s_tweet_anatomy_moderator_badge_enabled: true,
		tweetypie_unmention_optimization_enabled: true,
		responsive_web_edit_tweet_api_enabled: true,
		graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
		view_counts_everywhere_api_enabled: true,
		longform_notetweets_consumption_enabled: true,
		responsive_web_twitter_article_tweet_consumption_enabled: false,
		tweet_awards_web_tipping_enabled: false,
		freedom_of_speech_not_reach_fetch_enabled: true,
		standardized_nudges_misinfo: true,
		tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: true,
		longform_notetweets_rich_text_read_enabled: true,
		longform_notetweets_inline_media_enabled: true,
		responsive_web_media_download_video_enabled: false,
		responsive_web_enhance_cards_enabled: false
	}));

type UserTweetsResponse = {
	data: {
		user: {
			result: {
				timeline_v2: {
					timeline: {
						instructions: Instruction[]
						metadata: object
					}
				}
			}
		}
	}
} | ResponseError;