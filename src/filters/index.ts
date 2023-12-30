import type { ArticleWithRefs } from '~/articles';
import {articleWithRefToArray} from '~/articles';
import {getServices} from '~/services/service';
import {type ArticleMedia, MediaType} from '~/articles/media';

//TODO Filter groups and boolean filters

export type FilterInstance = {
	filter: Filter
	enabled: boolean
	inverted: boolean
}

export type Filter = ({
	type: string
	service: string
} | {
	type: GenericFilter
	service: null
}) & {
	props: Record<string, any>
}

type GenericFilter =
	| 'media'
	| 'animated'
	| 'notMarkedAsRead'
	| 'noRef'
	| 'selfRepost'
	| 'selfQuote'
	| 'repost'
	//TODO Test quote filter
	| 'quote'
	| 'interval'
//TODO Number of medias (with equal, less than, greater than, etc)

export type FilterInfo<S extends string = string> = {
	type: S
	name: string
	invertedName: string
	props: Record<string, PropType>
}

export function getFilterName(filter: FilterInfo, inversed: boolean): string {
	return inversed ? filter.invertedName : filter.name;

}

export type PropType =
| {
	type: 'string' | 'boolean' | 'string[]'
}
| {
	type: 'number'
	min?: number
	max?: number
}

export const genericFilterTypes: Record<GenericFilter, FilterInfo<GenericFilter>> = {
	media: {
		type: 'media',
		name: 'Has media',
		invertedName: 'Without media',
		props: {},
	},
	animated: {
		type: 'animated',
		name: 'Animated',
		invertedName: 'Not animated',
		props: {},
	},
	notMarkedAsRead: {
		type: 'notMarkedAsRead',
		name: 'Not marked as read',
		invertedName: 'Marked as read',
		props: {},
	},
	noRef: {
		type: 'noRef',
		name: "Doesn't references other articles",
		invertedName: 'References other articles',
		props: {},
	},
	repost: {
		type: 'repost',
		name: 'Repost',
		invertedName: 'Not a repost',
		props: {
			byUsername: {
				type: 'string',
			},
		},
	},
	quote: {
		type: 'quote',
		name: 'Quote',
		invertedName: 'Not a quote',
		props: {
			byUsername: {
				type: 'string',
			},
		},
	},
	selfRepost: {
		type: 'selfRepost',
		name: 'Self repost',
		invertedName: 'Not a self repost',
		props: {},
	},
	selfQuote: {
		type: 'selfQuote',
		name: 'Self quote',
		invertedName: 'Not a self quote',
		props: {},
	},
	interval: {
		type: 'interval',
		name: 'By interval',
		invertedName: 'Not by interval',
		props: {
			interval: {
				type: 'number',
				min: 1,
			},
			offset: {
				type: 'number',
				min: 0,
			},
			includeOffset: {
				type: 'boolean'
			},
		},
	},
};

export function defaultFilter(filterType: string, service: string | null): Filter {
	if (service)
		return getServices()[service].defaultFilter(filterType);

	switch (filterType) {
		case 'interval':
			return {
				type: filterType,
				props: {
					interval: 3,
					offset: 0,
					includeOffset: false,
				},
				service: null,
			};
		default:
			return {
				type: filterType as GenericFilter,
				service: null,
				props: {},
			};
	}
}

export const defaultFilterInstances: FilterInstance[] = [
	{
		filter: {type: 'notMarkedAsRead', service: null, props: {}},
		enabled: true,
		inverted: false,
	},
];

export function keepArticle(articleWithRefs: ArticleWithRefs, index: number, filter: Filter): boolean {
	if (filter.service !== null)
		return getServices()[filter.service].keepArticle(articleWithRefs, index, filter);
	else
		return keepArticleGeneric(articleWithRefs, index, filter);
}

function keepArticleGeneric(articleWithRefs: ArticleWithRefs, index: number, filter: Filter): boolean {
	switch (filter.type as GenericFilter) {
		case 'media':
			return articleWithRefToArray(articleWithRefs).some(a => a.medias.length > 0);
		case 'animated':
			return articleWithRefToArray(articleWithRefs).some(a => a.medias.some(isAnimated));
		case 'notMarkedAsRead':
			switch (articleWithRefs.type) {
				case 'normal':
					return !articleWithRefs.article.markedAsRead;
				case 'repost':
					return !articleWithRefs.article.markedAsRead && keepArticleGeneric(articleWithRefs.reposted, index, filter);
				case 'reposts':
					return articleWithRefs.reposts.every(a => !a.markedAsRead) && keepArticleGeneric(articleWithRefs.reposted, index, filter);
				case 'quote':
					return !articleWithRefs.article.markedAsRead;// && keepArticleGeneric(articleWithRefs.quoted, index, filter);
				default:
					throw new Error(`Unknown article type: ${(articleWithRefs as unknown as any).type}`);
			}
		case 'noRef':
			return articleWithRefs.type === 'normal';
		case 'repost':
			if (articleWithRefs.type === 'repost') {
				if (filter.props.byUsername?.length) {
					return articleWithRefs.article.author?.username === filter.props.byUsername;
				}else
					return true;
			}

			return false;
		case 'quote':
			if (articleWithRefs.type === 'quote') {
				if (filter.props.byUsername?.length)
					return articleWithRefs.article.author?.username === filter.props.byUsername;
				else
					return true;
			}

			return false;
		case 'selfRepost':
			if (articleWithRefs.type === 'repost')
				return articleWithRefs.article.author?.username === articleWithRefs.reposted.article.author?.username;

			return false;
		case 'selfQuote':
			if (articleWithRefs.type === 'quote')
				return articleWithRefs.article.author?.username === articleWithRefs.quoted.article.author?.username;

			return false;
		case 'interval':
			if (index < filter.props.offset)
				return filter.props.includeOffset;
			else
				return (index - filter.props.offset) % filter.props.interval === filter.props.interval - 1;
	}
}

function isAnimated(media: ArticleMedia): boolean {
	switch (media.mediaType) {
		case MediaType.Video:
		case MediaType.VideoGif:
		case MediaType.Gif:
			return true;
		case MediaType.Image:
			return false;
	}
}

export function useFilters(articlesWithRefs: ArticleWithRefs[], filters: FilterInstance[]): ArticleWithRefs[] {
	return articlesWithRefs.filter((articleWithRefs, i) => filters.every(f => !f.enabled || (keepArticle(articleWithRefs, i, f.filter) !== f.inverted)));
}