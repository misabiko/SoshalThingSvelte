import type { ArticleIdPair, ArticleRefIdPair, ArticleWithRefs } from '~/articles';
import type {TwitterUser} from './article';
import TwitterArticle from './article';
import { getMarkedAsReadStorage } from '~/storages/serviceCache';
import {parseMedia, parseText} from './apiV1';
import type {Entities, ExtendedEntities} from './apiV1';
import {TwitterService} from './service';
import { getWritable } from '~/services/service';
import {get} from 'svelte/store';
import { sendRequest } from '~/services/remotePage';

export function parseResponse(instructions: Instruction[]): ArticleWithRefs[] {
	// if (instructions.filter(i => i.type === 'TimelineAddEntries').length !== 1)
	// 	console.warn('Unhandled multiple AddEntries instructions', instructions);

	const entries =
		((instructions.find(i => i.type === 'TimelineAddToModule') as AddToModuleInstruction | undefined)?.moduleItems) ??
		(instructions.find(i => i.type === 'TimelineAddEntries') as AddEntriesInstruction | undefined)?.entries;

	if (entries === undefined)
		throw new Error('No entries found');

	if (entries[0].entryId.startsWith('profile-grid-')) {
		let itemContents: ItemContent[];
		if (!entries[0].entryId.includes('-tweet-')) {
			const gridEntry = entries[0];
			if (gridEntry.item !== undefined)
				throw new Error('Unhandled profile grid entry type: ' + gridEntry.item.itemType);
			if (gridEntry.content.entryType !== 'TimelineTimelineModule')
				throw new Error('Unhandled profile grid entry type: ' + gridEntry.content.entryType);

			itemContents = gridEntry.content.items.map(i => i.item.itemContent);
		} else {
			itemContents = (entries as EntryWithItem[]).map(e => e.item.itemContent);
		}

		return itemContents
			//TODO Support TimelineTimelineModule (replies)
			// .filter(e => e.entryId.startsWith('profile-grid-0-tweet-'))
			.map(e => e.tweet_results.result)
			.filter(result => result?.legacy !== undefined)
			.map(result => {
				try {
					return articleFromResult(result);
				} catch (e) {
					console.error('Error parsing result tweet', result, e);
					return null;
				}
			})
			.filter((a): a is ArticleWithRefs => a !== null);
	} else {
		return (entries as EntryWithContent[])
			//TODO Support TimelineTimelineModule (replies)
			.filter(e => e.content.entryType === 'TimelineTimelineItem' && (e.entryId.startsWith('tweet-') || e.entryId.startsWith('profile-grid-0-tweet-')))
			.map(e => {
				//To calm down TypeScript
				if (e.content.entryType !== 'TimelineTimelineItem')
					throw new Error('Unhandled entry type: ' + e.content.entryType);
				return e.content.itemContent.tweet_results.result;
			})
			.filter(result => result?.legacy !== undefined)
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
}

export function articleFromResult(result: Result): ArticleWithRefs {
	const {text, textHtml} = parseText(result.legacy.full_text, result.legacy.entities, result.legacy.extended_entities);

	const article = (refs: ArticleRefIdPair | null = null) => new TwitterArticle(
		BigInt(result.legacy.id_str),
		text,
		textHtml,
		{
			username: result.core.user_results.result.legacy.screen_name,
			name: result.core.user_results.result.legacy.name,
			url: `https://twitter.com/${result.core.user_results.result.legacy.screen_name}`,
			id: result.legacy.user_id_str,
			avatarUrl: result.core.user_results.result.legacy.profile_image_url_https,
		} as TwitterUser,
		new Date(result.legacy.created_at),
		getMarkedAsReadStorage(TwitterService),
		refs,
		parseMedia(result.legacy.extended_entities),
		result.legacy.favorited,
		result.legacy.favorite_count,
		result.legacy.retweeted,
		result.legacy.retweet_count,
		[result],
	);

	if (result.legacy.retweeted_status_result !== undefined) {
		const reposted = articleFromResult(result.legacy.retweeted_status_result.result);
		if (reposted.type === 'repost' || reposted.type === 'reposts')
			throw new Error('Retweeted article is a retweet itself: ' + JSON.stringify(reposted));

		return {
			type: 'repost',
			article: article({
				type: 'repost',
				reposted: reposted.article.idPair
			}),
			reposted,
		};
	} else if (result.legacy.is_quote_status) {
		if (result.quoted_status_result === undefined) {
			console.debug('Quoted article not found (probably nested quotes): ', result);

			return {
				type: 'normal',
				article: article(),
			};
		}else {
			let quote_result = result.quoted_status_result.result;
			if (quote_result.tweet !== undefined)
				quote_result = quote_result.tweet;
			const quoted = articleFromResult(quote_result);
			if (quoted.type === 'repost' || quoted.type === 'reposts')
				throw new Error('Quoted article is a retweet itself: ' + JSON.stringify(quoted));

			return {
				type: 'quote',
				article: article({
					type: 'quote',
					quoted: quoted.article.idPair,
				}),
				quoted,
			};
		}
	} else
		return {
			type: 'normal',
			article: article(),
		};
}

export type Instruction =
	| AddEntriesInstruction
	| AddToModuleInstruction
	| {
	type: Omit<string, 'TimelineAddEntries' | 'TimelineAddToModule'>
};
export type AddEntriesInstruction = {
	type: 'TimelineAddEntries'
	entries: EntryWithContent[]
};
type AddToModuleInstruction = {
	type: 'TimelineAddToModule'
	moduleItems: EntryWithItem[]
};

type EntryWithContent = {
	entryId: string
	sortIndex: string
	content:
		| {
		entryType: 'TimelineTimelineItem'
		itemContent: ItemContent
	}
		| {
		entryType: 'TimelineTimelineModule'
		items: {
			entryId: string
			item: {
				entryType: 'TimelineTimelineItem'
				itemContent: ItemContent
			}
		}[]
	}
		| {
		entryType: 'TimelineTimelineCursor'
		__typename: 'TimelineTimelineCursor'
		value: string
		cursorType: 'Top' | 'Bottom'
	}
	item?: never
};
type EntryWithItem = {
	entryId: string
	item: {
		itemType: 'TimelineTweet'
		itemContent: ItemContent
	}
	content?: never
};

type ItemContent = {
	tweet_results: {
		result: Result
	}
};

export type Result = {
	legacy: Legacy
	core: {
		user_results: {
			result: {
				__typename: 'User'
				id: string
				rest_id: string
				affiliates_highlighted_label: object
				has_graduated_access: boolean
				is_blue_verified: boolean
				profile_image_shape: string
				legacy: {
					can_dm: boolean
					can_media_tag: boolean
					created_at: string
					default_profile: boolean
					default_profile_image: boolean
					description: string
					entities: Entities
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
	quoted_status_result?: {
		result: {
			tweet?: never
		} & Result
	} | {
		result: {
			__typename: string
			tweet: Result
			limitedActionResults: object
		}
	}
};

type Legacy = {
	id_str: string
	user_id_str: string
	full_text: string
	created_at: string
	entities: Entities
	extended_entities: ExtendedEntities
	favorited: boolean
	favorite_count: number
	retweeted: boolean
	retweet_count: number
	retweeted_status_result?: { result: Result }
	is_quote_status: boolean
};

export async function toggleLikeWebSocket(idPair: ArticleIdPair) {
	const writable = getWritable<TwitterArticle>(idPair);
	const liked = get(writable).liked;
	const request = liked ? 'unlikeTweet' : 'likeTweet';

	try {
		const response = await sendRequest<FavoriteResponse>(request, idPair.id.toString());

		if (response.errors !== undefined)
			throw response;
		if ((liked ? response.data.unfavorite_tweet : response.data.favorite_tweet) === 'Done')
			writable.update(a => {
				a.liked = !liked;
				return a;
			});
		else
			throw response;
	} catch (cause: ResponseError | any) {
		let shouldThrow = true;
		if (cause.errors !== undefined) {
			for (const err of (cause as ResponseError).errors)
				switch (err.code) {
					case 139:
						console.warn(cause);
						writable.update(a => {
							a.liked = true;
							return a;
						});

						if (cause.errors.length === 1)
							shouldThrow = false;
						break;
					case 144:
						writable.update(a => {
							a.deleted = true;
							return a;
						});

						if (cause.errors.length === 1)
							shouldThrow = false;
						break;
				}
		}

		if (shouldThrow)
			throw cause;
	}
}

export async function retweetWebSocket(idPair: ArticleIdPair) {
	const writable = TwitterService.articles[idPair.id as string][0];
	if (get(writable).retweeted)
		return;

	try {
		const response = await sendRequest<RetweetResponse>('retweetTweet', idPair.id.toString());

		if (response.errors !== undefined)
			throw response;
		if (response.data.create_retweet !== undefined)
			writable.update(a => {
				a.retweeted = true;
				return a;
			});
		else
			throw response;
	} catch (err: ResponseError | any) {
		if (err.errors !== undefined) {
			if ((err as ResponseError).errors.some(e => e.code === 144)) {
				writable.update(a => {
					a.deleted = true;
					return a;
				});
				if (err.errors.length === 1)
					return;
			}
		}

		throw new Error(err);
	}
}

export type FavoriteResponse = {
	data: {
		favorite_tweet: 'Done'
		unfavorite_tweet: undefined
	}
	errors: undefined
} | {
	data: {
		favorite_tweet: undefined
		unfavorite_tweet: 'Done'
	}
	errors: undefined
} | ResponseError;

export type RetweetResponse = {
	data: {
		create_retweet: {
			retweet_results: {
				result: {
					rest_id: string
					legacy: {
						full_text: string
					}
				}
			}
		}
	}
	errors: undefined
} | ResponseError;

export type ResponseError = {
	errors: ({
		message: string
		locations: {
			line: number
			column: number
		}[]
		path: string[]
		extensions: ResponseSingleError
	} & ResponseSingleError)[]
	data: object
};

export type ResponseSingleError = {
	name: string
	source: string
	code: number
	kind: string
	tracing: {
		trace_id: string
	}
};