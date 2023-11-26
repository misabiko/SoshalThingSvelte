import { mount } from 'svelte';
import { tryInject } from '..';
import UserPage from './UserPage.svelte';

tryInject(() => document.querySelector('nav[aria-label="Profile timelines"]')?.parentElement?.querySelector('section') ?? null, 2000)
	.then(anchor => {
		const target = anchor.parentElement;
		if (!target)
			throw new Error("Couldn't find target");

		const soshalanchor = document.createElement('div');
		soshalanchor.id = 'soshalanchor';
		target.insertBefore(soshalanchor, anchor);

		mount(UserPage, { target: soshalanchor });
	});