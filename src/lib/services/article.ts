//TODO interface?
export default abstract class Article {
	static readonly service: string;

	readonly id: string | number;
	readonly text?: string;
	readonly textHtml?: string;
	readonly author?: ArticleAuthor;
	readonly creationTime?: Date;
	readonly url: string;
	readonly medias: ArticleMedia[];
	markedAsRead: boolean;
	hidden: boolean;

	protected constructor(params: {
		id: string | number,
		text?: string,
		textHtml?: string,
		url: string,
		medias: ArticleMedia[],
		markedAsRead: boolean,
		hidden: boolean,
		markedAsReadStorage: (string | number)[],	//Actually (string[] | number[])
	}) {
		this.id = params.id;
		this.text = params.text;
		this.textHtml = params.textHtml;
		this.url = params.url;
		this.medias = params.medias || [];
		this.markedAsRead = params.markedAsRead || params.markedAsReadStorage.includes(this.id);
		this.hidden = params.hidden;
	}

	//TODO Unit test this
	get idPair() {
		return {
			// @ts-ignore
			service: this.constructor.service,
			id: this.id,
		}
	}
}

export interface ArticleAuthor {
	username: string;
	name: string;
	url: string;	//TODO delegate to service
	avatarUrl?: string;
}

export interface ArticleMedia {
	src: string;
	ratio: ValidRatio;
	queueLoadInfo: MediaQueueInfo;
	mediaType: MediaType;
}

type ValidRatio = number;
export function getRatio(width: number, height: number): ValidRatio {
	if (isNaN(width))
		throw 'Width is NaN';
	if (isNaN(height))
		throw 'Height is NaN';
	if (width <= 0)
		throw "Width isn't positive";
	if (height <= 0)
		throw "Height isn't positive";

	return height / width;
}

export enum MediaType {
	Image,
	Video,
	VideoGif,
	Gif,
}

export enum MediaQueueInfo {
	DirectLoad,
	Thumbnail,
	//LazyLoad,
}