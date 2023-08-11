import FollowIllusts from './FollowIllusts.svelte';
import {tryInject} from '../index';

tryInject(() => document.querySelector('section ul'))
	.then(element => {
		const anchor = element.parentElement?.parentElement?.parentElement;
		const target = anchor?.parentElement;
		if (!target)
			throw new Error("Couldn't find ul");

		new FollowIllusts({target, anchor});
	});