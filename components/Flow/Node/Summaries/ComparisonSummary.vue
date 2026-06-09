<template>
	<div>
		<div v-if="node.config.field">
			<span class="text-sm font-medium">{{ node.config.field.name }}</span>
			<span class="text-sm text-base-content/70">
				{{ getSummaryText() }}
			</span>
		</div>

		<NodeSummaryEmptyState v-else :text="$t('components.flow.node.summaries.comparison.emptyState')" />
	</div>
</template>

<script>
import { comparisonOperators } from '~/models/Flow/utils/utils'
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
	computed: {
		availableOperators() {
			const type = this.node.config.field?.comparisonType || 'string'
			return comparisonOperators[type] || []
		},
		needsValue() {
			const noValueOperators = ['is_empty', 'is_not_empty', 'is_true', 'is_false']
			return !noValueOperators.includes(this.node.config.operator)
		},
	},
	methods: {
		getSummaryText() {
			const fieldName = this.node.config.field?.name || ''
			const operator = this.node.config.operator
			const value = this.node.config.value

			if (!operator) return this.$t('components.flow.node.conditions.comparison.messages.noComparisonSelected')

			const operatorObj = this.availableOperators.find((op) => op === operator)

			const operatorLabel = operatorObj
				? this.$t(`components.flow.node.conditions.comparison.operators.${operatorObj}`)
				: operator

			if (this.needsValue) {
				return `${operatorLabel}: ${value}`
			}

			return operatorLabel
		},
	},
}
</script>
