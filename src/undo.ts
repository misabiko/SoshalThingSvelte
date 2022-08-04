import {writable} from 'svelte/store'
import type {ArticleIdPair} from './articles'

export const undoables = (() => {
	const {subscribe, update} = writable<Undoable[]>([])

	return {
		subscribe,
		addCommand(undoable: Undoable) {
			update(u => {
				u.unshift(undoable)
				return u
			})
		},
		toggleDo(index: number) {
			update(u => {
				if (u[index].undid)
					u[index].redo()
				else
					u[index].undo()

				u[index].undid = !u[index].undid
				return u
			})
		}
	}
})()

export type Undoable = {
	//TODO Find a way to make todo/redo private
	undo: () => void
	redo: () => void
	undid: boolean
	text: string
	articleIdPair: ArticleIdPair
}