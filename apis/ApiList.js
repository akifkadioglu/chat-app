// endpoints must not be started with "/"
// endpoints must not be end with "/"

const apiList = {
	// token: {
	// 	path: '/api/token',
	// 	tokenRequired: false,
	// },
	affiliate: {
		partner: {
			userInfo: 'api/affiliate/partner/user-info',
			apply: 'api/affiliate/partner/apply',
		},
		programs: {
			index: 'api/affiliate/programs',
			apply: 'api/affiliate/programs/{id}/apply',
			slug: 'api/affiliate/programs/{slug}',
		},
	},
	account: {
		team: {
			index: 'api/account/team',
			create: 'api/account/team/create',
			leave: 'api/account/team/leave',
			users: {
				invite: 'api/account/team/users/invite',
				changeRole: 'api/account/team/users/change-role',
				remove: 'api/account/team/users/remove',
			},
			changeOwner: 'api/account/team/change-owner',
			replyInvitation: 'api/account/team/reply-invitation',
			migrateData: 'api/account/team/migrate-data',
			settings: {
				upsert: 'api/account/team/settings/upsert',
			},
		},
		subscription: {
			addCoupon: 'api/account/subscription/add-coupon',
		},
	},
	sso: {
		validateToken: '/api/sso/validate-token',
	},
	stats: {
		path: '/api/stats',
		tokenRequired: false,
	},
	prices: {
		subscription: {
			chatPlans: 'api/prices/subscription/chat-plans',
			get: 'api/prices/subscription/{slug}',
		},
		card: {
			get: 'api/prices/card/get',
			remove: 'api/prices/card/remove',
			add: 'api/prices/card/add',
		},
		get: 'api/prices',
		getPaymentIntent: 'api/prices/get-payment-intent',
		coupon: {
			apply: {
				package: 'api/prices/coupon/apply/package',
				subscription: 'api/prices/coupon/apply/subscription',
			},
		},
		refCode: {
			redeem: 'api/prices/ref-code/redeem',
		},
	},
	testimonials: {
		get: '/api/testimonials',
	},
	limits: '/api/limits',
	changeCurrency: '/api/change-currency',
	changeCountry: '/api/change-country',
	thread: {
		list: 'api/thread/list',
		create: 'api/thread/create',
		hash: {
			messages: 'api/thread/{hash}/messages',
			send: 'api/thread/{hash}/send',
		},
		saveRatingScore: 'api/thread/save-rating-score/{id}',
	},
	chat: {
		saveSetup: 'api/chat/save-setup',
		userInfo: 'api/chat/user-info',
		instagram: {
			chatAccounts: 'api/chat/instagram/chat-accounts',
			conversations: {
				get: 'api/chat/instagram/conversations',
				byIds: 'api/chat/instagram/conversations/by-ids',
			},
			contacts: {
				get: 'api/chat/instagram/contacts',
				export: 'api/chat/instagram/contacts/export',
				delete: 'api/chat/instagram/contacts/delete',
				flows: {
					get: 'api/chat/instagram/contacts/flows',
					pause: 'api/chat/instagram/contacts/flows/pause',
					resume: 'api/chat/instagram/contacts/flows/resume',
				},
				attributes: {
					customFields: {
						create: 'api/chat/instagram/contacts/attributes/custom-fields/create',
						update: 'api/chat/instagram/contacts/attributes/custom-fields/update',
						delete: 'api/chat/instagram/contacts/attributes/custom-fields/delete',
					},
					tags: {
						create: 'api/chat/instagram/contacts/attributes/tags/create',
						delete: 'api/chat/instagram/contacts/attributes/tags/delete',
					},
				},
			},
			chatAccountId: {
				contacts: {
					contactId: {
						addTag: 'api/chat/instagram/{chatAccountId}/contacts/{slug}/add-tag',
						removeTag: 'api/chat/instagram/{chatAccountId}/contacts/{slug}/remove-tag',
						upsertField: 'api/chat/instagram/{chatAccountId}/contacts/{slug}/upsert-field',
						removeField: 'api/chat/instagram/{chatAccountId}/contacts/{slug}/remove-field',
						updateContact: 'api/chat/instagram/{chatAccountId}/contacts/{slug}/update-contact',
						pauseFlows: 'api/chat/instagram/{chatAccountId}/contacts/{slug}/pause-flows',
						resumeFlows: 'api/chat/instagram/{chatAccountId}/contacts/{slug}/resume-flows',
					},
					create: 'api/chat/instagram/{chatAccountId}/contacts',
					update: 'api/chat/instagram/{chatAccountId}/contacts/{slug}',
					delete: 'api/chat/instagram/{chatAccountId}/contacts/{slug}',
					get: 'api/chat/instagram/{chatAccountId}/contacts/{slug}',
				},
				lastMediaInfo: 'api/chat/instagram/{chatAccountId}/last-media-info',
				conversation: {
					conversationId: {
						get: 'api/chat/instagram/{chatAccountId}/conversation/{conversationId}',
						send: 'api/chat/instagram/{chatAccountId}/conversation/{conversationId}/send',
						like: 'api/chat/instagram/{chatAccountId}/conversation/{conversationId}/like',
						read: 'api/chat/instagram/{chatAccountId}/conversation/{conversationId}/read',
						translateText: 'api/chat/instagram/{chatAccountId}/conversation/{conversationId}/translate-text',
						translateMessage: 'api/chat/instagram/{chatAccountId}/conversation/{conversationId}/translate-message',
						retrySend: 'api/chat/instagram/{chatAccountId}/conversation/{conversationId}/retry-send',
						hashMessages: 'api/chat/instagram/{chatAccountId}/conversation/{conversationId}/hash-messages',
						unread: 'api/chat/instagram/{chatAccountId}/conversation/{conversationId}/unread',
						delete: 'api/chat/instagram/{chatAccountId}/conversation/{conversationId}/delete',
						pin: 'api/chat/instagram/{chatAccountId}/conversation/{conversationId}/pin',
						unpin: 'api/chat/instagram/{chatAccountId}/conversation/{conversationId}/unpin',
						changeAssignee: 'api/chat/instagram/{chatAccountId}/conversation/{conversationId}/change-assignee',
					},
				},
				tags: {
					get: 'api/chat/instagram/{chatAccountId}/tags',
					create: 'api/chat/instagram/{chatAccountId}/tags/create',
					delete: 'api/chat/instagram/{chatAccountId}/tags/delete',
					update: 'api/chat/instagram/{chatAccountId}/tags/update',
				},
				customFields: {
					get: 'api/chat/instagram/{chatAccountId}/custom-fields',
					create: 'api/chat/instagram/{chatAccountId}/custom-fields/create',
					delete: 'api/chat/instagram/{chatAccountId}/custom-fields/delete',
					upsert: 'api/chat/instagram/{chatAccountId}/custom-fields/update',
				},
				medias: {
					get: 'api/chat/instagram/{chatAccountId}/medias',
					mediaInfo: 'api/chat/instagram/{chatAccountId}/media-info',
				},
				persistentMenu: {
					create: 'api/chat/instagram/{chatAccountId}/persistent-menu/create',
					get: 'api/chat/instagram/{chatAccountId}/persistent-menu',
					delete: 'api/chat/instagram/{chatAccountId}/persistent-menu/delete',
				},
				iceBreakers: {
					create: 'api/chat/instagram/{chatAccountId}/ice-breakers/create',
					get: 'api/chat/instagram/{chatAccountId}/ice-breakers',
					delete: 'api/chat/instagram/{chatAccountId}/ice-breakers/delete',
				},
				settings: {
					upsert: 'api/chat/instagram/{chatAccountId}/settings/upsert',
				},
				activities: {
					get: 'api/chat/instagram/{chatAccountId}/activities',
				},
				subscribe: 'api/chat/instagram/{chatAccountId}/subscribe',
				subscribeExist: 'api/chat/instagram/{chatAccountId}/subscribe-exist',
				planInfo: 'api/chat/instagram/{chatAccountId}/plan-info',
				subscription: {
					cancel: 'api/chat/instagram/{chatAccountId}/subscription/cancel',
					continue: 'api/chat/instagram/{chatAccountId}/subscription/continue',
					retryPayment: 'api/chat/instagram/{chatAccountId}/subscription/retry-payment',
					maxOverageLimit: 'api/chat/instagram/{chatAccountId}/subscription/max-overage-limit',
				},
				delete: 'api/chat/instagram/{chatAccountId}/delete',
				onboarding: 'api/chat/instagram/{chatAccountId}/onboarding',
				publishedFlows: 'api/chat/instagram/{chatAccountId}/published-flows',
				overviewFlows: 'api/chat/instagram/{chatAccountId}/overview-flows',
				resetStatusReason: 'api/chat/instagram/{chatAccountId}/reset-status-reason',
			},
			authUrl: 'api/chat/instagram/auth/url',
			preview: 'api/chat/instagram/preview/{slug}',
			contact: {
				contactId: {
					conversation: 'api/chat/instagram/contact/{slug}/conversation',
				},
			},
		},
		facebook: {
			tokens: 'api/chat/facebook/tokens',
			accounts: 'api/chat/facebook/accounts',
			createChatAccount: 'api/chat/facebook/create-chat-account',
		},
		flow: {
			library: 'api/chat/flow/library',
			flows: 'api/chat/flow/flows',
			id: {
				run: 'api/chat/flow/{id}/run',
				get: 'api/chat/flow/{id}',
				save: 'api/chat/flow/{id}/save',
				publish: 'api/chat/flow/{id}/publish',
				rollback: 'api/chat/flow/{id}/rollback',
				changeStatus: 'api/chat/flow/{id}/change-status',
				delete: 'api/chat/flow/{id}/delete',
				reportErrors: 'api/chat/flow/{id}/report-errors',
				share: {
					update: 'api/chat/flow/{id}/share/update',
					index: 'api/chat/flow/{id}/share',
				},
				library: {
					submit: 'api/chat/flow/{id}/library/submit',
					update: 'api/chat/flow/{id}/library/update',
				},
			},
			flowStats: 'api/chat/flow/flow-stats',
			testExternalRequest: 'api/chat/flow/test-external-request',
			shared: {
				get: 'api/chat/flow/shared/{slug}',
			},
			chatAccountId: {
				flows: {
					selected: 'api/chat/flow/{chatAccountId}/flows/selected',
					actives: 'api/chat/flow/{chatAccountId}/flows/actives',
				},
			},
		},
		comments: {
			preview: {
				id: 'api/chat/comments/preview/{id}',
			},
			chatAccountId: {
				comments: {
					id: {
						hide: 'api/chat/comments/{chatAccountId}/comments/{id}/hide',
						unhide: 'api/chat/comments/{chatAccountId}/comments/{id}/unhide',
						analyze: 'api/chat/comments/{chatAccountId}/comments/{id}/analyze',
						reply: 'api/chat/comments/{chatAccountId}/comments/{id}/reply',
					},
				},
			},
			posts: 'api/chat/comments/posts',
			comments: 'api/chat/comments/comments',
			confirm: 'api/chat/comments/confirm',
			unconfirm: 'api/chat/comments/unconfirm',
			stats: 'api/chat/comments/stats',
		},
		posts: {
			get: 'api/chat/posts',
		},
	},
	auth: {
		login: 'api/login',
		register: 'api/register',
		user: {
			path: 'api/user',
			tokenRequired: false,
		},
		logout: 'api/logout',
		forgotPassword: 'api/forgot-password',
		resetPassword: 'api/reset-password',
		subscriptionStatus: 'api/subscription/status',
		google: {
			login: 'api/auth/google',
		},
	},
	faq: {
		get: 'api/faq',
		rate: 'api/faq/rate',
	},
	tracker: {
		track: 'api/track',
		offerSession: 'api/track/offer-session',
		syncTrackerDomain: 'api/track/sync-tracker-domain',
		trackerDomainSyncErrorLog: 'api/track/tracker-domain-sync-error-log',
		logEventWeb: '/api/track/log-event-web',
	},
	webErrorLogs: 'api/track/web-error-logs',
	uploadFile: 'api/upload-file',
}

export default apiList
