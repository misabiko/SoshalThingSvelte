export type ArticleMedia = (
	| {
		queueLoadInfo: MediaLoadType.DirectLoad | MediaLoadType.Thumbnail
		thumbnail?: never
		loaded?: never
	}
	| {
		queueLoadInfo: MediaLoadType.LazyLoad
		thumbnail: ArticleThumbnail | null
		loaded: boolean
	}
	) & {
		src: string
		mediaType: MediaType
		//Height divided by width
		ratio: ValidRatio | null
		cropRatio: ValidRatio | null
		offsetX: string | null
		offsetY: string | null
	};

export type ArticleThumbnail = {
	src: string
	offsetX: string | null
	offsetY: string | null
	ratio: ValidRatio | null
	cropRatio: ValidRatio | null
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
	Image = 'Image',
	Video = 'Video',
	VideoGif = 'VideoGif',
	Gif = 'Gif',
}

export enum MediaLoadType {
	DirectLoad = 'DirectLoad',
	Thumbnail = 'Thumbnail',
	LazyLoad = 'LazyLoad',
}

export function extensionToMediaType(extension: string): MediaType {
	switch (extension) {
		case 'mp4':
		case 'webm':
			return MediaType.Video;
		case 'gif':
			return MediaType.Gif;
		default:
			return MediaType.Image;
	}
}