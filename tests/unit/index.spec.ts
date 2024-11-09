import { expect, test } from '@playwright/test';
import { generateId, notifications } from '~/notifications/store';

test.describe('notifications', () => {
	test('without adding notification', () => {
		for (let i = 0; i < 3; ++i)
			expect(generateId()).toEqual('Generated0');
	});

	test('adding notifications', () => {
		let ids: string[] = [];
		notifications.subscribe(value => ids = Object.keys(value));
		for (let i = 0; i < 3; ++i)
			notifications.notify({ type: 'generic', text: 'text ' + i });

		expect(generateId()).toEqual('Generated3');
		expect(ids).toEqual([
			'Generated0',
			'Generated1',
			'Generated2',
		]);
	});
});