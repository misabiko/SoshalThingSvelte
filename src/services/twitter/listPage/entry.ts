import { tryInject } from '~/services/extension';
import ListPage from './ListPage.svelte';

tryInject(() => {
	const target = document.querySelector('div[aria-label="Timeline: List"]');
	if (target?.firstChild)
		return target;
	else
		return null;
}, 2000)
	.then(target => {
		const anchor = target.firstChild as HTMLElement | null;
		if (!anchor)
			throw new Error("Couldn't find anchor");

		new ListPage({ target, anchor });
	});