import { mount } from 'svelte';
import { tryInject } from '..';
import HomePage from './HomePage.svelte';

tryInject(() => {
	const target = document.querySelector('div[aria-label="Home timeline"]');
	if (target?.children[4] !== undefined)
		return target;
	else
		return null;
}, 2000)
	.then(target => {
		const anchor = target.children[4];
		if (!anchor)
			throw new Error("Couldn't find anchor");

		const soshalanchor = document.createElement('div');
		soshalanchor.id = 'soshalanchor';
		target.insertBefore(soshalanchor, anchor);

		mount(HomePage, { target: soshalanchor });
	});