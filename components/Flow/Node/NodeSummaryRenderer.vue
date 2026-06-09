<template>
	<TriggersSummary v-if="node.type.key === nodeTypes.trigger.key" :node="node" class="text-sm" />
	<AddTagSummary v-else-if="node.type.key === nodeTypes.actions.addTag.key" :node="node" />
	<RemoveTagSummary v-else-if="node.type.key === nodeTypes.actions.removeTag.key" :node="node" />
	<DelaySummary v-else-if="node.type.key === nodeTypes.actions.delay.key" :node="node" />
	<ExternalRequestSummary v-else-if="node.type.key === nodeTypes.actions.externalRequest.key" :node="node" />
	<SendMessageSummary
		v-else-if="node.type.key === nodeTypes.actions.sendMessage.key"
		:node="node"
		:isCompactMode="isCompactMode"
	>
		<template #default="props">
			<slot v-bind="props" />
		</template>
	</SendMessageSummary>
	<DataCollectionSummary v-else-if="node.type.key === nodeTypes.actions.dataCollection.key" :node="node" />
	<ComparisonSummary v-else-if="node.type.key === nodeTypes.conditions.comparison.key" :node="node" />
	<TriggerFlowSummary v-else-if="node.type.key === nodeTypes.actions.triggerFlow.key" :node="node" />
	<SetContactFieldSummary v-else-if="node.type.key === nodeTypes.actions.setContactField.key" :node="node" />
	<RandomizerSummary v-else-if="node.type.key === nodeTypes.actions.randomizer.key" :node="node" />
	<SendPrivateReplySummary v-else-if="node.type.key === nodeTypes.commentActions.sendPrivateReply.key" :node="node" >
		<template #default="props">
			<slot v-bind="props" />
		</template>
	</SendPrivateReplySummary>
	<ReplyCommentSummary v-else-if="node.type.key === nodeTypes.commentActions.replyComment.key" :node="node" />
	<HideCommentSummary v-else-if="node.type.key === nodeTypes.commentActions.hideComment.key" :node="node" />
	<PauseFlowsSummary v-else-if="node.type.key === nodeTypes.actions.pauseFlows.key" :node="node" />
	<SignatureSummary v-else-if="node.type.key === nodeTypes.signature.key" :node="node" />
</template>
<script>
import { nodeTypes } from '~/models/Flow/utils/utils.ts'
import TriggersSummary from '~/components/Flow/Node/Summaries/TriggersSumary.vue'
import AddTagSummary from '~/components/Flow/Node/Summaries/AddTagSummary.vue'
import RemoveTagSummary from '~/components/Flow/Node/Summaries/RemoveTagSummary.vue'
import DelaySummary from '~/components/Flow/Node/Summaries/DelaySummary.vue'
import ExternalRequestSummary from '~/components/Flow/Node/Summaries/ExternalRequestSummary.vue'
import SendMessageSummary from '~/components/Flow/Node/Summaries/SendMessageSummary.vue'
import DataCollectionSummary from '~/components/Flow/Node/Summaries/DataCollectionSummary.vue'
import ComparisonSummary from '~/components/Flow/Node/Summaries/ComparisonSummary.vue'
import TriggerFlowSummary from '~/components/Flow/Node/Summaries/TriggerFlowSummary.vue'
import SetContactFieldSummary from '~/components/Flow/Node/Summaries/SetContactFieldSummary.vue'
import RandomizerSummary from '~/components/Flow/Node/Summaries/RandomizerSummary.vue'
import { Node } from '~/models/Flow/Node.ts'
import SendPrivateReplySummary from '~/components/Flow/Node/Summaries/SendPrivateReplySummary.vue'
import ReplyCommentSummary from '~/components/Flow/Node/Summaries/ReplyCommentSummary.vue'
import HideCommentSummary from '~/components/Flow/Node/Summaries/HideCommentSummary.vue'
import SignatureSummary from '~/components/Flow/Node/Summaries/SignatureSummary.vue'
import PauseFlowsSummary from '~/components/Flow/Node/Summaries/PauseFlowsSummary.vue'

export default {
	components: {
		PauseFlowsSummary,
		SignatureSummary,
		TriggersSummary,
		AddTagSummary,
		RemoveTagSummary,
		DelaySummary,
		ExternalRequestSummary,
		SendMessageSummary,
		DataCollectionSummary,
		ComparisonSummary,
		TriggerFlowSummary,
		SetContactFieldSummary,
		RandomizerSummary,
		SendPrivateReplySummary,
		ReplyCommentSummary,
		HideCommentSummary,
	},
	props: {
		node: {
			type: Node,
			required: true,
		},
		isCompactMode: {
			type: Boolean,
			default: true,
		},
	},
	computed: {
		nodeTypes() {
			return nodeTypes
		},
	},
}
</script>

<style scoped></style>
