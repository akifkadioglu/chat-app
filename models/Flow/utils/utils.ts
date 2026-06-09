import { NodeType } from '~/models/Flow/NodeType'
import { TriggerType } from '~/models/Flow/TriggerType'
import traverse from 'traverse'
import { v4, validate as isUuid } from 'uuid'

import {
	INTENT_COLLABORATION_KEY,
	INTENT_COMPLAINT_KEY,
	INTENT_COMPLIMENT_KEY,
	INTENT_FEEDBACK_KEY,
	INTENT_GIVEAWAY_ENTRY_KEY,
	INTENT_INFORMATION_KEY,
	INTENT_PURCHASE_KEY,
	INTENT_QUESTION_KEY,
	INTENT_REQUEST_KEY,
	INTENT_SPAM_KEY,
	INTENT_SUPPORT_KEY,
} from '~/models/Post/ContentIntent'
import { unbindUuidReferences } from '~/helpers/bindUUIDReferences'

export const INSTAGRAM_PROFILE_URL_PREFIX = 'https://www.instagram.com/_u/'

export const FLOW_TYPE_KEYS = {
	basic: 'basic',
	diagram: 'diagram',
	quick: 'quick',
}

export const guardKeys = {
	button: 'button',
	quickReply: 'quickReply',
	invalidReply: 'invalidReply',
	expired: 'expired',
	variation: 'variation',
	else: 'else',
	consent: 'consent',
}

export const nodeTypeCategories = {
	trigger: 'trigger',
	action: 'action',
	condition: 'condition',
}

export const nodeTypes = {
	trigger: {
		label: 'Trigger',
		key: 'trigger',
	} as NodeType,
	actions: {
		addTag: {
			label: 'Add Tag',
			key: 'addTag',
		} as NodeType,
		removeTag: {
			label: 'Remove Tag',
			key: 'removeTag',
		} as NodeType,
		setContactField: {
			label: 'Set Contact Field',
			key: 'setContactField',
		} as NodeType,
		randomizer: {
			label: 'Randomizer',
			key: 'randomizer',
			needsPro: true,
		} as NodeType,
		delay: {
			label: 'Delay',
			key: 'delay',
		} as NodeType,
		externalRequest: {
			label: 'External Request',
			key: 'externalRequest',
		} as NodeType,
		dataCollection: {
			label: 'Data Collection',
			key: 'dataCollection',
			needsPro: true,
		} as NodeType,
		sendMessage: {
			label: 'Send Message',
			key: 'sendMessage',
			children: [
				{
					key: 'sendMessage.text',
					icon: 'fa fa-font',
					labelKey: 'components.flow.node.actions.sendMessage.contentTypes.text',
					presetContentType: 'text',
				},
				{
					key: 'sendMessage.image',
					icon: 'fa fa-image',
					labelKey: 'components.flow.node.actions.sendMessage.contentTypes.image',
					presetContentType: 'image',
				},
				{
					key: 'sendMessage.video',
					icon: 'fa fa-video',
					labelKey: 'components.flow.node.actions.sendMessage.contentTypes.video',
					presetContentType: 'video',
				},
				{
					key: 'sendMessage.audio',
					icon: 'fa fa-music',
					labelKey: 'components.flow.node.actions.sendMessage.contentTypes.audio',
					presetContentType: 'audio',
				},
				{
					key: 'sendMessage.file',
					icon: 'fa fa-file-pdf',
					labelKey: 'components.flow.node.actions.sendMessage.contentTypes.file',
					presetContentType: 'file',
				},
				// {
				// 	key: 'sendMessage.delay',
				// 	icon: 'fa fa-clock',
				// 	labelKey: 'components.flow.node.actions.sendMessage.contentTypes.delay',
				// 	presetContentType: 'delay',
				// },
			],
		} as NodeType,
		triggerFlow: {
			label: 'Trigger Flow',
			key: 'triggerFlow',
		} as NodeType,
		pauseFlows: {
			label: 'Pause Flow',
			key: 'pauseFlows',
		} as NodeType,
	},
	commentActions: {
		sendPrivateReply: {
			label: 'Send Private Reply',
			key: 'sendPrivateReply',
		} as NodeType,
		replyComment: {
			label: 'Reply Comment',
			key: 'replyComment',
			needsPro: true,
		} as NodeType,
		hideComment: {
			label: 'Hide Comment',
			key: 'hideComment',
			needsPro: true,
		} as NodeType,
	},
	conditions: {
		comparison: {
			// tagExists: {
			// 	label: 'Tag Exists',
			// 	key: 'tagExists',
			// } as NodeType,
			label: 'Comparison',
			key: 'comparison',
		} as NodeType,
		// randomizer: {
		// 	label: 'Randomizer',
		// 	key: 'randomizer',
		// } as NodeType,
	},
	signature: {
		label: 'Signature',
		key: 'signature',
	} as NodeType,
}

export const triggerTypes = {
	storyMention: {
		label: 'Story Mention',
		key: 'storyMention',
	} as TriggerType,
	commentOnPost: {
		label: 'Comments On Post',
		key: 'commentOnPost',
	} as TriggerType,
	replyToStory: {
		label: 'Reply To Story',
		key: 'replyToStory',
	} as TriggerType,
	receivedDM: {
		label: 'Received DM',
		key: 'receivedDM',
	} as TriggerType,
	commentOnLive: {
		label: 'Comment On Live',
		key: 'commentOnLive',
		needsPro: true,
	} as TriggerType,
	postback: {
		label: 'Postback',
		key: 'postback',
	} as TriggerType,
	quickReply: {
		label: 'Quick Reply',
		key: 'quickReply',
	} as TriggerType,
	otherFlow: {
		label: 'Other Flow',
		key: 'otherFlow',
	} as TriggerType,
}

export enum CommentOnPostType {
	NEXT_POST = 'nextPost',
	ALL_POSTS = 'allPosts',
	SELECTED_POSTS = 'selectPosts',
}

// Comparison Type'ları
export const comparisonTypes = {
	BOOL: 'bool',
	STRING: 'string',
	DATE: 'date',
	INTEGER: 'integer',
	TAG: 'tag',
	SENTIMENT: 'sentiment',
	SCORE: 'score',
	INTENT: 'intent',
	TEXT: 'text',
}

export const fieldTypes = {
	BOOL: 'bool',
	STRING: 'string',
	INTEGER: 'integer',
	DATE: 'date',
	TAG: 'tag',
}

export function getFieldTypeIcon(fieldType: string) {
	switch (fieldType) {
		case fieldTypes.STRING:
			return 'fa fa-font'
		case fieldTypes.INTEGER:
			return 'fa fa-hashtag'
		case fieldTypes.BOOL:
			return 'fa fa-toggle-on'
		case fieldTypes.DATE:
			return 'fa fa-calendar'
		default:
			return 'fa fa-square-plus'
	}
}

// Condition metadata'ları - name, description, icon
export const conditionMetadata = {
	// General conditions
	first_name: {
		key: 'first_name',
		icon: 'fa fa-user',
		type: fieldTypes.STRING,
		comparisonType: comparisonTypes.STRING,
	},
	last_name: {
		key: 'last_name',
		icon: 'fa fa-user',
		type: fieldTypes.STRING,
		comparisonType: comparisonTypes.STRING,
	},
	email: {
		key: 'email',
		icon: 'fa fa-envelope',
		type: fieldTypes.STRING,
		comparisonType: comparisonTypes.STRING,
	},
	phone: {
		key: 'phone',
		icon: 'fa fa-phone',
		type: fieldTypes.STRING,
		comparisonType: comparisonTypes.STRING,
	},
	// subscribed: {
	// 	key: 'subscribed',
	// 	icon: 'fa fa-bell',
	// 	type: fieldTypes.BOOL,
	// 	comparisonType: comparisonTypes.BOOL,
	// 	categories: ['contact'],
	// },

	tag: {
		key: 'tag',
		icon: 'fa fa-tag',
		type: fieldTypes.TAG,
		comparisonType: comparisonTypes.TAG,
	},

	// Instagram field conditions from contactFields
	'ig.username': {
		key: 'ig.username',
		icon: 'fa fa-at',
		type: fieldTypes.STRING,
		comparisonType: comparisonTypes.STRING,
	},
	'ig.followers_count': {
		key: 'ig.followers_count',
		icon: 'fa fa-users',
		type: fieldTypes.INTEGER,
		comparisonType: comparisonTypes.INTEGER,
	},
	'ig.is_verified': {
		key: 'ig.is_verified',
		icon: 'fa fa-check-circle',
		type: fieldTypes.BOOL,
		comparisonType: comparisonTypes.BOOL,
	},
	'ig.last_interaction': {
		key: 'ig.last_interaction',
		icon: 'fa fa-clock',
		type: fieldTypes.DATE,
		comparisonType: comparisonTypes.DATE,
		filterable: false,
	},
	'ig.last_seen': {
		key: 'ig.last_seen',
		icon: 'fa fa-eye',
		type: fieldTypes.DATE,
		comparisonType: comparisonTypes.DATE,
		filterable: false,
	},
	'ig.follows_account': {
		key: 'ig.follows_account',
		icon: 'fa fa-user-plus',
		type: fieldTypes.BOOL,
		comparisonType: comparisonTypes.BOOL,
		filterable: true,
	},
	'ig.opted_in': {
		key: 'ig.opted_in',
		icon: 'fa fa-check-circle',
		type: fieldTypes.BOOL,
		comparisonType: comparisonTypes.BOOL,
		filterable: true,
	},

	'comment.sentiment': {
		key: 'comment.sentiment',
		icon: 'fa fa-smile',
		type: 'sentiment',
		comparisonType: comparisonTypes.SENTIMENT,
		needsPro: true,
	},
	'comment.score': {
		key: 'comment.score',
		icon: 'fa fa-star',
		type: 'score',
		comparisonType: comparisonTypes.SCORE,
		needsPro: true,
	},
	'comment.intent': {
		key: 'comment.intent',
		icon: 'fa fa-lightbulb',
		type: 'intent',
		comparisonType: comparisonTypes.INTENT,
		needsPro: true,
	},
	'comment.text': {
		key: 'comment.text',
		icon: 'fa fa-comment-dots',
		type: 'text',
		comparisonType: comparisonTypes.TEXT,
		filterable: true,
	},
}

export const conditionCategories = {
	recommended: {
		key: 'recommended',
		conditionKeys: [
			conditionMetadata.first_name.key,
			conditionMetadata.last_name.key,
			conditionMetadata.email.key,
			conditionMetadata.tag.key,
			conditionMetadata['ig.username'].key,
			conditionMetadata['ig.is_verified'].key,
			conditionMetadata['comment.sentiment'].key,
		],
	},
	contact: {
		key: 'contact',
		conditionKeys: [
			conditionMetadata.first_name.key,
			conditionMetadata.last_name.key,
			conditionMetadata.email.key,
			conditionMetadata.phone.key,
			// conditionMetadata.subscribed?.key,
		],
	},
	instagram: {
		key: 'instagram',
		conditionKeys: [
			conditionMetadata['ig.username'].key,
			conditionMetadata['ig.followers_count'].key,
			conditionMetadata['ig.is_verified'].key,
			conditionMetadata['ig.last_interaction'].key,
			conditionMetadata['ig.last_seen'].key,
			conditionMetadata['ig.follows_account'].key,
			conditionMetadata['ig.opted_in'].key,
		],
	},
	comment: {
		key: 'comment',
		conditionKeys: [
			conditionMetadata['comment.sentiment'].key,
			conditionMetadata['comment.score'].key,
			conditionMetadata['comment.intent'].key,
			conditionMetadata['comment.text'].key,
		],
	},
	custom: {
		key: 'custom',
	},
}
// Trigger filter operators (FilterRuleBuilder için)
export const triggerFilterOperators = ['contains', 'doesNotContain', 'beginsWith', 'containsWholeWord']

// Value gerektirmeyen operator'lar
export const noValueOperators = ['is_empty', 'is_not_empty', 'is_true', 'is_false', 'positive', 'negative', 'neutral']

// Comparison type'larına göre kullanılabilir operator'lar
export const comparisonOperators = {
	string: ['is_not_empty', 'is_empty', 'equals', 'not_equals', 'contains', 'not_contains', 'starts_with', 'ends_with'],
	bool: ['is_true', 'is_false'],
	integer: [
		'is_not_empty',
		'is_empty',
		'equals',
		'not_equals',
		'greater_than',
		'less_than',
		'greater_than_or_equal',
		'less_than_or_equal',
	],
	date: ['is_not_empty', 'is_empty', 'before', 'after', 'on', 'within_days', 'older_than_days'],
	tag: ['has', 'not_has'],

	sentiment: ['positive', 'neutral', 'negative'],
	score: ['greater_than', 'less_than', 'greater_than_or_equal', 'less_than_or_equal', 'equals', 'not_equals'],
	intent: ['has', 'not_has'],
	text: ['contains', 'starts_with', 'equals'],
}

export const viewTypes = {
	POST: 'post',
	CHAT: 'chat',
	EMPTY: 'empty',
}

export const optionTypes = {
	EMPTY: 'empty',
	COMMENTS: 'comments',
}

// Randomizer constants
export const randomizerConstants = {
	variationColors: [
		'#3b82f6', // Blue
		'#10b981', // Green
		'#8b5cf6', // Purple
		'#f59e0b', // Orange
		'#06b6d4', // Cyan
		'#ef4444', // Red
		'#84cc16', // Lime
		'#f97316', // Orange
	],
	variationLabels: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
}

export const intents = [
	INTENT_QUESTION_KEY,
	INTENT_COMPLAINT_KEY,
	INTENT_COMPLIMENT_KEY,
	INTENT_REQUEST_KEY,
	INTENT_SUPPORT_KEY,
	INTENT_PURCHASE_KEY,
	INTENT_INFORMATION_KEY,
	INTENT_FEEDBACK_KEY,
	INTENT_SPAM_KEY,
	INTENT_GIVEAWAY_ENTRY_KEY,
	INTENT_COLLABORATION_KEY,
]

// içerdeki keylerin de merge'lenmesi için
// target: DefaultConfig source: CurrentConfig (TriggerConfig or NodeConfig)
export function deepMerge(target: any, source: any): any {
	const result = { ...target }

	for (const key in source) {
		if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
			result[key] = deepMerge(target?.[key] ?? {}, source[key])
		} else {
			result[key] = source[key]
		}
	}

	return result
}

function getOrCreateUuid(uuidMap: Record<string, string>, oldUuid: string): string {
	if (!uuidMap[oldUuid]) uuidMap[oldUuid] = v4()
	return uuidMap[oldUuid]
}

//Regenerate flows uuids
export function regenerateUuids(flow: any) {
	const uuidMap: Record<string, string> = {}

	const nodes = flow.nodes?.value ?? flow.nodes ?? []
	const edges = flow.edges?.value ?? flow.edges ?? []

	nodes.forEach((node: any) => {
		if (node.uuid && isUuid(node.uuid)) {
			node.uuid = getOrCreateUuid(uuidMap, node.uuid)
		}

		const triggers = node.triggers?.value ?? node.triggers ?? []
		triggers.forEach((trigger: any) => {
			if (trigger.uuid && isUuid(trigger.uuid)) {
				trigger.uuid = getOrCreateUuid(uuidMap, trigger.uuid)
			}
			if (trigger.config?.postback && isUuid(trigger.config.postback)) {
				trigger.config.postback = getOrCreateUuid(uuidMap, trigger.config.postback)
			}
		})

		const config = node.config?.value ?? node.config ?? {}
		traverse(config).forEach(function (value) {
			if (typeof value === 'string' && isUuid(value)) {
				this.update(getOrCreateUuid(uuidMap, value))
			}
		})
	})

	edges.forEach((edge: any) => {
		if (edge.uuid && isUuid(edge.uuid)) {
			edge.uuid = getOrCreateUuid(uuidMap, edge.uuid)
		}
		if (edge.fromNodeUuid && isUuid(edge.fromNodeUuid)) {
			edge.fromNodeUuid = getOrCreateUuid(uuidMap, edge.fromNodeUuid)
		}
		if (edge.toNodeUuid && isUuid(edge.toNodeUuid)) {
			edge.toNodeUuid = getOrCreateUuid(uuidMap, edge.toNodeUuid)
		}
		if (edge.guard && isUuid(edge.guard)) {
			edge.guard = getOrCreateUuid(uuidMap, edge.guard)
		}
	})

	return flow
}

function sanitizeNodeConfigForShare(node: any) {
	if (!node.config) return

	traverse(node.config).forEach(function (value) {
		// Tag objelerindeki hesaba özgü id'leri null'la (name, color portable)
		if (
			value &&
			typeof value === 'object' &&
			!Array.isArray(value) &&
			'id' in value &&
			'name' in value &&
			'color' in value
		) {
			this.update({ ...value, id: null, chat_account_id: null })
		}

		// Instagram profil URL'lerinden username'i sıyır
		if (
			typeof value === 'string' &&
			value.startsWith(INSTAGRAM_PROFILE_URL_PREFIX) &&
			value !== INSTAGRAM_PROFILE_URL_PREFIX
		) {
			this.update(INSTAGRAM_PROFILE_URL_PREFIX)
		}
	})

	// triggerFlow: selectedFlowId taşınamaz
	if (node.type?.key === 'triggerFlow') {
		node.config.selectedFlowId = null
	}
}

export function createJSONByFlow(flow: any) {
	const flowObject = JSON.parse(JSON.stringify(flow))

	// node.uuid -> tempId (sıralı, 1'den başlar)
	const nodeUuidToTempId: Record<string, number> = {}
	flowObject.nodes.forEach((node: any, index: number) => {
		if (node.uuid) nodeUuidToTempId[node.uuid] = index + 1
	})

	const nodeUuids = new Set(Object.keys(nodeUuidToTempId))
	const edgeUuids = new Set<string>(flowObject.edges.map((e: any) => e.uuid).filter(Boolean))

	// Nodes: uuid kaldır, tempId ekle, type.key'ten uuid kaldır
	flowObject.nodes = flowObject.nodes.map((node: any, index: number) => {
		const { uuid, ...rest } = node
		const cleanedNode = { tempId: index + 1, ...rest }

		// node.type'dan sadece key kalsın
		if (cleanedNode.type) {
			cleanedNode.type = { key: cleanedNode.type.key }
		}

		// node.triggers'dan uuid'yi kaldır
		if (cleanedNode.triggers) {
			cleanedNode.triggers = cleanedNode.triggers.map((trigger: any) => {
				const { uuid, ...triggerRest } = trigger
				const cleanedTrigger = triggerRest

				// trigger.type'dan sadece key kalsın
				if (cleanedTrigger.type) {
					cleanedTrigger.type = { key: cleanedTrigger.type.key }
				}

				// Comment on post trigger'ının config'indeki selectedPostIds ve selectedPostImgs'i boş array yap
				if (cleanedTrigger.config && cleanedTrigger.type?.key === triggerTypes.commentOnPost.key) {
					cleanedTrigger.config.selectedPostIds = []
					cleanedTrigger.config.selectedPostImgs = []
				}

				return cleanedTrigger
			})
		}

		sanitizeNodeConfigForShare(cleanedNode)
		return cleanedNode
	})

	// Edges: uuid/fromNodeUuid/toNodeUuid kaldır, fromTempId/toTempId ekle
	flowObject.edges = flowObject.edges.map((edge: any) => {
		const { uuid, fromNodeUuid, toNodeUuid, ...rest } = edge
		return {
			...rest,
			fromTempId: fromNodeUuid != null ? (nodeUuidToTempId[fromNodeUuid] ?? null) : null,
			toTempId: toNodeUuid != null ? (nodeUuidToTempId[toNodeUuid] ?? null) : null,
		}
	})

	// Config UUID'lerini generateUuid-N ile değiştir (node/edge UUID'leri hariç)
	unbindUuidReferences(flowObject, new Set([...nodeUuids, ...edgeUuids]))

	const result = {
		name: flowObject.name,
		quickTypeKey: flowObject.quickTypeKey,
		typeKey: flowObject.typeKey,
		nodes: flowObject.nodes,
		edges: flowObject.edges,
	}

	return result
}
