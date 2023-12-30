import '~/services/twitter/service.ts';
import '~/services/twitter/endpoints/domainEndpoints/UserTweetsAPI.endpoint';

import { tryInject } from '~/services/extension';
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

		new HomePage({ target, anchor });
	});