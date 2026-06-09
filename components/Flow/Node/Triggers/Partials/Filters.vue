<template>
	<div class="flex flex-col gap-4">
		<CustomToggleSwitch
			v-model="filterOptions.filterByWords"
			:title="$t('components.flow.node.triggers.receivedDM.filterMessages.title')"
			:description="$t('components.flow.node.triggers.receivedDM.filterMessages.description')"
			class="border border-muted rounded-xl shadow-xs px-3 py-4 overflow-hidden"
			icon-class="fa fa-filter"
		>
			<div v-auto-animate>
				<div v-if="filterOptions.filterByWords" class="ps-4 pb-5 mt-5 flex flex-col gap-3">
					<FilterRuleBuilder :options="filterOptions.wordFilters" />
				</div>
			</div>
		</CustomToggleSwitch>

		<CustomToggleSwitch
			v-if="showSentimentFilters"
			v-model="filterOptions.filterBySentiment"
			:description="$t('components.flow.node.triggers.receivedDM.sentimentFilter.description')"
			class="border border-muted rounded-xl shadow-xs px-3 py-4 overflow-hidden"
			icon-class="fa fa-face-smile"
		>
			<template #title>
				<div>
					{{ $t('components.flow.node.triggers.receivedDM.sentimentFilter.title') }}
					<ProBadge class="ml-2" />
				</div>
			</template>
			<div v-auto-animate>
				<div v-if="filterOptions.filterBySentiment" class="ps-4 pb-5 mt-5 flex flex-col gap-3">
					<SentimentFilterTypeSelector :filterOptions="filterOptions" />
				</div>
			</div>
		</CustomToggleSwitch>

		<div class="ai-gradient-border rounded-xl p-[1px]">
			<CustomToggleSwitch
				v-model="filterOptions.filterByIntent"
				:description="$t('components.flow.node.triggers.receivedDM.aiFilters.description')"
				class="bg-base-100 rounded-xl shadow-xs px-3 py-4 overflow-hidden"
				icon-class="fa fa-wand-sparkles"
			>
				<template #title>
					<div>
						{{ $t('components.flow.node.triggers.receivedDM.aiFilters.title') }}
						<ProBadge class="ml-2" />
					</div>
				</template>
				<div v-auto-animate>
					<div v-if="filterOptions.filterByIntent" class="ps-4 pb-5 mt-5 flex flex-col gap-3">
						<AiRuleBuilder :options="filterOptions.intentFilter" />
					</div>
				</div>
			</CustomToggleSwitch>
		</div>
	</div>
</template>
<script>
import FilterRuleBuilder from '~/components/Flow/Node/Triggers/Partials/FilterRuleBuilder.vue'
import AiRuleBuilder from '~/components/Flow/Node/Triggers/Partials/AiRuleBuilder.vue'
import CustomToggleSwitch from '~/components/Flow/Node/Triggers/Partials/CustomToggleSwitch.vue'
import ToggleSwitch from '~/components/Flow/Node/Triggers/Partials/ToggleSwitch.vue'
import ProBadge from '~/components/Flow/AddNodePartials/ProBadge.vue'
import Comparison from '~/components/Flow/Node/Conditions/Comparison.vue'
import SentimentScoreFilterBuilder from '~/components/Flow/Node/Triggers/Partials/SentimentScoreFilterBuilder.vue'
import SentimentAnalysisFilterBuilder from '~/components/Flow/Node/Triggers/Partials/SentimentAnalysisFilterBuilder.vue'
import SentimentFilterTypeSelector from '~/components/Flow/Node/Triggers/Partials/SentimentFilterTypeSelector.vue'

export default {
	name: 'Filters',
	components: {
		SentimentFilterTypeSelector,
		SentimentAnalysisFilterBuilder,
		SentimentScoreFilterBuilder,
		Comparison,
		ProBadge,
		ToggleSwitch,
		CustomToggleSwitch,
		FilterRuleBuilder,
		AiRuleBuilder,
	},
	props: {
		filterOptions: {
			type: Object,
			required: true,
		},
		showSentimentFilters: {
			type: Boolean,
			default: false,
		},
	},
	watch: {
		'filterOptions.filterByIntent'(newVal) {
			if (newVal) {
				this.filterOptions.filterByWords = false
				this.filterOptions.filterBySentiment = false
			}
		},
		'filterOptions.filterByWords'(newVal) {
			if (newVal) {
				this.filterOptions.filterByIntent = false
				this.filterOptions.filterBySentiment = false
			}
		},
		'filterOptions.filterBySentiment'(newVal) {
			if (newVal) {
				this.filterOptions.filterByIntent = false
				this.filterOptions.filterByWords = false
			}
		},
	},
}
</script>
<style scoped>
.ai-gradient-border {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #667eea 100%);
	background-size: 300% 300%;
	animation: gradient-shift 5s ease infinite;
}

@keyframes gradient-shift {
	0% {
		background-position: 0% 50%;
	}
	50% {
		background-position: 100% 50%;
	}
	100% {
		background-position: 0% 50%;
	}
}
</style>
