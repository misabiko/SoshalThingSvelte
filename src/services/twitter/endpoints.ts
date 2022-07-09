import type {ArticleMedia, ArticleRef} from '../article'
import {Endpoint, type EndpointConstructorInfo, getMarkedAsReadStorage, RefreshTime, registerEndpoint} from '../service'
import type {ArticleWithRefs} from '../service'
import {fetchExtensionV1, TwitterService} from './service'
import TwitterArticle from './article'
import {articleRefToIdPair, ArticleRefType, getRatio, MediaQueueInfo, MediaType} from '../article'

export class HomeTimelineEndpoint extends Endpoint {
	readonly name = 'Home Timeline'

	async refresh(refreshTime: RefreshTime) {
		try {
			return (await fetchExtensionV1<TweetResponse[]>('https://api.twitter.com/1.1/statuses/home_timeline.json', 'statuses/home_timeline'))
				.map(articleFromV1)
		}catch (errorResponse) {
			console.error('Error fetching', errorResponse)
		}
		return []
	}

	matchParams(params: any): boolean {
		return true;
	}

	static readonly constructorInfo: EndpointConstructorInfo = {
		name: 'HomeTimelineEndpoint',
		paramTemplate: [],
		constructor: () => new HomeTimelineEndpoint()
	}
}

export class UserTimelineEndpoint extends Endpoint {
	readonly name;

	constructor(readonly username: string) {
		super()

		this.name = `User Timeline ${this.username}`
	}

	async refresh(refreshTime: RefreshTime) {
		return []
	}

	matchParams(params: any): boolean {
		return params.username === this.username;
	}

	static readonly constructorInfo: EndpointConstructorInfo = {
		name: 'UserTimelineEndpoint',
		paramTemplate: [['username', '']],
		constructor: params => new UserTimelineEndpoint(params.username as string)
	}
}

export class ListEndpoint extends Endpoint {
	readonly name;

	constructor(readonly username: string, readonly slug: string) {
		super()

		this.name = `List Endpoint ${this.username}/${this.slug}`
	}

	async refresh(refreshTime: RefreshTime) {
		return []
	}

	matchParams(params: any): boolean {
		return params.username === this.username &&
			params.slug === this.slug;
	}

	static readonly constructorInfo: EndpointConstructorInfo = {
		name: 'ListEndpoint',
		paramTemplate: [['username', ''], ['slug', '']],
		constructor: params => new ListEndpoint(params.username as string, params.slug as string)
	}
}

export class LikesEndpoint extends Endpoint {
	readonly name

	constructor(readonly username: string) {
		super()

		this.name = `Likes ${this.username}`
	}

	async refresh(refreshTime: RefreshTime) {
		return []
	}

	matchParams(params: any): boolean {
		return params.username === this.username;
	}

	static readonly constructorInfo: EndpointConstructorInfo = {
		name: 'LikesEndpoint',
		paramTemplate: [['username', '']],
		constructor: params => new LikesEndpoint(params.username as string)
	}
}

export class SearchEndpoint extends Endpoint {
	readonly name

	constructor(readonly query: string) {
		super()

		this.name = `Search ${this.query}`
	}

	async refresh(refreshTime: RefreshTime) {
		return []
	}

	matchParams(params: any): boolean {
		return params.query === this.query;
	}

	static readonly constructorInfo: EndpointConstructorInfo = {
		name: 'SearchEndpoint',
		paramTemplate: [['query', '']],
		constructor: params => new SearchEndpoint(params.query as string)
	}
}

registerEndpoint(TwitterService,
	HomeTimelineEndpoint.constructorInfo,
	UserTimelineEndpoint.constructorInfo,
	ListEndpoint.constructorInfo,
	LikesEndpoint.constructorInfo,
	SearchEndpoint.constructorInfo,
)

function articleFromV1(json: TweetResponse): ArticleWithRefs {
	const {text, textHtml} = parseText(json.text, json.entities, json.extended_entities)

	const articleRefs: ArticleRef[] = []
	let actualArticleIndex: number | undefined
	{
		if (json.retweeted_status !== undefined) {
			const retweet = articleFromV1(json.retweeted_status)
			const actualRef = retweet.actualArticleIndex !== undefined ? retweet.refs[retweet.actualArticleIndex] : undefined

			if (actualRef?.type === ArticleRefType.Quote) {
				articleRefs.push({
					type: ArticleRefType.QuoteRepost,
					reposted: retweet.article,
					quoted: actualRef.quoted
				})
			}else {
				articleRefs.push({
					type: ArticleRefType.Repost,
					reposted: retweet.article,
				})
			}
			actualArticleIndex = 0
		}else if (json.is_quote_status) {
			//TODO Have is_quote_status imply not undefined quoted_status
			const quote = articleFromV1(json.quoted_status as TweetResponse)
			const actualRef = quote.actualArticleIndex !== undefined ? quote.refs[quote.actualArticleIndex] : undefined
			if (actualRef?.type === ArticleRefType.Quote)
				console.warn(`Quote(${json.id_str}) of a quote(${actualRef.quoted.id})?`)

			articleRefs.push({
				type: ArticleRefType.Quote,
				quoted: quote.article,
			})
		}
	}
	return {
		article: new TwitterArticle(
			json.id_str,
			text,
			textHtml,
			{
				id: json.user.id_str,
				name: json.user.name,
				username: json.user.screen_name,
				url: "https://twitter.com/" + json.user.screen_name,
				avatarUrl: json.user.profile_image_url,
			},
			new Date(json.created_at),
			getMarkedAsReadStorage(TwitterService) as string[],
			articleRefs.map(articleRefToIdPair),
			parseMedia(json.extended_entities),
			json.favorited,
			json.favorite_count,
			json.retweeted,
			json.retweet_count,
		),
		refs: articleRefs,
		actualArticleIndex,
	}
}

function parseText(rawText: string, entities: Entities, extendedEntities?: ExtendedEntities): { text: string, textHtml: string } {
	let trimmedText = rawText
	const mediaUrls = extendedEntities?.media.map(media => media.url) || []

	for (const url of mediaUrls) {
		trimmedText = trimmedText.replace(url, '')
	}

	let finalText = trimmedText
	let htmlParts: [Indices, string][] = []

	for (const {display_url, expanded_url, indices, url} of entities.urls) {
		finalText = finalText.replace(url, display_url)
		htmlParts.push([indices, `<a href='${expanded_url}'>${display_url}</a>`])
	}
	for (const {indices, text} of entities.hashtags) {
		htmlParts.push([indices, `<a href='https://twitter.com/search?q=#${text}'>#${text}</a>`])
	}
	for (const {indices, screen_name} of entities.user_mentions) {
		htmlParts.push([indices, `<a href='https://twitter.com/${screen_name}'>@${screen_name}</a>`])
	}

	finalText = finalText.trim()

	if (htmlParts.length) {
		htmlParts.sort(([[a]], [[b]]) => a - b)

		let i = 0
		let length = trimmedText.length
		let newHtmlParts = ''
		let lastIndex = (htmlParts.at(-1) as [Indices, string])[0][1]

		for (const [[first, last], html] of htmlParts) {
			if (i < first)
				newHtmlParts += rawText.slice(i, first)

			newHtmlParts += html
			i = last
		}

		if (i < length - 1)
			newHtmlParts += trimmedText.slice(lastIndex)

		return {
			text: finalText,
			textHtml: newHtmlParts
		}
	}else {
		return {
			text: finalText,
			textHtml: finalText,
		}
	}
}

function parseMedia(extendedEntities?: ExtendedEntities): ArticleMedia[] {
	return extendedEntities?.media.map(media => {
		switch (media.type) {
			case 'photo':
				return {
					mediaType: MediaType.Image,
					src: media.media_url_https,
					ratio: getRatio(media.sizes.large.w, media.sizes.large.h),
					queueLoadInfo: MediaQueueInfo.DirectLoad
				}
			case 'video':
				return getMP4(media.video_info, MediaType.VideoGif)
			case 'animated_gif':
				return getMP4(media.video_info, MediaType.Video)
		}
	}) || []
}

function getMP4(videoInfo: VideoInfo, mediaType: MediaType): ArticleMedia {
	const variant = videoInfo.variants.find(v => v.content_type === 'video/mp4');
	if (variant === undefined)
		throw Error("Couldn't find video/mp4 variant.");

	return {
		mediaType,
		src: variant.url,
		ratio: getRatio(videoInfo.aspect_ratio[0], videoInfo.aspect_ratio[1]),
		queueLoadInfo: MediaQueueInfo.DirectLoad,
	}
}

export type TweetResponse = {
	created_at: string;
	id: number;
	id_str: string;
	text: string;
	truncated: boolean;
	entities: Entities;
	extended_entities?: ExtendedEntities;
	source: string;
	in_reply_to_status_id: null;
	in_reply_to_status_id_str: null;
	in_reply_to_user_id: null;
	in_reply_to_user_id_str: null;
	in_reply_to_screen_name: null;
	user: {
		id: number;
		id_str: string;
		name: string;
		screen_name: string;
		location: string;
		description: string;
		url: string;
		entities: UserEntities;
		protected: boolean;
		followers_count: number;
		friends_count: number;
		listed_count: number;
		created_at: string;
		favourites_count: number;
		utc_offset: null;
		time_zone: null;
		geo_enabled: boolean;
		verified: boolean;
		statuses_count: number;
		lang: null;
		contributors_enabled: boolean;
		is_translator: boolean;
		is_translation_enabled: boolean;
		profile_background_color: string;
		profile_background_image_url: string;
		profile_background_image_url_https: string;
		profile_background_tile: boolean;
		profile_image_url: string;
		profile_image_url_https: string;
		profile_banner_url: string;
		profile_link_color: string;
		profile_sidebar_border_color: string;
		profile_sidebar_fill_color: string;
		profile_text_color: string;
		profile_use_background_image: boolean;
		has_extended_profile: boolean;
		default_profile: boolean;
		default_profile_image: boolean;
		following: boolean;
		follow_request_sent: boolean;
		notifications: boolean;
		translator_type: string;
		withheld_in_countries: []
	};
	geo: null;
	coordinates: null;
	place: null;
	contributors: null;
	retweeted_status?: TweetResponse;
	is_quote_status: boolean;
	quoted_status?: TweetResponse;
	retweet_count: number;
	favorite_count: number;
	favorited: boolean;
	retweeted: boolean;
	possibly_sensitive: boolean;
	possibly_sensitive_appealable: boolean;
	lang: string
}

type Entities = {
	hashtags: [];
	symbols: [];
	user_mentions: {
		screen_name: string;
		name: string;
		id: number;
		id_str: string;
		indices: Indices;
	}[];
	urls: {
		url: string;
		expanded_url: string;
		display_url: string;
		indices: Indices
	}[];
	description: {
		urls: []
	};
	media: {
		id: number;
		id_str: string;
		indices: Indices;
		media_url: string;
		media_url_https: string;
		url: string;
		display_url: string;
		expanded_url: string;
		type: MediaType;
		sizes: MediaSizes;
		source_status_id: number;
		source_status_id_str: string;
		source_user_id: number;
		source_user_id_str: string
	}[];
}

type ExtendedEntities = {
	media: ExtendedMedia[];
}

type ExtendedMedia = {
	id: number;
	id_str: string;
	indices: Indices;
	media_url: string;
	media_url_https: string;
	url: string;
	display_url: string;
	expanded_url: string;
	type: 'photo';
	sizes: MediaSizes;
	source_status_id: number;
	source_status_id_str: string;
	source_user_id: number;
	source_user_id_str: string;
	video_info: null
} | {
	id: number;
	id_str: string;
	indices: Indices;
	media_url: string;
	media_url_https: string;
	url: string;
	display_url: string;
	expanded_url: string;
	type: 'video' | 'animated_gif';
	sizes: MediaSizes;
	source_status_id: number;
	source_status_id_str: string;
	source_user_id: number;
	source_user_id_str: string;
	video_info: VideoInfo
}

type VideoInfo = {
	aspect_ratio: [number, number];
	duration_millis: number;
	variants: VideoVariant[]
}

type VideoVariant = {
	bitrate: number;
	content_type: string;	//enum?
	url: string
}

type UserEntities = {
	url: {
		urls: {
			url: string;
			expanded_url: string;
			display_url: string;
			indices: Indices
		}[]
	};
	description: {
		urls: []
	}
}

type MediaSizes = {
	thumb: MediaSize;
	large: MediaSize;
	medium: MediaSize;
	small: MediaSize;
}

type MediaSize = {
	w: number;
	h: number;
	resize: 'fit' | 'crop';
}

type Indices = [number, number]