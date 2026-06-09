<template>
	<div class="">
		<div class="flex items-start justify-between gap-3">
			<div class="flex items-center gap-3 min-w-0 flex-1 text-info font-medium">
				<i class="fa fa-info-circle" />
				{{ $t('components.flow.node.triggers.commentOnPost.consentMessage.title') }}
			</div>
		</div>
		<div class="text-xs text-base-content/70 mt-2">
			<p>{{ $t('components.flow.node.triggers.commentOnPost.consentMessage.description1') }}</p>
		</div>

		<div class="px-4 pb-5 mt-5 flex flex-col gap-3">
			<TextMessage :content="privateReplyMessage" :node="node" />
		</div>
	</div>
</template>

<script>
import TextMessage from '~/components/Flow/Node/Actions/SendMessagePartials/TextMessage.vue'
import { Node } from '~/models/Flow/Node.ts'

export default {
	components: {
		TextMessage,
	},
	props: {
		node: {
			type: Node,
			required: true,
		},
		privateReplyMessage: {
			type: Object,
			required: true,
		},
	},
	emits: ['addActionToButton', 'addEdgeToButton'],
}
</script>
