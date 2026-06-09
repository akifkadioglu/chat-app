<template>
	<FieldSelector
		:hideSocialFields="hideConsentRequiredActions"
		@fieldSelected="fieldSelected"
		@dropdown-opened="onDropdownOpened"
		@dropdown-closed="onDropdownClosed"
	>
		<template v-if="$slots.triggerButton" #triggerButton>
			<slot name="triggerButton" />
		</template>
	</FieldSelector>
</template>

<script>
import FieldSelector from '~/components/Flow/Node/Conditions/FieldSelector.vue'
import { nodeTypes } from '~/models/Flow/utils/utils.js'
import { Node } from '~/models/Flow/Node.js'

export default {
	props: {
		hideConsentRequiredActions: {
			type: Boolean,
			default: false,
		},
	},
	components: {
		FieldSelector,
	},
	emits: ['addNode', 'dropdown-opened', 'dropdown-closed'],
	methods: {
		fieldSelected(field) {
			this.$emit(
				'addNode',
				new Node({
					type: nodeTypes.conditions.comparison,
					config: {
						field: field,
						operator: null,
						value: null,
					},
				}),
			)
		},
		onDropdownOpened() {
			this.$emit('dropdown-opened')
		},
		onDropdownClosed() {
			this.$emit('dropdown-closed')
		},
	},
}
</script>
