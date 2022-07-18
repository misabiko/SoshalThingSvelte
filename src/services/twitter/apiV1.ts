import type {ArticleMedia, ArticleRef, ArticleWithRefs, ArticleIdPair} from '../article'
import Article, {
	articleRefToIdPair,
	ArticleRefType,
	getRatio,
	MediaQueueInfo,
	MediaType,
} from '../article'
import TwitterArticle from './article'
import {getHiddenStorage, getMarkedAsReadStorage} from '../../storages/serviceCache'
import {TwitterService} from './service'
import {fetchExtension} from '../extension'
import {get} from 'svelte/store'
import {addArticles, getWritable} from '../service'

export function getV1APIURL(resource: string): string {
	return `https://api.twitter.com/1.1/${resource}.json`
}

export function articleFromV1(json: TweetResponse): ArticleWithRefs {
	const {text, textHtml} = parseText(json.text, json.entities, json.extended_entities)

	let actualArticleRef: ArticleRef | undefined
	let replyRef: Article | undefined
	let actualArticleIndex: number | undefined
	{
		if (json.retweeted_status !== undefined) {
			const retweet = articleFromV1(json.retweeted_status)

			if (retweet.actualArticleRef?.type === ArticleRefType.Quote) {
				actualArticleRef = {
					type: ArticleRefType.QuoteRepost,
					reposted: retweet.article,
					quoted: retweet.actualArticleRef.quoted,
				}
			}else {
				actualArticleRef = {
					type: ArticleRefType.Repost,
					reposted: retweet.article,
				}
			}
			actualArticleIndex = 0
		}else if (json.is_quote_status) {
			if (json.quoted_status) {
				const quote = articleFromV1(json.quoted_status)
				if (quote.actualArticleRef?.type === ArticleRefType.Quote)
					console.warn(`Quote(${json.id_str}) of a quote(${quote.actualArticleRef.quoted.idPair.id})?`)

				actualArticleRef = {
					type: ArticleRefType.Quote,
					quoted: quote.article,
				}
			}else if (json.quoted_status_id_str) {
				console.warn("Quote tweet doesn't include quoted tweet, need to get the tweet from service", json)
			}else {
				console.error('is_quote_status true, but no quote info', json)
			}
		}
	}
	return {
		article: new TwitterArticle(
			BigInt(json.id_str),
			text,
			textHtml,
			{
				id: json.user.id_str,
				name: json.user.name,
				username: json.user.screen_name,
				url: "https://twitter.com/" + json.user.screen_name,
				avatarUrl: json.user.profile_image_url_https,
			},
			new Date(json.created_at),
			getMarkedAsReadStorage(TwitterService) as string[],
			getHiddenStorage(TwitterService) as string[],
			actualArticleRef ? articleRefToIdPair(actualArticleRef) : undefined,
			replyRef?.idPair,
			parseMedia(json.extended_entities),
			json.favorited,
			json.favorite_count,
			json.retweeted,
			json.retweet_count,
		),
		actualArticleRef,
		replyRef,
	}
}

export async function toggleFavorite(idPair: ArticleIdPair) {
	const writable = getWritable<TwitterArticle>(idPair)
	const action = get(writable).liked ? 'destroy' : 'create'

	try {
		const response = await fetchExtensionV1(
			`${getV1APIURL('favorites/' + action)}?id=${idPair.id}`,
			'POST',
		)

		updateAPIResponse(response)
	}catch (cause: V1ErrorResponse | any) {
		let shouldThrow = true
		if (cause.errors !== undefined && (cause as V1ErrorResponse).errors.some(e => e.code === 139)) {
			console.warn(cause)
			writable.update(a => {
				a.liked = true
				return a
			})

			if (cause.errors.length === 1)
				shouldThrow = false
		}

		if (shouldThrow)
			throw new Error(JSON.stringify(cause, null, '\t'))
	}
}

export async function retweet(idPair: ArticleIdPair) {
	const writable = TwitterService.articles[idPair.id as string]
	if (get(writable).retweeted)
		return

	const response = await fetchExtensionV1(
		`${getV1APIURL('statuses/retweet')}?id=${idPair.id}`,
		'POST',
	)

	updateAPIResponse(response)
}

export async function fetchExtensionV1<T = TweetResponse>(url: string, method = 'GET', body?: any): Promise<T> {
	const response = await fetchExtension<T | V1ErrorResponse>(
		TwitterService.name,
		'fetchV1',
		url,
		method,
		body,
	)

	if ((response as V1ErrorResponse).errors !== undefined)
		return Promise.reject(response)
	//TODO Handle deleted tweet
	// {
	// 	"errors": [
	// 		{
	// 			"code": 144,
	// 			"message": "No status found with that ID."
	// 		}
	// 	]
	// }

	return response as T
}

function updateAPIResponse(response: TweetResponse) {
	if (TwitterService.articles[response.id_str] === undefined)
		addArticles(TwitterService, true, articleFromV1(response))

	const writable = getWritable<TwitterArticle>({service: TwitterService.name, id: BigInt(response.id_str)})

	writable.update(a => {
		a.liked = response.favorited
		a.likeCount = response.favorite_count
		a.retweeted = response.retweeted
		a.retweetCount = response.retweet_count
		return a
	})

	if (response.retweeted_status) {
		if (TwitterService.articles[response.retweeted_status.id_str])
			updateAPIResponse(response.retweeted_status as TweetResponse)
		else
			addArticles(TwitterService, false, articleFromV1(response.retweeted_status))
	}

	if (response.quoted_status)
		if (TwitterService.articles[response.quoted_status.id_str])
			updateAPIResponse(response.quoted_status as TweetResponse)
		else
			addArticles(TwitterService, false, articleFromV1(response.quoted_status))
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
			textHtml: newHtmlParts,
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
					queueLoadInfo: MediaQueueInfo.DirectLoad,
				}
			case 'video':
				return getMP4(media.video_info, MediaType.Video)
			case 'animated_gif':
				return getMP4(media.video_info, MediaType.VideoGif)
		}
	}) || []
}

function getMP4(videoInfo: VideoInfo, mediaType: MediaType): ArticleMedia {
	const variant = videoInfo.variants.find(v => v.content_type === 'video/mp4')
	if (variant === undefined)
		throw Error("Couldn't find video/mp4 variant.")

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
	quoted_status_id?: number;
	quoted_status_id_str?: string;
	retweet_count: number;
	favorite_count: number;
	favorited: boolean;
	retweeted: boolean;
	possibly_sensitive: boolean;
	possibly_sensitive_appealable: boolean;
	lang: string
}
type V1ErrorResponse = {
	errors: {
		code: number,
		message: string,
	}[]
}
export type SearchResponse = {
	search_metadata: {
		completed_in: number
		max_id: number
		max_id_str: string
		next_results: string
		query: string
		refresh_url: string
		count: number
		since_id: number
		since_id_str: string
	}
	statuses: TweetResponse[]
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