//TODO interface?
import type {Readable} from 'svelte/store'
import {derived} from 'svelte/store'
import {getWritable} from './service'

export default abstract class Article {
	static readonly service: string

	readonly id: string | number
	abstract numberId: number | bigint

	readonly text?: string
	readonly textHtml?: string
	readonly author?: ArticleAuthor
	readonly creationTime?: Date
	readonly url: string
	readonly medias: ArticleMedia[]

	markedAsRead: boolean
	hidden: boolean

	readonly actualArticleRef?: ArticleRefIdPair
	readonly replyRef?: ArticleIdPair

	fetched: boolean
	json: any

	protected constructor(params: {
		id: string | number,
		text?: string,
		textHtml?: string,
		url: string,//TODO Make optional
		medias: ArticleMedia[],
		markedAsRead: boolean,
		hidden: boolean,
		markedAsReadStorage: (string | number)[],	//Actually (string[] | number[])
		actualArticleRef?: ArticleRefIdPair
		replyRef?: ArticleIdPair
		fetched?: boolean,
		json?: any,
	}) {
		this.id = params.id
		this.text = params.text
		this.textHtml = params.textHtml
		this.url = params.url
		this.medias = params.medias || []
		this.markedAsRead = params.markedAsRead || params.markedAsReadStorage.includes(this.id)
		this.hidden = params.hidden
		this.actualArticleRef = params.actualArticleRef
		this.replyRef = params.replyRef
		this.fetched = params.fetched || false
		this.json = params.json
	}

	//TODO Unit test this
	get idPair() {
		return {
			// @ts-ignore
			service: this.constructor.service,
			id: this.id,
		}
	}

	//TODO Replace with dynamic action buttons
	getLikeCount() {
		return 0
	}
	getLiked() {
		return false
	}

	getRepostCount() {
		return 0
	}
	getReposted() {
		return false
	}
}

export interface ArticleAuthor {
	username: string;
	name: string;
	url: string;	//TODO delegate to service
	avatarUrl?: string;
}

export type ArticleMedia = {
	src: string;
	ratio: ValidRatio;
	queueLoadInfo: MediaQueueInfo.DirectLoad | MediaQueueInfo.Thumbnail;
	mediaType: MediaType;
	thumbnail?: undefined;
	loaded?: undefined;
} | {
	src: string;
	ratio: ValidRatio;
	queueLoadInfo: MediaQueueInfo.LazyLoad;
	mediaType: MediaType;
	thumbnail?: string;
	loaded: boolean;
}

type ValidRatio = number;

export function getRatio(width: number, height: number): ValidRatio {
	if (isNaN(width))
		throw 'Width is NaN'
	if (isNaN(height))
		throw 'Height is NaN'
	if (width <= 0)
		throw "Width isn't positive"
	if (height <= 0)
		throw "Height isn't positive"

	return height / width
}

export enum MediaType {
	Image,
	Video,
	VideoGif,
	Gif,
}

//TODO Rename to MediaLoadType?
export enum MediaQueueInfo {
	DirectLoad,
	Thumbnail,
	LazyLoad,
}

export enum ArticleRefType {
	Repost,
	Quote,
	QuoteRepost,
}

//TODO Have reply as its own member
export type ArticleRef =
	{
		type: ArticleRefType.Repost,
		reposted: Article,
	} |
	{
		type: ArticleRefType.Quote,
		quoted: Article,
	} |
	{
		type: ArticleRefType.QuoteRepost,
		reposted: Article,
		quoted: Article,
	}

export type ArticleWithRefs = Readonly<{
	article: Article,
	actualArticleRef?: ArticleRef
	replyRef?: Article
}>

export interface ArticleIdPair {
	service: string;
	id: string | number
}

export type ArticleRefIdPair =
	{
		type: ArticleRefType.Repost,
		reposted: ArticleIdPair,
	} |
	{
		type: ArticleRefType.Quote,
		quoted: ArticleIdPair,
	} |
	{
		type: ArticleRefType.QuoteRepost,
		reposted: ArticleIdPair,
		quoted: ArticleIdPair,
	}

export function articleRefToIdPair(ref: ArticleRef): ArticleRefIdPair {
	switch (ref.type) {
		case ArticleRefType.Repost:
			return {
				type: ref.type,
				reposted: ref.reposted.idPair,
			}
		case ArticleRefType.Quote:
			return {
				type: ref.type,
				quoted: ref.quoted.idPair,
			}
		case ArticleRefType.QuoteRepost:
			return {
				type: ref.type,
				reposted: ref.reposted.idPair,
				quoted: ref.quoted.idPair,
			}
	}
}

type ArticlesOrIdPairs<T extends ArticleRef | ArticleRefIdPair> = T extends ArticleRef
	? Article[]
	: ArticleIdPair[]

export function getRefed<T extends ArticleRef | ArticleRefIdPair>(ref: T) {
	switch (ref.type) {
		case ArticleRefType.Repost:
			return [ref.reposted] as ArticlesOrIdPairs<T>
		case ArticleRefType.Quote:
			return [ref.quoted] as ArticlesOrIdPairs<T>
		case ArticleRefType.QuoteRepost:
			return [ref.reposted, ref.quoted] as ArticlesOrIdPairs<T>
	}
}

export function getActualArticleIdPair(article: Article)
	: Readonly<ArticleIdPair> {
	switch (article.actualArticleRef?.type) {
		case ArticleRefType.Repost:
			return article.actualArticleRef.reposted;
		case ArticleRefType.Quote:
			return article.idPair;
		case ArticleRefType.QuoteRepost:
			return article.actualArticleRef.reposted;
		default:
			return article.idPair;
	}
}

export function getActualArticle({article, actualArticleRef}: ArticleWithRefs)
	: Readonly<Article> {
	switch (actualArticleRef?.type) {
		case ArticleRefType.Repost:
			return actualArticleRef.reposted;
		case ArticleRefType.Quote:
			return article;
		case ArticleRefType.QuoteRepost:
			return actualArticleRef.reposted;
		default:
			return article;
	}
}

export function isRepost(article: Article): boolean {
	return article.actualArticleRef?.type === ArticleRefType.Repost ||
		article.actualArticleRef?.type === ArticleRefType.QuoteRepost;
}

export function articleRefIdPairToRef(articleRef: ArticleRefIdPair): Readable<ArticleRef> {
	switch (articleRef.type) {
		case ArticleRefType.Repost:
			return derived(getWritable(articleRef.reposted), reposted => ({
				type: articleRef.type,
				reposted
			}));
		case ArticleRefType.Quote:
			return derived(getWritable(articleRef.quoted), quoted => ({
				type: articleRef.type,
				quoted
			}));
		case ArticleRefType.QuoteRepost:
			return derived([
				getWritable(articleRef.reposted),
				getWritable(articleRef.quoted)
			], ([reposted, quoted]) => ({
				type: articleRef.type,
				reposted,
				quoted
			}));
	}
}