import '~/services/pixiv/service';
import '~/services/pixiv/endpoints/user.endpoint';
import '~/services/pixiv/endpoints/ranking.endpoint';
import '~/services/pixiv/endpoints/top.endpoint';
import '~/services/pixiv/endpoints/discovery.endpoint';
import {mount} from 'svelte';

import Discovery from './Discovery.svelte';
import {tryInject} from '~/services/extension';

//Could abstract with followIllusts' entry
tryInject(() => document.querySelector('div.gtm-illust-recommend-zone ul'))
	.then(element => {
		const anchor = element.parentElement?.parentElement?.parentElement?.parentElement;
		const target = anchor?.parentElement;
		if (!target)
			throw new Error("Couldn't find ul");

		mount(Discovery, {target, anchor});
	});