import type {ArticleIdPair} from '~/articles';
import {getServices, toggleMarkAsRead} from './service';
import {
	faUpRightFromSquare,
	type IconDefinition
} from '@fortawesome/free-solid-svg-icons';
import {faHeart as faHeartReg} from '@fortawesome/free-regular-svg-icons';
import {faEye, faEyeSlash, faHeart, faRetweet} from '@fortawesome/free-solid-svg-icons';
import type Article from '../articles';

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
	count: ((article: A) => number) | null
	index: number
	listAsIcon: boolean
	listAsDropdown: boolean
};

type StandardAction<A extends Article> = Omit<ArticleAction<A>, 'action' | 'href'>;

export const STANDARD_ACTIONS = {
	like: {
		key: 'like',
		name: 'Like',
		actionedName: 'Unlike',
		listAsDropdown: false,
		icon: faHeartReg,
		actionedIcon: faHeart,
		listAsIcon: true,
		color: '#e0245e',
		togglable: true,
		disabled: null,
		count: null,
		index: 2,
	},
	repost: {
		key: 'repost',
		name: 'Repost',
		actionedName: null,
		listAsDropdown: false,
		icon: faRetweet,
		actionedIcon: null,
		listAsIcon: true,
		color: '#17bf63',
		togglable: false,
		disabled: null,
		count: null,
		index: 1,
	},
} satisfies { [key: string]: StandardAction<Article> };

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

export function getUniversalActions(article: Article): ArticleAction[] {
	const universalActions: ArticleAction[] = [
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
			listAsIcon: true,
			listAsDropdown: false,
		},
	];
	if (article.url)
		universalActions.push({
			href: article.url,
			key: 'externalLink',
			name: 'External Link',
			icon: faUpRightFromSquare,
			color: null,
			count: null,
			index: 6,
			listAsIcon: true,
			listAsDropdown: false,
		});

	return universalActions;
}