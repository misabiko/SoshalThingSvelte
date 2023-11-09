import type { ArticleRefIdPair, ArticleWithRefs } from '../../articles';
import type { TwitterUser } from './article';
import TwitterArticle from './article';
import { getHiddenStorage, getMarkedAsReadStorage } from '../../storages/serviceCache';
import { parseMedia } from './apiV1';
import type { ExtendedEntities } from './apiV1';
import { TwitterService } from './service';

export function parseResponse(instructions: Instruction[]): ArticleWithRefs[] {
	//TODO Temporary assert
	if (instructions.filter(i => i.type === 'TimelineAddEntries').length !== 1)
		console.warn('Unhandled multiple AddEntries instructions', instructions);

	const addEntries = instructions.find(i => i.type === 'TimelineAddEntries') as AddEntriesInstruction | undefined;
	const entries = addEntries?.entries;

	if (entries === undefined)
		throw new Error('No entries found');

	return entries
		.filter(e => e.content.entryType === 'TimelineTimelineItem')
		.map(e => e.content.itemContent.tweet_results.result)
		.filter(result => result !== undefined)
		.map(result => {
			try {
				return articleFromResult(result);
			} catch (e) {
				console.error('Error parsing result tweet', result, e);
				return null;
			}
		})
		.filter((a): a is ArticleWithRefs => a !== null);
}

function articleFromResult(result: Result): ArticleWithRefs {
	const article = (actualArticleRef?: ArticleRefIdPair) => new TwitterArticle(
		BigInt(result.legacy.id_str),
		result.legacy.full_text,
		result.legacy.full_text,
		{
			username: result.core.user_results.result.legacy.screen_name,
			name: result.core.user_results.result.legacy.name,
			url: `https://twitter.com/${result.core.user_results.result.legacy.screen_name}`,
			id: result.legacy.user_id_str,
			avatarUrl: result.core.user_results.result.legacy.profile_image_url_https,
		} as TwitterUser,
		new Date(result.legacy.created_at),
		getMarkedAsReadStorage(TwitterService),
		getHiddenStorage(TwitterService),
		actualArticleRef,
		parseMedia(result.legacy.extended_entities),
		result.legacy.favorited,
		result.legacy.favorite_count,
		result.legacy.retweeted,
		result.legacy.retweet_count,
		result.legacy,
	);

	/* if (legacy.is_quote_status)
		return {
			type: 'quote',
			article: article(),
			reposted: legacy.retweeted_status_result !== undefined ? articleFromLegacy(legacy.retweeted_status_result.result.legacy) : undefined,
		};
	else  */if (result.legacy.retweeted_status_result !== undefined) {
		const reposted = articleFromResult(result.legacy.retweeted_status_result.result);
		return {
			type: 'repost',
			article: article({
				type: 'repost',
				reposted: reposted.article.idPair
			}),
			reposted,
		};
	} else
		return {
			type: 'normal',
			article: article(),
		};
}

export type Instruction = AddEntriesInstruction | { type: string };
type AddEntriesInstruction = {
	type: 'TimelineAddEntries';
	entries: Entry[];
};

type Entry = {
	entryId: string;
	sortIndex: string;
	content: {
		entryType: 'TimelineTimelineItem';
		itemContent: {
			tweet_results: {
				result: Result
			}
		}
	}
}

type Result = {
	legacy: Legacy;
	core: {
		user_results: {
			result: {
				__typename: 'User'
				id: string
				rest_id: string
				affiliates_highlighted_label: {}
				has_graduated_access: boolean
				is_blue_verified: boolean
				profile_image_shape: string
				legacy: {
					protected: boolean
					can_dm: boolean
					can_media_tag: boolean
					created_at: Date
					default_profile: boolean
					default_profile_image: boolean
					description: string
					// entities: Entities
					fast_followers_count: number
					favourites_count: number
					followers_count: number
					friends_count: number
					has_custom_timelines: boolean
					is_translator: boolean
					listed_count: number
					location: string
					media_count: number
					name: string
					needs_phone_verification: boolean
					normal_followers_count: number
					pinned_tweet_ids_str: []
					possibly_sensitive: boolean
					profile_image_url_https: string
					profile_interstitial_type: string
					screen_name: string
					statuses_count: number
					translator_type: string
					verified: boolean
					want_retweets: boolean
					withheld_in_countries: []
				}
			}
		}
	}
}

type Legacy = {
	id_str: string;
	user_id_str: string;
	full_text: string;
	created_at: string;
	extended_entities: ExtendedEntities;
	favorited: boolean;
	favorite_count: number;
	retweeted: boolean;
	retweet_count: number;
	retweeted_status_result?: { result: Result };
	is_quote_status: boolean;
}