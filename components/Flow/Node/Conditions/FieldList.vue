<template>
	<div>
		<!-- Header -->
		<div class="p-3 border-b border-base-300 h-[60px]">
			<div class="relative">
				<i class="fa fa-search absolute left-2.5 top-1/2 transform -translate-y-1/2 text-base-content/50 text-sm" />
				<input
					type="text"
					v-model="searchQuery"
					:placeholder="$t('components.flow.node.conditions.fieldSelector.searchPlaceholder')"
					class="input input-sm input-bordered w-full pl-8 bg-primary/5 border-primary/20 focus:border-primary text-sm"
				/>
			</div>
		</div>

		<div class="flex h-65">
			<!-- Left Sidebar - Categories -->
			<div class="w-1/3 border-r border-base-300 p-2 overflow-y-auto">
				<button
					v-for="category in categories"
					:key="category.key"
					@click="selectedCategoryKey = category.key"
					class="w-full text-left px-2 py-1.5 rounded text-sm transition-colors"
					:class="[
						selectedCategoryKey === category.key
							? 'bg-primary/10 text-primary font-medium'
							: 'hover:bg-base-200 text-base-content',
					]"
				>
					{{ $t(`components.flow.node.conditions.categories.${category.key}`) }}
				</button>
			</div>

			<!-- Right Content - Conditions -->
			<div class="flex-1 h-full overflow-y-auto">
				<div v-if="selectedCategoryKey === 'custom' && customFieldsLoading" class="flex justify-center py-8">
					<span class="loading loading-spinner loading-sm"></span>
				</div>
				<ul class="menu w-full" v-else-if="filteredConditions.length > 0">
					<li v-for="condition in filteredConditions" :key="condition.key" class="">
						<a class="block w-full" @click="selectCondition(condition)">
							<div class="flex items-center justify-start gap-2">
								<i :class="['fa fa-lg', condition.icon]"></i>
								<div class="text-sm">
									{{ condition.name }}
								</div>

								<ProBadge v-if="condition.needsPro && !skipProCheck" />
							</div>
							<span class="text-xs text-base-content/60 leading-tight">
								{{ condition.description }}
							</span>
						</a>
					</li>
				</ul>

				<!--				<div class="divider my-0" v-if="filteredConditions.length > 0" />-->
				<!-- Add Custom Field Section - Only show for custom category -->
				<div v-if="selectedCategoryKey === 'custom' && chatAccount">
					<div class="px-2 py-2">
						<span
							v-if="!showAddCustomField"
							@click.prevent.stop="showAddCustomField = true"
							class="btn btn-transition btn-ghost btn-primary btn-sm"
						>
							<i class="fa fa-plus text-sm"></i>
							<span class="text-xs font-medium">
								{{ $t('components.flow.node.conditions.fieldSelector.addCustomField') }}
							</span>
						</span>
						<div v-else @click.stop>
							<CustomFieldCreator
								:chatAccountId="chatAccount.id"
								@customFieldCreated="showAddCustomField = false"
								@customFieldCancelled="showAddCustomField = false"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { conditionCategories, conditionMetadata, fieldTypes } from '~/models/Flow/utils/utils'
import ProBadge from '~/components/Flow/AddNodePartials/ProBadge.vue'
import CustomFieldCreator from '~/components/Flow/Node/Conditions/CustomFieldCreator.vue'

export default {
	name: 'FieldList',
	components: {
		CustomFieldCreator,
		ProBadge,
	},
	props: {
		excludeTypes: {
			type: Array,
			default: () => [],
		},
		hideSocialFields: {
			type: Boolean,
			default: false,
		},
		hideTag: {
			type: Boolean,
			default: false,
		},
		hideNonFilterable: {
			type: Boolean,
			default: false,
		},
		skipProCheck: {
			type: Boolean,
			default: false,
		},
		showCommentFields: {
			type: Boolean,
			default: false,
		},
		customFields: {
			type: Array,
			default: null,
		},
		customFieldsLoading: {
			type: Boolean,
			default: false,
		},
	},
	data() {
		return {
			searchQuery: '',
			selectedCategoryKey: 'recommended',
			expandedSections: {
				instagram: false,
			},
			loading: false,
			showAddCustomField: false,
			newFieldKey: '',
			newFieldType: fieldTypes.STRING,
			createCustomFieldLoading: false,
		}
	},
	setup() {
		return {
			flowStore: useFlowStore(),
			chatAccountAttributesStore: useChatAccountAttributesStore(),
			chatAccountsStore: useChatAccountsStore(),
		}
	},
	computed: {
		categories() {
			return Object.fromEntries(
				Object.entries(conditionCategories).filter(([key]) => {
					if (this.hideSocialFields && key === conditionCategories.instagram.key) return false
					if (!this.showCommentFields && key === conditionCategories.comment.key) return false
					// if (!this.customItems?.length && key === conditionCategories.custom.key) return false
					return true
				}),
			)
		},
		filteredConditions() {
			let localConditionCategories = this.categories
			if (this.selectedCategoryKey === localConditionCategories.custom?.key) {
				return this.customItems || []
			}
			const selectedCategory = localConditionCategories[this.selectedCategoryKey]
			if (!selectedCategory?.conditionKeys) return []
			return selectedCategory.conditionKeys
				.map((key) => {
					return {
						...conditionMetadata[key],
						name: this.$t('components.flow.node.conditions.fields.' + key + '.name'),
						description: this.$t('components.flow.node.conditions.fields.' + key + '.description'),
					}
				})
				.filter((condition) => !this.excludeTypes.includes(condition.type))
				.filter((condition) => {
					return !(this.hideTag && condition.key === 'tag')
				})
				.filter((condition) => {
					if (this.hideSocialFields && conditionCategories.instagram.conditionKeys.includes(condition.key)) {
						return false
					}
					return true
				})
				.filter((condition) => {
					if (!this.showCommentFields && conditionCategories.comment.conditionKeys.includes(condition.key)) {
						return false
					}
					return true
				})
				.filter((condition) => {
					if (this.hideNonFilterable && condition.filterable === false) {
						return false
					}
					return true
				})
				.filter(
					(condition) =>
						condition.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
						condition.description.toLowerCase().includes(this.searchQuery.toLowerCase()),
				)
		},
		chatAccount() {
			return this.chatAccountsStore.active || null
		},
		customItems() {
			return this.customFields || []
		},
	},
	mounted() {
		if (this.selectedCategoryKey === 'system') {
			this.expandedSections.instagram = true
		}
	},
	watch: {
		selectedCategoryKey(newCategory) {
			if (newCategory === 'system') {
				this.expandedSections.instagram = true
			}
		},
	},
	emits: ['fieldSelected'],
	methods: {
		selectCondition(condition) {
			if (!this.skipProCheck && condition.needsPro && !this.chatAccount?.subscribed) {
				this.$emitter.emit('showUpgradeModal', {
					chatAccount: this.chatAccount,
					feature: 'addField',
				})
				return
			}

			this.$emit('fieldSelected', condition)
		},
	},
}
</script>

<style scoped></style>
