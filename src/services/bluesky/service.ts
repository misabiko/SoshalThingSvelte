import type BlueskyArticle from '~/services/bluesky/article';
import {getWritable, newService, registerService, type Service} from '~/services/service';
import {type AtpSessionData, type AtpSessionEvent, BskyAgent} from '@atproto/api';
import {STANDARD_ACTIONS} from '~/services/actions';
import {get} from 'svelte/store';

export const BlueskyService: BlueskyServiceType = {
	...newService({
		name: 'Bluesky',
		articleActions: {
			[STANDARD_ACTIONS.like.key]: {
				...STANDARD_ACTIONS.like,
				action: async articleIdPair => {
					const writable = getWritable<BlueskyArticle>(articleIdPair);
					const {uri, likeURI} = get(writable);
					if (likeURI) {
						await BlueskyService.agent.deleteLike(likeURI);
						writable.update(article => {
							article.likeURI = null;
							return article;
						});
					}else {
						const response = await BlueskyService.agent.like(uri, articleIdPair.id as string);
						writable.update(article => {
							article.likeURI = response.uri;
							return article;
						});
					}
				},
				actioned(article) { return article.liked ?? false; },
				disabled: null,
				count(article) { return article.likeCount; },
			},
			[STANDARD_ACTIONS.repost.key]: {
				...STANDARD_ACTIONS.repost,
				togglable: true,
				action: async articleIdPair => {
					const writable = getWritable<BlueskyArticle>(articleIdPair);
					const {uri, repostURI} = get(writable);
					if (repostURI) {
						await BlueskyService.agent.deleteRepost(repostURI);
						writable.update(article => {
							article.repostURI = null;
							return article;
						});
					}else {
						const response = await BlueskyService.agent.repost(uri, articleIdPair.id as string);
						writable.update(article => {
							article.repostURI = response.uri;
							return article;
						});
					}
				},
				actioned(article) { return article.reposted ?? false; },
				disabled: null,
				count(article) { return article.repostCount; },
			},
		}
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