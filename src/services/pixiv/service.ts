import PixivArticle from './article';
import type {FetchingService, Service} from '../service';
import {getWritable, newFetchingService, newService, registerService} from '../service';
import type {Writable} from 'svelte/store';
import {get} from 'svelte/store';
import type {ArticleIdPair} from '../../articles';
import {STANDARD_ACTIONS} from '../actions';
import {getServiceStorage} from '../../storages';
import {getRatio, MediaLoadType, MediaType} from '../../articles/media';
import {faFaceSmile} from '@fortawesome/free-solid-svg-icons';

export const PixivService: PixivServiceType = {
	...newService('Pixiv'),
	...newFetchingService(),
	async fetchArticle(store: Writable<PixivArticle>) {
		const article = get(store);
		const json: PagesResponse = await fetch(`https://www.pixiv.net/ajax/illust/${article.id}/pages`).then(r => r.json());

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
			actionnedIcon: undefined,
			color: undefined,
			togglable: false,
			async action(idPair: ArticleIdPair) {
				const csrfToken = getServiceStorage(PixivService.name)['csrfToken'] as string | undefined;
				if (!csrfToken)
					throw new Error('No CSRF token');

				const response : LikeResponse = await fetch('https://www.pixiv.net/ajax/illusts/like', {
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
			actionned(article) { return article.liked; },
		},
		bookmark: {
			key: 'bookmark',
			name: 'Bookmark',
			color: STANDARD_ACTIONS.like.color,
			icon: STANDARD_ACTIONS.like.icon,
			actionnedIcon: STANDARD_ACTIONS.like.actionnedIcon,
			togglable: false,
			index: 1,
			async action(idPair) {
				const storage = getServiceStorage(PixivService.name);
				const csrfToken = storage['csrfToken'] as string | undefined;
				if (!csrfToken)
					throw new Error('No CSRF token');

				const privateBookmark = (storage['privateBookmark'] as boolean | undefined) ?? false;

				const response : BookmarkResponse = await fetch('https://www.pixiv.net/ajax/illusts/bookmarks/add', {
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
			actionned(article) { return article.bookmarked === true; },
		}
	},
	isOnDomain: globalThis.window?.location?.hostname === 'pixiv.net',
};
PixivArticle.service = PixivService.name;

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