import { mount } from 'svelte';
import { tryInject } from '..';
import ListPage from './ListPage.svelte';

tryInject(() => {
	const target = document.querySelector('div[aria-label="Timeline: List"]');
	if (target?.firstChild !== undefined)
		return target;
	else
		return null;
}, 2000)
	.then(target => {
		const anchor = target.firstChild;
		if (!anchor)
			throw new Error("Couldn't find anchor");

		const soshalanchor = document.createElement('div');
		soshalanchor.id = 'soshalanchor';
		target.insertBefore(soshalanchor, anchor);

		mount(ListPage, { target: soshalanchor });
	});