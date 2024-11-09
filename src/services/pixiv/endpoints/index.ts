import type {ArticleWithRefs} from '~/articles';
import type {CachedPixivArticle, PixivUser} from '../article';
import PixivArticle from '../article';
import {type ArticleMedia, MediaLoadType, MediaType} from '~/articles/media';
import {avatarHighRes} from '~/services/pixiv/endpoints/bookmarks.endpoint';

export function getThumbnailId(element: Element): number | null {
	const anchors = element.querySelectorAll('a');
	const idStr = anchors[0]?.getAttribute('data-gtm-value');
	if (!idStr) {
		if (element.querySelector('span')?.getAttribute('data-gtm-value'))
			return null;
		else
			throw new Error("Couldn't find id");
	}
	return parseInt(idStr);
}

export function parseThumbnail(element: Element, markedAsReadStorage: string[], cachedArticlesStorage: Record<number, CachedPixivArticle | undefined>, user: PixivUser): ArticleWithRefs | null {
	const id = getThumbnailId(element);
	if (id === null)
		return null;

	const thumbnailSrc = element.querySelector('img')?.src;
	if (!thumbnailSrc) {
		if (element.querySelector('figure'))
			return null;
		else
			throw new Error("Couldn't find src");
	}

	const pageCountSpan = element.querySelector('span:nth-child(2)');
	const pageCount = pageCountSpan !== null ? parseInt(pageCountSpan.textContent as string) : 1;

	const cached = cachedArticlesStorage[id];

	const medias: ArticleMedia[] = cached?.medias ??
		getEachPageURL(thumbnailSrc, pageCount)
			.map(src => ({
				mediaType: MediaType.Image,
				src,
				ratio: null,
				queueLoadInfo: MediaLoadType.Thumbnail,
				offsetX: null,
				offsetY: null,
				cropRatio: null,
			}));

	const title = element.querySelectorAll('a')[1]?.textContent;
	if (!title)
		throw new Error("Couldn't find title");

	const liked = cached?.liked ?? false;

	let bookmarked = false;
	const bookmarkButton = element.querySelector('button svg');
	if (bookmarkButton) {
		const color = getComputedStyle(bookmarkButton).color;
		bookmarked = color === 'rgb(255, 64, 96)';
	}

	return {
		type: 'normal',
		article: new PixivArticle(
			id,
			medias,
			title,
			user,
			undefined,
			markedAsReadStorage,
			[element],
			liked,
			bookmarked,
			cached?.medias !== undefined,
		),
	};
}

export function getEachPageURL(baseUrl: string, pageCount: number): string[] {
	const parsed = baseUrl.replace(/(\/c\/.+)?(\/\w+-)\w+(\/.+_p\d)(_(\w+)\d+)?/, '/img-master$3_square1200');
	const urls = [];
	for (let i = 0; i < pageCount; ++i)
		urls.push(parsed.replace(/(_p)\d/, '$1' + i));

	return urls;
}

export function getUserUrl(id: number | string): string {
	return 'https://www.pixiv.net/en/users/' + id;
}

export function getCurrentPage(): number {
	const p = new URLSearchParams(location.search).get('p');
	return p === null ? 0 : parseInt(p) - 1;
}


export type PixivResponse<Body> = {
	error: boolean
	message: string
	body: Body
};

export type PixivResponseWithPage<Page> = PixivResponse<{
	page: Page
	tagTranslation: TagTranslation
	thumbnails: {
		illust: Illust[]
		novel: []
		novelSeries: []
		novelDraft: []
	}
	illustSeries: []
	requests: []
	users: []
	zoneConfig: ZoneConfig
}>;

export type PixivResponseWithWorks = PixivResponse<{
	works: Record<string, Illust>
}> & {
	zoneConfig: ZoneConfig
	extraData: ExtraData
};

export type BookmarkData = {
	id: string
	private: boolean
};

export type Illust = {
	id: string
	title: string
	illustType: IllustType
	xRestrict: 0 | 1
	restrict: 0 | 1
	sl: number
	url: string
	description: string
	tags: string[]
	userId: string
	userName: string
	width: number
	height: number
	pageCount: number
	isBookmarkable: boolean
	bookmarkData: BookmarkData | null
	alt: string
	titleCaptionTranslation: {
		workTitle: null
		workCaption: null
	}
	createDate: string
	updateDate: string
	isUnlisted: boolean
	isMasked: boolean
	aiType: AIType
	urls: {
		//Didn't confirm those were the only sizes
		[key in '250x250' | '360x360' | '540x540']: string
	}
	profileImageUrl: string
};

export type TagTranslation = Record<string, Record<'en' | 'ko' | 'zh' | 'zh_tw' | 'romaji', string>>;

export type ZoneConfig = {
	header: {url: string}
	footer: {url: string}
	logo: {url: string}
	'500x500': {url: string}
};

export type ExtraData = {
	meta: {
		title: string
		description: string
		canonical: string
		ogp: {
			description: string
			image: string
			title: string
			type: string
		}
		twitter: {
			description: string
			image: string
			title: string
			card: string
		}
		alternateLanguages: {
			ja: string
			en: string
		}
		descriptionHeader: string
	}
};

export enum IllustType {
	Illust = 0,
	//Manga = 1,?
	Ugoira = 2,
}

//Should upgrade to enum, probably 0 | 1 | 2
export type AIType = number;

export function illustToArticle(illust: Illust, markedAsReadStorage: string[], cachedArticlesStorage: Record<string, CachedPixivArticle | undefined>): ArticleWithRefs {
	const id = parseInt(illust.id);
	const cached = cachedArticlesStorage[id];

	let mediaType: MediaType;
	switch (illust.illustType) {
		case IllustType.Ugoira:
			mediaType = MediaType.Gif;
			break;
		default:
			mediaType = MediaType.Image;
			break;
	}

	const medias = cached?.medias ?? getEachPageURL(illust.url, illust.pageCount).map((src, i) => {
		//TODO Try loading image and trying different extension on fail
		//if (mediaType === MediaType.Gif) {
		return {
			mediaType,
			src,
			ratio: i === 0 ? illust.height / illust.width : null,
			queueLoadInfo: MediaLoadType.Thumbnail,
			offsetX: null,
			offsetY: null,
			cropRatio: null,
		} satisfies ArticleMedia;
		//}else {
		//	const fullSrc = new URL(src);
		//	fullSrc.pathname = fullSrc.pathname.replace(/\/img-master\//, '/img-original/');
		//	fullSrc.pathname = fullSrc.pathname.replace(/_square1200/, '');
		//	console.log(src + '\n' + fullSrc.toString());
		//	const ratio = i === 0 ? illust.height / illust.width : null;
		//	return {
		//		mediaType,
		//		src: fullSrc.toString(),
		//		ratio,
		//		queueLoadInfo: MediaLoadType.LazyLoad,
		//		offsetX: null,
		//		offsetY: null,
		//		cropRatio: null,
		//		loaded: false,
		//		thumbnail: {
		//			src,
		//			ratio,
		//			offsetX: null,
		//			offsetY: null,
		//			cropRatio: null,
		//		},
		//	} satisfies ArticleMedia;
		//}
	});
	const liked = cached?.liked ?? false;
	const bookmarked = illust.bookmarkData !== null;

	return {
		type: 'normal',
		article: new PixivArticle(
			id,
			medias,
			illust.title,
			{
				id: parseInt(illust.userId),
				url: getUserUrl(illust.userId),
				username: illust.userName,
				name: illust.userName,
				avatarUrl: avatarHighRes(illust.profileImageUrl),
			},
			new Date(illust.createDate),
			markedAsReadStorage,
			[illust],
			liked,
			bookmarked,
			cached?.medias !== undefined,
		),
	};
}

export enum Mode {
	All = 'all',
	AllAges = 'safe',
	R18 = 'r18',
}