<template>
	<div class="flex flex-col gap-6">
		<!-- Post Type Selection -->
		<SelectPostType
			:config="trigger.config"
			:chat-account="flowStore.flow.chatAccount"
			class="border border-muted rounded-xl shadow-xs px-3 py-4"
		/>

		<!-- Filter Options -->
		<FilterComments :config="trigger.config" class="border border-muted rounded-xl shadow-xs px-3 py-4" />

		<!-- Content based on selection -->
		<ReplyComment :config="trigger.config" class="border border-muted rounded-xl shadow-xs px-3 py-4" />

		<!--		<PrivateReply-->
		<!--			:privateReplyMessage="trigger.config.privateReplyMessage"-->
		<!--			:toEdges="node.toEdges"-->
		<!--			@addActionToButton="addActionToButton"-->
		<!--			@addEdgeToButton="addEdgeToButton"-->
		<!--		/>-->
	</div>
</template>
<script>
import FilterComments from '~/components/Flow/Node/Triggers/Partials/FilterComments.vue'
import SelectPostType from '~/components/Flow/Node/Triggers/Partials/SelectPostType.vue'
import ReplyComment from '~/components/Flow/Node/Triggers/Partials/ReplyComment.vue'
import { Trigger } from '~/models/Flow/Trigger.js'
import { Node } from '~/models/Flow/Node.js'

export default {
	components: {
		ReplyComment,
		SelectPostType,
		FilterComments,
	},
	props: {
		node: {
			type: Node,
			required: true,
		},
		trigger: {
			type: Trigger,
			default: null,
		},
	},
	setup() {
		return {
			flowStore: useFlowStore(),
		}
	},
}
</script>
