import type {ArticleWithRefs} from '../services/article'

export type TimelineArticleProps = {
	animatedAsGifs: boolean;
	compact: boolean;
	hideText: boolean;
	shouldLoadMedia: boolean;
}

export type ArticleProps = Readonly<ArticleWithRefs & {
	filteredOut: boolean;
}>

const MONTH_ABBREVS: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function shortTimestamp(date: Date) {
	const timeSince = Date.now() - date.getTime()

	if (timeSince < 1000)
		return 'just now'
	else if (timeSince < 60_000)
		return `${Math.floor(timeSince / 1000)}s`
	else if (timeSince < 3_600_000)
		return `${Math.floor(timeSince / 60_000)}m`
	else if (timeSince < 86_400_000)
		return `${Math.floor(timeSince / 3_600_000)}h`
	else if (timeSince < 604_800_000)
		return `${Math.floor(timeSince / 86_400_000)}d`
	else
		return `${MONTH_ABBREVS[date.getMonth()]} ${date.getDate()} ${date.getFullYear()}`
}