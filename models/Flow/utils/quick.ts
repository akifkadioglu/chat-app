import { v4 } from 'uuid'
import { deepLocalize } from '~/helpers/deepLocalize'
import quickFlowsJson from '~/models/Flow/utils/quickFlows.json'
import { bindUuidReferences } from '~/helpers/bindUUIDReferences'
import { ensureQuickFlows } from '~/helpers/ensureQuickFlows'
import { FLOW_TYPE_KEYS, INSTAGRAM_PROFILE_URL_PREFIX, nodeTypes, triggerTypes } from '~/models/Flow/utils/utils'
import { SIGNATURE_COMMENTS } from '~/models/Flow/utils/signatureMessages'

export type QUICK_TYPE = {
	key: string
	path: string
	needsPro?: boolean
}

export const QUICK_TYPE: QUICK_TYPE = {
	key: '',
	path: '',
	needsPro: false,
}
export const QUICK_TYPES = {
	growFollowersFromComments: {
		key: 'growFollowersFromComments',
		path: 'grow',
	} as QUICK_TYPE,
	replyToStory: {
		key: 'replyToStory',
		path: 'reply',
	} as QUICK_TYPE,
	replyToDm: {
		key: 'replyToDm',
		path: 'reply-dm',
	} as QUICK_TYPE,
	sendDmFromComments: {
		key: 'sendDmFromComments',
		path: 'send-dm',
	} as QUICK_TYPE,
	replyGiveawayEntries: {
		key: 'replyGiveawayEntries',
		path: 'reply-giveaway-entries',
	} as QUICK_TYPE,
	storyMentionReply: {
		key: 'storyMentionReply',
		path: 'mention',
	} as QUICK_TYPE,
	turnCommentsIntoSales: {
		key: 'turnCommentsIntoSales',
		path: 'sales',
	} as QUICK_TYPE,
	runGiveaway: {
		key: 'runGiveaway',
		path: 'giveaway',
		needsPro: true,
	} as QUICK_TYPE,
	positiveCommentReply: {
		key: 'positiveCommentReply',
		path: 'positive-comment',
		needsPro: true,
	} as QUICK_TYPE,
	questionCommentReply: {
		key: 'questionCommentReply',
		path: 'question-comment',
		needsPro: true,
	} as QUICK_TYPE,
	hideCommentNegative: {
		key: 'hideCommentNegative',
		path: 'hide-comment',
		needsPro: true,
	} as QUICK_TYPE,
	quiz: {
		key: 'quiz',
		path: 'quiz',
		needsPro: true,
	} as QUICK_TYPE,
}

export function createQuickFlowByJSON(type: any, t: any, te: any, username?: string) {
	const flowObject = structuredClone((quickFlowsJson as any).quickFlows[type])
	flowObject.quickTypeKey = type
	flowObject.typeKey = FLOW_TYPE_KEYS.quick
	flowObject.nodes = deepLocalize(flowObject.nodes, { t: t, te: te })
	flowObject.name = t(flowObject.name)
	processFlowObject(flowObject, username)
	ensureQuickFlows(flowObject, t)
	finalizeTriggerConfigs(flowObject)
	return flowObject
}

function finalizeTriggerConfigs(flowObject: any) {
	const triggerNodes = flowObject.nodes.filter((n: any) => n.type?.key === nodeTypes.trigger.key)
	triggerNodes.forEach((node: any) => {
		node.triggers?.forEach((trigger: any) => {
			if (trigger.type?.key === triggerTypes.commentOnPost.key) {
				const entry = SIGNATURE_COMMENTS[trigger.config.signatureLocale] || SIGNATURE_COMMENTS.en_US
				if (!trigger.config.signatureText) {
					trigger.config.signatureText = entry.text
				}
			}
		})
	})
}
export function processFlowObject(flowObject: any, username?: string) {
	flowObject.nodes = flowObject.nodes.map((node: any) => {
		const uuid = v4()
		const tempId = node.tempId
		flowObject.edges = flowObject.edges.map((edge: any) => {
			let newEdge = edge
			if (edge.fromTempId === tempId) {
				newEdge = { ...edge, fromNodeUuid: uuid }
			}

			if (edge.toTempId === tempId) {
				newEdge = { ...edge, toNodeUuid: uuid }
			}

			return newEdge
		})
		if (username) {
			replaceInstagramProfileUrls(node, username)
		}
		return { ...node, uuid }
	})
	flowObject.edges = flowObject.edges.map((edge: any) => {
		return { ...edge, uuid: v4() }
	})
	bindUuidReferences(flowObject)
	return flowObject
}

function replaceInstagramProfileUrls(node: any, username: string) {
	if (!node.config?.contents) return
	for (const content of node.config.contents) {
		if (!content.buttons) continue
		for (const button of content.buttons) {
			if (button.url && button.url.startsWith(INSTAGRAM_PROFILE_URL_PREFIX)) {
				button.url = INSTAGRAM_PROFILE_URL_PREFIX + username
			}
		}
	}
}

export const quickFlowCategories = [
	{
		key: 'comments',
		titlePath: 'components.flow.createFlowModal.categories.comments',
		flowKeys: [
			QUICK_TYPES.sendDmFromComments.key,
			QUICK_TYPES.replyGiveawayEntries.key,
			QUICK_TYPES.growFollowersFromComments.key,
			QUICK_TYPES.turnCommentsIntoSales.key,
			QUICK_TYPES.hideCommentNegative.key,
			QUICK_TYPES.positiveCommentReply.key,
			QUICK_TYPES.questionCommentReply.key,
		],
	},
	{
		key: 'dm',
		flowKeys: [QUICK_TYPES.replyToDm.key, QUICK_TYPES.sendDmFromComments.key],
	},
	{
		key: 'stories',
		flowKeys: [QUICK_TYPES.storyMentionReply.key, QUICK_TYPES.replyToStory.key],
	},
	{
		key: 'sales',
		flowKeys: [
			QUICK_TYPES.turnCommentsIntoSales.key,
			QUICK_TYPES.replyGiveawayEntries.key,
			QUICK_TYPES.runGiveaway.key,
		],
	},
	{
		key: 'moderation',
		flowKeys: [
			QUICK_TYPES.hideCommentNegative.key,
			QUICK_TYPES.positiveCommentReply.key,
			QUICK_TYPES.questionCommentReply.key,
		],
	},
	{
		key: 'engagement',
		flowKeys: [QUICK_TYPES.quiz.key, QUICK_TYPES.replyGiveawayEntries.key, QUICK_TYPES.runGiveaway.key],
	},
	{
		key: 'community',
		isCommunity: true,
		flowKeys: [],
	},
]

export function getFlowCategoryKeys(flowKey: string): string[] {
	return quickFlowCategories.filter((c) => c.flowKeys.includes(flowKey)).map((c) => c.key)
}

export const quickFlows = [
	{
		type: QUICK_TYPES.sendDmFromComments,
		iconClass: 'text-info fa fa-link',
		color: '#4F9CF9',
	},
	{
		type: QUICK_TYPES.replyGiveawayEntries,
		iconClass: 'text-simpliers fa fa-gift',
		color: '#E0003B',
	},
	{
		type: QUICK_TYPES.storyMentionReply,
		iconClass: 'text-warning fa-solid fa-quote-right',
		color: '#F59E0B',
	},
	{
		type: QUICK_TYPES.replyToStory,
		iconClass: 'text-secondary fa-solid fa-reply',
		color: '#61738d',
	},
	{
		type: QUICK_TYPES.growFollowersFromComments,
		iconClass: 'text-primary fa-solid fa-users-rays',
		color: '#432dd7',
	},
	{
		type: QUICK_TYPES.turnCommentsIntoSales,
		iconClass: 'text-success fa fa-hand-holding-dollar',
		color: '#10B981',
	},
	{
		type: QUICK_TYPES.runGiveaway,
		iconClass: 'text-orange-500 fa-solid fa-gift',
		color: '#F97316',
	},
	{
		type: QUICK_TYPES.hideCommentNegative,
		iconClass: 'text-red-500 fa-solid fa-comment-slash',
		color: '#EF4444',
	},
	{
		type: QUICK_TYPES.positiveCommentReply,
		iconClass: 'text-green-500 fa-solid fa-face-smile-beam',
		color: '#22C55E',
	},
	{
		type: QUICK_TYPES.questionCommentReply,
		iconClass: 'text-blue-500 fa-solid fa-circle-question',
		color: '#3B82F6',
	},
	{
		type: QUICK_TYPES.quiz,
		iconClass: 'text-amber-500 fa-solid fa-reply-all',
		color: '#F59E0B',
	},
	{
		type: QUICK_TYPES.replyToDm,
		iconClass: 'text-lime-500 fa-solid fa-reply-all',
		color: '#84cc16',
	},
]

// function commentOnPostFlow(flow: Flow, translateFunc: any) {
// 	flow.name = translateFunc('models.flow.utils.quick.sendDmFromComments.flowName')
// 	flow.quickTypeKey = QUICK_TYPES.sendDmFromComments.key
//
// 	const defaultConfig = defaultTriggerConfigs(triggerTypes.commentOnPost.key)
// 	defaultConfig.postType = CommentOnPostType.SELECTED_POSTS
//
// 	const trigger = new Trigger({ type: triggerTypes.commentOnPost, config: defaultConfig || {} })
// 	flow.nodes.find((n) => n.type.key === nodeTypes.trigger.key)?.addTrigger(trigger)
// 	flow.nodes
// 		.find((n) => n.type.key === nodeTypes.actions.sendMessage.key)
// 		?.setConfig({
// 			contents: [
// 				{
// 					type: 'text',
// 					text: translateFunc('models.flow.utils.quick.sendDmFromComments.defaultMessage'),
// 					buttons: [],
// 				},
// 			],
// 		})
//
// 	const privateReplyNode = flow.nodes.find((n) => n.type.key === nodeTypes.commentActions.sendPrivateReply.key)
//
// 	privateReplyNode.config = {
// 		isPrivateReplyMessageActive: true,
// 		text: translateFunc('models.flow.utils.quick.firstDMActionPanel.defaultOpeningDMMessage', {
// 			igUsername: '{{ig.username}}',
// 		}),
// 		buttons: [
// 			{
// 				text: translateFunc('models.flow.utils.quick.firstDMActionPanel.defaultOpeningDMButton'),
// 				disableDeleting: true,
// 				showRemoveButton: false,
// 				consentButton: true,
// 			},
// 		],
// 	}
//
// 	return flow
// }
//
// function storyMentionReplyFlow(flow: Flow, translateFunc: any) {
// 	flow.name = translateFunc('models.flow.utils.quick.storyMentionReply.flowName')
// 	flow.quickTypeKey = QUICK_TYPES.storyMentionReply.key
//
// 	const defaultConfig = defaultTriggerConfigs(triggerTypes.storyMention.key)
// 	const trigger = new Trigger({ type: triggerTypes.storyMention, config: defaultConfig || {} })
// 	flow.nodes.find((n) => n.type.key === nodeTypes.trigger.key)?.addTrigger(trigger)
// 	flow.nodes
// 		.find((n) => n.type.key === nodeTypes.actions.sendMessage.key)
// 		?.setConfig({
// 			contents: [
// 				{ type: 'text', text: translateFunc('models.flow.utils.quick.storyMentionReply.defaultMessage'), buttons: [] },
// 			],
// 		})
// }
//
// function replyToStoryFlow(flow: Flow, translateFunc: any) {
// 	flow.name = translateFunc('models.flow.utils.quick.replyToStory.flowName')
// 	flow.quickTypeKey = QUICK_TYPES.replyToStory.key
// 	consoleLog("flow.nodes",flow.nodes)
//
//
// 	const defaultConfig = defaultTriggerConfigs(triggerTypes.replyToStory.key)
// 	const trigger = new Trigger({ type: triggerTypes.replyToStory, config: defaultConfig || {} })
// 	flow.nodes.find((n) => n.type.key === nodeTypes.trigger.key)?.addTrigger(trigger)
//
// 	const sendMessageNode = flow.nodes.find((n) => n.type.key === nodeTypes.actions.sendMessage.key)
// 	sendMessageNode?.setConfig({
// 		contents: [
// 			{
// 				type: 'text',
// 				text: translateFunc('models.flow.utils.quick.replyToStory.sendMessageText'),
// 				buttons: [],
// 			},
// 		],
// 	})
// }
//
// function growFollowersFromCommentsFlow(flow: Flow, translateFunc: any) {
// 	flow.name = translateFunc('models.flow.utils.quick.growFollowersFromComments.flowName')
// 	flow.quickTypeKey = QUICK_TYPES.growFollowersFromComments.key
//
// 	const defaultConfig = defaultTriggerConfigs(triggerTypes.commentOnPost.key)
// 	defaultConfig.postType = CommentOnPostType.SELECTED_POSTS
//
//
// 	const trigger = new Trigger({ type: triggerTypes.commentOnPost, config: defaultConfig || {} })
//
// 	const comparisonNode = new Node({
// 		type: nodeTypes.conditions.comparison,
// 		config: {
// 			field: {
// 				key: 'ig.follows_account',
// 				icon: 'fa fa-user-plus',
// 				name: translateFunc('models.flow.utils.quick.growFollowersFromComments.comparisonNode.name'),
// 				type: 'bool',
// 				categories: ['instagram'],
// 				descriptionPath: translateFunc('models.flow.utils.quick.growFollowersFromComments.comparisonNode.description'),
// 				comparisonType: 'bool',
// 			},
// 			value: null,
// 			operator: 'is_true',
// 		},
// 	})
// 	const postback = v4()
// 	const sendMessageTrigger = new Trigger({
// 		config: {
// 			postback: postback,
// 		},
// 	})
// 	sendMessageTrigger.type = triggerTypes.postback
// 	const sendMessageNode = new Node({
// 		type: nodeTypes.actions.sendMessage,
// 		config: {
// 			contents: [
// 				{
// 					type: 'text',
// 					text: translateFunc('models.flow.utils.quick.growFollowersFromComments.followMessage'),
// 					buttons: [
// 						{
// 							text: translateFunc('models.flow.utils.quick.growFollowersFromComments.followButton'),
// 							action: {},
// 							disableDeleting: true,
// 							guard: postback,
// 							showRemoveButton: false,
// 							consentButton: true,
// 						},
// 					],
// 				},
// 			],
// 		},
// 	})
// 	const triggerNode = flow.nodes.find((n) => n.type.key === nodeTypes.trigger.key)
// 	sendMessageNode.addTrigger(sendMessageTrigger)
//
// 	flow.nodes.find((n) => n.type.key === nodeTypes.trigger.key)?.addTrigger(trigger)
// 	flow.nodes
// 		.find((n) => n.type.key === nodeTypes.actions.sendMessage.key)
// 		?.setConfig({
// 			contents: [{ type: 'text', text: '', buttons: [] }],
// 		})
//
// 	const privateReplyNode = flow.nodes.find((n) => n.type.key === nodeTypes.commentActions.sendPrivateReply.key)
// 	privateReplyNode.config = {
// 		isPrivateReplyMessageActive: true,
// 		text: translateFunc('models.flow.utils.quick.growFollowersFromComments.openingButton'),
// 		buttons: [
// 			{
// 				text: translateFunc('models.flow.utils.quick.growFollowersFromComments.openingButton'),
// 				disableDeleting: true,
// 				showRemoveButton: false,
// 				consentButton: true,
// 			},
// 		],
// 	}
//
// 	flow.addNode(comparisonNode, privateReplyNode)
// 	flow.addNode(sendMessageNode, comparisonNode, 'else')
// 	flow.addEdge(sendMessageNode, comparisonNode, postback)
// }
//
// function turnCommentsIntoSalesFlow(flow: Flow, translateFunc: any) {
// 	flow.name = translateFunc('models.flow.utils.quick.turnCommentsIntoSales.flowName')
// 	flow.quickTypeKey = QUICK_TYPES.turnCommentsIntoSales.key
// 	const defaultConfig = defaultTriggerConfigs(triggerTypes.commentOnPost.key)
// 	defaultConfig.postType = CommentOnPostType.SELECTED_POSTS
//
// 	const trigger = new Trigger({ type: triggerTypes.commentOnPost, config: defaultConfig || {} })
// 	const sendMessageNode = new Node({
// 		type: nodeTypes.actions.sendMessage,
// 		config: {
// 			contents: [
// 				{
// 					type: 'text',
// 					text: translateFunc('models.flow.utils.quick.turnCommentsIntoSales.sendMessage'),
// 					buttons: [
// 						{
// 							text: translateFunc('models.flow.utils.quick.turnCommentsIntoSales.shopNowButton'),
// 							url: '',
// 							disableDeleting: true,
// 							showRemoveButton: false,
// 							websiteLink: true,
// 						},
// 					],
// 				},
// 			],
// 		},
// 	})
// 	const delayNode = new Node({
// 		type: nodeTypes.actions.delay,
// 		config: {
// 			isDelayActive: false,
// 			delayType: 'duration',
// 			delayTime: 5,
// 			delayUnit: 'hours',
// 		},
// 	})
// 	flow.nodes.find((n) => n.type.key === nodeTypes.trigger.key)?.addTrigger(trigger)
// 	flow.nodes
// 		.find((n) => n.type.key === nodeTypes.actions.sendMessage.key)
// 		?.setConfig({
// 			contents: [
// 				{
// 					type: 'text',
// 					text: 'Kuponu kullandınız mı?',
// 					buttons: [],
// 				},
// 			],
// 		})
// 	const privateReplyNode = flow.nodes.find((n) => n.type.key === nodeTypes.commentActions.sendPrivateReply.key)
// 	privateReplyNode.config = {
// 		isPrivateReplyMessageActive: true,
// 		text: translateFunc('models.flow.utils.quick.turnCommentsIntoSales.openingMessage', {
// 			igUsername: '{{igUsername}}',
// 		}),
// 		buttons: [
// 			{
// 				text: translateFunc('models.flow.utils.quick.turnCommentsIntoSales.openingButton'),
// 				disableDeleting: true,
// 				showRemoveButton: false,
// 				consentButton: true,
// 			},
// 		],
// 	}
// 	flow.addNode(sendMessageNode, privateReplyNode)
// 	flow.addNode(delayNode, sendMessageNode)
// }
