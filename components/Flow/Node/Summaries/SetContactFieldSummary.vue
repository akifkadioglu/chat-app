<template>
	<div>
		<h4 class="text-sm font-medium mb-2">{{ $t('components.flow.node.actions.setContactField.setFieldValue') }}</h4>

		<div v-if="node.config.field && node.config.operation" class="bg-base-200 rounded-lg p-3">
			<div class="flex items-center gap-2 text-sm">
				<span class="font-medium">{{ getFieldDisplayName() }}</span>
				<i class="fa fa-arrow-right text-base-content/60"></i>
				<span class="badge badge-primary badge-sm">{{ getOperationLabel() }}</span>
				<span v-if="showValue()" class="font-mono text-primary">{{ node.config.value }}</span>
			</div>
		</div>

		<NodeSummaryEmptyState v-else :text="$t('components.flow.node.summaries.setContactField.emptyState')" />
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
		getFieldDisplayName() {
			if (!this.node.config.field) return ''
			
			// Custom field ise key'ini göster
			if (this.node.config.field.key && this.node.config.field.key.startsWith('custom.')) {
				return this.node.config.field.name || this.node.config.field.key.replace('custom.', '')
			}
			
			// System field ise çevirisini göster
			return this.node.config.field.name || this.node.config.field.key
		},
		
		getOperationLabel() {
			if (!this.node.config.operation) return ''
			
			const operationKey = `components.flow.node.actions.setContactField.operations.${this.node.config.operation}`
			return this.$t(operationKey)
		},
		
		showValue() {
			// Clear ve toggle operasyonları value gerektirmez
			return this.node.config.operation && !['clear', 'toggle'].includes(this.node.config.operation)
		},
	},
}
</script>
