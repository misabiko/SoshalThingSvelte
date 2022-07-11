import Article, {
	type ArticleMedia,
	ArticleRefType,
	type ArticleWithRefs,
	getActualArticle,
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
				articleWithRefs.refs.some(ref => {
					//TODO Use getRefed
					switch (ref.type) {
						case ArticleRefType.Repost:
							return !!ref.reposted.medias.length;
						case ArticleRefType.Quote:
							return !!ref.quoted.medias.length;
						case ArticleRefType.QuoteRepost:
							return !!ref.reposted.medias.length || !!ref.quoted.medias.length;
						case ArticleRefType.Reply:
							return false;
					}
				});
		case 'animated':
			return articleWithRefs.article.medias.some(isAnimated) ||
				articleWithRefs.refs.some(ref => {
					switch (ref.type) {
						case ArticleRefType.Repost:
							return ref.reposted.medias.some(isAnimated);
						case ArticleRefType.Quote:
							return ref.quoted.medias.some(isAnimated);
						case ArticleRefType.QuoteRepost:
							return ref.reposted.medias.some(isAnimated) || ref.quoted.medias.some(isAnimated);
						case ArticleRefType.Reply:
							return false;
					}
				});
		case 'notMarkedAsRead':
			return !getActualArticle(articleWithRefs).markedAsRead;
		case 'notHidden':
			return !getActualArticle(articleWithRefs).hidden;
		case 'liked':
			return getActualArticle(articleWithRefs).getLiked();
		case 'reposted':
			return getActualArticle(articleWithRefs).getReposted();
		case 'noRef':
			return !articleWithRefs.refs.some(ref =>
				ref.type === ArticleRefType.Repost ||
				ref.type === ArticleRefType.Quote ||
				ref.type === ArticleRefType.QuoteRepost
			);
		case 'repost': {
			for (const ref of articleWithRefs.refs) {
				if (ref.type === ArticleRefType.Repost || ref.type === ArticleRefType.QuoteRepost) {
					if (filter.byUsername)
						return ref.reposted.author?.username === filter.byUsername
					else
						return true
				}
			}

			return false
		}
		case 'quote':
			for (const ref of articleWithRefs.refs) {
				if (ref.type === ArticleRefType.Quote || ref.type === ArticleRefType.QuoteRepost) {
					if (filter.byUsername)
						return ref.quoted.author?.username === filter.byUsername
					else
						return true
				}
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