<template>
	<div>
		<h4 class="text-sm font-medium mb-3">{{ $t('components.flow.node.actions.comment.sendPrivateReply.title') }}</h4>

		<PrivateReply
			:privateReplyMessage="node.config"
			:node="node"
			@addActionToButton="$emit('addGuardNode', $event)"
			@addEdgeToButton="$emit('addGuardEdge', $event)"
		/>
	</div>
</template>

<script>
import { Node } from '~/models/Flow/Node.ts'
import PrivateReply from '~/components/Flow/Node/Triggers/Partials/PrivateReply.vue'
import { triggerTypes } from '~/models/Flow/utils/utils.ts'

export default {
	components: {
		PrivateReply,
	},
	props: {
		node: {
			type: Node,
			required: true,
		},
	},
	emits: ['addGuardNode', 'addGuardEdge'],
}
</script>
