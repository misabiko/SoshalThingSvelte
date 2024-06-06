import type BlueskyArticle from '~/services/bluesky/article';
import {newService, registerService, type Service} from '~/services/service';
import {type AtpSessionData, type AtpSessionEvent, BskyAgent} from '@atproto/api';

export const BlueskyService: BlueskyServiceType = {
	...newService({
		name: 'Bluesky',
	}),
	agent: new BskyAgent({
		//TODO Look into persistSession
		service: 'https://bsky.social',
		persistSession(evt: AtpSessionEvent, sess?: AtpSessionData) {
			console.log('Persisting session', evt, sess);
		}
	}),
};

registerService(BlueskyService);

interface BlueskyServiceType extends Service<BlueskyArticle> {
	agent: BskyAgent
}