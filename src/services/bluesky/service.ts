import type BlueskyArticle from '~/services/bluesky/article';
import {getWritable, newService, registerService, type Service} from '~/services/service';
import {BskyAgent} from '@atproto/api';
import {STANDARD_ACTIONS} from '~/services/actions';
import {get} from 'svelte/store';
import {type ArticleWithRefs, articleWithRefToArray, getActualArticle, getRootArticle} from '~/articles';
import type {Filter} from '~/filters';

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
						if (!uri)
							throw new Error('Cannot like article without URI');

						const response = await BlueskyService.agent.like(uri, articleIdPair.id as string);
						writable.update(article => {
							article.likeURI = response.uri;
							return article;
						});
					}
				},
				actioned(article) {return article.liked ?? false;},
				disabled: null,
				count(article) {return article.likeCount;},
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
						if (!uri)
							throw new Error('Cannot repost article without URI');

						const response = await BlueskyService.agent.repost(uri, articleIdPair.id as string);
						writable.update(article => {
							article.repostURI = response.uri;
							return article;
						});
					}
				},
				actioned(article) {return article.reposted ?? false;},
				disabled: null,
				count(article) {return article.repostCount;},
			},
		},
		keepArticle(articleWithRefs: ArticleWithRefs, index: number, filter: Filter): boolean {
			//TODO Label filter
			switch (filter.type) {
				case 'liked':
					return (articleWithRefToArray(articleWithRefs) as BlueskyArticle[])
						.some(a => a.liked);
				case 'reposted':
					return (articleWithRefToArray(articleWithRefs) as BlueskyArticle[])
						.some(a => a.reposted);
				//TODO Add filter templates
				case 'likes': {
					const likeCount = (getRootArticle(articleWithRefs) as BlueskyArticle).likeCount;
					if (likeCount === null)
						return false;
					switch (filter.props.compare.comparator) {
						case '=':
							return likeCount === filter.props.compare.value;
						case '>':
							return likeCount > filter.props.compare.value;
						case '>=':
							return likeCount >= filter.props.compare.value;
						case '<':
							return likeCount < filter.props.compare.value;
						case '<=':
							return likeCount <= filter.props.compare.value;
						default:
							throw new Error('Unknown comparator: ' + filter.props.compare.comparator);
					}
				}case 'reposts': {
					const repostCount = (getRootArticle(articleWithRefs) as BlueskyArticle).repostCount;
					if (repostCount === null)
						return false;
					switch (filter.props.compare.comparator) {
						case '=':
							return repostCount === filter.props.compare.value;
						case '>':
							return repostCount > filter.props.compare.value;
						case '>=':
							return repostCount >= filter.props.compare.value;
						case '<':
							return repostCount < filter.props.compare.value;
						case '<=':
							return repostCount <= filter.props.compare.value;
						default:
							throw new Error('Unknown comparator: ' + filter.props.compare.comparator);
					}
				}default:
					throw new Error('Unknown filter type: ' + filter.type);
			}
		},
		sortMethods: {
			//TODO Add sort method templates
			likes: {
				name: 'Likes',
				compare(a, b) {
					return ((getActualArticle(a) as BlueskyArticle).likeCount || 0) - ((getActualArticle(b) as BlueskyArticle).likeCount || 0);
				},
				directionLabel(reversed: boolean): string {
					return reversed ? 'Descending' : 'Ascending';
				},
			},
			reposts: {
				name: 'Reposts',
				compare(a, b) {
					return ((getActualArticle(a) as BlueskyArticle).repostCount || 0) - ((getActualArticle(b) as BlueskyArticle).repostCount || 0);
				},
				directionLabel(reversed: boolean): string {
					return reversed ? 'Descending' : 'Ascending';
				},
			},
		},
		filterTypes: {
			liked: {
				type: 'liked',
				name: 'Liked',
				invertedName: 'Not liked',
				props: {},
			},
			reposted: {
				type: 'reposted',
				name: 'Reposted',
				invertedName: 'Not reposted',
				props: {},
			},
			likes: {
				type: 'likes',
				name: 'Likes',
				invertedName: 'Likes',
				props: {
					compare: {
						type: 'order',
						optional: false,
						min: 0,
					},
				},
			},
			reposts: {
				type: 'reposts',
				name: 'Reposts',
				invertedName: 'Reposts',
				props: {
					compare: {
						type: 'order',
						optional: false,
						min: 0,
					},
				},
			},
		},
	}),
	agent: new BskyAgent({
		service: 'https://bsky.social',
		// persistSession(evt: AtpSessionEvent, sess?: AtpSessionData) {
		// 	//TODO Look into persistSession
		// 	console.log('Persisting session', evt, sess);
		// }
	}),
};

registerService(BlueskyService);

interface BlueskyServiceType extends Service<BlueskyArticle> {
	agent: BskyAgent
}