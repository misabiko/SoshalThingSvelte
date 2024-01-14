import type {TimelineData} from '~/timelines';
import {getServices, getWritable} from '~/services/service';
import type {Readable, Writable} from 'svelte/store';
import {get} from 'svelte/store';
import type {ArticleMedia} from './media';
import type {FilterInstance} from '~/filters';

export default abstract class Article {
	static readonly service: string;

	readonly idPair: ArticleIdPair;
	readonly idPairStr: string;
	abstract numberId: number | bigint;

	readonly text?: string;
	readonly textHtml?: string;
	readonly author?: ArticleAuthor;
	readonly creationTime?: Date;
	readonly url: string | null;
	readonly medias: ArticleMedia[];

	markedAsRead: boolean;

	readonly refs: ArticleRefIdPair | null;

	fetched: boolean;
	rawSource: any;

	protected constructor(params: {
		id: ArticleId
		text?: string
		textHtml?: string
		url?: string
		medias: ArticleMedia[]
		//TODO Remove markedAsRead from Article
		markedAsRead?: boolean
		markedAsReadStorage: string[]
		refs?: ArticleRefIdPair | null
		fetched?: boolean
		rawSource?: any
	}) {
		this.text = params.text;
		this.textHtml = params.textHtml;
		this.url = params.url ?? null;
		this.medias = params.medias || [];
		this.markedAsRead = params.markedAsRead || params.markedAsReadStorage.includes(params.id.toString());
		this.refs = params.refs ?? null;
		this.fetched = params.fetched ?? false;
		this.rawSource = params.rawSource;

		this.idPair = {
			service: (this.constructor as typeof Article).service,
			id: params.id,
		};
		this.idPairStr = `${this.idPair.service}/${params.id}`;
	}

	update(newArticle: this) {
		if (newArticle.creationTime !== undefined)
			(this.creationTime as Date) = newArticle.creationTime;
	}

	getArticleWithRefs(): ArticleWithRefs {
		switch (this.refs?.type) {
			case undefined:
				return {
					type: 'normal',
					article: this,
				};
			case 'repost': {
				const reposted = get(getWritable(this.refs.reposted)).getArticleWithRefs();
				if (reposted === null || reposted.type === 'repost' || reposted.type === 'reposts')
					throw new Error('Reposted article is a repost itself: ' + JSON.stringify(reposted));
				return {
					type: 'repost',
					article: this,
					reposted,
				};
			}
			case 'quote': {
				const quoted = get(getWritable(this.refs.quoted)).getArticleWithRefs();
				if (quoted === null || quoted.type === 'repost' || quoted.type === 'reposts')
					throw new Error('Quoted article is a repost itself: ' + JSON.stringify(quoted));
				return {
					type: 'quote',
					article: this,
					quoted,
				};
			}
		}
	}
}

export type ArticleId = string | number | bigint;

export interface ArticleAuthor {
	username: string	//TODO Make username optional and rename name to displayName
	name: string
	url: string
	avatarUrl?: string
}

export type ArticleWithRefs<Extra extends object = object> = Readonly<(
	| {
		type: 'normal'
		article: Article
	}
	| {
		type: 'repost'
		article: Article
		reposted: NonRepostArticleWithRefs<Extra>
	}
	| {
		type: 'reposts'
		reposts: Article[]
		reposted: NonRepostArticleWithRefs<Extra>
	}
	| {
		type: 'quote'
		article: Article
		quoted: NonRepostArticleWithRefs<Extra>
	}
) & Extra>;
type NonRepostArticleWithRefs<Extra extends object = object> = Exclude<ArticleWithRefs<Extra>, {type: 'repost' | 'reposts';}>;

export type DerivedArticleWithRefs = Readonly<
	| {
		type: 'normal'
		article: Article
	}
	| {
		type: 'repost'
		article: Article
		reposted: NonRepostDerivedArticleWithRefs
	}
	| {
		type: 'quote'
		article: Article
		quoted: NonRepostDerivedArticleWithRefs
	}
>;
type NonRepostDerivedArticleWithRefs = Exclude<DerivedArticleWithRefs, {type: 'repost' | 'reposts';}>;

export type ArticleProps = ArticleWithRefs<{
	filteredOut: boolean
	nonKeepFilters: FilterInstance[]
	mediaIndex: number | null	//Should be always null for reposts
}>;

export function getIdServiceMediaStr(articleProps: ArticleProps): string {
	return `${getRootArticle(articleProps).idPairStr}/${articleProps.mediaIndex}`;
}

export interface ArticleIdPair {
	service: string
	id: ArticleId
}

export function idPairEqual(a: ArticleIdPair, b: ArticleIdPair) {
	return a.service === b.service && a.id === b.id;
}

export type ArticleRefIdPair =
	{
		type: 'repost'
		reposted: ArticleIdPair
	} |
	{
		type: 'quote'
		quoted: ArticleIdPair
	};

export function getRefed(ref: ArticleRefIdPair): ArticleIdPair[] {
	switch (ref.type) {
		case 'repost':
			return [ref.reposted];
		case 'quote':
			return [ref.quoted];
	}
}

export function articleWithRefToArray(articleWithRefs: ArticleWithRefs | ArticleProps): Article[] {
	switch (articleWithRefs.type) {
		case 'normal':
			return [articleWithRefs.article];
		case 'repost':
			return [articleWithRefs.article, ...articleWithRefToArray(articleWithRefs.reposted)];
		case 'reposts':
			return [...articleWithRefs.reposts, ...articleWithRefToArray(articleWithRefs.reposted)];
		case 'quote':
			return [articleWithRefs.article, ...articleWithRefToArray(articleWithRefs.quoted)];
	}
}

export function getActualArticleIdPair(article: Article): Readonly<ArticleIdPair> {
	switch (article.refs?.type) {
		case 'repost':
			return article.refs.reposted;
		default:
			return article.idPair;
	}
}

export function getRootArticle(articleWithRefs: ArticleWithRefs | ArticleProps) : Readonly<Article> {
	switch (articleWithRefs.type) {
		case 'reposts':
			return articleWithRefs.reposts[0];
		default:
			return articleWithRefs.article;
	}
}

export function getActualArticle(articleWithRefs: ArticleWithRefs | ArticleProps) : Readonly<Article> {
	switch (articleWithRefs.type) {
		case 'normal':
		case 'quote':
			return articleWithRefs.article;
		case 'repost':
		case 'reposts':
			return getActualArticle(articleWithRefs.reposted);
	}
}

export function getActualArticleRefs(articleWithRefs: ArticleWithRefs | ArticleProps) : Readonly<ArticleWithRefs | ArticleProps> {
	switch (articleWithRefs.type) {
		case 'normal':
		case 'quote':
			return articleWithRefs;
		case 'repost':
		case 'reposts':
			return getActualArticleRefs(articleWithRefs.reposted);
	}
}

export function flatDeriveArticle(idPair: ArticleIdPair): Readable<Article>[] {
	const [articleStore, refs] = getServices()[idPair.service].articles[idPair.id as string];
	switch (refs?.type) {
		case undefined:
			return [articleStore];
		case 'repost':
			return [articleStore, ...flatDeriveArticle(refs.reposted)];
		case 'quote':
			return [articleStore, ...flatDeriveArticle(refs.quoted)];
	}
}

//Props for every article in the timeline
export type TimelineArticleProps = {
	animatedAsGifs: boolean
	muteVideos: boolean
	compact: boolean
	/// If true, the media stays full even when compact is true
	fullMedia: number
	hideQuoteMedia: boolean
	hideText: boolean
	shouldLoadMedia: boolean
	maxMediaCount: number | null
	setModalTimeline: (data: TimelineData, width?: number) => void
	showAllMediaArticles: Writable<Set<string>>
};

const MONTH_ABBREVS: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function shortTimestamp(date: Date) {
	const timeSince = Date.now() - date.getTime();

	if (timeSince < 1000)
		return 'just now';
	else if (timeSince < 60_000)
		return `${Math.floor(timeSince / 1000)}s`;
	else if (timeSince < 3_600_000)
		return `${Math.floor(timeSince / 60_000)}m`;
	else if (timeSince < 86_400_000)
		return `${Math.floor(timeSince / 3_600_000)}h`;
	else if (timeSince < 604_800_000)
		return `${Math.floor(timeSince / 86_400_000)}d`;
	else
		return `${MONTH_ABBREVS[date.getMonth()]} ${date.getDate()} ${date.getFullYear()}`;
}