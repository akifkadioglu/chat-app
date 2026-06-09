import { conditionMetadata, nodeTypes, triggerTypes } from '~/models/Flow/utils/utils'
import featureList from '~/types/featureList'

export type ProHit = { key: string; feature: string; nodeUuid: string | null }

export type ProCheck = {
	key: string
	feature: string
	findNode: (flow: any) => any | null
}

function getTriggers(node: any): any[] {
	return node.triggers?.value || node.triggers || []
}

function getConfig(target: any): any {
	return target?.config?.value || target?.config || {}
}

function byNodeType(nodeTypeKey: string) {
	return function findOffendingNode(flow: any): any | null {
		for (const node of flow.nodes.value) {
			if (node.type?.key === nodeTypeKey) return node
		}
		return null
	}
}

function byTriggerType(triggerTypeKey: string) {
	return function findOffendingNode(flow: any): any | null {
		for (const node of flow.nodes.value) {
			for (const trigger of getTriggers(node)) {
				if (trigger.type?.key === triggerTypeKey) return node
			}
		}
		return null
	}
}

function byTriggerConfig(matches: (triggerConfig: any) => boolean) {
	return function findOffendingNode(flow: any): any | null {
		for (const node of flow.nodes.value) {
			for (const trigger of getTriggers(node)) {
				if (matches(getConfig(trigger))) return node
			}
		}
		return null
	}
}

function byConditionField(fieldKey: string) {
	return function findOffendingNode(flow: any): any | null {
		for (const node of flow.nodes.value) {
			if (node.type?.key !== nodeTypes.conditions.comparison.key) continue
			if (getConfig(node).field?.key === fieldKey) return node
		}
		return null
	}
}

export const proFeatureChecks: Record<string, ProCheck> = {
	randomizer: {
		key: 'randomizer',
		feature: featureList.randomizerStep,
		findNode: byNodeType(nodeTypes.actions.randomizer.key),
	},
	dataCollection: {
		key: 'dataCollection',
		feature: featureList.dataCollectionStep,
		findNode: byNodeType(nodeTypes.actions.dataCollection.key),
	},
	replyComment: {
		key: 'replyComment',
		feature: featureList.replyCommentStep,
		findNode: byNodeType(nodeTypes.commentActions.replyComment.key),
	},
	hideComment: {
		key: 'hideComment',
		feature: featureList.hideCommentStep,
		findNode: byNodeType(nodeTypes.commentActions.hideComment.key),
	},
	commentOnLive: {
		key: 'commentOnLive',
		feature: featureList.commentOnLiveStarter,
		findNode: byTriggerType(triggerTypes.commentOnLive.key),
	},
	filterByIntent: {
		key: 'filterByIntent',
		feature: featureList.filterByIntent,
		findNode: byTriggerConfig(
			(triggerConfig) => !!(triggerConfig.filters?.filterByIntent || triggerConfig.filterByIntent),
		),
	},
	filterBySentiment: {
		key: 'filterBySentiment',
		feature: featureList.filterBySentiment,
		findNode: byTriggerConfig((triggerConfig) => !!triggerConfig.filters?.filterBySentiment),
	},
	signatureOff: {
		key: 'signatureOff',
		feature: featureList.commentSignature,
		findNode: byTriggerConfig((triggerConfig) => triggerConfig.showSignature === false),
	},
	commentSentiment: {
		key: 'commentSentiment',
		feature: featureList.commentSentimentRule,
		findNode: byConditionField(conditionMetadata['comment.sentiment'].key),
	},
	commentScore: {
		key: 'commentScore',
		feature: featureList.commentScoreRule,
		findNode: byConditionField(conditionMetadata['comment.score'].key),
	},
	commentIntent: {
		key: 'commentIntent',
		feature: featureList.commentIntentRule,
		findNode: byConditionField(conditionMetadata['comment.intent'].key),
	},
}

function runCheck(flow: any, check: ProCheck): ProHit | null {
	const offendingNode = check.findNode(flow)
	if (!offendingNode) return null
	return { key: check.key, feature: check.feature, nodeUuid: offendingNode.uuid ?? null }
}

export function detectProFeatures(flow: any): ProHit[] {
	const hits: ProHit[] = []
	for (const check of Object.values(proFeatureChecks)) {
		const hit = runCheck(flow, check)
		if (hit) hits.push(hit)
	}
	return hits
}

export function firstProHit(flow: any): ProHit | null {
	for (const check of Object.values(proFeatureChecks)) {
		const hit = runCheck(flow, check)
		if (hit) return hit
	}
	return null
}

export function flowHasProFeature(flow: any): boolean {
	return firstProHit(flow) !== null
}
