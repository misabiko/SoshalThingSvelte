import type PixivArticle from './article';
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
import Article, {type ArticleIdPair, type ArticleWithRefs, articleWithRefToArray, getRootArticle} from '../../articles';
import {STANDARD_ACTIONS} from '../actions';
import {getServiceStorage} from '../../storages';
import {getRatio, MediaLoadType, MediaType} from '../../articles/media';
import {faFaceSmile} from '@fortawesome/free-solid-svg-icons';
import type {Filter} from 'filters';
import ServiceSettings from './ServiceSettings.svelte';

export const PixivService: PixivServiceType = {
	...newService('Pixiv'),
	...newFetchingService(),
	async fetchArticle(store: Writable<PixivArticle>) {
		const article = get(store);
		const json: PagesResponse = await this.fetch(`https://www.pixiv.net/ajax/illust/${article.id}/pages`).then(r => r.json());

		store.update(a => {
			for (let i = 0; i < a.medias.length; ++i) {
				const page = json.body[i];
				a.medias[i] = {
					src: page.urls.original,
					ratio: getRatio(page.width, page.height),
					queueLoadInfo: MediaLoadType.LazyLoad,
					mediaType: MediaType.Image,
					thumbnail: a.medias[i].queueLoadInfo === MediaLoadType.Thumbnail ? {
						src: a.medias[i].src
					}: undefined,
					loaded: false
				};
			}

			a.fetched = true;
			PixivService.fetchedArticles.delete(article.idPair.id);

			return a;
		});
	},
	articleActions: {
		[STANDARD_ACTIONS.like.key]: {
			...STANDARD_ACTIONS.like,
			icon: faFaceSmile,
			actionedIcon: undefined,
			color: undefined,
			togglable: false,
			async action(idPair: ArticleIdPair) {
				const csrfToken = getServiceStorage(PixivService.name)['csrfToken'] as string | undefined;
				if (!csrfToken)
					throw new Error('No CSRF token');

				const response : LikeResponse = await getServices()['Pixiv'].fetch('https://www.pixiv.net/ajax/illusts/like', {
					method: 'POST',
					credentials: 'same-origin',
					cache: 'no-cache',
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/json',
						'Cache-Control': 'no-cache',
						'X-CSRF-TOKEN': csrfToken,
					},
					body: JSON.stringify({illust_id: idPair.id}),
				}).then(r => r.json());

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
			},
			actioned(article) { return article.liked; },
		},
		bookmark: {
			key: 'bookmark',
			name: 'Bookmark',
			color: STANDARD_ACTIONS.like.color,
			icon: STANDARD_ACTIONS.like.icon,
			actionedIcon: STANDARD_ACTIONS.like.actionedIcon,
			togglable: false,
			index: 1,
			async action(idPair) {
				const storage = getServiceStorage(PixivService.name);
				const csrfToken = storage['csrfToken'] as string | undefined;
				if (!csrfToken)
					throw new Error('No CSRF token');

				const privateBookmark = (storage['privateBookmark'] as boolean | undefined) ?? false;

				const response : BookmarkResponse = await getServices()['Pixiv'].fetch('https://www.pixiv.net/ajax/illusts/bookmarks/add', {
					method: 'POST',
					credentials: 'same-origin',
					cache: 'no-cache',
					headers: {
						'Accept': 'application/json',
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
				}).then(r => r.json());

				if (response.error)
					throw new Error('Error during bookmark: ' + response.message);

				console.debug('Bookmarked ' + idPair.id);

				getWritable<PixivArticle>(idPair).update(a => {
					a.bookmarked = true;
					return a;
				});
			},
			actioned(article) { return article.bookmarked === true; },
		}
	},
	isOnDomain: globalThis.window?.location?.hostname === 'pixiv.net',
	keepArticle(articleWithRefs: ArticleWithRefs, index: number, filter: Filter): boolean {
		if ((getRootArticle(articleWithRefs).constructor as typeof Article).service !== this.name)
			return true;

		switch (filter.type) {
			case 'bookmarked':
				return (articleWithRefToArray(articleWithRefs) as PixivArticle[])
					.some(a => a.bookmarked);
			default: return true;
		}
	},
	filterTypes: {
		bookmarked: {
			name: (inverted) => inverted ? 'Not bookmarked' : 'Bookmarked',
			props: [],
		},
	},
	settings: ServiceSettings,
	fetchInfo: {
		//Pixiv's images don't allow CORS
		type: FetchType.OnDomainOnly,
	}
};

registerService(PixivService);

interface PixivServiceType extends Service<PixivArticle>, FetchingService<PixivArticle> {}

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
			},
			width: number
			height: number
		}[]
}

type LikeResponse = {
	error : boolean
	message : string
	body : { is_liked : boolean }
}

type BookmarkResponse = {
	error : boolean,
	message : string,
	body : {
		last_bookmark_id : string,
		stacc_status_id : any
	}
}