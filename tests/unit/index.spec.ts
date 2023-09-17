import {expect, test} from '@playwright/test';
import {parseText} from '../../src/services/twitter/apiV1';
import {generateId, notifications} from '../../src/notifications/store';

console.log('blaaaah');

test('twitter V1 parseText', () => {
	//1549147268195966979
	const raw: any = {
		'created_at': 'Mon Jul 18 21:41:05 +0000 2022',
		'id': 1549147268195967000,
		'id_str': '1549147268195966979',
		'text': 'where can i find a sound pack of old gamey beeps n boops? 👀🎶🤖\n\n#gamedev #sounds',
		'truncated': false,
		'entities': {
			'hashtags': [
				{
					'text': 'gamedev',
					'indices': [
						63,
						71
					]
				},
				{
					'text': 'sounds',
					'indices': [
						72,
						79
					]
				}
			],
			'symbols': [],
			'user_mentions': [],
			'urls': []
		},
		'source': '<a href="https://mobile.twitter.com" rel="nofollow">Twitter Web App</a>',
		'in_reply_to_status_id': null,
		'in_reply_to_status_id_str': null,
		'in_reply_to_user_id': null,
		'in_reply_to_user_id_str': null,
		'in_reply_to_screen_name': null,
		'user': {
			'id': 3068978453,
			'id_str': '3068978453',
			'name': 'BNDT',
			'screen_name': 'LootBndt',
			'location': 'United Kingdom',
			'description': '8x8 inspiration! \n.\n.\nhttps://t.co/CNMpLoypyR .',
			'url': null,
			'entities': {
				'description': {
					'urls': [
						{
							'url': 'https://t.co/CNMpLoypyR',
							'expanded_url': 'http://lootbndt.wixsite.com/gifgalore',
							'display_url': 'lootbndt.wixsite.com/gifgalore',
							'indices': [
								22,
								45
							]
						}
					]
				}
			},
			'protected': false,
			'followers_count': 7043,
			'friends_count': 2211,
			'listed_count': 201,
			'created_at': 'Wed Mar 04 00:59:55 +0000 2015',
			'favourites_count': 32007,
			'utc_offset': null,
			'time_zone': null,
			'geo_enabled': false,
			'verified': false,
			'statuses_count': 19522,
			'lang': null,
			'contributors_enabled': false,
			'is_translator': false,
			'is_translation_enabled': false,
			'profile_background_color': '000000',
			'profile_background_image_url': 'http://abs.twimg.com/images/themes/theme1/bg.png',
			'profile_background_image_url_https': 'https://abs.twimg.com/images/themes/theme1/bg.png',
			'profile_background_tile': false,
			'profile_image_url': 'http://pbs.twimg.com/profile_images/1355649791989080066/I1hUPIc1_normal.jpg',
			'profile_image_url_https': 'https://pbs.twimg.com/profile_images/1355649791989080066/I1hUPIc1_normal.jpg',
			'profile_banner_url': 'https://pbs.twimg.com/profile_banners/3068978453/1637329590',
			'profile_link_color': '19CF86',
			'profile_sidebar_border_color': '000000',
			'profile_sidebar_fill_color': '000000',
			'profile_text_color': '000000',
			'profile_use_background_image': false,
			'has_extended_profile': false,
			'default_profile': false,
			'default_profile_image': false,
			'following': true,
			'follow_request_sent': false,
			'notifications': false,
			'translator_type': 'none',
			'withheld_in_countries': []
		},
		'geo': null,
		'coordinates': null,
		'place': null,
		'contributors': null,
		'is_quote_status': false,
		'retweet_count': 1,
		'favorite_count': 0,
		'favorited': false,
		'retweeted': false,
		'lang': 'en'
	};

	const {text, textHtml} = parseText(raw.text, raw.entities, raw.extended_entities);
	expect(text).toStrictEqual(`where can i find a sound pack of old gamey beeps n boops? 👀🎶🤖

#gamedev #sounds`);
	expect(textHtml).toStrictEqual(`where can i find a sound pack of old gamey beeps n boops? 👀🎶🤖

<a href='https://twitter.com/hashtag/gamedev'>#gamedev</a> <a href='https://twitter.com/hashtag/sounds'>#sounds</a>`);
});

test.describe('notifications', () => {
	test('without adding notification', () => {
		for (let i = 0; i < 3; ++i)
			expect(generateId()).toEqual('Generated0');
	});

	test('adding notifications', () => {
		let ids: string[] = [];
		notifications.subscribe(value => ids = Object.keys(value));
		for (let i = 0; i < 3; ++i)
			notifications.notify({type: 'generic', text: 'text ' + i});

		expect(generateId()).toEqual('Generated3');
		expect(ids).toEqual([
			'Generated0',
			'Generated1',
			'Generated2'
		]);
	});
});