<template>
	<div class="bg-subtle rounded-lg p-4 flex flex-1 items-center gap-4">
		<!-- Variation Label -->
		<div class="flex items-center gap-2 min-w-0">
			<div class="w-4 h-4 rounded-full flex-shrink-0" :style="{ backgroundColor: variationColor }"></div>
			<span class="font-medium text-sm">{{ variationLabel }}</span>
		</div>

		<!-- Percentage Slider -->
		<div class="flex-1 flex items-center gap-3">
			<input v-model.number="variation.percentage" type="range" min="0" max="100" class="range range-xs" />
			<div class="flex items-center gap-1">
				<input
					v-model.number="variation.percentage"
					type="number"
					min="0"
					max="100"
					class="input input-sm input-bordered w-16 text-center"
				/>
				<span class="text-sm">%</span>
			</div>
		</div>

		<div class="bg-muted p-1 rounded-lg">
			<CloseAction
				:action="action"
				@create:action="createAction"
				@add:edge="addEdge"
			>
				<template #triggerButton>
					<button class="btn btn-soft btn-xs">
						<i class="fa fa-cog"></i>
					</button>
				</template>
			</CloseAction>
		</div>
	</div>
</template>

<script>
import CloseAction from '~/components/Flow/Node/CloseAction.vue'
import { Node } from '~/models/Flow/Node.ts'
import { randomizerConstants } from '~/models/Flow/utils/utils.ts'

export default {
	components: { CloseAction },
	props: {
		action: {
			type: Node,
			default: null,
		},
		variation: {
			type: Object,
			required: true,
		},
		index: {
			type: Number,
			required: true,
		},
	},
	computed: {
		variationColor() {
			return randomizerConstants.variationColors[this.index % randomizerConstants.variationColors.length]
		},
		variationLabel() {
			return randomizerConstants.variationLabels[this.index % randomizerConstants.variationLabels.length]
		},
	},
	emits: ['add:edge', 'create:action'],
	methods: {
		createAction(newNode) {
			this.$emit('create:action', newNode)
		},
		addEdge(targetNodeUuid) {
			this.$emit('add:edge', targetNodeUuid)
		},
	},
}
</script>
