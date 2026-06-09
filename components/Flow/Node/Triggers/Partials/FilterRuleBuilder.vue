<template>
	<div class="flex flex-col gap-3">
		<!-- Filter Rules List -->
		<div v-for="(rule, index) in options" :key="index" class="flex flex-col gap-2">
			<!-- AND Connector (except for first rule) -->
			<div v-if="index > 0" class="flex items-center gap-2 my-1">
				<div class="h-px bg-base-content/10 flex-1"></div>
				<span class="text-xs font-semibold text-base-content/60 px-2">AND</span>
				<div class="h-px bg-base-content/10 flex-1"></div>
			</div>

			<!-- Rule Card -->
			<div class="flex items-start gap-2">
				<div class="flex flex-col items-baseline gap-2 w-full">
					<div class="w-full">
						<!-- Rule Type Selector -->
						<div class="flex w-full gap-1">
							<CustomDropdown class="w-full flex-1" ref="ruleTypeDropdown" placement="bottom-start">
								<button class="btn btn-outline border-muted btn-sm justify-between truncate w-full">
									<span class="text-nowrap truncate">
										{{ $t(`components.flow.node.triggers.receivedDM.filterRules.${rule.type}`) }}
									</span>
									<i class="fa fa-chevron-down text-xs" />
								</button>
								<template #popper="{ hide }" v-if="availableTypes.length > 0">
									<ul class="menu bg-base-100 rounded-box shadow-lg min-w-48 p-2">
										<li v-for="type in availableTypes" :key="type">
											<button
												@click="updateRuleType(index, type)"
												:disabled="isTypeUsedBefore(index, type)"
												class="btn btn-ghost w-full justify-start"
												:class="{ active: rule.type === type }"
											>
												{{ $t(`components.flow.node.triggers.receivedDM.filterRules.${type}`) }}
											</button>
										</li>
									</ul>
								</template>
							</CustomDropdown>

							<!-- Remove Button -->
							<button
								@click="removeRule(index)"
								:disabled="index === 0"
								class="btn btn-sm btn-ghost btn-square btn-error"
								:title="$t('components.flow.node.triggers.receivedDM.filterRules.removeRule')"
							>
								<i class="fa fa-trash" />
							</button>
						</div>
						<!-- Rule Description -->
						<p class="mt-2 text-xs text-muted">
							<i class="fa fa-info-circle text-info" />
							<span v-if="rule.type === 'contains'">
								{{ $t('components.flow.node.triggers.receivedDM.filterRules.containsDescription') }}
							</span>
							<span v-else-if="rule.type === 'doesNotContain'">
								{{ $t('components.flow.node.triggers.receivedDM.filterRules.doesNotContainDescription') }}
							</span>
							<span v-else-if="rule.type === 'beginsWith'">
								{{ $t('components.flow.node.triggers.receivedDM.filterRules.beginsWithDescription') }}
							</span>
							<span v-else-if="rule.type === 'containsWholeWord'">
								{{ $t('components.flow.node.triggers.receivedDM.filterRules.containsWholeWordDescription') }}
							</span>
						</p>
					</div>

					<div class="flex-1 w-full">
						<div class="flex flex-wrap mt-2 gap-2">
							<div
								v-for="(tag, tagIndex) in rule.keywords"
								:key="`tag-${tagIndex}`"
								class="badge badge-sm badge-soft gap-2 cursor-pointer"
								@click="rule.keywords.splice(tagIndex, 1)"
							>
								{{ tag }}
								<i class="fa fa-times-circle text-xs" />
							</div>
						</div>
						<!-- Keywords Input -->
						<TagsInput
							ref="TagsInput"
							v-model="rule.keywords"
							class="w-full"
							:showTags="false"
							:placeholder="$t('components.flow.node.triggers.receivedDM.keywordPlaceholder')"
							:add-button-text="$t('components.flow.node.triggers.receivedDM.addButton')"
						/>
						<div v-if="getSuggestedKeywords(rule.type).length > 0">
							<small>{{ $t('components.flow.node.triggers.receivedDM.filterRules.suggestedKeywordsLabel') }}</small>
							<div class="flex flex-wrap mt-2 gap-2">
								<div
									v-for="(tag, tagIndex) in getSuggestedKeywords(rule.type)"
									:key="`tag-${tagIndex}`"
									class="badge badge-sm badge-soft badge-info gap-2 cursor-pointer"
									@click="rule.keywords.push(tag)"
								>
									{{ tag }}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Add New Rule Button -->
		<div class="text-start w-full">
			<button @click="addRule" class="btn btn-sm btn-ghost btn-primary gap-2" :disabled="availableTypes.length === 0">
				<i class="fa fa-plus"></i>
				{{ $t('components.flow.node.triggers.receivedDM.filterRules.addRule') }}
			</button>
		</div>
	</div>
</template>

<script>
import TagsInput from '~/components/GlobalComponents/TagsInput.vue'
import CustomDropdown from '~/components/GlobalComponents/CustomDropdown.vue'
import { triggerFilterOperators } from '~/models/Flow/utils/utils.ts'

export default {
	components: { CustomDropdown, TagsInput },
	props: {
		options: {
			type: Object,
		},
	},
	data() {
		return {
			allTypes: triggerFilterOperators,
		}
	},
	computed: {
		availableTypes() {
			const usedTypes = this.options ? this.options.map((rule) => rule.type) : []

			return this.allTypes.filter((type) => !usedTypes.includes(type))
		},
		// canRemoveRule() {
		// 	return (index) => {
		// 		const totalRules = this.options.length
		// 		const currentRule = this.options[index]
		//
		// 		if (totalRules === 1) {
		// 			return false
		// 		}
		//
		// 		if (totalRules === 2) {
		// 			const hasDoesNotContainRule = this.options.some((rule) => rule.type === 'doesNotContain')
		// 			if (hasDoesNotContainRule && currentRule.type !== 'doesNotContain') {
		// 				return false
		// 			}
		// 		}
		//
		// 		return true
		// 	}
		// },
	},
	methods: {
		getSuggestedKeywords(ruleType) {
			if (ruleType !== 'contains') return []

			return ['link', 'info', 'price', 'order', 'help']
				.map((keyword) => this.$t(`components.flow.node.triggers.receivedDM.filterRules.suggestedKeywords.${keyword}`))
				.filter((keyword) => !this.options.some((rule) => rule.keywords.includes(keyword) && rule.type === 'contains'))
		},
		isTypeUsedBefore(currentIndex, type) {
			return this.options.some((rule, index) => {
				return rule.type === type
			})
		},
		// shouldDisableDoesNotContain(type) {
		// 	if (type !== 'doesNotContain') return false
		// 	return this.options.length <= 1
		// },
		addRule() {
			// Kullanılmayan ilk type'ı al, yoksa contains kullan
			if (this.availableTypes.length === 0) {
				return
			}

			const newType = this.availableTypes[0]

			this.options.push({
				type: newType,
				keywords: [],
			})
		},
		removeRule(index) {
			this.options.splice(index, 1)
		},
		updateRuleType(index, newType) {
			if (this.isTypeUsedBefore(index, newType)) {
				return
			}
			this.$refs.ruleTypeDropdown[index].hide()
			this.options[index].type = newType
		},
	},
}
</script>
