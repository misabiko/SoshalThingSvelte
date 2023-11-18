import type { ArticleWithRefs } from 'articles';
import { Endpoint, RefreshType } from 'services/endpoints';
import { parseResponse, type Instruction } from 'services/twitter/pageAPI';
import { TwitterService } from 'services/twitter/service';
import { getCookie, getServiceStorage } from 'storages';

export default class TimelineAPI extends Endpoint {
	readonly service = TwitterService.name;
	readonly name: string;
	readonly endpointPath: string;

	topCursor: string | null = null;
	bottomCursor: string | null = null;

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

	async refresh(refreshType: RefreshType): Promise<ArticleWithRefs[]> {
		const bearerToken = getServiceStorage(TwitterService.name).bearerToken;
		if (!bearerToken)
			throw new Error('Bearer token not found');
		const csrfToken = getCookie('ct0');
		if (csrfToken === null)
			throw new Error('Csrf token not found');

		let cursor: string | undefined = undefined;
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

		const response = await fetch(`https://twitter.com/i/api/graphql/${this.endpointPath}${fetchParams(cursor)}`, {
			headers: {
				'Authorization': 'Bearer ' + bearerToken,
				'X-Csrf-Token': csrfToken,
			}
		});
		const data: HomeTimelineResponse = await response.json();

		if ('errors' in data)
			throw new Error('Error fetching tweets: ' + data.errors.map(e => e.message).join('\n'));

		const instructions = data.data.home.home_timeline_urt.instructions;

		const addEntries = instructions.find(i => i.type === 'TimelineAddEntries')?.entries;
		if (addEntries) {
			let foundTopCursor = false;
			let foundBottomCursor = false;
			for (const entry of addEntries) {
				if (entry.entryId.startsWith('cursor-top')) {
					this.topCursor = entry.content.value;
					this.refreshTypes.add(RefreshType.LoadTop);
					foundTopCursor = true;
				}else if (entry.entryId.startsWith('cursor-bottom')) {
					this.bottomCursor = entry.content.value;
					this.refreshTypes.add(RefreshType.LoadBottom);
					foundBottomCursor = true;
				}
			}

			if (!foundTopCursor) {
				this.topCursor = null;
				this.refreshTypes.delete(RefreshType.LoadTop);
			}
			if (!foundBottomCursor) {
				this.bottomCursor = null;
				this.refreshTypes.delete(RefreshType.LoadBottom);
			}
		}

		return parseResponse(instructions);
	}

	matchParams(_params: any): boolean {
		throw new Error('Method not implemented.');
	}
}

export enum TimelineType {
	ForYou,
	Following,
}

const fetchParams = (cursor: string | undefined) => '?variables='
	+ encodeURIComponent(JSON.stringify({
		includePromotedContent: true,
		cursor,
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