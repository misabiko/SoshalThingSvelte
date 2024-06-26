import '~/services/pixiv/service';
import '~/services/pixiv/endpoints/user.endpoint';
import '~/services/pixiv/endpoints/ranking.endpoint';
import '~/services/pixiv/endpoints/top.endpoint';
import '~/services/pixiv/endpoints/discovery.endpoint';

import UserArtworksPage from './UserArtworksPage.svelte';
import {tryInject} from '~/services/extension';
import UserBookmarksPage from './UserBookmarksPage.svelte';

const path = window.location.pathname.split('/');
if (path.length === 4 || path[4] === 'illustrations' || path[4] === 'artworks') {
	tryInject(() => {
		const thumbnail = document.querySelector('div[type="illust"]');
		return thumbnail?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement ?? null;
	})
	.then(element => {
		const anchor = element.parentElement?.parentElement;
		const target = anchor?.parentElement;
		if (!target)
			throw new Error("Couldn't find ul");

		new UserArtworksPage({target, anchor});
	});
}else if (path[4] === 'bookmarks') {
	tryInject(() => {
		const element = document.querySelector('section > div > div > ul');
		if (element?.children.length)
			return element;
		else
			return null;
	})
		.then(element => {
			const anchor = element.parentElement?.parentElement;
			const target = anchor?.parentElement;
			if (!target)
				throw new Error("Couldn't find ul");

			new UserBookmarksPage({target, anchor});
		});
}