import type PixivArticle from './article';
import type {CachedPixivArticle} from './article';
import {
	type FetchingService,
	FetchType, getServices,
	getWritable,
	newFetchingService,
	newService,
	registerService,
	type Service
} from '../service';
import {get, type Writable} from 'svelte/store';
import {
	type ArticleIdPair,
	type ArticleWithRefs,
	articleWithRefToArray,
	getActualArticle,
	getRootArticle
} from '~/articles';
import {STANDARD_ACTIONS} from '../actions';
import {getServiceStorage} from '~/storages';
import {faFaceSmile} from '@fortawesome/free-solid-svg-icons';
import type {Filter} from '~/filters';
import ServiceSettings from './ServiceSettings.svelte';
import {updateCachedArticlesStorage} from '~/storages/serviceCache';
import MasonryContainer from '~/containers/MasonryContainer.svelte';
import {SortMethod} from '~/sorting';
import type {
	AIType,
	BookmarkData, ExtraData,
	Illust,
	IllustType, ZoneConfig,
} from '~/services/pixiv/endpoints';
import {getRatio, MediaLoadType} from '~/articles/media';

export const PixivService: PixivServiceType = {
	...newFetchingService({
		...newService({
			name: 'Pixiv',
			articleActions: {
				[STANDARD_ACTIONS.like.key]: {
					...STANDARD_ACTIONS.like,
					icon: faFaceSmile,
					actionedIcon: null,
					color: null,
					togglable: false,
					async action(idPair: ArticleIdPair) {
						const csrfToken = getServiceStorage(PixivService.name)['csrfToken'] as string | undefined;
						if (!csrfToken)
							throw new Error('No CSRF token');

						const response: LikeResponse = await getServices()['Pixiv'].fetch('https://www.pixiv.net/ajax/illusts/like', {
							method: 'POST',
							credentials: 'same-origin',
							cache: 'no-cache',
							headers: {
								Accept: 'application/json',
								'Content-Type': 'application/json',
								'Cache-Control': 'no-cache',
								'X-CSRF-TOKEN': csrfToken,
							},
							body: JSON.stringify({illust_id: idPair.id}),
						});

						if (response.error)
							throw new Error('Error during like: ' + response.message);

						if (response.body.is_liked)
							console.debug(idPair.id + ' was already liked.');
						else
							console.debug('Liked ' + idPair.id);

						getWritable<PixivArticle>(idPair).update(a => {
							a.liked = true;
							return a;
						});

						updateCachedArticlesStorage(PixivService.name);
					},
					actioned(article: PixivArticle) {
						return article.liked;
					},
					count(article: PixivArticle) {
						return article.likeCount;
					}
				},
				bookmark: {
					key: 'bookmark',
					name: 'Bookmark',
					actionedName: null,
					icon: STANDARD_ACTIONS.like.icon,
					actionedIcon: STANDARD_ACTIONS.like.actionedIcon,
					color: STANDARD_ACTIONS.like.color,
					togglable: false,
					disabled: null,
					index: 1,
					async action(idPair) {
						const storage = getServiceStorage(PixivService.name);
						const csrfToken = storage['csrfToken'] as string | undefined;
						if (!csrfToken)
							throw new Error('No CSRF token');

						const privateBookmark = (storage['privateBookmark'] as boolean | undefined) ?? false;

						const response: BookmarkResponse = await getServices()['Pixiv'].fetch('https://www.pixiv.net/ajax/illusts/bookmarks/add', {
							method: 'POST',
							credentials: 'same-origin',
							cache: 'no-cache',
							headers: {
								Accept: 'application/json',
								'Content-Type': 'application/json',
								'Cache-Control': 'no-cache',
								'X-CSRF-TOKEN': csrfToken,
							},
							body: JSON.stringify({
								illust_id: idPair.id,
								restrict: privateBookmark ? 1 : 0,
								comment: '',
								tags: [],
							}),
						});

						if (response.error)
							throw new Error('Error during bookmark: ' + response.message);

						console.debug('Bookmarked ' + idPair.id);

						getWritable<PixivArticle>(idPair).update(a => {
							a.bookmarked = true;
							return a;
						});
					},
					actioned(article) {
						return article.bookmarked === true;
					},
					count(article) {
						return article.bookmarkCount;
					},
					views: {
						default: {
							listAsIcon: true,
							listAsDropdown: false,
						}
					}
				}
			},
			isOnDomain: globalThis.window?.location?.hostname.endsWith('pixiv.net'),
			keepArticle(articleWithRefs: ArticleWithRefs, index: number, filter: Filter): boolean {
				switch (filter.type) {
					case 'bookmarked':
						return (articleWithRefToArray(articleWithRefs) as PixivArticle[])
							.some(a => a.bookmarked);
					case 'liked':
						return (articleWithRefToArray(articleWithRefs) as PixivArticle[])
							.some(a => a.liked);
					case 'likes': {
						const likeCount = (getRootArticle(articleWithRefs) as PixivArticle).likeCount;
						if (likeCount === null)
							return false;

						switch (filter.props.compare.comparator) {
							case '=':
								return likeCount === filter.props.compare.value;
							case '>':
								return likeCount > filter.props.compare.value;
							case '>=':
								return likeCount >= filter.props.compare.value;
							case '<':
								return likeCount < filter.props.compare.value;
							case '<=':
								return likeCount <= filter.props.compare.value;
							default:
								throw new Error('Unknown comparator: ' + filter.props.compare.comparator);
						}
					}
					case 'bookmarks': {
						const bookmarkCount = (getRootArticle(articleWithRefs) as PixivArticle).bookmarkCount;
						if (bookmarkCount === null)
							return false;
						switch (filter.props.compare.comparator) {
							case '=':
								return bookmarkCount === filter.props.compare.value;
							case '>':
								return bookmarkCount > filter.props.compare.value;
							case '>=':
								return bookmarkCount >= filter.props.compare.value;
							case '<':
								return bookmarkCount < filter.props.compare.value;
							case '<=':
								return bookmarkCount <= filter.props.compare.value;
							default:
								throw new Error('Unknown comparator: ' + filter.props.compare.comparator);
						}
					}
					default:
						throw new Error('Unknown filter type: ' + filter.type);
				}
			},
			sortMethods: {
				likes: {
					name: 'Likes',
					compare(a, b) {
						return ((getActualArticle(a) as PixivArticle).likeCount || 0) - ((getActualArticle(b) as PixivArticle).likeCount || 0);
					},
					directionLabel(reversed: boolean): string {
						return reversed ? 'Descending' : 'Ascending';
					}
				},
				retweets: {
					name: 'Bookmarks',
					compare(a, b) {
						return ((getActualArticle(a) as PixivArticle).bookmarkCount || 0) - ((getActualArticle(b) as PixivArticle).bookmarkCount || 0);
					},
					directionLabel(reversed: boolean): string {
						return reversed ? 'Descending' : 'Ascending';
					}
				}
			},
			filterTypes: {
				bookmarked: {
					type: 'bookmarked',
					name: 'Bookmarked',
					invertedName: 'Not bookmarked',
					props: {},
				},
				liked: {
					type: 'liked',
					name: 'Liked',
					invertedName: 'Not liked',
					props: {},
				},
				likes: {
					type: 'likes',
					name: 'Likes',
					invertedName: 'Likes',
					props: {
						compare: {
							type: 'order',
							optional: false,
							min: 0,
						}
					},
				},
				bookmarks: {
					type: 'bookmarks',
					name: 'Bookmarks',
					invertedName: 'Bookmarks',
					props: {
						compare: {
							type: 'order',
							optional: false,
							min: 0,
						}
					},
				},
			},
			defaultFilter(filterType: string): Filter {
				switch (filterType) {
					case 'bookmarked':
						return {
							type: filterType,
							service: 'Pixiv',
							props: {},
						};
					case 'liked':
						return {
							type: filterType,
							service: 'Pixiv',
							props: {},
						};
					case 'likes':
						return {
							type: filterType,
							service: 'Pixiv',
							props: {
								compare: {
									value: 0,
									comparator: '>=',
								}
							},
						};
					case 'bookmarks':
						return {
							type: filterType,
							service: 'Pixiv',
							props: {
								compare: {
									value: 0,
									comparator: '>=',
								}
							},
						};
					default:
						return {
							type: filterType,
							service: 'Pixiv',
							props: {},
						};
				}
			},
			settings: ServiceSettings,
			fetchInfo: {
				//Pixiv's images don't allow CORS
				type: FetchType.OnDomainOnly,
			},
			timelineTemplates: {
				main: {
					container: MasonryContainer,
					columnCount: 4,
					animatedAsGifs: true,
					sortInfo: {
						method: SortMethod.Id,
						customMethod: null,
						reversed: true,
					},
					compact: true,
					fullMedia: 1,
				}
			},
		}),
		async fetchArticle(store: Writable<PixivArticle>) {
			const article = get(store);
			const htmlPage: string = await PixivService.fetch(`https://www.pixiv.net/en/artworks/${article.id}`, {headers: {Accept: 'text/html'}});
			//TODO Replace htmls with DOMParser
			const doc = new DOMParser().parseFromString(htmlPage, 'text/html');
			const preloadData = doc.querySelector('meta[name="preload-data"]')?.getAttribute('content');
			if (!preloadData)
				throw {message: 'No preload data', doc};
			const preloadDataJson: PreloadData = JSON.parse(preloadData);
			logPreloadDataTypes(preloadDataJson);
			//TODO Try loading jpg and then png, instead of fetching through api
			const pagesJson: PagesResponse = await PixivService.fetch(`https://www.pixiv.net/ajax/illust/${article.id}/pages`, {headers: {Accept: 'application/json'}});

			store.update(a => {
				a.liked = preloadDataJson.illust[article.id].likeData;
				a.bookmarked = preloadDataJson.illust[article.id].bookmarkData !== null;
				a.likeCount = preloadDataJson.illust[article.id].likeCount;
				a.bookmarkCount = preloadDataJson.illust[article.id].bookmarkCount;

				for (let i = 0; i < a.medias.length; ++i) {
					const page = pagesJson.body[i];
					a.medias[i] = {
						src: page.urls.original,
						ratio: getRatio(page.width, page.height),
						queueLoadInfo: MediaLoadType.LazyLoad,
						mediaType: a.medias[i].mediaType,
						thumbnail: a.medias[i].queueLoadInfo === MediaLoadType.Thumbnail ? {
							src: a.medias[i].src,
							ratio: null,
							offsetX: null,
							offsetY: null,
							cropRatio: null,
						} : null,
						loaded: false,
						offsetX: null,
						offsetY: null,
						cropRatio: null,
					};
				}

				a.rawSource.push(preloadDataJson/*, pagesJson*/);
				a.fetched = true;
				PixivService.fetchedArticles.delete(article.idPair.id);

				return a;
			});
		},
	}),
	getCachedArticles() {
		const cachedArticles: Record<string, CachedPixivArticle> = {};
		for (const a of Object.values(PixivService.articles).map(([w, _]) => get(w))) {
			if (a.fetched || a.liked) {
				cachedArticles[a.id] = {
					id: a.id,
					medias: a.fetched ? a.medias.map(m => {
						const newM = {...m};
						if (newM.loaded)
							newM.loaded = false;
						return newM;
					}) : undefined,
					liked: a.liked || undefined,
					likeCount: a.likeCount ?? undefined,
					bookmarkCount: a.bookmarkCount ?? undefined,
				};
			}
		}

		return cachedArticles;
	},
};

registerService(PixivService);

interface PixivServiceType extends Service<PixivArticle>, FetchingService<PixivArticle> {
	getCachedArticles: () => Record<string, CachedPixivArticle>
}

type PagesResponse = {
	error: boolean
	message: string
	body:
		{
			urls: {
				thumb_mini: string
				small: string
				regular: string
				original: string
			}
			width: number
			height: number
		}[]
};

type LikeResponse = {
	error: boolean
	message: string
	body: { is_liked: boolean }
};

type BookmarkResponse = {
	error: boolean
	message: string
	body: {
		last_bookmark_id: string
		stacc_status_id: any
	}
};

export type PreloadData = {
	timestamp: string
	illust: Record<string, PreloadIllust>
	user: Record<string, PreloadUser>
};

export type PreloadIllust = {
	illustId: string
	illustTitle: string
	illustComment: string
	id: string
	title: string
	description: string
	illustType: IllustType
	createDate: string
	uploadDate: string
	restrict: 0 | 1
	xRestrict: 0 | 1
	sl: number
	urls: {
		mini: string
		thumb: string
		small: string
		regular: string
		original: string
	}
	tags: {
		authorId: string
		isLocked: boolean
		tags: {
			tag: string
			locked: boolean
			deletable: boolean
			userId: string
			userName: string
			romaji?: string
			translation?: Record<string, string>
		}[]
		writable: boolean
	}
	alt: string
	userId: string
	userName: string
	userAccount: string
	userIllusts: Record<string, (Omit<Illust,
		| 'urls'
		| 'profileImageUrl'
	> & {
		profileImageUrl?: string
	}) | null>
	likeData: boolean
	width: number
	height: number
	pageCount: number
	bookmarkCount: number
	likeCount: number
	commentCount: number
	responseCount: number
	viewCount: number
	bookStyle: string
	isHowto: boolean
	isOriginal: boolean
	imageResponseOutData: unknown[]
	imageResponseData: unknown[]
	imageResponseCount: number
	pollData: null | {
		question: string
		choices:
			{
				id: number
				text: string
				count: number
			}[]
		selectedValue: null | unknown
		total: number
	}
	seriesNavData: null | {
		seriesType: string
		seriesId: string
		title: string
		order: number
		isWatched: boolean
		isNotifying: boolean
		prev: {
			id: string
			title: string
			order: number
		}
		next: {
			id: string
			title: string
			order: number
		}
	}
	descriptionBoothId: null | unknown
	descriptionYoutubeId: null | unknown
	comicPromotion: null | unknown
	fanboxPromotion: null | unknown
	contestBanners: unknown[]
	isBookmarkable: boolean
	bookmarkData: BookmarkData | null
	contestData: null | unknown
	zoneConfig: ZoneConfig & {
		responsive: { url: string }
		rectangle: { url: string }
		expandedFooter: { url: string }
		relatedworks: { url: string }
	}
	extraData: ExtraData
	titleCaptionTranslation: {
		workTitle: string | null
		workCaption: string | null
	}
	isUnlisted: boolean
	request: null | {
		request: {
			requestId: string
			requestStatus: string
			requestProposal: {
				requestOriginalProposal: string
				requestOriginalProposalLang: string
				requestTranslationProposal: {
					requestProposal: string
					requestProposalLang: string
				}[]
			}
			requestTags: string[]
			requestAdultFlg: boolean
			requestPrice: number
			role: string
			postWork: null | unknown
			plan: {
				currentPlanId: null | unknown
				planId: string
				creatorUserI: string
				planAcceptRequestFlg: boolean
				planStandardPrice: number
				planTitle: {
					planOriginalTitle: string
					planOriginalTitleLang: string
					planTranslationTitle: unknown[]
				}
				planDescription: {
					planOriginalDescription: string
					planOriginalDescriptionHtml: string
					planOriginalLang: string
					planTranslationDescription: Record<string, {
						planDescription: string
						planDescriptionHtml: string
						planLang: string
					}>
				}
				planAcceptAdultFlg: boolean
				planAcceptAnonymousFlg: boolean
				planAcceptIllustFlg: boolean
				planAcceptUgoiraFlg: boolean
				planAcceptMangaFlg: boolean
				planAcceptNovelFlg: boolean
				planCoverImage: null | unknown
				planAiType: AIType
			}
		}
		creator: {
			userId: string
			userName: string
			profileImg: string
		}
		fan: {
			userId: string
			userName: string
			profileImg: string
		}
		collaborateStatus: {
			collaborating: boolean
			collaborateAnonymousFlg: boolean
			collaboratedCnt: number
			userSamples: unknown[]
		}
		editable: boolean
	}
	commentOff: 0 | 1
	aiType: AIType
	reuploadDate: string | null
	locationMask: boolean
};

export type PreloadUser = {
	userId: string
	name: string
	image: string
	imageBig: string
	premium: boolean
	isFollowed: boolean
	isMypixiv: boolean
	isBlocking: boolean
	background: null | {
		repeat: null | unknown
		color: null | unknown
		url: string
		isPrivate: boolean
	}
	sketchLiveId: null | unknown
	partial: number
	acceptRequest: boolean
	sketchLives: unknown[]
	commission: null | {
		acceptRequest: boolean
		isSubscribedReopenNotification: boolean
	}
};

//Temp function to find unknown types
export function logPreloadDataTypes(data: PreloadData) {
	for (const illust of Object.values(data.illust)) {
		if (illust.imageResponseOutData.length > 0)
			console.log(
				'PreloadData.Illust.imageResponseOutData',
				typeof (illust.imageResponseOutData[0]),
				illust.imageResponseOutData[0]
			);
		if (illust.imageResponseData.length > 0)
			console.log(
				'PreloadData.Illust.imageResponseData',
				typeof (illust.imageResponseData[0]),
				illust.imageResponseData[0]
			);
		if (illust.descriptionBoothId !== null && illust.descriptionBoothId !== undefined)
			console.log(
				'PreloadData.Illust.descriptionBoothId',
				typeof (illust.descriptionBoothId),
				illust.descriptionBoothId
			);
		if (illust.descriptionYoutubeId !== null && illust.descriptionYoutubeId !== undefined)
			console.log(
				'PreloadData.Illust.descriptionYoutubeId',
				typeof (illust.descriptionYoutubeId),
				illust.descriptionYoutubeId
			);
		if (illust.comicPromotion !== null && illust.comicPromotion !== undefined)
			console.log(
				'PreloadData.Illust.comicPromotion',
				typeof (illust.comicPromotion),
				illust.comicPromotion
			);
		if (illust.fanboxPromotion !== null && illust.fanboxPromotion !== undefined)
			console.log(
				'PreloadData.Illust.fanboxPromotion',
				typeof (illust.fanboxPromotion),
				illust.fanboxPromotion
			);
		if (illust.contestBanners.length > 0)
			console.log(
				'PreloadData.Illust.contestBanners',
				typeof (illust.contestBanners[0]),
				illust.contestBanners[0]
			);
		if (illust.contestData !== null && illust.contestData !== undefined)
			console.log(
				'PreloadData.Illust.contestData',
				typeof (illust.contestData),
				illust.contestData
			);
	}

	for (const user of Object.values(data.user)) {
		if (user.background?.color !== null && user.background?.color !== undefined)
			console.log(
				'PreloadData.User.background.color',
				typeof (user.background?.color),
				user.background?.color
			);
		if (user.background?.repeat !== null && user.background?.repeat !== undefined)
			console.log(
				'PreloadData.User.background.repeat',
				typeof (user.background?.repeat),
				user.background?.repeat
			);
		if (user.sketchLiveId !== null && user.sketchLiveId !== undefined)
			console.log(
				'PreloadData.User.sketchLiveId',
				typeof (user.sketchLiveId),
				user.sketchLiveId
			);
		if (user.sketchLives.length > 0)
			console.log(
				'PreloadData.User.sketchLives',
				typeof (user.sketchLives[0]),
				user.sketchLives[0]
			);
	}
}