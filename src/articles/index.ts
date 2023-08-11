import type {TimelineData} from '../timelines';
import {getWritable} from '../services/service';
import type {Readable} from 'svelte/store';
import {derived, get, readable} from 'svelte/store';
import type {ArticleMedia} from './media';

export default abstract class Article {
	static readonly service: string;

	readonly idPair: ArticleIdPair;
	readonly idPairStr: string;
	abstract numberId: number | bigint

	readonly text?: string;
	readonly textHtml?: string;
	readonly author?: ArticleAuthor;
	readonly creationTime?: Date;
	readonly url: string;
	readonly medias: ArticleMedia[];

	markedAsRead: boolean;
	hidden: boolean;

	readonly actualArticleRef?: ArticleRefIdPair;
	//readonly replyRef?: ArticleIdPair

	fetched: boolean;
	rawSource: any;

	protected constructor(params: {
		id: ArticleId,
		text?: string,
		textHtml?: string,
		url: string,//TODO Make article url optional
		medias: ArticleMedia[],
		markedAsRead?: boolean,
		hidden?: boolean,
		markedAsReadStorage: string[],
		hiddenStorage: string[],
		actualArticleRef?: ArticleRefIdPair
		//replyRef?: ArticleIdPair
		fetched?: boolean,
		rawSource?: any,
	}) {
		this.text = params.text;
		this.textHtml = params.textHtml;
		this.url = params.url;
		this.medias = params.medias || [];
		this.markedAsRead = params.markedAsRead || params.markedAsReadStorage.includes(params.id.toString());
		this.hidden = params.hidden || params.hiddenStorage.includes(params.id.toString());
		this.actualArticleRef = params.actualArticleRef;
		//this.replyRef = params.replyRef
		this.fetched = params.fetched || false;
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

	//TODO Replace with dynamic action buttons
	//Currently only used to sort by likes
	getLikeCount() {
		return 0;
	}
	getLiked() {
		return false;
	}

	getRepostCount() {
		return 0;
	}
	getReposted() {
		return false;
	}
}

export type ArticleId = string | number | bigint

export interface ArticleAuthor {
	username: string;
	name: string;	//TODO Make author name optional
	url: string;
	avatarUrl?: string;
}

export type ArticleWithRefs<ExtraParams = {}> = Readonly<
	({
		type: 'normal'
		article: Article
	} |
	{
		type: 'repost'
		article: Article
		reposted: ArticleWithRefs<ExtraParams> & Readonly<{type: 'normal' | 'quote'}>
	} |
	{
		type: 'reposts'
		reposts: Article[]
		reposted: ArticleWithRefs<ExtraParams> & Readonly<{type: 'normal' | 'quote'}>
	} |
	{
		type: 'quote'
		article: Article
		quoted: ArticleWithRefs<ExtraParams> & Readonly<{type: 'normal' | 'quote'}>
	}) & ExtraParams
>

export type DerivedArticleWithRefs = Readonly<
	{
		type: 'normal'
		article: Article
	} |
	{
		type: 'repost'
		article: Article
		reposted: Readable<DerivedArticleWithRefs & {type: 'normal' | 'quote'}>
	} |
	{
		type: 'quote'
		article: Article
		quoted: Readable<DerivedArticleWithRefs & {type: 'normal' | 'quote'}>
	}
	>

export type ArticleProps = ArticleWithRefs<{filteredOut: boolean}>

export interface ArticleIdPair {
	service: string;
	id: ArticleId
}

export function idPairEqual(a: ArticleIdPair, b: ArticleIdPair) {
	return a.service === b.service && a.id === b.id;
}

export type ArticleRefIdPair =
	{
		type: 'repost',
		reposted: ArticleIdPair,
	} |
	{
		type: 'quote',
		quoted: ArticleIdPair,
	}

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
	switch (article.actualArticleRef?.type) {
		case 'repost':
			return article.actualArticleRef.reposted;
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

export function deriveArticleRefs(article: Article): Readable<DerivedArticleWithRefs> {
	switch (article.actualArticleRef?.type) {
		case undefined:
			return readable({
				type: 'normal',
				article,
			});
		case 'repost':
			return derived(getWritable(article.actualArticleRef.reposted), repostedArticle =>
				({
					type: 'repost',
					article,
					reposted: deriveArticleRefs(repostedArticle),
				} as DerivedArticleWithRefs)
			);
		case 'quote':
			return derived(getWritable(article.actualArticleRef.quoted), quotedArticle =>
				({
					type: 'quote',
					article,
					quoted: deriveArticleRefs(quotedArticle),
				} as DerivedArticleWithRefs)
			);
	}
}

export function getDerivedArticleWithRefs(a: DerivedArticleWithRefs): ArticleWithRefs {
	switch (a.type) {
		case 'normal':
			return a;
		case 'repost':
			return {
				...a,
				reposted: getDerivedArticleWithRefs(get(a.reposted)) as ArticleWithRefs & Readonly<{type: 'normal' | 'quote'}>
			};
		case 'quote':
			return {
				...a,
				quoted: getDerivedArticleWithRefs(get(a.quoted)) as ArticleWithRefs & Readonly<{type: 'normal' | 'quote'}>
			};
	}
}

//Props for every article in the timeline
export type TimelineArticleProps = {
	animatedAsGifs: boolean;
	compact: boolean;
	hideText: boolean;
	shouldLoadMedia: boolean;
	maxMediaCount: number | null;
	setModalTimeline: (data: TimelineData, width?: number) => void;
}

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