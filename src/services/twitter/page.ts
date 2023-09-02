import { MediaLoadType, MediaType } from 'articles/media';
import TwitterArticle from './article';
import type { ArticleWithRefs } from 'articles';

export function parseHTMLArticle(article: HTMLElement): ArticleWithRefs | null {
	for (const span of article.getElementsByTagName('span')) {
		if (span.textContent === 'Ad')
			return null;
	}

	const anchors = article.getElementsByTagName('a');
	const timestampAnchor = article.getElementsByTagName('time')[0].parentElement! as HTMLAnchorElement;
	const id = BigInt(timestampAnchor.href.split('/').pop()!);
	const authorId = anchors[0].href.slice(1);
	const avatar = article.querySelector('div[data-testid="Tweet-User-Avatar"] img') as HTMLImageElement;
	const authorAvatarUrl = avatar.src;
	const medias = [...article.querySelectorAll('div[data-testid="tweetPhoto"] img')].map((img: HTMLImageElement) => {
		return {
			src: img.src,
			ratio: null,
			queueLoadInfo: MediaLoadType.DirectLoad,
			mediaType: MediaType.Image,
		};
	});
	return {
		type: 'normal',
		article: new TwitterArticle(
			id,
			'TODO',
			'TODO',
			{
				username: authorId,
				avatarUrl: authorAvatarUrl,
				name: 'TODO',
				url: `https://twitter.com/${authorId}`,
				id: 'TODO',
			},
			new Date(),
			[],
			[],
			undefined,
			medias,
			false,
			0,
			false,
			0,
			article,
		),
	};
}