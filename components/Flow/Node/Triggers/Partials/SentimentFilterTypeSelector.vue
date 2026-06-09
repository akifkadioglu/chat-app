<template>
	<div class="flex flex-col">
		<!-- Analysis Option -->
		<QuickFlowElement
			:is-selected="filterOptions.sentimentFilter.filterByAnalysis"
			:show-content="filterOptions.sentimentFilter.filterByAnalysis"
			class="rounded-b-none"
		>
			<template #leading>
				<input
					type="radio"
					:name="inputName"
					:checked="filterOptions.sentimentFilter.filterByAnalysis"
					@change="selectAnalysis"
					class="radio radio-primary radio-sm"
				/>
			</template>
			<template #title>
				<i class="fa fa-face-smile mr-1"></i>
				{{ $t('components.flow.node.triggers.receivedDM.sentimentFilter.analysisOption') }}
			</template>
			<template #content>
				<SentimentAnalysisFilterBuilder :options="filterOptions.sentimentFilter.analysisFilter" />
			</template>
		</QuickFlowElement>

		<!-- Score Option -->
		<QuickFlowElement
			:is-selected="filterOptions.sentimentFilter.filterByScore"
			:show-content="filterOptions.sentimentFilter.filterByScore"
			class="rounded-t-none"
		>
			<template #leading>
				<input
					type="radio"
					:name="inputName"
					:checked="filterOptions.sentimentFilter.filterByScore"
					@change="selectScore"
					class="radio radio-primary radio-sm"
				/>
			</template>
			<template #title>
				<i class="fa fa-star mr-1"></i>
				{{ $t('components.flow.node.triggers.receivedDM.sentimentFilter.scoreOption') }}
			</template>
			<template #content>
				<SentimentScoreFilterBuilder :options="filterOptions.sentimentFilter.scoreFilter" />
			</template>
		</QuickFlowElement>
	</div>
</template>

<script>
import SentimentAnalysisFilterBuilder from '~/components/Flow/Node/Triggers/Partials/SentimentAnalysisFilterBuilder.vue'
import SentimentScoreFilterBuilder from '~/components/Flow/Node/Triggers/Partials/SentimentScoreFilterBuilder.vue'
import QuickFlowElement from '~/components/Flow/Quick/Components/QuickFlowElement.vue'

export default {
	components: { QuickFlowElement, SentimentScoreFilterBuilder, SentimentAnalysisFilterBuilder },
	props: {
		filterOptions: {
			type: Object,
			default: () => ({}),
		},
	},
	data() {
		return {
			inputName: useId(),
		}
	},
	methods: {
		selectAnalysis() {
			this.filterOptions.sentimentFilter.filterByAnalysis = true
			this.filterOptions.sentimentFilter.filterByScore = false
		},
		selectScore() {
			this.filterOptions.sentimentFilter.filterByAnalysis = false
			this.filterOptions.sentimentFilter.filterByScore = true
		},
	},
}
</script>
