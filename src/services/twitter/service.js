import { readable } from 'svelte/store';
import Article from '../article';

export const articles = [
	readable(new Article('0', "Text for article 1")),
	readable(new Article('1', "Text for article 2")),
	readable(new Article('3', "Text for article 3")),
];