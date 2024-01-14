import { type ArticleMedia, getRatio, MediaLoadType, MediaType } from '~/articles/media';
import {type ArticleRefIdPair, type ArticleWithRefs, getRootArticle} from '~/articles';
import TwitterArticle from '~/services/twitter/article';
import {getMarkedAsReadStorage} from '~/storages/serviceCache';
import {TwitterService} from '~/services/twitter/service';

export function articleFromV1(json: TweetResponse, isRef = false, extraTweets?: Record<string, TweetResponse>): ArticleWithRefs {
	const rawText = json.full_text ?? json.text as string;
	const { text, textHtml } = parseText(rawText, json.entities, json.extended_entities);

	let refs: ArticleRefIdPair | null = null;

	const makeArticle = () => new TwitterArticle(
		BigInt(json.id_str),
		text,
		textHtml,
		{
			id: json.user.id_str,
			name: json.user.name,
			username: json.user.screen_name,
			url: 'https://twitter.com/' + json.user.screen_name,
			avatarUrl: json.user.profile_image_url_https,
		},
		new Date(json.created_at),
		getMarkedAsReadStorage(TwitterService),
		refs,
		parseMedia(json.extended_entities),
		json.favorited,
		json.favorite_count,
		json.retweeted,
		json.retweet_count,
		json,
	);

	if (
		json.retweeted_status !== undefined ||
		//hack for NotificationAPIEndpoint
		(json.retweeted_status_id_str !== undefined && extraTweets !== undefined)
	) {
		const jsonRetweeted = json.retweeted_status !== undefined
			? json.retweeted_status
			: extraTweets![json.retweeted_status_id_str!];
		if (jsonRetweeted === undefined)
			throw new Error('Retweeted tweet not found: ' + JSON.stringify(json), extraTweets);
		const retweeted = articleFromV1(jsonRetweeted, true);

		if (retweeted.type === 'quote') {
			refs = {
				type: 'quote',
				quoted: retweeted.quoted.article.idPair,
			};
		} else {
			refs = {
				type: 'repost',
				reposted: getRootArticle(retweeted).idPair,
			};
		}

		if (retweeted.type === 'repost' || retweeted.type === 'reposts')
			throw new Error('Retweeted article is a retweet itself: ' + JSON.stringify(retweeted));
		return {
			type: 'repost',
			article: makeArticle(),
			reposted: retweeted,
		};
	} else if (json.is_quote_status) {
		if (json.quoted_status) {
			const quoted = articleFromV1(json.quoted_status, true);

			refs = {
				type: 'quote',
				quoted: getRootArticle(quoted).idPair,
			};

			if (quoted.type === 'repost' || quoted.type === 'reposts')
				throw new Error('Quoted article is a repost itself: ' + JSON.stringify(quoted));
			return {
				type: 'quote',
				article: makeArticle(),
				quoted,
			};
		} else {
			if (!isRef) {	//Twitter won't give quoted_status for quote of quote
				if (json.quoted_status_id_str)
					console.warn("Quote tweet doesn't include quoted tweet, need to get the tweet from service", json);
				else
					console.error('is_quote_status true, but no quote info', json);
			}
		}
	}

	return {
		type: 'normal',
		article: makeArticle()
	};
}

export function parseText(rawText: string, entities: Entities, extendedEntities?: ExtendedEntities): { text: string; textHtml: string; } {
	let trimmedText = rawText;
	const mediaUrls = extendedEntities?.media.map(media => media.url) || [];

	for (const url of mediaUrls) {
		trimmedText = trimmedText.replace(url, '');
	}

	let finalText = trimmedText;
	const htmlParts: [Indices, string][] = [];

	for (const { display_url, expanded_url, indices, url } of entities.urls) {
		finalText = finalText.replace(url, display_url);
		htmlParts.push([indices, `<a href='${expanded_url}'>${display_url}</a>`]);
	}
	for (const { indices, text } of entities.hashtags) {
		htmlParts.push([indices, `<a href='https://twitter.com/hashtag/${text}'>#${text}</a>`]);
	}
	for (const { indices, screen_name } of entities.user_mentions) {
		htmlParts.push([indices, `<a href='https://twitter.com/${screen_name}'>@${screen_name}</a>`]);
	}

	finalText = finalText.trim();

	if (htmlParts.length) {
		htmlParts.sort(([[a]], [[b]]) => a - b);

		let i = 0;
		const length = trimmedText.length;
		let newHtmlParts = '';
		const lastIndex = (htmlParts.at(-1) as [Indices, string])[0][1];

		for (const [[first, last], html] of htmlParts) {
			if (i < first)
				newHtmlParts += [...rawText].slice(i, first).join('');

			newHtmlParts += html;
			i = last;
		}

		if (i < length - 1)
			newHtmlParts += [...trimmedText].slice(lastIndex).join('');

		return {
			text: finalText,
			textHtml: newHtmlParts,
		};
	} else {
		return {
			text: finalText,
			textHtml: finalText,
		};
	}
}

export function parseMedia(extendedEntities?: ExtendedEntities): ArticleMedia[] {
	return extendedEntities?.media.map(media => {
		switch (media.type) {
			case 'photo':
				return {
					mediaType: MediaType.Image,
					src: media.media_url_https,
					ratio: getRatio(media.sizes.large.w, media.sizes.large.h),
					queueLoadInfo: MediaLoadType.DirectLoad,
					offsetX: null,
					offsetY: null,
					cropRatio: null,
				};
			case 'video':
				return getMP4(media.video_info, MediaType.Video);
			case 'animated_gif':
				return getMP4(media.video_info, MediaType.VideoGif);
		}
	}) || [];
}

function getMP4(videoInfo: VideoInfo, mediaType: MediaType): ArticleMedia {
	const variant = videoInfo.variants.find(v => v.content_type === 'video/mp4');
	if (variant === undefined)
		throw Error("Couldn't find video/mp4 variant.");

	return {
		mediaType,
		src: variant.url,
		ratio: getRatio(videoInfo.aspect_ratio[0], videoInfo.aspect_ratio[1]),
		queueLoadInfo: MediaLoadType.DirectLoad,
		offsetX: null,
		offsetY: null,
		cropRatio: null,
	};
}

export type TweetResponse = {
	created_at: string
	id: number
	id_str: string
	full_text?: string
	text?: string
	truncated: boolean
	entities: Entities
	extended_entities?: ExtendedEntities
	source: string
	in_reply_to_status_id: null
	in_reply_to_status_id_str: null
	in_reply_to_user_id: null
	in_reply_to_user_id_str: null
	in_reply_to_screen_name: null
	user: {
		id: number
		id_str: string
		name: string
		screen_name: string
		location: string
		description: string
		url: string
		entities: UserEntities
		protected: boolean
		followers_count: number
		friends_count: number
		listed_count: number
		created_at: string
		favourites_count: number
		utc_offset: null
		time_zone: null
		geo_enabled: boolean
		verified: boolean
		statuses_count: number
		lang: null
		contributors_enabled: boolean
		is_translator: boolean
		is_translation_enabled: boolean
		profile_background_color: string
		profile_background_image_url: string
		profile_background_image_url_https: string
		profile_background_tile: boolean
		profile_image_url: string
		profile_image_url_https: string
		profile_banner_url: string
		profile_link_color: string
		profile_sidebar_border_color: string
		profile_sidebar_fill_color: string
		profile_text_color: string
		profile_use_background_image: boolean
		has_extended_profile: boolean
		default_profile: boolean
		default_profile_image: boolean
		following: boolean
		follow_request_sent: boolean
		notifications: boolean
		translator_type: string
		withheld_in_countries: []
	}
	geo: null
	coordinates: null
	place: null
	contributors: null
	retweeted_status?: TweetResponse
	retweeted_status_id_str?: string
	is_quote_status: boolean
	quoted_status?: TweetResponse
	quoted_status_id?: number
	quoted_status_id_str?: string
	retweet_count: number
	favorite_count: number
	favorited: boolean
	retweeted: boolean
	possibly_sensitive: boolean
	possibly_sensitive_appealable: boolean
	lang: string
};

export type Entities = {
	hashtags: []
	symbols: []
	user_mentions: {
		screen_name: string
		name: string
		id: number
		id_str: string
		indices: Indices
	}[]
	urls: {
		url: string
		expanded_url: string
		display_url: string
		indices: Indices
	}[]
	description: {
		urls: []
	}
	media: {
		id: number
		id_str: string
		indices: Indices
		media_url: string
		media_url_https: string
		url: string
		display_url: string
		expanded_url: string
		type: MediaType
		sizes: MediaSizes
		source_status_id: number
		source_status_id_str: string
		source_user_id: number
		source_user_id_str: string
	}[]
};

export type ExtendedEntities = {
	media: ExtendedMedia[]
};

type ExtendedMedia = {
	id: number
	id_str: string
	indices: Indices
	media_url: string
	media_url_https: string
	url: string
	display_url: string
	expanded_url: string
	type: 'photo'
	sizes: MediaSizes
	source_status_id: number
	source_status_id_str: string
	source_user_id: number
	source_user_id_str: string
	video_info: null
} | {
	id: number
	id_str: string
	indices: Indices
	media_url: string
	media_url_https: string
	url: string
	display_url: string
	expanded_url: string
	type: 'video' | 'animated_gif'
	sizes: MediaSizes
	source_status_id: number
	source_status_id_str: string
	source_user_id: number
	source_user_id_str: string
	video_info: VideoInfo
};

type VideoInfo = {
	aspect_ratio: [number, number]
	duration_millis: number
	variants: VideoVariant[]
};

type VideoVariant = {
	bitrate: number
	content_type: string	//enum?
	url: string
};

type UserEntities = {
	url: {
		urls: {
			url: string
			expanded_url: string
			display_url: string
			indices: Indices
		}[]
	}
	description: {
		urls: []
	}
};

type MediaSizes = {
	thumb: MediaSize
	large: MediaSize
	medium: MediaSize
	small: MediaSize
};

type MediaSize = {
	w: number
	h: number
	resize: 'fit' | 'crop'
};

type Indices = [number, number];