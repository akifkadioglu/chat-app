<template>
	<div>
		<h4 class="text-sm font-medium mb-2">{{ $t('components.flow.node.actions.comment.hideComment.title') }}</h4>

		<div class="flex items-center gap-2 text-sm text-base-content/70">
			<i class="fa fa-eye-slash text-info"></i>
			<span>{{ $t('components.flow.node.summaries.hideComment.description') }}</span>
		</div>
	</div>
</template>

<script>
import { Node } from '~/models/Flow/Node.ts'

export default {
	props: {
		node: {
			type: Node,
			required: true,
		},
	},
}
</script>
