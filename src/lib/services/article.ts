//TODO interface?
export default abstract class Article {
	readonly id: string | number;
	readonly text?: string;
	readonly author?: ArticleAuthor;
	readonly creationTime?: Date;
	readonly medias: ArticleMedia[];
	markedAsRead: boolean;
	hidden: boolean;

	protected constructor(params: {
		id: string | number,
		text?: string,
		medias: ArticleMedia[],
		markedAsRead: boolean,
		hidden: boolean,
	}) {
		this.id = params.id;
		this.text = params.text;
		this.medias = params.medias || [];
		this.markedAsRead = params.markedAsRead;
		this.hidden = params.hidden;
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
	//queueLoadInfo
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