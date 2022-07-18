import type {Readable} from 'svelte/store'
import {derived} from 'svelte/store'
import {getWritable} from './service'

export default abstract class Article {
	static readonly service: string

	readonly idPair: ArticleIdPair
	readonly idPairStr: string
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
		id: ArticleId,
		text?: string,
		textHtml?: string,
		url: string,//TODO Make optional
		medias: ArticleMedia[],
		markedAsRead: boolean,
		hidden: boolean,
		markedAsReadStorage: string[],
		hiddenStorage: string[],
		actualArticleRef?: ArticleRefIdPair
		replyRef?: ArticleIdPair
		fetched?: boolean,
		json?: any,
	}) {
		this.text = params.text
		this.textHtml = params.textHtml
		this.url = params.url
		this.medias = params.medias || []
		this.markedAsRead = params.markedAsRead || params.markedAsReadStorage.includes(params.id.toString())
		this.hidden = params.hidden || params.hiddenStorage.includes(params.id.toString())
		this.actualArticleRef = params.actualArticleRef
		this.replyRef = params.replyRef
		this.fetched = params.fetched || false
		this.json = params.json

		this.idPair = {
			service: (this.constructor as typeof Article).service,
			id: params.id,
		}
		this.idPairStr = `${this.idPair.service}/${params.id}`
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

export type ArticleId = string | number | bigint

export interface ArticleIdPair {
	service: string;
	id: ArticleId
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

export function getActualArticle({article, actualArticleRef}: ArticleWithRefs) : Readonly<Article> {
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