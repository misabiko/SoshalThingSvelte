import type {ArticleProps, ArticleWithRefs} from '~/articles';
import {getRootArticle} from '~/articles';
import {getService} from '~/services/service';

export type SortInfo = {
	method: SortMethod | null
	customMethod: null	//TODO customMethod: never ?
	reversed: boolean
} | {
	method: SortMethod.Custom
	customMethod: {
		service: string
		method: string
	}
	reversed: boolean
};

export enum SortMethod {
	Id,
	Date,
	Custom,
}

export const genericSortMethods = [
	SortMethod.Id,
	SortMethod.Date,
];

export function compare(info: SortInfo): (a: ArticleWithRefs | ArticleProps, b: ArticleWithRefs | ArticleProps) => number {
	return (a, b) => {
		let order;
		switch (info.method) {
			case SortMethod.Id: {
				const aRoot = getRootArticle(a);
				const bRoot = getRootArticle(b);
				order = aRoot.numberId > bRoot.numberId ? 1 : (aRoot.numberId < bRoot.numberId ? -1 : 0);
			}
				break;
			case SortMethod.Date:
				order = (getRootArticle(a).creationTime?.getTime() ?? 0) - (getRootArticle(b).creationTime?.getTime() ?? 0);
				break;
			case SortMethod.Custom: {
				if (getRootArticle(a).idPair.service !== info.customMethod?.service || getRootArticle(b).idPair.service !== info.customMethod.service)
					order = 0;
				else {
					const sortMethod = getService(info.customMethod.service).sortMethods[info.customMethod.method];
					if (!sortMethod)
						throw new Error(`Custom sort method ${info.customMethod.method} not found`);
					order = sortMethod.compare(a, b) || 0;
				}
				break;
			}case null:
				order = 0;
				break;
		}

		if (order === 0 && 'mediaIndex' in a && 'mediaIndex' in b)
			return (a.mediaIndex ?? 0) - (b.mediaIndex ?? 0);
		else
			return info.reversed ? -order : order;
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
		case SortMethod.Custom:
			return 'Custom';
	}
}