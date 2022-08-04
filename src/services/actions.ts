import type {ArticleIdPair} from '../articles'
import {getServices, toggleHide, toggleMarkAsRead} from './service'

export type ArticleAction = {
	action: (idPair: ArticleIdPair) => void;
	togglable: boolean;
};
export const STANDARD_ACTIONS = {
	like: 'like',
	repost: 'repost',
	markAsRead: 'markAsRead',
	hide: 'hide',
}

export function articleAction(action: string, idPair: ArticleIdPair) {
	switch (action) {
		case STANDARD_ACTIONS.markAsRead:
			toggleMarkAsRead(idPair)
			break
		case STANDARD_ACTIONS.hide:
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
	const actions = getServices()[service].articleActions
	if (actions.hasOwnProperty(action))
		return actions[action]
}