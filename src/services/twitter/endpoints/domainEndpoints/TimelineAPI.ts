import type { ArticleWithRefs } from 'articles';
import { Endpoint, RefreshType } from 'services/endpoints';
import { parseResponse, type Instruction } from 'services/twitter/pageAPI';
import { TwitterService } from 'services/twitter/service';
import { getServiceStorage } from 'storages';

export class TimelineAPI extends Endpoint {
	readonly service = TwitterService.name;
	readonly name: string;
	readonly endpointPath: string;

	constructor(readonly timelineType: TimelineType) {
		super(new Set([RefreshType.RefreshStart, RefreshType.Refresh]));

		switch (timelineType) {
			case TimelineType.ForYou:
				this.name = 'ForYouTimelineAPI';
				this.endpointPath = 'QwrCVrjexN3CAvAAVDU5iw/HomeTimeline';
				break;
			case TimelineType.Following:
				this.name = 'FollowingTimelineAPI';
				this.endpointPath = 'Qe2CCi4SE0Dvsb1TYrDfKQ/HomeLatestTimeline';
				break;
			default:
				throw new Error('Unsupported timeline type');
		}
	}

	async refresh(_refreshType: RefreshType): Promise<ArticleWithRefs[]> {
		const response = await fetch(`https://twitter.com/i/api/graphql/${this.endpointPath}${fetchParams}`, {
			headers: {
				'Authorization': 'Bearer ' + getServiceStorage(TwitterService.name).bearerToken,
				//TODO Redo typescript friendly cookie thing
				'X-Csrf-Token': (await cookieStore.get('ct0')).value,
			}
		});
		const data = await response.json();

		return parseResponse(data.data.home.home_timeline_urt.instructions);
	}

	matchParams(_params: any): boolean {
		throw new Error('Method not implemented.');
	}
}

export enum TimelineType {
	ForYou,
	Following,
}

const fetchParams = '?variables='
	+ encodeURIComponent(JSON.stringify({
		includePromotedContent: true
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

type HomeTimelineResponse = {
	data: {
		home: {
			home_timeline_urt: {
				instructions: Instruction[]
				responseObjects: object
				metadata: object
			}
		}
	}
};