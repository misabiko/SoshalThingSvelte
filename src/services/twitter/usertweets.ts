import type {ArticleWithRefs} from '../../articles';
import type {TwitterUser} from './article';
import TwitterArticle from './article';
import {getHiddenStorage, getMarkedAsReadStorage} from '../../storages/serviceCache';
import {parseMedia} from './apiV1';
import type {ExtendedEntities} from './apiV1';
import {TwitterService} from './service';

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
		.map(e => e.content.itemContent.tweet_results.result.legacy)
		.filter(legacy => legacy !== undefined)
		.map(legacy => {
			try {
				return articleFromLegacy(legacy);
			} catch (e) {
				console.error('Error parsing legacy tweet', legacy, e);
				return null;
			}
		})
		.filter((a): a is ArticleWithRefs => a !== null);
}

function articleFromLegacy(legacy: Legacy): ArticleWithRefs {
	return {
		type: 'normal',
		article: new TwitterArticle(
			BigInt(legacy.id_str),
			legacy.full_text,
			legacy.full_text,
			{
				id: legacy.user_id_str,
			} as unknown as TwitterUser,
			new Date(legacy.created_at),
			getMarkedAsReadStorage(TwitterService),
			getHiddenStorage(TwitterService),
			undefined,
			parseMedia(legacy.extended_entities),
			legacy.favorited,
			legacy.favorite_count,
			legacy.retweeted,
			legacy.retweet_count,
			legacy,
		),
	};
}

type UserTweetsResponse = {
	data: {
		user: {
			result: {
				timeline_v2: {
					timeline: {
						instructions: Instruction[];
					}
				}
			}
		}
	}
}

export type Instruction = AddEntriesInstruction | {type: string};
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
				result: {
					legacy: Legacy;
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
	retweeted_status_result: {result: Legacy} | undefined;
}