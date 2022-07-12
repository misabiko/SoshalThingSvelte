import {
	type ArticleMedia,
	ArticleRefType,
	type ArticleWithRefs,
	getActualArticle,
	getRefed,
	MediaType,
} from './services/article'

export type FilterInstance = {
	filter: Filter
	enabled: boolean
	inverted: boolean
}

export type Filter =
	{
		type: 'media'
	} |
	{
		type: 'animated'
	} |
	{
		type: 'notMarkedAsRead'
	} |
	{
		type: 'notHidden'
	} |
	{
		type: 'liked'
	} |
	{
		type: 'reposted'
	} |
	{
		type: 'noRef'
	} |
	{
		type: 'repost'
		byUsername?: string
	} |
	{
		type: 'quote'
		byUsername?: string
	}

function getFilterName(filter: Filter, inverted: boolean): string {
	if (inverted) {
		switch (filter.type) {
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
		}
	}else {
		switch (filter.type) {
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
		}
	}
}

export function keepArticle(articleWithRefs: ArticleWithRefs, filter: Filter): boolean {
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
			return !getActualArticle(articleWithRefs).markedAsRead;
		case 'notHidden':
			return !getActualArticle(articleWithRefs).hidden;
		case 'liked':
			return getActualArticle(articleWithRefs).getLiked();
		case 'reposted':
			return getActualArticle(articleWithRefs).getReposted();
		case 'noRef':
			return articleWithRefs.actualArticleRef === undefined;
		case 'repost':
			if (articleWithRefs.actualArticleRef?.type === ArticleRefType.Repost || articleWithRefs.actualArticleRef?.type === ArticleRefType.QuoteRepost) {
				if (filter.byUsername)
					return articleWithRefs.actualArticleRef.reposted.author?.username === filter.byUsername
				else
					return true
			}

			return false
		case 'quote':
			if (articleWithRefs.actualArticleRef?.type === ArticleRefType.Quote || articleWithRefs.actualArticleRef?.type === ArticleRefType.QuoteRepost) {
				if (filter.byUsername)
					return articleWithRefs.actualArticleRef.quoted.author?.username === filter.byUsername
				else
					return true
			}

			return false
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