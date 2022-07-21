import {writable} from 'svelte/store'

export const undoables = (() => {
	const {subscribe, update} = writable<Undoable[]>([])

	return {
		subscribe,
		addCommand(undoable: Undoable) {
			update(u => {
				u.push(undoable)
				return u
			})
		},
		undo(index: number) {
			update(u => {
				u[index].undo()
				return u
			})
		}
	}
})()

export type Undoable = {
	undo: () => void
	undid: boolean
}