import type PixivArticle from './article';
import type { CachedPixivArticle } from './article';
import {
	type FetchingService,
	FetchType, getService,
	getWritableArticle,
	newFetchingService,
	newService,
	registerService,
	type Service,
	tagFilterInfo,
	tagKeepArticle,
} from '../service';
import { get, type Writable } from 'svelte/store';
import {
	type ArticleIdPair,
	type ArticleWithRefs,
	articleWithRefToArray,
	getActualArticle,
	getRootArticle,
} from '~/articles';
import { STANDARD_ACTIONS } from '../actions';
import { getServiceStorage } from '~/storages';
import { faFaceSmile } from '@fortawesome/free-solid-svg-icons';
import type { Filter } from '~/filters';
import ServiceSettings from './ServiceSettings.svelte';
import { updateCachedArticlesStorage } from '~/storages/serviceCache';
import MasonryContainer from '~/containers/MasonryContainer.svelte';
import { SortMethod } from '~/sorting';
import { getRatio, MediaLoadType } from '~/articles/media';

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
						const csrfToken = getServiceStorage(PixivService.name).csrfToken as string | undefined;
						if (!csrfToken)
							throw new Error('No CSRF token');

						const response: LikeResponse = await getService('Pixiv').fetch('https://www.pixiv.net/ajax/illusts/like', {
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

						getWritableArticle<PixivArticle>(idPair).update(a => {
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
					},
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
						const csrfToken = storage.csrfToken as string | undefined;
						if (!csrfToken)
							throw new Error('No CSRF token');

						const privateBookmark = (storage.privateBookmark as boolean | undefined) ?? false;

						const response: BookmarkResponse = await getService('Pixiv').fetch('https://www.pixiv.net/ajax/illusts/bookmarks/add', {
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

						getWritableArticle<PixivArticle>(idPair).update(a => {
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
						},
					},
				},
			},
			isOnDomain: globalThis.window.location.hostname.endsWith('pixiv.net'),
			keepArticle(articleWithRefs: ArticleWithRefs, _index: number, filter: Filter): boolean {
				switch (filter.type) {
					case 'bookmarked':
						return (articleWithRefToArray(articleWithRefs) as PixivArticle[])
							.some(a => a.bookmarked);
					case 'liked':
						return (articleWithRefToArray(articleWithRefs) as PixivArticle[])
							.some(a => a.liked);
					//TODO Option to include null or not
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
					case 'tags':
						return tagKeepArticle(filter, articleWithRefToArray(articleWithRefs) as PixivArticle[], (a: PixivArticle) => a.tags);
					default:
						throw new Error('Unknown filter type: ' + filter.type);
				}
			},
			sortMethods: {
				likes: {
					name: 'Likes',
					compare(a, b) {
						return ((getActualArticle(a) as PixivArticle).likeCount ?? 0) - ((getActualArticle(b) as PixivArticle).likeCount ?? 0);
					},
					directionLabel(reversed: boolean): string {
						return reversed ? 'Descending' : 'Ascending';
					},
				},
				retweets: {
					name: 'Bookmarks',
					compare(a, b) {
						return ((getActualArticle(a) as PixivArticle).bookmarkCount ?? 0) - ((getActualArticle(b) as PixivArticle).bookmarkCount ?? 0);
					},
					directionLabel(reversed: boolean): string {
						return reversed ? 'Descending' : 'Ascending';
					},
				},
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
						},
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
						},
					},
				},
				...tagFilterInfo(),
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
								},
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
								},
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
				},
			},
		}),
		async fetchArticle(store: Writable<PixivArticle>) {
			const article = get(store);
			// const htmlPage: string = await PixivService.fetch(`https://www.pixiv.net/en/artworks/${article.id}`, {headers: {Accept: 'text/html'}});
			// const doc = new DOMParser().parseFromString(htmlPage, 'text/html');

			// const nextDataRaw = doc.querySelector('script[id="__NEXT_DATA__"]')?.textContent;
			// if (!nextDataRaw)
			// 	throw new Error('No __NEXT_DATA__ script to get article info');
			// const nextData: PixivNextData = JSON.parse(nextDataRaw);

			//TODO Try loading jpg and then png, instead of fetching through api
			const pagesJson: PagesResponse = await PixivService.fetch(`https://www.pixiv.net/ajax/illust/${article.id}/pages`, {headers: {Accept: 'application/json'}});

			store.update(a => {
				//TODO Find new way to get like and bookmark data
				// a.liked = illust.likeData;
				// a.bookmarked = illust.bookmarkData !== null;
				// a.likeCount = illust.likeCount;
				// a.bookmarkCount = illust.bookmarkCount;

				for (let i = 0; i < a.medias.length; ++i) {
					const page = pagesJson.body[i];
					if (!page)
						throw new Error('Page not found in pages');
					const media = a.medias[i];
					if (!media)
						throw new Error(`Media ${i} not found in article`);
					a.medias[i] = {
						src: page.urls.original,
						ratio: getRatio(page.width, page.height),
						queueLoadInfo: MediaLoadType.LazyLoad,
						mediaType: media.mediaType,
						thumbnail: media.queueLoadInfo === MediaLoadType.Thumbnail ? {
							src: media.src,
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

				//TODO Replace array with Map to overwrite existing data
				// a.rawSource.push(nextData, /* pagesJson */);
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
					tags: a.tags,
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
	body: {is_liked: boolean}
};

type BookmarkResponse = {
	error: boolean
	message: string
	body: {
		last_bookmark_id: string
		stacc_status_id: any
	}
};

//Instead of preload data, pixiv artwork pages now have a script with id __NEXT_DATA__ and type application/json
type _PixivNextData = {
	props: {
		pageProps: {
			forceLegacyNonResponsivePage: boolean
			meta: {
				title: string
				description: string
				canonical: string
				ogp: {
					title: string
					type: string
					image: string
					description: string
				}
				twitter: {
					card: string
					site: string
					url: string
					title: string
					description: string
					'app:name:iphone': string
					'app:id:iphone': string
					'app:url:iphone': string
					'app:name:ipad': string
					'app:id:ipad': string
					'app:url:ipad': string
					'app:name:googleplay': string
					'app:id:googleplay': string
					'app:url:googleplay': string
					image: string
				}
				alternateLanguages: {
					ja: string
					en: string
				}
				referrerContentOrigin: boolean
				ratingContent: string
				robots: boolean
				oembedJsonUrl: string
			}
			lang: string
			isLoggedIn: boolean
			gaUserData: {
				login: boolean
				userAgent: string
				gender: number
				userId: string
				illustUploadFlg: string
				premium: boolean
				lang: string
				abTestDeviceId: number
				premiumRegisterFirstMonthFreeCampaign: boolean
			}
			forceTheme: null
			serverSerializedPreloadedState: string
			dehydratedState: {
				mutations: any[]
				queries: any[]
			}
			_sentryTraceData: string
			_sentryBaggage: string
		}
	}
	page: string
	query: {
		id: string
	}
	buildId: string
	assetPrefix: string
	isFallback: boolean
	isExperimentalCompile: boolean
	dynamicIds: number[]
	gip: boolean
	scriptLoader: any[]
};

//Parsed version of serverSerializedPreloadedState, not really any useful info
type _ServerSerializedPreloadedState = {
	ads: { config: object, flags: object }
	api: {
		token: string
		services: {
			booth: string
			sketch: string
			vroidHub: string
			accounts: string
		}
		language: string
	}
	booth: { items: object }
	feedback: { open: boolean, page: string }
	isDevelopment: boolean
	meta: {
		config: {
			Illust: object
			IllustUnlisted: object
			IllustSeries: object
			Profile: object
			Novel: object
			NovelUnlisted: object
			NovelSeriesContent: object
			NovelSeries: object
			NovelSeriesGlossaryDetail: object
			Search: object
			Dashboard: object
			Preview: object
			FollowLatest: object
			Discovery: object
			UserEvents: object
			About: object
			Top: { default: { title: string, description: boolean } }
		}
		error: boolean
		lang: string
	}
	misc: {
		consent: { gdpr: boolean }
		policyRevision: boolean
		grecaptcha: {
			recaptchaEnterpriseScoreSiteKey: string
		}
		info: {
			id: string
			title: string
			createDate: string
		}
		isSmartphone: boolean
		oneSignalAppId: string
	}
	mute: { tags: [], userIds: [], modal: { items: [] } }
	search: {
		tag: {
			tagData: object
			translation: object
			loaded: { tag_search: string }
		}
		work: { works: object, popular: object, relatedTags: object }
	}
	tag: {
		popular: {
			illust: { all: [], r18: [] }
			novel: { all: [], r18: [] }
			manga: { all: [], r18: [] }
		}
		recommend: { illust: { all: [], r18: [] } }
		recommendBy: { illust: { all: [], r18: [] } }
		loaded: { search_suggestion: { all: string, r18: string } }
		myFavorite: []
		genre: { manga: { all: [], r18: [] } }
		randomSeed: number
	}
	task: { busy: object }
	test: {
		ab: {
			commission_send_and_accept_confirmation: boolean
			ab_touch_manga_new_viewer: boolean
			novel_12th_premium_covers: boolean
			novel_reading_status: boolean
			novel_upload_next_js: boolean
			novel_mod_next_js: boolean
			novel_reserve_mod_next_js: boolean
			posted_novel_cover_edit: boolean
			premium_campaign_spring_2025: boolean
			premium_campaign_spring_2025_banner: boolean
			premium_dmm_lp_update_202502: boolean
			www_tags_link_to_en_dic: boolean
			www_illust_edit_next_js_desktop: boolean
			www_illust_reserve_edit_next_js_desktop: boolean
			www_illust_reupload_next_js_desktop: boolean
			next_js_cardiac_transplant: boolean
		}
		toggle: {
			toggle_accounts_mail_reauthentication_always_available: boolean
			toggle_commission_limitation_countermeasure_202403: boolean
			toggle_commission_lp_renewal: boolean
			toggle_commission_coupon: boolean
			toggle_commission_request_draft: boolean
			toggle_enquete: boolean
			toggle_enquete_target_user: boolean
			toggle_manga_thumbnail_crop: boolean
			toggle_novel_reading_status_show_release_modal: boolean
			toggle_novel_reading_status_read_next_novel: boolean
			toggle_premium_contract_update_retry_from_api: boolean
			toggle_premium_error_next_js: boolean
			toggle_premium_direct_overseas_users_to_gmo_flow: boolean
			toggle_premium_edit_term_next_js: boolean
			toggle_save_feedback: boolean
			toggle_mybestpixiv_release: boolean
			toggle_new_logo_2025: boolean
		}
	}
	thumbnail: {
		illust: object
		novel: object
		drafts: {
			illust: object
			novel: object
		}
		series: {
			manga: object
			novel: object
		}
	}
	userData: {
		pAbDId: number
		self: {
			id: string
			pixivId: string
			name: string
			profileImg: string
			profileImgBig: string
			premium: boolean
			xRestrict: number
			adult: boolean
			illustCreator: boolean
			novelCreator: boolean
			hideAiWorks: boolean
			readingStatusEnabled: boolean
			illustMaskRules: []
			location: string
			isSensitiveViewable: boolean
		}
		users: object
		follow: object
		mypixiv: object
		block: object
		acceptRequest: object
		subscribedReopenNotification: object
		loaded: { self: string }
	}
	webpush: { pixivWebpushPermission: null }
	work: {
		bookmark: {
			bookmark: { illust: object, novel: object }
			bookmarkable: { illust: object, novel: object }
			manualBookmarks: { illust: null, novel: null }
		}
		booth: {
			widget: object
			items: object
			workBoothIds: { illust: object, novel: object }
		}
		contest: {
			banners: { illust: object, novel: object }
			data: { illust: object, novel: object }
		}
		request: { data: { illust: object, novel: object } }
		data: {
			secret: { illust: object, novel: object }
			illust: object
			novel: object
			seriesContent: { illust: object, novel: object }
		}
		discovery: { illust: object, novel: object }
		like: { illust: object, novel: object }
		noLogin: { illust: object, novel: object }
		poll: { illust: object, novel: object }
		promotion: {
			comic: { illust: object, novel: object }
			fanbox: { illust: object, novel: object }
		}
		recommend: { illust: object, novel: object }
		response: {
			outData: {
				illust: { items: object, references: object }
				novel: { items: object, references: object }
			}
			inData: {
				illust: { items: object, references: object, count: object }
				novel: { items: object, references: object, count: object }
			}
		}
		sensitiveVisibility: { illust: object, novel: object }
		series: {
			series: {
				byId: { illust: object, novel: object }
				detailById: { manga: object, novel: object }
				content: { illust: object, novel: object }
				contentTitles: { manga: object, novel: object }
				glossary: { manga: object, novel: object }
			}
			seriesEditor: {
				novel: {
					seriesContentsById: object
					nonSeriesWorks: { works: object, hasMore: boolean }
					deletedWorks: object
					ordersByDesc: []
					editFirstOrder: 1
					unsaved: false
					validationMessages: {
						title: []
						caption: []
						xRestrict: []
						aiType: []
						genre: []
						cover: []
					}
					seriesContentCount: 0
				}
			}
			watch: { manga: object, novel: object }
			notify: { manga: object, novel: object }
		}
		spoiler: { illust: object, novel: object }
		tags: {
			byId: { illust: object, novel: object }
			history: { illust: object, novel: object }
		}
		userWorks: object
		youtube: { workYoutubeIds: { illust: object, novel: object } }
		newPost: {
			illust: { entries: [], lastId: '0' }
			r18_illust: { entries: [], lastId: '0' }
			manga: { entries: [], lastId: '0' }
			r18_manga: { entries: [], lastId: '0' }
			novel: { entries: [], lastId: '0' }
			r18_novel: { entries: [], lastId: '0' }
		}
	}
	pageCommission: {
		requests: object
		userList: object
		userListDesktop: object
		paymentServiceStatus: []
		page: {
			manageRequests: {
				info: null
				requestList: null
				recentUpdate: null
			}
			managePlanSettingsEdit: null
			managePlanSettingsNew: null
			requestsDetails: {
				requestThread: null
				creator: null
				recommendedUserIds: null
				inProgressRequestIds: null
				completeRequestIds: null
				confettiModalStatus: {
					inProgressFan: false
					inProgressCreator: false
					completeFanOrCollaborateUser: false
				}
				alreadyRequestCollaborate: null
				platformFeeCampaignLabel: null
				eligibleCampaignList: null
				isUnlisted: false
				ogp: object
				locationMask: false
			}
			requestSend: {
				creator: null
				plan: null
				planCoverImage: {
					selectableIllustsId: []
					fetchRanges: [[0, 24]]
				}
				inProgressRequestIds: []
				completeRequestIds: []
				recommendedTags: []
				ogp: object
				progressCampaignList: []
				locationMask: false
			}
			requestLegal: null
			request: null
			requestCreatorRecommendPost: {
				illust: object
				manga: object
				ugoira: object
				novels: object
			}
			requestCreators: {
				illust: object
				manga: object
				ugoira: object
				novels: object
			}
			requestInProgress: {
				all: object
				illust: object
				manga: object
				ugoira: object
				novels: object
			}
			requestComplete: {
				illust: object
				manga: object
				ugoira: object
				novels: object
			}
			requestAbout: null
			manageSales: null
			manageTransfer: null
			manageTransferSettings: null
			manageLegalSettings: null
			managePayment: null
		}
	}
	pageNovelEditorsPicks: { data: [] }
	premium: { freeCampaign: true }
	illust: {
		page: {
			currentPage: 1
			pages: object
			hasBookmarked: false
			expanded: false
			openViewer: 'close'
		}
	}
	illustSeries: {
		series: object
		seriesEditData: object
		userAllMangaWorkIds: []
		loaded: { userAllMangaWorkIds: 'waiting' }
	}
	pageFollowLatest: {
		followUserWorks: object
		mypixivUserWorks: object
		folderTags: { follow: null, mypixiv: null }
	}
	tagTranslationSuggestion: { isModalOpen: false }
	ssr: {
		time: 1745100193696
		location: {
			host: string
			href: string
			origin: string
			search: string
		}
	}
	recommendUsers: {
		analizedUserId: null
		users: null
		seedUserId: null
		followedUserIds: []
		usersWithoutUserId: []
	}
	profile: {
		bookmarks: {
			bookmarkWorks: object
			bookmarkTags: { illust: object, novel: object }
			bookmarkTagRenaming: { isInProgress: false }
		}
		external: { sketch: object, vroidHub: object, enabled: object }
		pickup: { pickup: object, pickupEditor: { unsaved: false } }
		series: object
		tag: { workTags: object, frequentTags: object, bookmarkTags: object }
		uploadComplete: object
		userList: {
			following: object
			mypixiv: object
			followers: object
			folder: { tags: [] }
			workData: object
		}
		work: { works: object, filtered: object }
		requests: { postWorkIds: object, plans: object }
		request: {
			tabStatus: object
			page: { request: null, requestSent: null }
		}
		shouldShowSensitiveNotice: { shouldShowSensitiveNotice: object }
	}
	pageDashboard: {
		home: {
			achievement: null
			contests: []
			hotWorks: { today: null }
			recentUploadWorks: []
			userCountSummary: object
			yearBestWork: { work: null }
			todayAnniversary: null
		}
		works: {
			userWorks: []
			userSeries: []
			userDrafts: []
			userReservedWorks: []
		}
		reactions: { recentUploadWorks: { illust: object, novel: object } }
		loaded: {
			reactions: string
			works: string
			worksUpToDate: string
			home: string
		}
	}
	pageTop: { illust: object, novel: object, manga: object }
	readingStatus: {
		novel: object
		manga: object
		novelSeries: object
		mangaSeries: object
		visibleReadingProgressBar: false
	}
	street: {
		main: []
		discover: []
		recommend_tags: null
		forYou: []
		latest: { data: null, isLoading: true }
		subColumn: []
		loadCount: { main: 1, discover: 1 }
		contentIndex: 0
		isNewUserToStreet: false
		uninterestedContent: null
	}
	spa: true
	page: object
	router: { location: null }
};