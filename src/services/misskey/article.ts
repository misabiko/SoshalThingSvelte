import type {ArticleAuthor, ArticleWithRefs} from '../../articles';
import Article, {getRootArticle} from '../../articles';
import type {ArticleRefIdPair} from '../../articles';
import type {Note, User} from 'misskey-js/built/entities';
import type {ArticleMedia} from '../../articles/media';
import {getRatio, MediaLoadType, MediaType} from '../../articles/media';
import * as mfm from 'mfm-js';
import type {MfmNode} from 'mfm-js/built/node';
import {MisskeyService} from './service';

export default class MisskeyArticle extends Article {
	static service = 'Misskey';

	constructor(
		readonly id: string,
		text: string | null,
		textHtml: string,
		medias: ArticleMedia[],
		readonly creationTime: Date,
		readonly author: MisskeyUser,
		actualArticleRef: ArticleRefIdPair | undefined,
		markedAsReadStorage: string[],
		rawSource: any
	) {
		super({
			id,
			text: text ?? undefined,
			textHtml,
			medias,
			//TODO Use host
			url: `https://misskey.io/notes/${id}`,
			actualArticleRef,
			markedAsReadStorage,
			rawSource,
		});
	}

	get numberId() {
		//TODO Make id sorting per service and dissolve numberId
		return 0;
	}
}

interface MisskeyUser extends ArticleAuthor {
	id: User['id'],
	avatarUrl: User['avatarUrl'],
}

export function fromAPI(
	note: Note,
	markedAsReadStorage: string[],
	_isRef = false,
): ArticleWithRefs {
	let textHtml = note.text || '';
	try {
		textHtml = parseText(note.text);
	}catch (e) {
		console.error(`Failed to parse mfm for note 'https://misskey.io/notes/${note.id}'`, e);
	}

	let actualArticleRefIdPair: ArticleRefIdPair | undefined;

	const medias: ArticleMedia[] = note.files.map(f => {
		let mediaType: MediaType;
		switch (f.type) {
			case 'image/png':
			case 'image/jpeg':
				mediaType = MediaType.Image;
				break;
			default:
				console.warn('unrecognized type ' + f.type);
				mediaType = MediaType.Image;
				break;
		}

		return {
			src: f.url,
			ratio: (f.properties.width && f.properties.height) ? getRatio(f.properties.width, f.properties.height) : null,
			queueLoadInfo: MediaLoadType.DirectLoad,
			mediaType,
			loaded: undefined,
		};
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
			textHtml,
			medias,
			new Date(note.createdAt),
			author,
			actualArticleRefIdPair,
			markedAsReadStorage,
			note,
		);

	if (note.renote !== undefined) {
		const renoted = fromAPI(note.renote, markedAsReadStorage, true);

		if (note.text !== null) {
			actualArticleRefIdPair = {
				type: 'quote',
				quoted: getRootArticle(renoted).idPair,
			};

			if (renoted.type === 'repost' || renoted.type === 'reposts')
				throw new Error('Quoted article is a repost itself: ' + JSON.stringify(renoted));
			return {
				type: 'quote',
				article: makeArticle(),
				quoted: renoted,
			};
		}else {
			if (renoted.type === 'quote') {
				actualArticleRefIdPair = {
					type: 'quote',
					quoted: renoted.quoted.article.idPair,
				};
			}else {
				actualArticleRefIdPair = {
					type: 'repost',
					reposted: getRootArticle(renoted).idPair,
				};
			}

			if (renoted.type === 'repost' || renoted.type === 'reposts')
				throw new Error('Quoted article is a repost itself: ' + JSON.stringify(renoted));
			return {
				type: 'repost',
				article: makeArticle(),
				reposted: renoted,
			};
		}
	}

	return {
		type: 'normal',
		article: makeArticle()
	};
}

function parseText(rawText: string | null): string {
	if (rawText?.length) {
		const parsed = mfm.parse(rawText);
		return parsed.map(node => mfmToHtml(node)).join('');
	}else
		return '';
}

function mfmToHtml(node: MfmNode): string {
	switch (node.type) {
		case 'text':
			return node.props.text;
		case 'unicodeEmoji':
			return node.props.emoji;
		case 'emojiCode': {
			const emoji = MisskeyService.emojis?.find(e => e.name === node.props.name || e.aliases.includes(node.props.name));
			if (emoji !== undefined)
				return `<img class="emoji" src="${emoji.url}" alt="${node.props.name}"/>`;
			else {
				console.warn(`Unrecognized emoji :${node.props.name}:`);
				return `:${node.props.name}:`;
			}
		}
		case 'inlineCode':
			return node.props.code;
		case 'mathInline':
			return node.props.formula;
		case 'center':
			if (node.props?.length)
				console.warn('Unparsed center props:', node.props);

			return `<div style="text-align: center">${node.children.map(n => mfmToHtml(n)).join('')}</div>`;
		case 'bold':
			if (node.props?.length)
				console.warn('Unparsed center props:', node.props);

			return `<div style="font-weight: bold">${node.children.map(n => mfmToHtml(n)).join('')}</div>`;
		case 'small':
			if (node.props?.length)
				console.warn('Unparsed center props:', node.props);

			return `<small>${node.children.map(n => mfmToHtml(n)).join('')}</small>`;
		case 'italic':
			if (node.props?.length)
				console.warn('Unparsed center props:', node.props);

			return `<i>${node.children.map(n => mfmToHtml(n)).join('')}</i>`;
		case 'strike':
			if (node.props?.length)
				console.warn('Unparsed center props:', node.props);

			return `<div style="text-decoration: line-through">${node.children.map(n => mfmToHtml(n)).join('')}</div>`;
		case 'mention':
			return `<a href="https://misskey.io/${node.props.acct}">${node.props.acct}</a>`;
		case 'hashtag':
			return `<a href="https://misskey.io/tags/${node.props.hashtag}">#${node.props.hashtag}</a>`;
		case 'url':
			if (node.props.brackets !== undefined)
				console.log('url brackets:', node.props.brackets, node);
			return `<a href="${node.props.url}">${node.props.url}</a>`;
		case 'fn':
			return `$[${node.props.name}(${node.props.args.toString()}) ${node.children.map(n => mfmToHtml(n)).join('')}]`;
		case 'plain':
			if (node.props?.length)
				console.warn('Unparsed center props:', node.props);

			return node.children.map(n => mfmToHtml(n)).join('');
		default:
			throw new Error(`Unrecognized mfm node '${node.type}'`);
	}
}