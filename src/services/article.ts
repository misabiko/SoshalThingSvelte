//TODO interface?
export default abstract class Article {
	static readonly service: string

	readonly id: string | number
	readonly text?: string
	readonly textHtml?: string
	readonly author?: ArticleAuthor
	readonly creationTime?: Date
	readonly url: string
	readonly medias: ArticleMedia[]
	markedAsRead: boolean
	hidden: boolean
	readonly articleRefs: ArticleRefIdPair[]
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
		articleRefs: ArticleRefIdPair[],
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
		this.articleRefs = params.articleRefs
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
	thumbnail: string;
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
	Reply,
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
	} |
	{
		type: ArticleRefType.Reply,
		replied: Article,
	}

export type ArticleWithRefs = {
	article: Article,
	refs: ArticleRef[],
	actualArticleIndex?: number,
}

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
	} |
	{
		type: ArticleRefType.Reply,
		replied: ArticleIdPair,
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
		case ArticleRefType.Reply:
			return {
				type: ref.type,
				replied: ref.replied.idPair,
			}
	}
}

export function getRefed(ref: ArticleRef | ArticleRefIdPair): (Article | ArticleIdPair)[] {
	switch (ref.type) {
		case ArticleRefType.Repost:
			return [ref.reposted]
		case ArticleRefType.Quote:
			return [ref.quoted]
		case ArticleRefType.QuoteRepost:
			return [ref.reposted, ref.quoted]
		case ArticleRefType.Reply:
			return [ref.replied]
	}
}