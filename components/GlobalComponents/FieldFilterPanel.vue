<template>
	<div>
		<!-- Active Filters -->
		<div v-if="activeFilters.length && !selectedField" class="border-b border-base-300 p-3 bg-base-100">
			<div class="text-xs text-muted mb-2">{{ $t('components.contacts.filterList.activeFilters') }}</div>
			<div class="flex flex-wrap gap-1">
				<div
					v-for="(filter, index) in activeFilters"
					:key="index"
					class="badge badge-soft gap-1 cursor-pointer hover:bg-base-200"
					@click="editFilter(index)"
				>
					<i class="fa fa-edit text-xs" />
					<span>
						{{ filter.name }} {{ getOperatorLabel(filter.operator) }}
						<template v-if="filter.field === 'comment.intent'">
							{{ $t('models.comments.intents.' + filter.value) }}
						</template>
						<template v-else>
							{{ filter.value }}
						</template>
					</span>
					<i class="fa fa-times text-xs" @click.stop="removeFilter(index)" />
				</div>
			</div>
		</div>

		<!-- Field Selection -->
		<div v-if="!selectedField" class="bg-base-100 rounded-lg">
			<FieldList
				:showCommentFields="showCommentFields"
				:customFields="customFields"
				@fieldSelected="onFieldSelected"
				skipProCheck
				hideNonFilterable
			/>
		</div>

		<!-- Filter Builder -->
		<div v-else class="p-4 space-y-3">
			<div class="flex items-center gap-2">
				<button class="btn btn-xs btn-ghost" @click="resetSelection">
					<i class="fa fa-chevron-left" />
				</button>
				<i :class="selectedFieldData.icon" class="text-primary" />
				<span class="font-medium">{{ selectedFieldData.name }}</span>
			</div>

			<div class="flex gap-2 items-baseline">
				<!-- Operator Dropdown -->
				<CustomDropdown ref="operatorDropdown" placement="bottom-start" class="shrink-0">
					<button class="btn btn-sm btn-outline border-base-300 min-w-32 justify-between">
						<span>{{ getOperatorLabel(selectedOperator) }}</span>
						<i class="fa fa-chevron-down text-xs"></i>
					</button>
					<template #popper>
						<ul class="menu bg-base-100 rounded-lg p-2">
							<li v-for="op in availableOperators" :key="op">
								<a @click="selectOperator(op)" :class="{ active: selectedOperator === op }">
									{{ getOperatorLabel(op) }}
								</a>
							</li>
						</ul>
					</template>
				</CustomDropdown>

				<!-- Value Input -->
				<template v-if="needsValue">
					<input
						v-if="selectedFieldData?.comparisonType === 'string'"
						v-model="filterValue"
						type="text"
						class="input input-sm input-bordered flex-1"
						:placeholder="selectedFieldData.name"
						@keyup.enter="applyFilter"
					/>
					<input
						v-else-if="selectedFieldData?.comparisonType === 'integer' || selectedFieldData?.comparisonType === 'score'"
						v-model.number="filterValue"
						type="number"
						class="input input-sm input-bordered flex-1"
						:placeholder="selectedFieldData.name"
						@keyup.enter="applyFilter"
					/>
					<input
						v-else-if="
							selectedFieldData?.comparisonType === 'date' &&
							(selectedOperator === 'within_days' || selectedOperator === 'older_than_days')
						"
						v-model.number="filterValue"
						type="number"
						class="input input-sm input-bordered flex-1"
						:placeholder="$t('components.flow.node.conditions.comparison.dayCountPlaceholder')"
						@keyup.enter="applyFilter"
					/>
					<input
						v-else-if="selectedFieldData?.comparisonType === 'date'"
						v-model="filterValue"
						type="date"
						class="input input-sm input-bordered flex-1"
						@keyup.enter="applyFilter"
					/>
					<div v-else-if="selectedFieldData?.comparisonType === 'tag'" class="w-full">
						<input
							v-model="filterValue"
							type="text"
							class="input input-sm input-bordered flex-1"
							:placeholder="$t('components.flow.node.conditions.comparison.tagNamePlaceholder')"
							@keyup.enter="applyFilter"
						/>
					</div>
					<div v-else-if="selectedFieldData?.comparisonType === 'intent'" class="w-full">
						<CustomDropdown ref="intentDropdown" class="w-full">
							<button class="btn btn-sm btn-outline border-base-300 w-full justify-between">
								<span v-if="filterValue">{{ $t('models.comments.intents.' + filterValue) }}</span>
								<span v-else class="text-muted">
									{{ $t('components.flow.node.conditions.comparison.selectIntent') }}
								</span>
								<i class="fa fa-chevron-down text-xs"></i>
							</button>
							<template #popper>
								<ul class="menu flex-nowrap bg-base-100 rounded-lg p-2 min-w-56 max-h-64 overflow-y-auto">
									<li v-for="intent in availableIntents" :key="intent">
										<a @click="selectIntent(intent)" :class="{ active: filterValue === intent }">
											<div class="flex flex-col">
												<span class="font-medium">{{ $t('models.comments.intents.' + intent) }}</span>
											</div>
										</a>
									</li>
								</ul>
							</template>
						</CustomDropdown>
					</div>
					<input
						v-else
						v-model="filterValue"
						type="text"
						class="input input-sm input-bordered flex-1"
						:placeholder="selectedFieldData.name"
						@keyup.enter="applyFilter"
					/>
				</template>
			</div>

			<div v-if="needsValue && selectedFieldData?.comparisonType === 'tag'">
				<slot name="tagList" />
			</div>

			<div class="flex gap-2">
				<button v-if="editingIndex !== null" class="btn btn-sm btn-soft flex-1" @click="resetSelection">
					{{ $t('components.contacts.filterList.cancel') }}
				</button>
				<button
					class="btn btn-sm btn-primary btn-transition flex-1"
					:disabled="needsValue && !filterValue"
					@click="applyFilter"
				>
					<span v-if="editingIndex !== null">{{ $t('components.contacts.filterList.save') }}</span>
					<span v-else>{{ $t('components.contacts.filterList.addFilter') }}</span>
				</button>
			</div>
		</div>
	</div>
</template>

<script>
import CustomDropdown from '~/components/GlobalComponents/CustomDropdown.vue'
import FieldList from '~/components/Flow/Node/Conditions/FieldList.vue'
import { comparisonOperators, conditionMetadata, noValueOperators } from '~/models/Flow/utils/utils.ts'
import FilterMixin from '~/mixins/FilterMixin.js'

export default {
	name: 'FieldFilterPanel',
	mixins: [FilterMixin],
	components: { CustomDropdown, FieldList },
	props: {
		customFields: {
			type: Array,
			default: () => [],
		},
		showCommentFields: {
			type: Boolean,
			default: false,
		},
	},
	emits: ['filtersChange', 'update:filterCount', 'update:isEditing'],
	data() {
		return {
			selectedField: null,
			selectedFieldData: null,
			selectedOperator: null,
			filterValue: '',
			activeFilters: [],
			editingIndex: null,
		}
	},
	computed: {
		availableOperators() {
			const type = this.selectedFieldData?.comparisonType || 'string'
			return comparisonOperators[type] || comparisonOperators.string
		},
		needsValue() {
			return !noValueOperators.includes(this.selectedOperator)
		},
		availableIntents() {
			return [
				'question',
				'complaint',
				'compliment',
				'request',
				'support',
				'purchase',
				'information',
				'feedback',
				'spam',
				'giveaway_entry',
				'collaboration',
			]
		},
	},
	mounted() {
		this.loadFiltersFromRoute()
	},
	watch: {
		'$route.query': {
			handler() {
				this.loadFiltersFromRoute()
			},
			deep: true,
		},
		'activeFilters.length': {
			handler(val) {
				this.$emit('update:filterCount', val)
			},
			immediate: true,
		},
		selectedField(val) {
			this.$emit('update:isEditing', !!val)
		},
	},
	methods: {
		onFieldSelected(condition) {
			this.selectedField = condition.key
			this.selectedFieldData = condition
			const type = condition.comparisonType || 'string'
			this.selectedOperator = comparisonOperators[type]?.[0] || comparisonOperators.string[0]
			this.filterValue = ''
		},
		selectOperator(op) {
			this.selectedOperator = op
			this.$refs.operatorDropdown.hide()
		},
		selectIntent(intentKey) {
			this.filterValue = intentKey
			this.$refs.intentDropdown.hide()
		},
		applyFilter() {
			if (!this.selectedField) return
			if (this.needsValue && !this.filterValue) return

			const filterData = {
				field: this.selectedField,
				name: this.selectedFieldData?.name || this.selectedField,
				icon: this.selectedFieldData?.icon,
				comparisonType: this.selectedFieldData?.comparisonType || 'string',
				operator: this.selectedOperator,
				value: this.filterValue,
			}

			if (this.editingIndex !== null) {
				this.activeFilters.splice(this.editingIndex, 1, filterData)
			} else {
				this.activeFilters.push(filterData)
			}

			this.$emit('filtersChange', this.activeFilters)
			this.updateRouteQuery()
			this.resetSelection()
		},
		removeFilter(index) {
			this.activeFilters.splice(index, 1)
			this.$emit('filtersChange', this.activeFilters)
			this.updateRouteQuery()
		},
		editFilter(index) {
			const filter = this.activeFilters[index]
			this.selectedField = filter.field
			this.selectedFieldData = {
				name: filter.name,
				icon: filter.icon || 'fa fa-filter',
				comparisonType: filter.comparisonType || 'string',
			}
			this.selectedOperator = filter.operator
			this.filterValue = filter.value
			this.editingIndex = index
		},
		resetSelection() {
			this.selectedField = null
			this.selectedFieldData = null
			this.selectedOperator = null
			this.filterValue = ''
			this.editingIndex = null
		},
		getOperatorLabel(operatorKey) {
			return this.$t(`components.flow.node.conditions.comparison.operators.${operatorKey}`)
		},
		updateRouteQuery() {
			const query = { ...this.$route.query }

			Object.keys(query).forEach((key) => {
				if (key.startsWith('filter_')) delete query[key]
			})

			this.activeFilters.forEach((filter, index) => {
				query[`filter_${index}`] = `${filter.field}:${filter.operator}:${filter.value}`
			})

			this.$router.push({ query })
		},
		loadFiltersFromRoute() {
			const query = this.$route?.query || {}
			const baseFilters = this.parseFiltersFromQuery(query)
			this.activeFilters = baseFilters.map((f) => {
				const fieldKey = f.field
				const metadata = conditionMetadata[fieldKey]
				let name = metadata ? this.$t('components.flow.node.conditions.fields.' + fieldKey + '.name') : fieldKey
				if (fieldKey.startsWith('custom.')) {
					name = fieldKey.replace('custom.', '')
				}
				return {
					field: fieldKey,
					comparisonType: metadata?.comparisonType || 'string',
					name,
					icon: metadata?.icon || 'fa fa-filter',
					operator: f.operator,
					value: f.value,
				}
			})
		},
	},
}
</script>
