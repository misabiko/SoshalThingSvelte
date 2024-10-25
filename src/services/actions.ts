import type {ArticleIdPair} from '~/articles';
import {fetchArticle, getServices, getWritable, toggleMarkAsRead} from './service';
import {
	faUpRightFromSquare,
	type IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import {faHeart as faHeartReg} from '@fortawesome/free-regular-svg-icons';
import {faEye, faEyeSlash, faHeart, faRetweet} from '@fortawesome/free-solid-svg-icons';
import type Article from '../articles';
import {loadingStore} from '~/bufferedMediaLoading';
import {get} from 'svelte/store';

export type ArticleAction<A extends Article = Article> = (
| (
	{
		action: (idPair: ArticleIdPair) => void
		actioned: (article: A) => boolean
		actionedName: string | null
		actionedIcon: IconDefinition | null
		togglable: boolean
		disabled: ((article: A) => boolean) | null

		href?: never
	}
)
| {
	href: string

	action?: never
	actionedName?: never
	actioned?: never
	togglable?: never
	actionedIcon?: never
	disabled?: never
}
) & {
	key: string
	name: string
	icon: IconDefinition | null
	color: string | null
	count: ((article: A) => number | null) | null
	index: number
	views: Partial<Record<'GalleryArticleView' | 'SocialArticleView', {
		listAsIcon?: boolean
		listAsDropdown?: boolean
	}>> & {
		default: {
			listAsIcon: boolean
			listAsDropdown: boolean
		}
	}
};

type StandardAction<A extends Article> = Omit<ArticleAction<A>, 'action' | 'href'>;

export const STANDARD_ACTIONS = {
	like: {
		key: 'like',
		name: 'Like',
		actionedName: 'Unlike',
		icon: faHeartReg,
		actionedIcon: faHeart,
		color: '#e0245e',
		togglable: true,
		disabled: null,
		count: null,
		index: 2,
		views: {
			default: {
				listAsIcon: true,
				listAsDropdown: false,
			},
		},
	},
	repost: {
		key: 'repost',
		name: 'Repost',
		actionedName: null,
		icon: faRetweet,
		actionedIcon: null,
		color: '#17bf63',
		togglable: false,
		disabled: null,
		count: null,
		index: 1,
		views: {
			default: {
				listAsIcon: true,
				listAsDropdown: false,
			},
		},
	},
} satisfies {[key: string]: StandardAction<Article>};

export function articleAction(actionName: string, idPair: ArticleIdPair) {
	switch (actionName) {
		case 'markAsRead':
			toggleMarkAsRead(idPair);
			break;
		default:
			if (Object.hasOwn(getServices()[idPair.service].articleActions, actionName)) {
				const action = getServices()[idPair.service].articleActions[actionName];
				if (!action.action)
					throw new Error(`Action ${action} is a link.`);

				action.action(idPair);
			}else
				console.warn(`${idPair.service} doesn't have action ${actionName}.`);
	}
}

export function getArticleAction(action: string, service: string) {
	return getServices()[service].articleActions[action];
}

export function getGenericActions(article: Article): ArticleAction[] {
	const genericActions: ArticleAction[] = [
		{
			action: (idPair: ArticleIdPair) => toggleMarkAsRead(idPair),
			actionedName: 'Mark as unread',
			actioned: (article: Article) => article.markedAsRead,
			togglable: true,
			actionedIcon: faEye,
			key: 'markAsRead',
			name: 'Mark as read',
			disabled: null,
			icon: faEyeSlash,
			color: null,
			count: null,
			index: 3,
			views: {
				default: {
					listAsIcon: true,
					listAsDropdown: false,
				},
				GalleryArticleView: {
					listAsIcon: false,
					listAsDropdown: true,
				},
			},
		},
	];
	if (article.url)
		genericActions.push({
			href: article.url,
			key: 'externalLink',
			name: 'External Link',
			icon: faUpRightFromSquare,
			color: null,
			count: null,
			index: 6,
			views: {
				default: {
					listAsIcon: true,
					listAsDropdown: false,
				},
				GalleryArticleView: {
					listAsIcon: false,
					listAsDropdown: true,
				},
			},
		});
	if (('fetchArticle' in getServices()[article.idPair.service])/* && !article.fetched*/)
		genericActions.push({
			action: (idPair: ArticleIdPair) => fetchArticle(idPair),
			actionedName: 'Re-Fetch Article',
			actioned: (article: Article) => article.fetched,
			togglable: true,
			actionedIcon: null,
			key: 'fetchArticle',
			name: 'Fetch Article',
			disabled: null,
			icon: null,
			color: null,
			count: null,
			index: 5,
			views: {
				default: {
					listAsIcon: false,
					listAsDropdown: true,
				},
			},
		});
	if (article.medias.length)
		genericActions.push({
			action: (idPair: ArticleIdPair) => {
				const article = get(getWritable(idPair));
				for (let i = 0; i < article.medias.length; ++i)
					loadingStore.forceLoading(article, i);
			},
			name: 'Load Media',
			actionedName: null,
			actioned: (article: Article) => article.medias.every(m => m.loaded),
			togglable: false,
			actionedIcon: null,
			disabled: null,
			key: 'loadMedia',
			icon: null,
			color: null,
			count: null,
			index: 4,
			views: {
				default: {
					listAsIcon: false,
					listAsDropdown: true,
				},
			},
		});

	return genericActions;
}