import { tryInject } from '../../index';
import UserPage from './UserPage.svelte';

tryInject(() => document.querySelector('nav[aria-label="Profile timelines"]')?.parentElement?.querySelector('section') ?? null, 2000)
	.then(anchor => {
		const target = anchor.parentElement;
		if (!target)
			throw new Error("Couldn't find target");

		new UserPage({ target, anchor });
	});