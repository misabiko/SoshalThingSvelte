export type ArticleMedia = (
| {
	src: string;
	ratio: ValidRatio | null;
	queueLoadInfo: MediaLoadType.DirectLoad | MediaLoadType.Thumbnail;
	mediaType: MediaType;
	thumbnail?: never;
	loaded?: never;
} | {
	src: string;
	ratio: ValidRatio | null;
	queueLoadInfo: MediaLoadType.LazyLoad;
	mediaType: MediaType;
	thumbnail: ArticleThumbnail | null;
	loaded: boolean;
}
) & {
	cropRatio: ValidRatio | null;
	offsetX: string | null
	offsetY: string | null
};

export type ArticleThumbnail = {
	src: string
	offsetX: string | null;
	offsetY: string | null;
	ratio: ValidRatio | null;
	cropRatio: ValidRatio | null;
};

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

export enum MediaLoadType {
	DirectLoad = 'DirectLoad',
	Thumbnail = 'Thumbnail',
	LazyLoad = 'LazyLoad',
}