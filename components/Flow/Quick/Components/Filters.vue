<template>
	<div class="flex flex-col" v-auto-animate>
		<!-- Keyword Filter -->
		<QuickFlowElement
			:is-selected="filterOptions.filterByWords"
			:show-content="filterOptions.filterByWords"
			class="rounded-b-none"
		>
			<template #leading>
				<input
					:checked="filterOptions.filterByWords"
					:type="requireOne ? 'radio' : 'checkbox'"
					:class="requireOne ? 'radio radio-sm' : 'checkbox checkbox-sm'"
					@click.stop
					@change="toggleFilter('words')"
				/>
			</template>
			<template #title>
				{{ $t('components.flow.node.triggers.receivedDM.filterMessages.title') }}
			</template>
			<template #content>
				<FilterRuleBuilder :options="filterOptions.wordFilters" />
			</template>
		</QuickFlowElement>

		<!-- AI Filter -->
		<QuickFlowElement
			:is-selected="filterOptions.filterByIntent"
			:show-content="filterOptions.filterByIntent"
			class="rounded-t-none"
		>
			<template #leading>
				<input
					:checked="filterOptions.filterByIntent"
					:type="requireOne ? 'radio' : 'checkbox'"
					:class="requireOne ? 'radio radio-sm' : 'checkbox checkbox-sm'"
					@click.stop
					@change="toggleFilter('intent')"
				/>
			</template>
			<template #title>
				<span class="flex items-center gap-2">
					{{ $t('components.flow.node.triggers.receivedDM.aiFilters.title') }}
					<ProBadge />
				</span>
			</template>
			<template #content>
				<AiRuleBuilder :options="filterOptions.intentFilter" />
			</template>
		</QuickFlowElement>
	</div>
</template>
<script>
import FilterRuleBuilder from '~/components/Flow/Node/Triggers/Partials/FilterRuleBuilder.vue'
import AiRuleBuilder from '~/components/Flow/Node/Triggers/Partials/AiRuleBuilder.vue'
import SentimentScoreFilterBuilder from '~/components/Flow/Node/Triggers/Partials/SentimentScoreFilterBuilder.vue'
import SentimentAnalysisFilterBuilder from '~/components/Flow/Node/Triggers/Partials/SentimentAnalysisFilterBuilder.vue'
import ProBadge from '~/components/Flow/AddNodePartials/ProBadge.vue'
import QuickFlowElement from '~/components/Flow/Quick/Components/QuickFlowElement.vue'

export default {
	components: {
		QuickFlowElement,
		ProBadge,
		FilterRuleBuilder,
		AiRuleBuilder,
		SentimentScoreFilterBuilder,
		SentimentAnalysisFilterBuilder,
	},
	props: {
		filterOptions: {
			type: Object,
			required: true,
		},
		requireOne: {
			type: Boolean,
			default: false,
		},
	},
	data() {
		return {
			inputName: useId(),
		}
	},
	computed: {
		selectedFilter: {
			get() {
				if (this.filterOptions.filterByWords) return 'words'
				if (this.filterOptions.filterByIntent) return 'intent'
				return null
			},
			set(val) {
				this.filterOptions.filterByWords = val === 'words'
				this.filterOptions.filterByIntent = val === 'intent'
			},
		},
	},
	methods: {
		toggleFilter(filter) {
			if (this.requireOne) {
				this.selectedFilter = filter
				return
			}
			this.selectedFilter = this.selectedFilter === filter ? null : filter
		},
	},
	mounted() {
		// if (this.requireOne && !this.filterOptions.filterByWords && !this.filterOptions.filterByIntent) {
		// 	this.filterOptions.filterByWords = true
		// }
	},
}
</script>
