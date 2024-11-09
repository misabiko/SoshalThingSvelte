import {writable} from 'svelte/store';

//TODO +1 Add notification on console errors

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
	};

const {subscribe, update} = writable<{[id: string]: Notification}>({});
let ids: string[];
subscribe(value => ids = Object.keys(value));

export const notifications = {
	subscribe,
	notify(notif: Notification, id?: string) {
		const actualId = id ?? generateId();

		update(prev => {
			prev[actualId] = notif;
			return prev;
		});
	},
	delete(id: string) {
		update(prev => {
			delete prev[id];
			return prev;
		});
	},
};

export function generateId(): string {
	let id = 'Generated0';
	for (let i = 1; ids.includes(id); ++i)
		id = 'Generated' + i;

	return id;
}