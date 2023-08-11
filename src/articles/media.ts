export type ArticleMedia = ({
	src: string;
	ratio: ValidRatio | null;
	queueLoadInfo: MediaLoadType.DirectLoad | MediaLoadType.Thumbnail;
	mediaType: MediaType;
	thumbnail?: undefined;
	loaded?: undefined;
} | {
	src: string;
	ratio: ValidRatio | null;
	queueLoadInfo: MediaLoadType.LazyLoad;
	mediaType: MediaType;
	thumbnail?: {
		src: string
		offsetX?: string
		offsetY?: string
		ratio?: ValidRatio;
		cropRatio?: ValidRatio;
	};
	loaded: boolean;
}) & {
	cropRatio?: ValidRatio;
	offsetX?: string
	offsetY?: string
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

export enum MediaLoadType {
	DirectLoad,
	Thumbnail,
	LazyLoad,
}