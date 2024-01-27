import {type ArticleWithRefs, getRootArticle} from '~/articles';
import {articleWithRefToArray} from '~/articles';
import {getServices} from '~/services/service';
import {type ArticleMedia, MediaType} from '~/articles/media';

//TODO Filter groups and boolean filters

export type FilterInstance = {
	filter: Filter
	enabled: boolean
	inverted: boolean
};

export type Filter = ({
	type: string
	service: string
} | {
	type: GenericFilter
	service: null
}) & {
	props: Record<string, any>
};

type GenericFilter =
	| 'media'
	| 'animated'
	//TODO Change for markedAsRead
	| 'notMarkedAsRead'
	| 'noRef'
	| 'selfRepost'
	| 'selfQuote'
	| 'repost'
	//TODO Test quote filter
	| 'quote'
	| 'interval'
	| 'section';
//TODO Number of medias (with equal, less than, greater than, etc)

export type FilterInfo<S extends string = string> = {
	type: S
	name: string
	invertedName: string
	props: Record<string, PropType>
};

export function getFilterName(filter: FilterInfo, inversed: boolean): string {
	return inversed ? filter.invertedName : filter.name;

}

export type PropType =
(| {
	type: 'string' | 'boolean' | 'string[]'
}
| {
	type: 'number'
	min?: number
	max?: number
}
| {
	type: 'select'
	options: Record<string, string>
	multiple: boolean
}) & {
	optional: boolean
};

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
		props: {
			includeQuoted: {
				type: 'boolean',
				optional: true,
			}
		},
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
				optional: true,
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
				optional: false,
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
				optional: false,
				min: 1,
			},
			offset: {
				type: 'number',
				optional: false,
				min: 0,
			},
			includeOffset: {
				type: 'boolean',
				optional: false,
			},
		},
	},
	section: {
		type: 'section',
		name: 'In section',
		invertedName: 'Not in section',
		props: {
			start: {
				type: 'number',
				optional: true,
			},
			end: {
				type: 'number',
				optional: true,
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

export function keepArticle(articleWithRefs: ArticleWithRefs, index: number, filter: Filter): boolean | null {
	if (filter.service === null)
		return keepArticleGeneric(articleWithRefs, index, filter);
	else if (filter.service !== getRootArticle(articleWithRefs).idPair.service)
		return null;
	else
		return getServices()[filter.service].keepArticle(articleWithRefs, index, filter);
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
					return !articleWithRefs.article.markedAsRead && (keepArticle(articleWithRefs.reposted, index, filter) ?? true);
				case 'reposts':
					return articleWithRefs.reposts.every(a => !a.markedAsRead) && (keepArticle(articleWithRefs.reposted, index, filter) ?? true);
				case 'quote':
					return !articleWithRefs.article.markedAsRead &&
						(!filter.props.includeQuoted || (keepArticle(articleWithRefs.quoted, index, filter) ?? true));
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
		case 'section':
			if (filter.props.start !== undefined && index < filter.props.start)
				return false;
			if (filter.props.end !== undefined && index > filter.props.end)
				return false;

			return true;
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