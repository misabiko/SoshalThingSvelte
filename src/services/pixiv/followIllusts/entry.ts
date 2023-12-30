//TODO Figure out how to load endpoints
import '~/services/pixiv/service';
import '~/services/pixiv/endpoints/user.endpoint';

import FollowIllusts from './FollowIllusts.svelte';
import {tryInject} from '~/services/extension';

tryInject(() => document.querySelector('section ul'))
	.then(element => {
		const anchor = element.parentElement?.parentElement?.parentElement;
		const target = anchor?.parentElement;
		if (!target)
			throw new Error("Couldn't find ul");

		new FollowIllusts({target, anchor});
	});