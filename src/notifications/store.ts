import {writable} from 'svelte/store'

export type Notification =
	{
		type: 'generic'
		text: string
	} |
	{
		type: 'login'
		text: string
	} |
	{
		type: 'error'
		text: string
	}

const {subscribe, set, update} = writable<{[id: string]: Notification}>({})
let ids: string[]
const localUnsubscribe = subscribe(value => ids = Object.keys(value))

export const notifications = {
	subscribe,
	notify(notif: Notification, id?: string) {
		const actualId = id ?? generateId()

		update(prev => {
			prev[actualId] = notif
			return prev
		})
	},
	delete(id: string) {
		update(prev => {
			delete prev[id]
			return prev
		})
	}
}

//TODO Unit test that this generates "Generated0", "Generated1", etc
//Even if "Generated1 is added manually
function generateId(): string {
	let i = 0
	let id = 'Generated0'
	for (let i = 1; ids.includes(id); ++i)
		id = 'Generated' + i

	return id
}