<template>
	<div class="flex items-center gap-2">
		<i class="fa fa-clipboard-list mr-1"></i>
		<div class="text-sm">
			<span v-if="node.config.replyType">
				{{
					$t('components.flow.node.actions.dataCollection.collectData', {
						replyType: getReplyTypeLabel(node.config.replyType),
					})
				}}
				<span v-if="node.config.contactField" class="ml-2 text-xs opacity-70">
					→ {{ node.config?.contactField?.key }}
					<!--						$t(`components.flow.node.conditions.fields.${node.config.contactField.key}.name`)-->
				</span>
			</span>
			<NodeSummaryEmptyState v-else :text="$t('components.flow.node.summaries.dataCollection.emptyState')" />
		</div>
	</div>
</template>

<script>
import { Node } from '~/models/Flow/Node.js'
import NodeSummaryEmptyState from '~/components/Flow/Node/Summaries/NodeSummaryEmptyState.vue'

export default {
	components: { NodeSummaryEmptyState },
	props: {
		node: {
			type: Node,
			required: true,
		},
	},
	methods: {
		getReplyTypeLabel(type) {
			const labels = {
				text: this.$t('components.flow.node.actions.dataCollection.replyTypes.text'),
				email: this.$t('components.flow.node.actions.dataCollection.replyTypes.email'),
				phone: this.$t('components.flow.node.actions.dataCollection.replyTypes.phone'),
				number: this.$t('components.flow.node.actions.dataCollection.replyTypes.number'),
				url: this.$t('components.flow.node.actions.dataCollection.replyTypes.url'),
				date: this.$t('components.flow.node.actions.dataCollection.replyTypes.date'),
				datetime: this.$t('components.flow.node.actions.dataCollection.replyTypes.datetime'),
				image: this.$t('components.flow.node.actions.dataCollection.replyTypes.image'),
				multiple_choice: this.$t('components.flow.node.actions.dataCollection.replyTypes.multiple_choice'),
			}
			return labels[type] || type
		},
	},
}
</script>
