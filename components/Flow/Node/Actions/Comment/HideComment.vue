<template>
	<div>
		<h4 class="text-sm font-medium mb-3">{{ $t('components.flow.node.actions.comment.hideComment.title') }}</h4>

		<div class="bg-info/10 border border-info/20 rounded-lg p-4">
			<div class="flex items-start gap-3">
				<i class="fa fa-eye-slash text-info mt-1"></i>
				<div class="flex-1">
					<div class="text-sm font-medium text-info mb-1">
						{{ $t('components.flow.node.actions.comment.hideComment.description') }}
					</div>
					<div class="text-xs text-info/70">
						{{ $t('components.flow.node.actions.comment.hideComment.note') }}
					</div>
				</div>
			</div>
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
	mounted() {
		// this.initializeConfig()
	},
	methods: {
		// initializeConfig() {
		// 	// HideComment için özel config gerekmez, sadece action'ın varlığı yeterli
		// 	if (!this.node.config) {
		// 		this.node.config = {}
		// 	}
		// },
	},
}
</script>
