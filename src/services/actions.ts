import type {ArticleIdPair} from '../articles';
import {getServices, toggleMarkAsRead} from './service';
import type {IconDefinition} from '@fortawesome/free-solid-svg-icons';
import {faHeart as faHeartReg} from '@fortawesome/free-regular-svg-icons';
import {faEye, faEyeSlash, faHeart, faRetweet} from '@fortawesome/free-solid-svg-icons';
import type Article from '../articles';

export type ArticleAction<A extends Article = Article> = {
	action: (idPair: ArticleIdPair) => void
	key: string
	name: string
	actioned: (article: A) => boolean
	disabled?: (article: A) => boolean
	togglable: boolean
	icon?: IconDefinition
	actionedIcon?: IconDefinition
	color?: string
	count?: ((article: A) => number)
	index: number
};

type StandardAction = {
	key: string
	name: string
	togglable: ArticleAction['togglable']
	icon?: IconDefinition
	actionedIcon?: IconDefinition
	color?: string
	index: number
}

export const STANDARD_ACTIONS: { [key: string]: StandardAction } = {
	like: {
		key: 'like',
		name: 'Like',
		icon: faHeartReg,
		color: '#e0245e',
		togglable: true,
		actionedIcon: faHeart,
		index: 2,
	},
	repost: {
		key: 'repost',
		name: 'Repost',
		icon: faRetweet,
		color: '#17bf63',
		togglable: false,
		index: 1,
	},
	markAsRead: {
		key: 'markAsRead',
		name: 'Mark as read',
		icon: faEyeSlash,
		actionedIcon: faEye,
		togglable: true,
		index: 3,
	},
};

export function articleAction(action: string, idPair: ArticleIdPair) {
	switch (action) {
		case STANDARD_ACTIONS.markAsRead.key:
			toggleMarkAsRead(idPair);
			break;
		default:
			if (Object.hasOwn(getServices()[idPair.service].articleActions, action))
				getServices()[idPair.service].articleActions[action].action(idPair);
			else
				console.warn(`${idPair.service} doesn't have action ${action}.`);
	}
}

export function getArticleAction(action: string, service: string) {
	return getServices()[service].articleActions[action];
}