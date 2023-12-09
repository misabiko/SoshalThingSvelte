import { MediaLoadType, MediaType } from 'articles/media';
import type { ArticleMedia } from 'articles/media';
import TwitterArticle from './article';
import type { ArticleWithRefs } from 'articles';

export function parseHTMLArticle(article: HTMLElement): ArticleWithRefs | null {
	for (const span of article.getElementsByTagName('span')) {
		if (span.textContent === 'Ad')
			return null;
	}

	// const anchors = article.getElementsByTagName('a');
	const timestamp = article.getElementsByTagName('time')[0];
	const timestampAnchor = timestamp.parentElement! as HTMLAnchorElement;
	const id = BigInt(timestampAnchor.href.split('/').pop()!);

	//TODO Parse emojis
	const text = article.querySelector('div[data-testid="tweetText"]')!.textContent!;

	const nameSpans = article.querySelectorAll('a[role="link"] span');
	let nameIndex = 1;
	if (nameSpans[0].textContent?.endsWith(' reposted'))
		nameIndex = 4;
	const authorName = nameSpans[nameIndex].textContent!;
	const authorId = [...nameSpans].find(span => span.textContent?.startsWith('@'))!.textContent!.slice(1);

	const avatar = article.querySelector('div[data-testid="Tweet-User-Avatar"] img') as HTMLImageElement;
	const authorAvatarUrl = avatar.src;

	const time = new Date(timestamp.dateTime);

	const medias: ArticleMedia[] = ([...article.querySelectorAll('div[data-testid="tweetPhoto"] img')] as HTMLImageElement[])
		.map((img: HTMLImageElement) => {
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
			text,
			text,
			{
				username: authorId,
				avatarUrl: authorAvatarUrl,
				name: authorName,
				url: `https://twitter.com/${authorId}`,
				//TODO Pass null for author id
				id: 'TODO',
			},
			time,
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