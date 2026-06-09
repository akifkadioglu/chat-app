<template>
	<CustomToggleSwitch
		v-model="config.filterComments"
		:title="$t('components.flow.node.triggers.partials.filterComments.title')"
		:description="$t('components.flow.node.triggers.partials.filterComments.description')"
		icon-class="fa fa-filter"
	>
		<div v-auto-animate>
			<div v-if="config.filterComments" class="pb-5 mt-5 flex flex-col gap-3">
				<Filters :filterOptions="config.filters" showSentimentFilters />

				<!--				<div class="my-4">-->
				<!--					<label class="block">-->
				<!--						<i class="fa fa-plus text-success mr-1" />-->
				<!--						{{ $t('components.flow.node.triggers.partials.filterComments.mustIncludeWords') }}-->
				<!--					</label>-->
				<!--					<p class="mb-2 text-xs text-muted">-->
				<!--						<i18n-t keypath="components.flow.node.triggers.partials.filterComments.mustIncludeWordsDescription">-->
				<!--							<template #bold>-->
				<!--								<b class="font-extrabold">{{-->
				<!--									$t('components.flow.node.triggers.partials.filterComments.atLeastOne')-->
				<!--								}}</b>-->
				<!--							</template>-->
				<!--						</i18n-t>-->
				<!--					</p>-->
				<!--					<TagsInput-->
				<!--						v-model="config.filters.includes"-->
				<!--						:placeholder="$t('components.flow.node.triggers.partials.filterComments.keywordPlaceholder')"-->
				<!--						:add-button-text="$t('components.flow.node.triggers.partials.filterComments.addButton')"-->
				<!--					/>-->
				<!--				</div>-->

				<!--				<div class="my-4">-->
				<!--					<label class="block">-->
				<!--						<i class="fa fa-minus text-error mr-1" />-->
				<!--						{{ $t('components.flow.node.triggers.partials.filterComments.excludedKeywords') }}-->
				<!--					</label>-->
				<!--					<p class="mb-2 text-xs text-muted">-->
				<!--						<i18n-t keypath="components.flow.node.triggers.partials.filterComments.excludedKeywordsDescription">-->
				<!--							<template #bold>-->
				<!--								<b class="font-extrabold">{{-->
				<!--									$t('components.flow.node.triggers.partials.filterComments.anyOfThese')-->
				<!--								}}</b>-->
				<!--							</template>-->
				<!--						</i18n-t>-->
				<!--					</p>-->
				<!--					<TagsInput-->
				<!--						v-model="config.filters.excludes"-->
				<!--						:placeholder="$t('components.flow.node.triggers.partials.filterComments.keywordPlaceholder')"-->
				<!--						icon-class=""-->
				<!--						:add-button-text="$t('components.flow.node.triggers.partials.filterComments.addButton')"-->
				<!--					/>-->
				<!--				</div>-->
			</div>
		</div>
	</CustomToggleSwitch>
</template>
<script>
import TagsInput from '~/components/GlobalComponents/TagsInput.vue'
import { optionTypes } from '~/models/Flow/utils/utils.js'
import CustomToggleSwitch from '~/components/Flow/Node/Triggers/Partials/CustomToggleSwitch.vue'
import AiRuleBuilder from '~/components/Flow/Node/Triggers/Partials/AiRuleBuilder.vue'
import FilterRuleBuilder from '~/components/Flow/Node/Triggers/Partials/FilterRuleBuilder.vue'
import ProBadge from '~/components/Flow/AddNodePartials/ProBadge.vue'
import Filters from '~/components/Flow/Node/Triggers/Partials/Filters.vue'

export default {
	components: { Filters, ProBadge, FilterRuleBuilder, AiRuleBuilder, CustomToggleSwitch, TagsInput },
	props: {
		config: {
			type: Object,
			required: true,
		},
	},
	data() {
		return {
			optionTypes,
		}
	},
}
</script>
