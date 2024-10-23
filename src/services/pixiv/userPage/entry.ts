import '~/services/pixiv/service';
import '~/services/pixiv/endpoints/user.endpoint';
import '~/services/pixiv/endpoints/ranking.endpoint';
import '~/services/pixiv/endpoints/top.endpoint';
import '~/services/pixiv/endpoints/discovery.endpoint';
import { mount } from 'svelte';

import UserArtworksPage from './UserArtworksPage.svelte';
import {tryInject} from '~/services/extension';
import UserBookmarksPage from './UserBookmarksPage.svelte';

const path = window.location.pathname.split('/');
if (path.length === 4 || path[4] === 'illustrations' || path[4] === 'artworks') {
	tryInject(() => {
		const sectionSibling = document.querySelector('section + div');
		const img = sectionSibling?.getElementsByTagName('img')[0];
		//Before the image loads, there's a placeholder figure element
		const figure = sectionSibling?.getElementsByTagName('figure')[0];
		return (img ?? figure)?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement ?? null;
	})
	.then(ul => {
		const target = ul.parentElement/* as HTMLUListElement | null*/;
		if (!target)
			throw new Error("Couldn't find ul's parent");

		mount(UserArtworksPage, {target, anchor: ul});
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

			mount(UserBookmarksPage, {target, anchor});
		});
}