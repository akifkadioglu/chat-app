<template>
	<div>
		<h4 class="text-sm font-medium mb-2">{{ $t('components.flow.node.actions.comment.replyComment.title') }}</h4>

		<div v-if="hasReplies" class="space-y-2">
			<div class="text-xs text-base-content/70">
				{{ $t('components.flow.node.summaries.replyComment.repliesCount', { count: repliesCount }) }}
			</div>
			<!--			<div class="space-y-1">-->
			<!--				<div v-for="(reply, index) in displayReplies" :key="index" class="text-sm bg-base-200 rounded p-2 truncate">-->
			<!--					{{ reply.text || $t('components.flow.node.summaries.replyComment.emptyReply') }}-->
			<!--				</div>-->
			<!--				<div v-if="hasMoreReplies" class="text-xs text-base-content/50 text-center">-->
			<!--					{{ $t('components.flow.node.summaries.replyComment.andMore', { count: remainingCount }) }}-->
			<!--				</div>-->
			<!--			</div>-->
			<!--			<div class="text-xs text-base-content/70">-->
			<!--				<i class="fa fa-info-circle mr-1"></i>-->
			<!--				{{-->
			<!--					node.config.sendRandomly-->
			<!--						? $t('components.flow.node.summaries.replyComment.sendRandomly')-->
			<!--						: $t('components.flow.node.summaries.replyComment.sendInOrder')-->
			<!--				}}-->
			<!--			</div>-->
		</div>

		<NodeSummaryEmptyState v-else :text="$t('components.flow.node.summaries.replyComment.emptyState')" />
	</div>
</template>

<script>
import { Node } from '~/models/Flow/Node.ts'
import NodeSummaryEmptyState from '~/components/Flow/Node/Summaries/NodeSummaryEmptyState.vue'

export default {
	components: { NodeSummaryEmptyState },
	props: {
		node: {
			type: Node,
			required: true,
		},
	},
	computed: {
		hasReplies() {
			return (
				this.node.config.replies && this.node.config.replies.some((reply) => (reply?.text ? reply.text.trim() : ''))
			)
		},
		repliesCount() {
			return this.node.config.replies?.length || 0
		},
		displayReplies() {
			return this.node.config.replies?.slice(0, 3) || []
		},
		hasMoreReplies() {
			return this.repliesCount > 3
		},
		remainingCount() {
			return this.repliesCount - 3
		},
	},
}
</script>
