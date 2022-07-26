import {getActualArticle} from '../services/article'
import type {ArticleProps} from '../articles'

export type SortInfo = {
	method?: SortMethod,
	reversed: boolean
}

export enum SortMethod {
	Id,
	Date,
	Likes,
	Reposts,
}

export const allSortMethods = [
	SortMethod.Id,
	SortMethod.Date,
	SortMethod.Likes,
	SortMethod.Reposts,
]

export function compare(method: SortMethod): (a: ArticleProps, b: ArticleProps) => number {
	return (a, b) => {
		switch (method) {
			case SortMethod.Id:
				return a.article.numberId > b.article.numberId ? 1 : (a.article.numberId < b.article.numberId ? -1 : 0);
			case SortMethod.Date:
				return (a.article.creationTime?.getTime() || 0) - (b.article.creationTime?.getTime() || 0);
			case SortMethod.Likes:
				return getActualArticle(a).getLikeCount() - getActualArticle(b).getLikeCount();
			case SortMethod.Reposts:
				return getActualArticle(a).getRepostCount() - getActualArticle(b).getRepostCount();
		}
	}
}

export function directionLabel(method: SortMethod, reversed: boolean): string {
	switch (method) {
		case SortMethod.Date:
			return reversed ? 'Reverse chronological' : 'Chronological'
		default:
			return reversed ? 'Descending' : 'Ascending'
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
	}
}