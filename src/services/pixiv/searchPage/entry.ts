//TODO Add service index script with every imports
import '~/services/pixiv/service';
import '~/services/pixiv/endpoints/user.endpoint';
import '~/services/pixiv/endpoints/ranking.endpoint';
import '~/services/pixiv/endpoints/top.endpoint';
import '~/services/pixiv/endpoints/discovery.endpoint';
import '~/services/pixiv/endpoints/search.endpoint';
import { mount } from 'svelte';

import SearchPage from './SearchPage.svelte';
import {tryInject} from '~/services/extension';

tryInject(() => [...document.getElementsByTagName('section')].at(-1))
	.then(element => {
		const target = element.parentElement?.parentElement;
		if (!target)
			throw new Error("Couldn't find target");

		mount(SearchPage, {target});
	});