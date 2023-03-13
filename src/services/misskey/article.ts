import type {ArticleAuthor, ArticleWithRefs} from "../../articles";
import Article, {ArticleRefIdPair, getRootArticle} from "../../articles";
import type {Note, User} from "misskey-js/built/entities";
import type {ArticleMedia} from "../../articles/media";
import {getRatio, MediaLoadType, MediaType} from "../../articles/media";

export default class MisskeyArticle extends Article {
	static service: string;

	constructor(
		readonly id: string,
		text: string | null,
		medias: ArticleMedia[],
		readonly creationTime: Date,
		readonly author: MisskeyUser,
		actualArticleRef: ArticleRefIdPair | undefined,
		markedAsReadStorage: string[],
		hiddenStorage: string[],
		rawSource: any
	) {
		super({
			id,
			text: text ?? undefined,
			medias,
			//TODO Use host
			url: `https://misskey.io/notes/${id}`,
			actualArticleRef,
			markedAsReadStorage,
			hiddenStorage,
			rawSource,
		})
	}

	get numberId() {
		//TODO Make id sorting per service and dissolve numberId
		return 0
	}
}

interface MisskeyUser extends ArticleAuthor {
	id: User["id"],
	avatarUrl: User["avatarUrl"],
}

export function fromAPI(
	note: Note,
	markedAsReadStorage: string[],
	hiddenStorage: string[],
	isRef = false,
): ArticleWithRefs {
	let actualArticleRefIdPair: ArticleRefIdPair | undefined;

	const medias = note.files.map(f => {
		let mediaType: MediaType;
		switch (f.type) {
			case 'image/png':
			case 'image/jpeg':
				mediaType = MediaType.Image;
				break;
			default:
				console.warn('unrecognized type ' + f.type)
				mediaType = MediaType.Image;
				break;
		}

		return {
			src: f.url,
			ratio: (f.properties.width && f.properties.height) ? getRatio(f.properties.width, f.properties.height) : null,
			queueLoadInfo: MediaLoadType.DirectLoad,
			mediaType,
			loaded: undefined,
		}
	});

	const author = {
		id: note.user.id,
		name: note.user.name,
		username: note.user.username,
		avatarUrl: note.user.avatarUrl,
		//TODO Use host
		url: `https://misskey.io/@${note.user.username}`
	};

	const makeArticle = () => new MisskeyArticle(
			note.id,
			note.text,
			medias,
			new Date(note.createdAt),
			author,
			actualArticleRefIdPair,
			markedAsReadStorage,
			hiddenStorage,
			note,
		);

	if (note.renote !== undefined) {
		const renoted = fromAPI(note.renote, markedAsReadStorage, hiddenStorage, true)

		if (note.text !== null) {
			actualArticleRefIdPair = {
				type: 'quote',
				quoted: getRootArticle(renoted).idPair,
			}

			return {
				type: 'quote',
				article: makeArticle(),
				quoted: renoted as ArticleWithRefs & {type: 'normal' | 'quote'},
			}
		}else {
			if (renoted.type === 'quote') {
				actualArticleRefIdPair = {
					type: 'quote',
					quoted: renoted.quoted.article.idPair,
				}
			}else {
				actualArticleRefIdPair = {
					type: 'repost',
					reposted: getRootArticle(renoted).idPair,
				}
			}

			return {
				type: 'repost',
				article: makeArticle(),
				reposted: renoted as ArticleWithRefs & {type: 'normal' | 'quote'}
			}
		}
	}

	return {
		type: 'normal',
		article: makeArticle()
	}
}