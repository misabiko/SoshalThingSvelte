import type { ArticleWithRefs } from 'articles';
import { Endpoint, RefreshType } from 'services/endpoints';
import { parseResponse, type Instruction, type ResponseError, type AddEntriesInstruction } from 'services/twitter/pageAPI';
import { TwitterService } from 'services/twitter/service';
import { getCookie, getServiceStorage } from 'storages';

export default abstract class APIEndpoint<Response extends APIResponse> extends Endpoint {
	readonly service = TwitterService.name;
	abstract readonly name: string;
	abstract readonly endpointPath: string;

	topCursor: string | null = null;
	bottomCursor: string | null = null;

	constructor() {
		super(new Set([RefreshType.RefreshStart, RefreshType.Refresh]));
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

		const { variables, features } = this.fetchParams();
		const params = '?variables='
			+ encodeURIComponent(JSON.stringify({
				...variables,
				cursor,
			}))
			+ '&features='
			+ encodeURIComponent(JSON.stringify(features));

		const response = await fetch(`https://twitter.com/i/api/graphql/${this.endpointPath}${params}`, {
			headers: {
				'Authorization': 'Bearer ' + bearerToken,
				'X-Csrf-Token': csrfToken,
			}
		});
		const data: Response | ResponseError = await response.json();

		if ('errors' in data)
			throw new Error('Error fetching tweets: ' + data.errors.map(e => e.message).join('\n'));

		const instructions = this.getInstructions(data);

		const addEntries = (instructions.find(i => i.type === 'TimelineAddEntries') as AddEntriesInstruction)?.entries;
		if (addEntries) {
			let foundTopCursor = false;
			let foundBottomCursor = false;
			for (const entry of addEntries) {
				if (entry.content.entryType === 'TimelineTimelineCursor') {
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

	abstract getInstructions(data: Response): Instruction[];

	fetchParams(): APIParams {
		return {
			variables: {
				includePromotedContent: true,
			},
			features: {
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
				responsive_web_enhance_cards_enabled: false,
			}
		};
	}
}

export type APIResponse = {
	data: object
};

export type APIParams = {
	variables: {
		includePromotedContent: boolean
		[other: string]: any
	}
	features: {
		responsive_web_graphql_exclude_directive_enabled: boolean
		verified_phone_label_enabled: boolean
		responsive_web_home_pinned_timelines_enabled: boolean
		creator_subscriptions_tweet_preview_api_enabled: boolean
		responsive_web_graphql_timeline_navigation_enabled: boolean
		responsive_web_graphql_skip_user_profile_image_extensions_enabled: boolean
		c9s_tweet_anatomy_moderator_badge_enabled: boolean
		tweetypie_unmention_optimization_enabled: boolean
		responsive_web_edit_tweet_api_enabled: boolean
		graphql_is_translatable_rweb_tweet_is_translatable_enabled: boolean
		view_counts_everywhere_api_enabled: boolean
		longform_notetweets_consumption_enabled: boolean
		responsive_web_twitter_article_tweet_consumption_enabled: boolean
		tweet_awards_web_tipping_enabled: boolean
		freedom_of_speech_not_reach_fetch_enabled: boolean
		standardized_nudges_misinfo: boolean
		tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: boolean
		longform_notetweets_rich_text_read_enabled: boolean
		longform_notetweets_inline_media_enabled: boolean
		responsive_web_media_download_video_enabled: boolean
		responsive_web_enhance_cards_enabled: boolean
	}
}