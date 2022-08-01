import {
	type ArticleMedia,
	ArticleRefType,
	type ArticleWithRefs,
	getActualArticle,
	getRefed,
	MediaType,
} from '../services/article'
import {getServices} from '../services/service'

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
	type: 'media' | 'animated' | 'notMarkedAsRead' | 'notHidden' | 'liked' | 'reposted' | 'noRef'
	service: null
} | {
	type: 'repost'
	byUsername?: string
	service: null
} | {
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
				return "References other articles";
			case 'repost':
				return 'Not a repost';
			case 'quote':
				return 'Not a quote';
			case 'interval':
				return `Not by interval`;
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
	'quote'
]

export function defaultFilter(filterType: string, service: string | null): Filter {
	if (service)
		return getServices()[service].defaultFilter(filterType)

	switch (filterType) {
		case 'interval':
			return {
				type: filterType,
				interval: 3,
				offset: 0,
				includeOffset: false,
				service: null,
			}
		default:
			return { type: filterType, service: null } as GenericFilter
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
]

export function keepArticle(articleWithRefs: ArticleWithRefs, index: number, filter: Filter): boolean {
	if (filter.service !== null)
		return getServices()[filter.service].keepArticle(articleWithRefs, index, filter)
	else
		return keepArticleGeneric(articleWithRefs, index, filter)
}

function keepArticleGeneric(articleWithRefs: ArticleWithRefs, index: number, filter: GenericFilter): boolean {
	switch (filter.type) {
		case 'media':
			return !!articleWithRefs.article.medias.length ||
				(
					articleWithRefs.actualArticleRef !== undefined &&
					getRefed(articleWithRefs.actualArticleRef)
						.some(ref => !!ref.medias.length)
				);
		case 'animated':
			return articleWithRefs.article.medias.some(isAnimated) ||
				(
					articleWithRefs.actualArticleRef !== undefined &&
					getRefed(articleWithRefs.actualArticleRef)
						.some(ref => ref.medias.some(isAnimated))
				);
		case 'notMarkedAsRead':
			return !articleWithRefs.article.markedAsRead &&
				(
					(
						articleWithRefs.actualArticleRef?.type !== ArticleRefType.Repost &&
						articleWithRefs.actualArticleRef?.type !== ArticleRefType.QuoteRepost
					) || !articleWithRefs.actualArticleRef.reposted.markedAsRead
				);
		case 'notHidden':
			return !articleWithRefs.article.hidden &&
				(
					(
						articleWithRefs.actualArticleRef?.type !== ArticleRefType.Repost &&
						articleWithRefs.actualArticleRef?.type !== ArticleRefType.QuoteRepost
					) || !articleWithRefs.actualArticleRef.reposted.hidden
				);
		case 'liked':
			return getActualArticle(articleWithRefs).getLiked();
		case 'reposted':
			return getActualArticle(articleWithRefs).getReposted();
		case 'noRef':
			return articleWithRefs.actualArticleRef === undefined;
		case 'repost':
			if (articleWithRefs.actualArticleRef?.type === ArticleRefType.Repost || articleWithRefs.actualArticleRef?.type === ArticleRefType.QuoteRepost) {
				if (filter.byUsername)
					return articleWithRefs.article.author?.username === filter.byUsername
				else
					return true
			}

			return false
		case 'quote':
			if (articleWithRefs.actualArticleRef?.type === ArticleRefType.Quote || articleWithRefs.actualArticleRef?.type === ArticleRefType.QuoteRepost) {
				if (filter.byUsername) {
					if (articleWithRefs.actualArticleRef.type === ArticleRefType.QuoteRepost)
						return articleWithRefs.actualArticleRef.reposted.author?.username === filter.byUsername
					else
						return articleWithRefs.article.author?.username === filter.byUsername
				}else
					return true
			}

			return false
		case 'interval':
			if (index < filter.offset)
				return filter.includeOffset
			else
				return (index - filter.offset) % filter.interval === filter.interval - 1
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
	return articlesWithRefs.filter((articleWithRefs, i) => filters.every(f => !f.enabled || (keepArticle(articleWithRefs, i, f.filter) !== f.inverted)))
}