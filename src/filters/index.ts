import type { ArticleWithRefs } from '../articles';
import {
	articleWithRefToArray,
	getActualArticle,

} from '../articles';
import {getServices} from '../services/service';
import {type ArticleMedia, MediaType} from '../articles/media';

//TODO Filter groups and boolean filters

export type FilterInstance = {
	filter: Filter
	enabled: boolean
	inverted: boolean
}

export type Filter = {
	type: string
	service: string
} | GenericFilter

type GenericFilter = {
	type: 'media' | 'animated' | 'notMarkedAsRead' | 'notHidden' | 'liked' | 'reposted' | 'noRef' | 'selfRepost' | 'selfQuote'
	service: null
} | {
	type: 'repost'
	byUsername?: string
	service: null
} | {
	//TODO Test quote filter
	type: 'quote'
	service: null
	byUsername?: string
} | {
	type: 'interval'
	service: null
	interval: number
	offset: number
	includeOffset: boolean
}

export function getFilterName(filterType: GenericFilter['type'], inverted: boolean): string {
	if (inverted) {
		switch (filterType) {
			case 'media':
				return 'Without Media';
			case 'animated':
				return 'Not Animated';
			case 'notMarkedAsRead':
				return 'Marked as read';
			case 'notHidden':
				return 'Hidden';
			case 'liked':
				return 'Not liked';
			case 'reposted':
				return 'Not reposted';
			case 'noRef':
				return 'References other articles';
			case 'repost':
				return 'Not a repost';
			case 'quote':
				return 'Not a quote';
			case 'selfRepost':
				return 'Not a self repost';
			case 'selfQuote':
				return 'Not a self quote';
			case 'interval':
				return 'Not by interval';
		}
	}else {
		switch (filterType) {
			case 'media':
				return 'Has media';
			case 'animated':
				return 'Animated';
			case 'notMarkedAsRead':
				return 'Not marked as read';
			case 'notHidden':
				return 'Not hidden';
			case 'liked':
				return 'Liked';
			case 'reposted':
				return 'Reposted';
			case 'noRef':
				return "Doesn't references other articles";
			case 'repost':
				return 'Repost';
			case 'quote':
				return 'Quote';
			case 'selfRepost':
				return 'Self repost';
			case 'selfQuote':
				return 'Self quote';
			case 'interval':
				return 'By interval';
		}
	}
}

export const filterTypes: Filter['type'][] = [
	'media',
	'animated',
	'notMarkedAsRead',
	'notHidden',
	'liked',
	'reposted',
	'noRef',
	'repost',
	'quote',
	'selfRepost',
	'selfQuote',
];

export function defaultFilter(filterType: string, service: string | null): Filter {
	if (service)
		return getServices()[service].defaultFilter(filterType);

	switch (filterType) {
		case 'interval':
			return {
				type: filterType,
				interval: 3,
				offset: 0,
				includeOffset: false,
				service: null,
			};
		default:
			return { type: filterType, service: null } as GenericFilter;
	}
}

export const defaultFilterInstances: FilterInstance[] = [
	{
		filter: {type: 'notMarkedAsRead', service: null},
		enabled: true,
		inverted: false,
	}, {
		filter: {type: 'notHidden', service: null},
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

function keepArticleGeneric(articleWithRefs: ArticleWithRefs, index: number, filter: GenericFilter): boolean {
	switch (filter.type) {
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
				//TODO Only filter quote and not quoted?
				case 'quote':
					return !articleWithRefs.article.markedAsRead && keepArticleGeneric(articleWithRefs.quoted, index, filter);
			}
		case 'notHidden':
			switch (articleWithRefs.type) {
				case 'normal':
					return !articleWithRefs.article.hidden;
				case 'repost':
					return !articleWithRefs.article.hidden && keepArticleGeneric(articleWithRefs.reposted, index, filter);
				case 'reposts':
					return articleWithRefs.reposts.every(a => !a.hidden) && keepArticleGeneric(articleWithRefs.reposted, index, filter);
				//TODO Only filter quote and not quoted?
				case 'quote':
					return !articleWithRefs.article.hidden && keepArticleGeneric(articleWithRefs.quoted, index, filter);
			}
		case 'liked':
			return getActualArticle(articleWithRefs).getLiked();
		case 'reposted':
			return getActualArticle(articleWithRefs).getReposted();
		case 'noRef':
			return articleWithRefs.type === 'normal';
		case 'repost':
			if (articleWithRefs.type === 'repost') {
				if (filter.byUsername) {
					return articleWithRefs.article.author?.username === filter.byUsername;
				}else
					return true;
			}

			return false;
		case 'quote':
			if (articleWithRefs.type === 'quote') {
				if (filter.byUsername)
					return articleWithRefs.article.author?.username === filter.byUsername;
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
			if (index < filter.offset)
				return filter.includeOffset;
			else
				return (index - filter.offset) % filter.interval === filter.interval - 1;
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