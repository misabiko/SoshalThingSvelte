import {writable} from 'svelte/store';
import type {ArticleIdPair} from './articles';

export const undoables = (() => {
	const {subscribe, update} = writable<Undoable[]>([]);

	return {
		subscribe,
		addCommand(undoable: Undoable) {
			update(u => {
				u.unshift(undoable);
				return u;
			});
		},
		toggleDo(index: number) {
			update(u => {
				if (u[index].undid)
					u[index].redo();
				else
					u[index].undo();

				u[index].undid = !u[index].undid;
				return u;
			});
		}
	};
})();

export type Undoable = {
	//Supposed to be called only in this file
	undo: () => void
	redo: () => void
	//TODO Remove undid, and on undo, remove undoable from stack and add togglable command on top
	undid: boolean
	text: string
	articleIdPair: ArticleIdPair
}