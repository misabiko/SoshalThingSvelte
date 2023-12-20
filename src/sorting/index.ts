import {getActualArticle} from '../articles';
import type {ArticleProps, ArticleWithRefs} from '../articles';
import {getRootArticle} from '../articles';
import {getServices} from '../services/service';

export type SortInfo = {
	method: SortMethod | null
	customMethod: null	//TODO customMethod: never ?
	reversed: boolean
} | {
	method: SortMethod.Custom
	customMethod: {
		service: string
		method: string
	},
	reversed: boolean
}

export enum SortMethod {
	Id,
	Date,
	Likes,
	Reposts,
	Custom,
}

export const genericSortMethods = [
	SortMethod.Id,
	SortMethod.Date,
	SortMethod.Likes,
	SortMethod.Reposts,
];

export function compare(info: SortInfo): (a: ArticleWithRefs | ArticleProps, b: ArticleWithRefs | ArticleProps) => number {
	return (a, b) => {
		switch (info.method) {
			case SortMethod.Id: {
				const aRoot = getRootArticle(a);
				const bRoot = getRootArticle(b);
				return aRoot.numberId > bRoot.numberId ? 1 : (aRoot.numberId < bRoot.numberId ? -1 : 0);
			}
			case SortMethod.Date:
				return (getRootArticle(a).creationTime?.getTime() || 0) - (getRootArticle(b).creationTime?.getTime() || 0);
			//TODO Replace with per-service sort method
			case SortMethod.Likes:
				return getActualArticle(a).getLikeCount() - getActualArticle(b).getLikeCount();
			case SortMethod.Reposts:
				return getActualArticle(a).getRepostCount() - getActualArticle(b).getRepostCount();
			case SortMethod.Custom: {
				if (getRootArticle(a).idPair.service !== info?.customMethod?.service || getRootArticle(b).idPair.service !== info.customMethod.service)
					return 0;
				else
					return getServices()[info.customMethod.service]?.sortMethods[info.customMethod.method]?.compare(a, b) || 0;
			}case null:
				return 0;
		}
	};
}

export function directionLabel(method: SortMethod, reversed: boolean): string {
	switch (method) {
		case SortMethod.Date:
			return reversed ? 'Reverse chronological' : 'Chronological';
		default:
			return reversed ? 'Descending' : 'Ascending';
	}
}

export function methodName(method: SortMethod): string {
	switch (method) {
		case SortMethod.Id:
			return 'Id';
		case SortMethod.Date:
			return 'Date';
		case SortMethod.Likes:
			return 'Likes';
		case SortMethod.Reposts:
			return 'Reposts';
		case SortMethod.Custom:
			return 'Custom';
	}
}