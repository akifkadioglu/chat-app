<template>
	<div>
		<div v-if="focusedTrigger" class="mb-5 pb-5 border-b border-muted flex items-center justify-between">
			<TriggerSummary :trigger="focusedTrigger" :showPostThumbnails="false" />
		</div>
		<div v-else>
			<NodeSummaryEmptyState :text="$t('components.flow.node.summaries.triggers.emptyState')" />
			<div class="my-5" />
			<AddTrigger :node="node" @triggerAdded="flowStore.focusTrigger($event.uuid)" />
		</div>
		<StoryMention
			v-if="focusedTriggerTypeKey === triggerTypes.storyMention.key"
			:node="node"
			:trigger="focusedTrigger"
		/>
		<CommentOnPost
			v-if="focusedTriggerTypeKey === triggerTypes.commentOnPost.key"
			:node="node"
			:trigger="focusedTrigger"
		/>
		<ReplyToStory
			v-if="focusedTriggerTypeKey === triggerTypes.replyToStory.key"
			:node="node"
			:trigger="focusedTrigger"
		/>

		<ReceivedDM v-if="focusedTriggerTypeKey === triggerTypes.receivedDM.key" :node="node" :trigger="focusedTrigger" />

		<CommentOnLive
			v-if="focusedTriggerTypeKey === triggerTypes.commentOnLive.key"
			:node="node"
			:trigger="focusedTrigger"
		/>
		<!--		</div>-->
	</div>
</template>

<script>
import Collapse from '~/components/GlobalComponents/Collapse.vue'
import StoryMention from '~/components/Flow/Node/Triggers/StoryMention.vue'
import CommentOnPost from '~/components/Flow/Node/Triggers/CommentOnPost.vue'
import ReplyToStory from '~/components/Flow/Node/Triggers/ReplyToStory.vue'
import ReceivedDM from '~/components/Flow/Node/Triggers/ReceivedDM.vue'
import { triggerTypes } from '~/models/Flow/utils/utils.js'
import { Node } from '~/models/Flow/Node.js'
import TriggerSummary from '~/components/Flow/Node/Triggers/Partials/TriggerSummary.vue'
import NodeSummaryEmptyState from '~/components/Flow/Node/Summaries/NodeSummaryEmptyState.vue'
import AddTrigger from '~/components/Flow/Node/AddTrigger.vue'
import CommentOnLive from '~/components/Flow/Node/Triggers/CommentOnLive.vue'

export default {
	components: {
		CommentOnLive,
		NodeSummaryEmptyState,
		AddTrigger,
		TriggerSummary,
		ReplyToStory,
		CommentOnPost,
		StoryMention,
		ReceivedDM,
		Collapse,
	},
	props: {
		node: {
			type: Node,
			default: null,
		},
	},
	setup() {
		return {
			flowStore: useFlowStore(),
		}
	},
	computed: {
		triggerTypes() {
			return triggerTypes
		},
		focusedTrigger() {
			return this.flowStore.focusedTrigger
		},
		focusedTriggerTypeKey() {
			return this.focusedTrigger?.type?.key ?? null
		},
	},
}
</script>
