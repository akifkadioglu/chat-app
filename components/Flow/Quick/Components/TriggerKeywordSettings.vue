<template>
	<div class="space-y-5">
		<div class="list space-y-1">
			<div class="font-semibold text-gray-600">
				{{ $t('components.flow.quick.components.triggerKeywordSettings.title') }}
			</div>
			<QuickFlowElement
				:title="$t('components.flow.quick.components.triggerKeywordSettings.specificWordLabel')"
				is-input-left
				:is-selected="config.filterComments && config.filters.filterByWords"
				v-model="filterOption"
			>
				<template #content>
					<div class="space-y-2">
						<TagsInput
							v-model="containsKeywords.keywords"
							:placeholder="$t('components.flow.node.triggers.receivedDM.keywordPlaceholder')"
							icon-class=""
							:add-button-text="$t('components.flow.node.triggers.receivedDM.addButton')"
							add-button-class="btn-success"
							badge-class="badge-success"
						/>
					</div>
				</template>
				<template #leading>
					<input
						v-model="filterOption"
						value="specificWords"
						class="radio radio-sm"
						type="radio"
						name="triggerFlowSettings"
					/>
				</template>
			</QuickFlowElement>
			<QuickFlowElement
				is-input-left
				:title="$t('components.flow.quick.components.triggerKeywordSettings.anyWordLabel')"
			>
				<template #leading>
					<input
						v-model="filterOption"
						value="anyWords"
						class="radio radio-sm"
						type="radio"
						name="triggerFlowSettings"
					/>
				</template>
			</QuickFlowElement>

			<QuickFlowElement is-input-left :is-selected="config.filterComments && config.filters.filterByIntent">
				<template #title>
					{{ $t('components.flow.quick.components.triggerKeywordSettings.intentLabel') }}
					<ProBadge class="ml-4 align-baseline" />
				</template>
				<template #content>
					<AiRuleBuilder :options="config.filters.intentFilter" class="border-none p-0" />
				</template>
				<template #leading>
					<input v-model="filterOption" value="intent" class="radio radio-sm" type="radio" name="triggerFlowSettings" />
				</template>
			</QuickFlowElement>
		</div>
	</div>
</template>
<script>
import SelectMedia from '~/components/Flow/Node/Triggers/Partials/SelectMedia.vue'
import TagsInput from '~/components/GlobalComponents/TagsInput.vue'
import QuickFlowElement from '~/components/Flow/Quick/Components/QuickFlowElement.vue'
import AiRuleBuilder from '~/components/Flow/Node/Triggers/Partials/AiRuleBuilder.vue'
import ProBadge from '~/components/Flow/AddNodePartials/ProBadge.vue'
export default {
	components: { ProBadge, AiRuleBuilder, QuickFlowElement, TagsInput, SelectMedia },
	props: {
		config: {
			type: Object,
			default: () => ({}),
		},
		filterType: {
			type: String,
			default: 'filterComments',
		},
	},
	data() {
		let filterOption = 'anyWords'
		if (this.config.filterComments) {
			if (this.config.filters.filterByWords) {
				filterOption = 'specificWords'
			} else if (this.config.filters.filterByIntent) {
				filterOption = 'intent'
			}
		}
		return {
			filterOption,
		}
	},
	watch: {
		filterOption(newVal) {
			if (newVal === 'anyWords') {
				this.config.filterComments = false
			}

			if (newVal === 'specificWords') {
				this.config.filterComments = true
				this.config.filters.filterByIntent = false
				this.config.filters.filterByWords = true
			}

			if (newVal === 'intent') {
				this.config.filterComments = true
				this.config.filters.filterByIntent = true
				this.config.filters.filterByWords = false
			}
		},
	},
	computed: {
		configFilterType: {
			get() {
				return this.config[this.filterType]
			},
			set(value) {
				this.config[this.filterType] = value

				this.config.filters.filterByWords = value
			},
		},
		containsKeywords() {
			return this.config.filters.wordFilters?.find((t) => t.type === 'contains')
		},
	},
}
</script>
