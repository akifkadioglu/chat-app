<template>
	<div>
		<h4 class="text-sm font-medium mb-2">{{ $t('components.flow.node.actions.randomizer.title') }}</h4>

		<div v-if="node.config.variations && node.config.variations.length > 0" class="space-y-2">
			<!-- Random path indicator -->
			<div v-if="node.config.randomPathEveryTime" class="text-xs text-primary flex items-center gap-1">
				<i class="fa fa-shuffle"></i>
				<span>{{ $t('components.flow.node.summaries.randomizer.randomPathEveryTime') }}</span>
			</div>

			<!-- Variations Preview -->
			<div class="grid grid-cols-2 gap-2">
				<div
					v-for="(variation, index) in visibleVariations"
					:key="variation.id"
					class="flex items-center gap-2 text-xs"
				>
					<div class="w-3 h-3 rounded-full flex-shrink-0" :style="{ backgroundColor: getVariationColor(index) }"></div>
					<span class="font-medium">{{ getVariationLabel(index) }}</span>
					<span class="text-base-content/60">{{ variation.percentage }}%</span>
				</div>
			</div>

			<!-- Show more indicator -->
			<div v-if="node.config.variations.length > 5" class="text-xs text-base-content/60">
				{{ $t('components.flow.node.summaries.randomizer.andMore', { count: node.config.variations.length - 5 }) }}
			</div>
		</div>

		<NodeSummaryEmptyState v-else :text="$t('components.flow.node.summaries.randomizer.emptyState')" />
	</div>
</template>

<script>
import { Node } from '~/models/Flow/Node.js'
import NodeSummaryEmptyState from '~/components/Flow/Node/Summaries/NodeSummaryEmptyState.vue'
import { randomizerConstants } from '~/models/Flow/utils/utils.ts'

export default {
	components: { NodeSummaryEmptyState },
	props: {
		node: {
			type: Node,
			required: true,
		},
	},
	data() {
		return {
			variationColors: randomizerConstants.variationColors,
			variationLabels: randomizerConstants.variationLabels,
		}
	},
	computed: {
		visibleVariations() {
			if (!this.node.config.variations) return []
			return this.node.config.variations.slice(0, 5)
		},
	},
	methods: {
		getVariationColor(index) {
			return this.variationColors[index % this.variationColors.length]
		},

		getVariationLabel(index) {
			return this.variationLabels[index % this.variationLabels.length]
		},
	},
}
</script>
