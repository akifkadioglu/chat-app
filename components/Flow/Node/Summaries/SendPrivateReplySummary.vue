<template>
	<div>
		<h4 class="text-sm font-medium mb-2">{{ $t('components.flow.node.actions.comment.sendPrivateReply.title') }}</h4>

		<div class="text-xs text-info mb-4">
			<i class="fa fa-info-circle text-info" />
			{{ $t('components.flow.node.actions.comment.sendPrivateReply.description') }}
		</div>

		<!--		<div v-if="node.config.text" class="space-y-2">-->
		<!--			&lt;!&ndash;			<div class="text-xs text-base-content/70">&ndash;&gt;-->
		<!--			&lt;!&ndash;				{{ $t('components.flow.node.summaries.sendPrivateReply.message') }}:&ndash;&gt;-->
		<!--			&lt;!&ndash;			</div>&ndash;&gt;-->
		<!--			&lt;!&ndash;			<div class="text-sm bg-base-200 rounded p-2">&ndash;&gt;-->
		<!--			&lt;!&ndash;				{{ truncatedMessage }}&ndash;&gt;-->
		<!--			&lt;!&ndash;			</div>&ndash;&gt;-->
		<!--		</div>-->

		<!--		<NodeSummaryEmptyState v-else :text="$t('components.flow.node.summaries.sendPrivateReply.emptyState')" />-->

		<slot v-bind="node.config" />

		<div v-if="node.config.skipIfConsentExists" class="text-xs text-warning mb-4">
			<i class="fa fa-info-circle text-warning" />
			{{ $t('components.flow.node.actions.comment.sendPrivateReply.notification') }}
		</div>
	</div>
</template>

<script>
import NodeSummaryEmptyState from '~/components/Flow/Node/Summaries/NodeSummaryEmptyState.vue'
import { Node } from '~/models/Flow/Node.ts'

export default {
	components: { NodeSummaryEmptyState },
	props: {
		node: {
			type: Node,
			required: true,
		},
	},
	computed: {
		// truncatedMessage() {
		// 	if (!this.node.config.text) return ''
		// 	const message = this.node.config.text.toString()
		// 	return message.length > 100 ? message.substring(0, 100) + '...' : message
		// },
	},
}
</script>
