import { CommentOnPostType, nodeTypes, triggerTypes } from '~/models/Flow/utils/utils'
import { SIGNATURE_MESSAGES } from '~/models/Flow/utils/signatureMessages'
import { v4 } from 'uuid'

// export const privateReplyGuard = 'consent'

export const errorsList = {
	triggersNeedsTrigger: {
		type: 'triggersNeedsTrigger',
		messageKey: 'models.flow.utils.errorsList.triggersNeedsTrigger',
	},
	hasResolvedTrigger: {
		type: 'hasResolvedTrigger',
		messageKey: 'models.flow.utils.errorsList.hasResolvedTrigger',
	},
	receivedDMNeedsFilter: {
		type: 'receivedDMNeedsFilter',
		messageKey: 'models.flow.utils.errorsList.receivedDMNeedsFilter',
	},
	sendMessageNeedsMessage: {
		type: 'sendMessageNeedsMessage',
		messageKey: 'models.flow.utils.errorsList.sendMessageNeedsMessage',
	},
	sendMessageTooLong: {
		type: 'sendMessageTooLong',
		messageKey: 'models.flow.utils.errorsList.sendMessageTooLong',
	},
	needsToSetField: {
		type: 'needsToSetField',
		messageKey: 'models.flow.utils.errorsList.needsToSetField',
	},
	buttonGuardNotMatch: {
		type: 'buttonGuardNotMatch',
		messageKey: 'models.flow.utils.errorsList.buttonGuardNotMatch',
	},
	websiteLinkButtonUrlNotSet: {
		type: 'websiteLinkButtonUrlNotSet',
		messageKey: 'models.flow.utils.errorsList.websiteLinkButtonUrlNotSet',
	},
	buttonTextIsEmpty: {
		type: 'buttonTextIsEmpty',
		messageKey: 'models.flow.utils.errorsList.buttonTextIsEmpty',
	},
	quickReplyTitleIsEmpty: {
		type: 'quickReplyTitleIsEmpty',
		messageKey: 'models.flow.utils.errorsList.quickReplyTitleIsEmpty',
	},
	quickReplyGuardNotMatch: {
		type: 'quickReplyGuardNotMatch',
		messageKey: 'models.flow.utils.errorsList.quickReplyGuardNotMatch',
	},
	needsSelectAtLeastOnePost: {
		type: 'needsSelectAtLeastOnePost',
		messageKey: 'models.flow.utils.errorsList.needsSelectAtLeastOnePost',
	},
}

export const defaultTriggerConfigs = ($t: any = (t: any) => '') => {
	return {
		[triggerTypes.storyMention.key]: {
			autoLike: false,
			perContactADay: false,
		},
		[triggerTypes.commentOnPost.key]: {
			postType: CommentOnPostType.ALL_POSTS,
			selectedPostIds: [],
			selectedPostImgs: [],
			selectedPostShortcodes: [],
			filterComments: false,
			filters: {
				filterByWords: false,
				wordFilters: [{ type: 'contains', keywords: [] }],
				filterByIntent: false,
				intentFilter: { intention: null },
				filterBySentiment: false,
				sentimentFilter: {
					filterByAnalysis: true,
					filterByScore: false,
					analysisFilter: {
						label: 'positive',
					},
					scoreFilter: {
						operator: 'greater_than',
						value: 0,
					},
				},
			},
			replyComments: [
				$t('models.flow.utils.defaultTriggerConfig.commentOnPost.replyComments.text1'),
				$t('models.flow.utils.defaultTriggerConfig.commentOnPost.replyComments.text2'),
				$t('models.flow.utils.defaultTriggerConfig.commentOnPost.replyComments.text3'),
			],
			showSignature: true,
			showReplyComment: true,
			signatureLocale: $t('models.flow.utils.defaultNodeConfigs.signature.locale'),
			signatureText: '',
			sendRandomly: false,
			perContactOnce: false,
		},
		[triggerTypes.receivedDM.key]: {
			filterByWords: false,
			wordFilters: [{ type: 'contains', keywords: [] }],
			filterByIntent: false,
			intentFilter: { intention: null },
		},
		[triggerTypes.replyToStory.key]: {
			likeReply: false,
			filterByWords: false,
			wordFilters: [{ type: 'contains', keywords: [] }],
			filterByIntent: false,
			intentFilter: { intention: null },
		},
		[triggerTypes.commentOnLive.key]: {},
		[triggerTypes.otherFlow.key]: {},
		[triggerTypes.postback.key]: {},
		[triggerTypes.quickReply.key]: {},
	}
}

export default ($t: any = (t: any) => '') => {
	return {
		[nodeTypes.trigger.key]: {},
		[nodeTypes.actions.addTag.key]: {
			tags: [],
		},
		[nodeTypes.actions.removeTag.key]: {
			tagsToRemove: [],
		},
		[nodeTypes.actions.delay.key]: {
			delayType: 'duration',
			delayTime: 5,
			delayUnit: 'minutes',
			continueWeekdays: [],
			continueStartHour: 9,
			continueEndHour: 17,
		},
		[nodeTypes.actions.externalRequest.key]: {
			requestConfig: {
				method: 'GET',
				url: '',
				headers: [],
				body: {
					type: 'form',
					fields: [],
					json: '',
					raw: '',
				},
				settings: {
					messagePath: 'data.message',
					fallbackMessage: "Sorry, we couldn't load the dynamic content.",
					responseVariable: '',
					extractPath: '',
					timeout: 10,
					retryAttempts: 1,
					cacheResponse: false,
					cacheDuration: 5,
					continueOnError: false,
				},
			},
		},
		[nodeTypes.actions.sendMessage.key]: {
			contents: [
				{
					type: 'text',
					quick_replies: [],
					// quickReplies: {
					// 	replies: [],
					// 	settings: {
					// 		showAsKeyboard: true,
					// 		oneTimeUse: true,
					// 		buttonStyle: 'outline',
					// 	},
					// },
				},
			],
		},
		[nodeTypes.actions.dataCollection.key]: {
			replyType: 'text',
			contactField: null,
			message: {
				type: 'text',
				text: '',
				buttons: [],
			},
			options: [],
			expireMinutes: 30,
			retryInvalidAttempts: 3,
		},
		[nodeTypes.conditions.comparison.key]: {},
		[nodeTypes.actions.triggerFlow.key]: {
			selectedFlowId: null,
		},
		[nodeTypes.actions.randomizer.key]: {
			variations: [
				{ uuid: v4(), percentage: 50 },
				{ uuid: v4(), percentage: 50 },
			],
			randomPathEveryTime: false,
		},
		[nodeTypes.actions.pauseFlows.key]: {
			duration: 30, // minutes
			isForever: false,
		},
		[nodeTypes.commentActions.sendPrivateReply.key]: {
			text: $t('components.flow.node.triggers.commentOnPost.defaultPrivateReplyMessage', {
				igUsername: '{{ig.username}}',
			}),
			buttons: [
				{
					text: $t('models.flow.utils.defaultNodeConfigs.sendPrivateReply.buttonText'),
					guard: v4(),
					consentButton: true,
					disableDeleting: true,
				},
			],
			skipIfConsentExists: false,
		},
		[nodeTypes.commentActions.replyComment.key]: {
			replies: [
				{ text: $t('models.flow.utils.defaultNodeConfigs.replyComment.text1') },
				{ text: $t('models.flow.utils.defaultNodeConfigs.replyComment.text2') },
				{ text: $t('models.flow.utils.defaultNodeConfigs.replyComment.text3') },
			],
			sendRandomly: false,
		},
		[nodeTypes.commentActions.hideComment.key]: {},
		[nodeTypes.signature.key]: (() => {
			const locale = $t('models.flow.utils.defaultNodeConfigs.signature.locale') || 'en_US'
			const messages = SIGNATURE_MESSAGES[locale] || SIGNATURE_MESSAGES.en_US
			return {
				contents: [
					{
						type: 'text',
						text: messages.text,
						locale,
						buttons: [
							{
								text: messages.buttonText,
								action: {},
								url: messages.path,
								websiteLink: true,
								disableDeleting: true,
								disableUrlEditing: true,
							},
						],
					},
				],
			}
		})(),
	}
}
