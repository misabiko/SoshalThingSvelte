import type {ArticleIdPair} from '../articles'
import {getServices, toggleHide, toggleMarkAsRead} from './service'
import type {IconDefinition} from '@fortawesome/free-solid-svg-icons'
import {faHeart as faHeartReg} from '@fortawesome/free-regular-svg-icons'
import {faEye, faEyeSlash, faHeart, faRetweet} from '@fortawesome/free-solid-svg-icons'
import type Article from '../articles'

export type ArticleAction<A extends Article = Article> = {
	action: (idPair: ArticleIdPair) => void
	name: string
	actionned: (article: A) => boolean
	disabled?: (article: A) => boolean
	toggle: {
		icon?: IconDefinition
	} | null
	icon?: IconDefinition
	color?: string
	count?: ((article: A) => number)
	index: number
};

type StandardAction = {
	key: string
	name: string
	toggle: ArticleAction['toggle']
	icon?: IconDefinition
	color?: string
	index: number
}

export const STANDARD_ACTIONS: { [key: string]: StandardAction } = {
	like: {
		key: 'like',
		name: 'Like',
		icon: faHeartReg,
		color: '#e0245e',
		toggle: { icon: faHeart },
		index: 2,
	},
	repost: {
		key: 'repost',
		name: 'Repost',
		icon: faRetweet,
		color: '#17bf63',
		toggle: null,
		index: 1,
	},
	markAsRead: {
		key: 'markAsRead',
		name: 'Mark as read',
		icon: faEyeSlash,
		toggle: { icon: faEye },
		index: 3,
	},
	hide: {
		key: 'hide',
		name: 'Hide',
		toggle: {},
		index: 4,
	},
}

export function articleAction(action: string, idPair: ArticleIdPair) {
	switch (action) {
		case STANDARD_ACTIONS.markAsRead.key:
			toggleMarkAsRead(idPair)
			break
		case STANDARD_ACTIONS.hide.key:
			toggleHide(idPair)
			break
		default:
			if (getServices()[idPair.service].articleActions.hasOwnProperty(action))
				getServices()[idPair.service].articleActions[action].action(idPair)
			else
				console.warn(`${idPair.service} doesn't have action ${action}.`)
	}
}

export function getArticleAction(action: string, service: string) {
	return getServices()[service].articleActions[action]
}