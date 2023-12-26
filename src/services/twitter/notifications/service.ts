import {FetchType, newService, registerService, type Service} from '../../service';
import type TwitterNotificationArticle from './article';
import {twitterFetch} from '../service';
import {writable} from 'svelte/store';

export const TwitterNotificationService: Service<TwitterNotificationArticle> = {
	...newService('TwitterNotification'),
	fetch: twitterFetch,
	isOnDomain: globalThis.window?.location?.hostname === 'twitter.com'
		|| globalThis.window?.location?.hostname === 'x.com',
	fetchInfo: {
		type: FetchType.Tab,
		tabInfo: {
			url: 'https://twitter.com',
			matchUrl: ['*://twitter.com/*'],
			tabId: writable(null),
		}
	},
}

registerService(TwitterNotificationService);