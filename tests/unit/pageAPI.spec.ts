import {test} from '@playwright/test';
import {articleFromResult, type Result} from '../../src/services/twitter/pageAPI';

test('result.tweet', () => {
	const tweet = {
		"__typename": "Tweet",
		"rest_id": "1737739942057615723",
		"core": {
			"user_results": {
				"result": {
					"__typename": "User",
					"id": "VXNlcjoyNjA5MTE2NDI4",
					"rest_id": "2609116428",
					"affiliates_highlighted_label": {},
					"has_graduated_access": true,
					"is_blue_verified": false,
					"profile_image_shape": "Circle",
					"legacy": {
						"following": true,
						"can_dm": false,
						"can_media_tag": true,
						"created_at": "Mon Jul 07 07:34:29 +0000 2014",
						"default_profile": true,
						"default_profile_image": false,
						"description": "らくがきしたりしなかったりする",
						"entities": {
							"description": {
								"urls": []
							},
							"url": {
								"urls": [
									{
										"display_url": "skeb.jp/@0N1NAMAK0",
										"expanded_url": "https://skeb.jp/@0N1NAMAK0",
										"url": "https://t.co/YbzbkHAQvV",
										"indices": [
											0,
											23
										]
									}
								]
							}
						},
						"fast_followers_count": 0,
						"favourites_count": 69752,
						"followers_count": 14914,
						"friends_count": 404,
						"has_custom_timelines": true,
						"is_translator": false,
						"listed_count": 218,
						"location": "たわらもの",
						"media_count": 879,
						"name": "おになまこ",
						"normal_followers_count": 14914,
						"pinned_tweet_ids_str": [
							"1724781714785108404"
						],
						"possibly_sensitive": false,
						"profile_banner_url": "https://pbs.twimg.com/profile_banners/2609116428/1445324847",
						"profile_image_url_https": "https://pbs.twimg.com/profile_images/950403626517676032/saQzOyd8_normal.jpg",
						"profile_interstitial_type": "",
						"screen_name": "0N1NAMAK0",
						"statuses_count": 57967,
						"translator_type": "none",
						"url": "https://t.co/YbzbkHAQvV",
						"verified": false,
						"want_retweets": true,
						"withheld_in_countries": []
					}
				}
			}
		},
		"unmention_data": {},
		"edit_control": {
			"edit_tweet_ids": [
				"1737739942057615723"
			],
			"editable_until_msecs": "1703148062490",
			"is_edit_eligible": false,
			"edits_remaining": "5"
		},
		"is_translatable": true,
		"views": {
			"count": "1",
			"state": "EnabledWithCount"
		},
		"source": "<a href=\"http://twitter.com/download/iphone\" rel=\"nofollow\">Twitter for iPhone</a>",
		"legacy": {
			"bookmark_count": 0,
			"bookmarked": false,
			"created_at": "Thu Dec 21 07:41:02 +0000 2023",
			"conversation_id_str": "1737739942057615723",
			"display_text_range": [
				0,
				124
			],
			"entities": {
				"media": [
					{
						"display_url": "pic.twitter.com/UCq7IcIMrO",
						"expanded_url": "https://twitter.com/271_omame/status/1737465280610382193/photo/1",
						"id_str": "1737465275593949184",
						"indices": [
							101,
							124
						],
						"media_key": "3_1737465275593949184",
						"media_url_https": "https://pbs.twimg.com/media/GBy3dnFagAArLlC.jpg",
						"source_status_id_str": "1737465280610382193",
						"source_user_id_str": "1512232083586162688",
						"type": "photo",
						"url": "https://t.co/UCq7IcIMrO",
						"ext_media_availability": {
							"status": "Available"
						},
						"features": {
							"large": {
								"faces": []
							},
							"medium": {
								"faces": []
							},
							"small": {
								"faces": []
							},
							"orig": {
								"faces": []
							}
						},
						"sizes": {
							"large": {
								"h": 1735,
								"w": 1125,
								"resize": "fit"
							},
							"medium": {
								"h": 1200,
								"w": 778,
								"resize": "fit"
							},
							"small": {
								"h": 680,
								"w": 441,
								"resize": "fit"
							},
							"thumb": {
								"h": 150,
								"w": 150,
								"resize": "crop"
							}
						},
						"original_info": {
							"height": 1735,
							"width": 1125,
							"focus_rects": [
								{
									"x": 0,
									"y": 1105,
									"w": 1125,
									"h": 630
								},
								{
									"x": 0,
									"y": 610,
									"w": 1125,
									"h": 1125
								},
								{
									"x": 0,
									"y": 452,
									"w": 1125,
									"h": 1283
								},
								{
									"x": 0,
									"y": 0,
									"w": 868,
									"h": 1735
								},
								{
									"x": 0,
									"y": 0,
									"w": 1125,
									"h": 1735
								}
							]
						}
					}
				],
				"user_mentions": [
					{
						"id_str": "1512232083586162688",
						"name": "おまめ",
						"screen_name": "271_omame",
						"indices": [
							3,
							13
						]
					}
				],
				"urls": [],
				"hashtags": [],
				"symbols": []
			},
			"extended_entities": {
				"media": [
					{
						"display_url": "pic.twitter.com/UCq7IcIMrO",
						"expanded_url": "https://twitter.com/271_omame/status/1737465280610382193/photo/1",
						"id_str": "1737465275593949184",
						"indices": [
							101,
							124
						],
						"media_key": "3_1737465275593949184",
						"media_url_https": "https://pbs.twimg.com/media/GBy3dnFagAArLlC.jpg",
						"source_status_id_str": "1737465280610382193",
						"source_user_id_str": "1512232083586162688",
						"type": "photo",
						"url": "https://t.co/UCq7IcIMrO",
						"ext_media_availability": {
							"status": "Available"
						},
						"features": {
							"large": {
								"faces": []
							},
							"medium": {
								"faces": []
							},
							"small": {
								"faces": []
							},
							"orig": {
								"faces": []
							}
						},
						"sizes": {
							"large": {
								"h": 1735,
								"w": 1125,
								"resize": "fit"
							},
							"medium": {
								"h": 1200,
								"w": 778,
								"resize": "fit"
							},
							"small": {
								"h": 680,
								"w": 441,
								"resize": "fit"
							},
							"thumb": {
								"h": 150,
								"w": 150,
								"resize": "crop"
							}
						},
						"original_info": {
							"height": 1735,
							"width": 1125,
							"focus_rects": [
								{
									"x": 0,
									"y": 1105,
									"w": 1125,
									"h": 630
								},
								{
									"x": 0,
									"y": 610,
									"w": 1125,
									"h": 1125
								},
								{
									"x": 0,
									"y": 452,
									"w": 1125,
									"h": 1283
								},
								{
									"x": 0,
									"y": 0,
									"w": 868,
									"h": 1735
								},
								{
									"x": 0,
									"y": 0,
									"w": 1125,
									"h": 1735
								}
							]
						}
					}
				]
			},
			"favorite_count": 0,
			"favorited": false,
			"full_text": "RT @271_omame: これ今日一勉強になった知識\n払うつもりないのに飲み食いしたら無銭飲食で詐欺罪\n払うつもりだったけど理由があって払えない場合は民事不介入で裁判しないと判定がつかない\nほえー https://t.co/UCq7IcIMrO",
			"is_quote_status": true,
			"lang": "ja",
			"possibly_sensitive": false,
			"possibly_sensitive_editable": true,
			"quote_count": 0,
			"quoted_status_id_str": "1737398598105760087",
			"quoted_status_permalink": {
				"url": "https://t.co/ZZ7S2yFbbx",
				"expanded": "https://twitter.com/namapomon/status/1737398598105760087",
				"display": "twitter.com/namapomon/stat…"
			},
			"reply_count": 0,
			"retweet_count": 2378,
			"retweeted": false,
			"user_id_str": "2609116428",
			"id_str": "1737739942057615723",
			"retweeted_status_result": {
				"result": {
					"__typename": "Tweet",
					"rest_id": "1737465280610382193",
					"core": {
						"user_results": {
							"result": {
								"__typename": "User",
								"id": "VXNlcjoxNTEyMjMyMDgzNTg2MTYyNjg4",
								"rest_id": "1512232083586162688",
								"affiliates_highlighted_label": {},
								"has_graduated_access": true,
								"is_blue_verified": false,
								"profile_image_shape": "Circle",
								"legacy": {
									"can_dm": true,
									"can_media_tag": true,
									"created_at": "Fri Apr 08 00:53:30 +0000 2022",
									"default_profile": true,
									"default_profile_image": false,
									"description": "プロ主婦｜ 株クラ｜アカ分けしてないから雑多にツイートします｜楽天ROOM https://t.co/e8mUlxti8t ｜贈り物https://t.co/X9aDFfFU1o",
									"entities": {
										"description": {
											"urls": [
												{
													"display_url": "room.rakuten.co.jp/mamainvestor/i…",
													"expanded_url": "https://room.rakuten.co.jp/mamainvestor/items",
													"url": "https://t.co/e8mUlxti8t",
													"indices": [
														38,
														61
													]
												},
												{
													"display_url": "amazon.jp/hz/wishlist/ls…",
													"expanded_url": "https://www.amazon.jp/hz/wishlist/ls/2A3BJRAJR5IV?ref_=wl_share",
													"url": "https://t.co/X9aDFfFU1o",
													"indices": [
														66,
														89
													]
												}
											]
										},
										"url": {
											"urls": [
												{
													"display_url": "mamainvestor.net",
													"expanded_url": "https://www.mamainvestor.net",
													"url": "https://t.co/pMfK36KHvb",
													"indices": [
														0,
														23
													]
												}
											]
										}
									},
									"fast_followers_count": 0,
									"favourites_count": 12004,
									"followers_count": 196,
									"friends_count": 139,
									"has_custom_timelines": true,
									"is_translator": false,
									"listed_count": 2,
									"location": "",
									"media_count": 648,
									"name": "おまめ",
									"normal_followers_count": 196,
									"pinned_tweet_ids_str": [
										"1700803902969713067"
									],
									"possibly_sensitive": false,
									"profile_banner_url": "https://pbs.twimg.com/profile_banners/1512232083586162688/1699934393",
									"profile_image_url_https": "https://pbs.twimg.com/profile_images/1722831624809943040/HaVQ93zD_normal.jpg",
									"profile_interstitial_type": "",
									"screen_name": "271_omame",
									"statuses_count": 6033,
									"translator_type": "none",
									"url": "https://t.co/pMfK36KHvb",
									"verified": false,
									"want_retweets": false,
									"withheld_in_countries": []
								}
							}
						}
					},
					"unmention_data": {},
					"edit_control": {
						"edit_tweet_ids": [
							"1737465280610382193"
						],
						"editable_until_msecs": "1703082578000",
						"is_edit_eligible": false,
						"edits_remaining": "5"
					},
					"is_translatable": true,
					"views": {
						"count": "942882",
						"state": "EnabledWithCount"
					},
					"source": "<a href=\"http://twitter.com/download/iphone\" rel=\"nofollow\">Twitter for iPhone</a>",
					"quoted_status_result": {
						"result": {
							"__typename": "TweetWithVisibilityResults",
							"tweet": {
								"rest_id": "1737398598105760087",
								"core": {
									"user_results": {
										"result": {
											"__typename": "User",
											"id": "VXNlcjoxNjk0NjAyNjc2NTc3OTc2MzIw",
											"rest_id": "1694602676577976320",
											"affiliates_highlighted_label": {},
											"has_graduated_access": true,
											"is_blue_verified": false,
											"profile_image_shape": "Circle",
											"legacy": {
												"can_dm": false,
												"can_media_tag": false,
												"created_at": "Thu Aug 24 06:49:03 +0000 2023",
												"default_profile": true,
												"default_profile_image": false,
												"description": "生活保護アラサーADHD鬱病精神3級障害年金3級(このアカウントは政治宗教や特定の個人団体を非難する目的のものではありません)",
												"entities": {
													"description": {
														"urls": []
													}
												},
												"fast_followers_count": 0,
												"favourites_count": 4208,
												"followers_count": 4756,
												"friends_count": 610,
												"has_custom_timelines": false,
												"is_translator": false,
												"listed_count": 24,
												"location": "東京都",
												"media_count": 99,
												"name": "ナマポずんだもん",
												"normal_followers_count": 4756,
												"pinned_tweet_ids_str": [
													"1702586708158718284"
												],
												"possibly_sensitive": false,
												"profile_banner_url": "https://pbs.twimg.com/profile_banners/1694602676577976320/1694779374",
												"profile_image_url_https": "https://pbs.twimg.com/profile_images/1730967153405566976/OKvKSKup_normal.jpg",
												"profile_interstitial_type": "",
												"screen_name": "namapomon",
												"statuses_count": 1025,
												"translator_type": "none",
												"verified": false,
												"want_retweets": false,
												"withheld_in_countries": []
											}
										}
									}
								},
								"unmention_data": {},
								"edit_control": {
									"edit_tweet_ids": [
										"1737398598105760087"
									],
									"editable_until_msecs": "1703066679000",
									"is_edit_eligible": true,
									"edits_remaining": "5"
								},
								"is_translatable": true,
								"views": {
									"count": "16304643",
									"state": "EnabledWithCount"
								},
								"source": "<a href=\"http://twitter.com/download/iphone\" rel=\"nofollow\">Twitter for iPhone</a>",
								"legacy": {
									"bookmark_count": 6278,
									"bookmarked": false,
									"created_at": "Wed Dec 20 09:04:39 +0000 2023",
									"conversation_control": {
										"policy": "Community",
										"conversation_owner_results": {
											"result": {
												"__typename": "User",
												"legacy": {
													"screen_name": "namapomon"
												}
											}
										}
									},
									"conversation_id_str": "1737398598105760087",
									"display_text_range": [
										0,
										134
									],
									"entities": {
										"user_mentions": [],
										"urls": [],
										"hashtags": [],
										"symbols": []
									},
									"favorite_count": 79411,
									"favorited": false,
									"full_text": "ぼったくり居酒屋「お会計20万です」 \n\nぼく「警察呼んでいいのだ？」 \n\nぼったくり居酒屋「民事不介入だからいいよ？w」 \n\n警察「民事不介入なんで……」 \n\nぼく「じゃあ民事だから踏み倒すのだ。生活保護費は差し押さえられないのだ」 \n\n今月これで飯食ってるのだ……",
									"is_quote_status": false,
									"lang": "ja",
									"limited_actions": "limited_replies",
									"quote_count": 1039,
									"reply_count": 113,
									"retweet_count": 12053,
									"retweeted": false,
									"user_id_str": "1694602676577976320",
									"id_str": "1737398598105760087"
								}
							},
							"limitedActionResults": {
								"limited_actions": [
									{
										"action": "Reply",
										"prompt": {
											"__typename": "CtaLimitedActionPrompt",
											"cta_type": "SeeConversation",
											"headline": {
												"text": "Who can reply?",
												"entities": []
											},
											"subtext": {
												"text": "People the author mentioned can reply",
												"entities": []
											}
										}
									}
								]
							}
						}
					},
					"legacy": {
						"bookmark_count": 1607,
						"bookmarked": false,
						"created_at": "Wed Dec 20 13:29:38 +0000 2023",
						"conversation_id_str": "1737465280610382193",
						"display_text_range": [
							0,
							85
						],
						"entities": {
							"media": [
								{
									"display_url": "pic.twitter.com/UCq7IcIMrO",
									"expanded_url": "https://twitter.com/271_omame/status/1737465280610382193/photo/1",
									"id_str": "1737465275593949184",
									"indices": [
										86,
										109
									],
									"media_key": "3_1737465275593949184",
									"media_url_https": "https://pbs.twimg.com/media/GBy3dnFagAArLlC.jpg",
									"type": "photo",
									"url": "https://t.co/UCq7IcIMrO",
									"ext_media_availability": {
										"status": "Available"
									},
									"features": {
										"large": {
											"faces": []
										},
										"medium": {
											"faces": []
										},
										"small": {
											"faces": []
										},
										"orig": {
											"faces": []
										}
									},
									"sizes": {
										"large": {
											"h": 1735,
											"w": 1125,
											"resize": "fit"
										},
										"medium": {
											"h": 1200,
											"w": 778,
											"resize": "fit"
										},
										"small": {
											"h": 680,
											"w": 441,
											"resize": "fit"
										},
										"thumb": {
											"h": 150,
											"w": 150,
											"resize": "crop"
										}
									},
									"original_info": {
										"height": 1735,
										"width": 1125,
										"focus_rects": [
											{
												"x": 0,
												"y": 1105,
												"w": 1125,
												"h": 630
											},
											{
												"x": 0,
												"y": 610,
												"w": 1125,
												"h": 1125
											},
											{
												"x": 0,
												"y": 452,
												"w": 1125,
												"h": 1283
											},
											{
												"x": 0,
												"y": 0,
												"w": 868,
												"h": 1735
											},
											{
												"x": 0,
												"y": 0,
												"w": 1125,
												"h": 1735
											}
										]
									}
								}
							],
							"user_mentions": [],
							"urls": [],
							"hashtags": [],
							"symbols": []
						},
						"extended_entities": {
							"media": [
								{
									"display_url": "pic.twitter.com/UCq7IcIMrO",
									"expanded_url": "https://twitter.com/271_omame/status/1737465280610382193/photo/1",
									"id_str": "1737465275593949184",
									"indices": [
										86,
										109
									],
									"media_key": "3_1737465275593949184",
									"media_url_https": "https://pbs.twimg.com/media/GBy3dnFagAArLlC.jpg",
									"type": "photo",
									"url": "https://t.co/UCq7IcIMrO",
									"ext_media_availability": {
										"status": "Available"
									},
									"features": {
										"large": {
											"faces": []
										},
										"medium": {
											"faces": []
										},
										"small": {
											"faces": []
										},
										"orig": {
											"faces": []
										}
									},
									"sizes": {
										"large": {
											"h": 1735,
											"w": 1125,
											"resize": "fit"
										},
										"medium": {
											"h": 1200,
											"w": 778,
											"resize": "fit"
										},
										"small": {
											"h": 680,
											"w": 441,
											"resize": "fit"
										},
										"thumb": {
											"h": 150,
											"w": 150,
											"resize": "crop"
										}
									},
									"original_info": {
										"height": 1735,
										"width": 1125,
										"focus_rects": [
											{
												"x": 0,
												"y": 1105,
												"w": 1125,
												"h": 630
											},
											{
												"x": 0,
												"y": 610,
												"w": 1125,
												"h": 1125
											},
											{
												"x": 0,
												"y": 452,
												"w": 1125,
												"h": 1283
											},
											{
												"x": 0,
												"y": 0,
												"w": 868,
												"h": 1735
											},
											{
												"x": 0,
												"y": 0,
												"w": 1125,
												"h": 1735
											}
										]
									}
								}
							]
						},
						"favorite_count": 5519,
						"favorited": false,
						"full_text": "これ今日一勉強になった知識\n払うつもりないのに飲み食いしたら無銭飲食で詐欺罪\n払うつもりだったけど理由があって払えない場合は民事不介入で裁判しないと判定がつかない\nほえー https://t.co/UCq7IcIMrO",
						"is_quote_status": true,
						"lang": "ja",
						"possibly_sensitive": false,
						"possibly_sensitive_editable": true,
						"quote_count": 43,
						"quoted_status_id_str": "1737398598105760087",
						"quoted_status_permalink": {
							"url": "https://t.co/ZZ7S2yFbbx",
							"expanded": "https://twitter.com/namapomon/status/1737398598105760087",
							"display": "twitter.com/namapomon/stat…"
						},
						"reply_count": 6,
						"retweet_count": 2378,
						"retweeted": false,
						"user_id_str": "1512232083586162688",
						"id_str": "1737465280610382193"
					}
				}
			}
		}
	} as unknown as Result;

	globalThis.localStorage = {
		getItem(_key: string) { return null; },
		setItem(_key: string, _value: string) {},
		removeItem(_key: string) {},
		clear() {},
		length: 0,
		key(_index: number) { return null; },
	}
	globalThis.sessionStorage = {
		getItem(_key: string) { return null; },
		setItem(_key: string, _value: string) {},
		removeItem(_key: string) {},
		clear() {},
		length: 0,
		key(_index: number) { return null; },
	}
	articleFromResult(tweet);
})