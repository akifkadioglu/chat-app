<template>
	<div>
		<!-- Summary için Teleport -->
		<!--		<Teleport v-if="summaryRefElement && node.config?.field" :to="summaryRefElement">-->
		<div>
			<span class="text-sm font-medium">{{ node.config.field.name }}</span>
			<span class="text-sm text-base-content/70">
				{{ getSummaryText() }}
			</span>
		</div>
		<!--		</Teleport>-->

		<!-- Ana Konfigürasyon -->
		<div>
			<FieldSelector @fieldSelected="changeField" v-if="node.config.field" class="w-full">
				<template #triggerButton>
					<button class="btn btn-outline btn-sm border-base-300 justify-start w-full">
						<i :class="node.config.field.icon" class="text-primary text-lg"></i>
						<span class="font-medium text-sm">{{ node.config.field.name }}</span>
						<span class="badge badge-primary badge-sm ml-auto">
							<span v-if="node.config.field.comparisonType === comparisonTypes.STRING">
								{{ $t('components.flow.node.conditions.comparison.fieldTypes.text') }}
							</span>
							<span v-else-if="node.config.field.comparisonType === comparisonTypes.BOOL">
								{{ $t('components.flow.node.conditions.comparison.fieldTypes.yesNo') }}
							</span>
							<span v-else-if="node.config.field.comparisonType === comparisonTypes.INTEGER">
								{{ $t('components.flow.node.conditions.comparison.fieldTypes.number') }}
							</span>
							<span v-else-if="node.config.field.comparisonType === comparisonTypes.DATE">
								{{ $t('components.flow.node.conditions.comparison.fieldTypes.date') }}
							</span>
							<span v-else-if="node.config.field.comparisonType === comparisonTypes.TAG">
								{{ $t('components.flow.node.conditions.comparison.fieldTypes.tag') }}
							</span>
							<span v-else>{{ $t('components.flow.node.conditions.comparison.fieldTypes.unknown') }}</span>
						</span>
					</button>
				</template>
			</FieldSelector>

			<!-- Karşılaştırma Ayarları (Kompakt Yan Yana) -->
			<div v-if="node.config.field" class="mt-3">
				<!-- Operator ve Value Yan Yana -->
				<div class="grid grid-cols-2 gap-3 items-end">
					<!-- Operator Seçimi -->
					<div class="col-span-2">
						<label class="label py-1">
							<span class="label-text text-xs flex items-center gap-1">
								<i class="fa fa-filter text-xs text-primary"></i>
								{{ $t('components.flow.node.conditions.comparison.comparisonLabel') }}
							</span>
						</label>
						<CustomDropdown ref="operatorDropdown" container="#appPage" placement="bottom-start">
							<button class="btn btn-outline btn-sm w-full justify-between">
								<span v-if="node.config.operator">
									{{ $t(`components.flow.node.conditions.comparison.operators.${node.config.operator}`) }}
								</span>
								<span v-else> {{ $t('components.flow.node.conditions.comparison.selectOperator') }} </span>
								<i class="fa fa-chevron-down text-xs"></i>
							</button>
							<template #popper>
								<ul class="menu bg-base-100 rounded-box shadow-lg min-w-48 p-2">
									<li v-for="operator in availableOperators" :key="operator">
										<a
											@click="(node.config.operator = operator), $refs.operatorDropdown.hide()"
											:class="{ active: node.config.operator === operator }"
										>
											{{ $t(`components.flow.node.conditions.comparison.operators.${operator}`) }}
										</a>
									</li>
								</ul>
							</template>
						</CustomDropdown>
					</div>

					<!-- Value Input -->
					<div v-if="node.config.operator && needsValue" class="col-span-2">
						<label class="label py-1">
							<span class="label-text text-xs flex items-center gap-1">
								<i class="fa fa-edit text-xs text-primary"></i>
								<span v-if="node.config.operator === 'within_days' || node.config.operator === 'older_than_days'">
									{{ $t('components.flow.node.conditions.comparison.dayCountLabel') }}
								</span>
								<span v-else-if="node.config.field?.comparisonType === comparisonTypes.STRING">
									{{ $t('components.flow.node.conditions.comparison.valueLabel') }}
								</span>
								<span v-else-if="node.config.field?.comparisonType === comparisonTypes.INTEGER">
									{{ $t('components.flow.node.conditions.comparison.numberLabel') }}
								</span>
								<span v-else-if="node.config.field?.comparisonType === comparisonTypes.DATE">
									{{ $t('components.flow.node.conditions.comparison.dateLabel') }}
								</span>
								<span v-else-if="node.config.field?.comparisonType === comparisonTypes.TAG">
									{{ $t('components.flow.node.conditions.comparison.tagNameLabel') }}
								</span>
								<span v-else>{{ $t('components.flow.node.conditions.comparison.valueLabel') }}</span>
							</span>
						</label>

						<!-- String Input -->
						<input
							v-if="node.config.field?.comparisonType === comparisonTypes.STRING"
							v-model="node.config.value"
							type="text"
							class="input input-bordered input-sm w-full"
							:placeholder="getValuePlaceholder()"
						/>

						<!-- Integer Input -->
						<input
							v-else-if="node.config.field?.comparisonType === comparisonTypes.INTEGER"
							v-model.number="node.config.value"
							type="number"
							class="input input-bordered input-sm w-full"
							:placeholder="getValuePlaceholder()"
						/>

						<!-- Date Input -->
						<input
							v-else-if="
								node.config.field?.comparisonType === comparisonTypes.DATE &&
								(node.config.operator === 'within_days' || node.config.operator === 'older_than_days')
							"
							v-model.number="node.config.value"
							type="number"
							class="input input-bordered input-sm w-full"
							:placeholder="$t('components.flow.node.conditions.comparison.dayCountPlaceholder')"
						/>
						<input
							v-else-if="node.config.field?.comparisonType === comparisonTypes.DATE"
							v-model="node.config.value"
							type="date"
							class="input input-bordered input-sm w-full"
						/>

						<!--						&lt;!&ndash; Tag Input &ndash;&gt;-->
						<!--						<input-->
						<!--							v-else-if="node.config.field?.comparisonType === 'tag'"-->
						<!--							v-model="node.config.value"-->
						<!--							type="text"-->
						<!--							class="input input-bordered input-sm w-full"-->
						<!--							:placeholder="$t('components.flow.node.conditions.comparison.tagNamePlaceholder')"-->
						<!--						/>-->
						<div v-else-if="node.config.field?.comparisonType === comparisonTypes.TAG">
							<TagBadgeList
								:tags="availableTags"
								:selectedTagIds="selectedTagIds"
								@toggleTag="node.config.value = $event?.name || ''"
							/>
						</div>

						<!-- Score Input -->
						<div v-else-if="node.config.field?.comparisonType === comparisonTypes.SCORE" class="flex flex-col gap-1">
							<div class="flex items-center gap-2">
								<input
									v-model.number="node.config.value"
									type="range"
									min="-100"
									max="100"
									class="range range-xs range-primary flex-1"
								/>
								<span class="text-sm font-medium min-w-12 text-right">{{ node.config.value || 0 }}%</span>
							</div>
						</div>

						<!-- Intent Input -->
						<div v-else-if="node.config.field?.comparisonType === comparisonTypes.INTENT">
							<CustomDropdown ref="intentDropdown" container="#appPage" placement="bottom-start">
								<button class="btn btn-outline btn-sm w-full justify-between">
									<span v-if="node.config.value">
										{{ $t(`models.comments.intents.${node.config.value}`) }}
									</span>
									<span v-else> {{ $t('components.flow.node.conditions.comparison.selectIntent') }} </span>
									<i class="fa fa-chevron-down text-xs"></i>
								</button>
								<template #popper>
									<ul class="menu bg-base-100 rounded-box shadow-lg min-w-48 p-2">
										<li v-for="intent in intents" :key="intent">
											<a
												@click="(node.config.value = intent), $refs.intentDropdown.hide()"
												:class="{ active: node.config.value === intent }"
											>
												{{ $t(`models.comments.intents.${intent}`) }}
											</a>
										</li>
									</ul>
								</template>
							</CustomDropdown>
						</div>
						<input
							v-else-if="node.config.field?.comparisonType === comparisonTypes.TEXT"
							v-model="node.config.value"
							type="text"
							class="input input-bordered input-sm w-full"
							:placeholder="getValuePlaceholder()"
						/>

						<input
							v-else
							v-model="node.config.value"
							type="text"
							class="input input-bordered input-sm w-full"
							:placeholder="getValuePlaceholder()"
						/>
					</div>
				</div>
			</div>
		</div>

		<div v-if="isMainNode" class="py-4 border-t border-t-base-content/10 mt-4 flex flex-col items-end">
			<div class="italic text-sm mb-2">{{ $t('components.flow.node.conditions.comparison.ifNotMatchesText') }}</div>
			<CloseAction
				ref="addElseNodeInComparison"
				:action="node.guardNode('else')"
				:showSummaryBelowActionName="true"
				@create:action="addElseNode"
				@add:edge="addElseEdge"
			>
				<template #triggerButton>
					<button class="btn btn-ghost btn-transition">
						<i class="fa fa-plus" />
						{{ $t('components.flow.node.conditions.comparison.ifNotButton') }}
					</button>
				</template>
			</CloseAction>
		</div>
	</div>
</template>

<script>
import { comparisonOperators, comparisonTypes, intents, noValueOperators } from '~/models/Flow/utils/utils'
import FieldSelector from '~/components/Flow/Node/Conditions/FieldSelector.vue'
import CloseAction from '~/components/Flow/Node/CloseAction.vue'
import CustomDropdown from '~/components/GlobalComponents/CustomDropdown.vue'
import { Node } from '~/models/Flow/Node.js'
import TagBadgeList from '~/components/Chat/ContactInfo/Partials/TagBadgeList.vue'

export default {
	components: {
		TagBadgeList,
		CloseAction,
		AddAction: defineAsyncComponent(() => import('~/components/Flow/AddNodePartials/AddAction.vue')),
		FieldSelector,
		CustomDropdown,
	},
	props: {
		node: {
			type: Node,
			required: true,
		},
		isMainNode: {
			type: Boolean,
			default: false,
		},
	},
	setup() {
		return {
			flowStore: useFlowStore(),
			chatAccountAttributesStore: useChatAccountAttributesStore(),
			intents,
		}
	},
	computed: {
		comparisonTypes() {
			return comparisonTypes
		},
		availableOperators() {
			const type = this.node.config.field?.comparisonType || 'string'
			return comparisonOperators[type] || []
		},
		needsValue() {
			return !noValueOperators.includes(this.node.config.operator)
		},
		availableTags() {
			const chatAccountId = this.flowStore.flow?.chatAccountId
			if (!chatAccountId || this.node.config.field?.comparisonType !== 'tag') return []
			const tags = this.chatAccountAttributesStore.getTagsByChatAccountId(chatAccountId) ?? []
			return tags.filter((tag, i, arr) => arr.findIndex((t) => t.name === tag.name) === i)
		},
		selectedTagIds() {
			if (!this.node.config || this.node.config.field?.comparisonType !== 'tag') return []
			const selectedName = this.node.config.value
			return this.availableTags.filter((tag) => tag.name === selectedName).map((tag) => tag.id)
		},
	},
	mounted() {
		const chatAccountId = this.flowStore.flow?.chatAccountId
		if (chatAccountId) {
			this.chatAccountAttributesStore.fetchTags(chatAccountId)
		}
	},
	watch: {
		// Field değiştiğinde operator ve value'yu sıfırla
		'node.config.field.key'() {
			consoleLog('Field changed, resetting operator and value')
			this.$nextTick(() => {
				// Eğer mevcut operator yeni field için geçerli değilse sıfırla
				if (!this.availableOperators.find((op) => op.value === this.node.config.operator)) {
					this.node.config.operator = this.availableOperators[0]?.value || null
				}
			})
			this.node.config.value = ''
		},
		// Operator değiştiğinde value'yu sıfırla
		'node.config.operator'() {
			this.node.config.value = ''
		},
	},
	methods: {
		changeField(field) {
			this.node.config.field = field
		},
		getValuePlaceholder() {
			const type = this.node.config.field?.comparisonType || 'string'
			const operator = this.node.config.operator

			if (operator === 'within_days') {
				return this.$t('components.flow.node.conditions.comparison.placeholders.withinDays')
			}
			if (operator === 'older_than_days') {
				return this.$t('components.flow.node.conditions.comparison.placeholders.olderThanDays')
			}

			switch (type) {
				case comparisonTypes.STRING:
					if (operator === 'contains') {
						return this.$t('components.flow.node.conditions.comparison.placeholders.contains')
					}
					if (operator === 'starts_with') {
						return this.$t('components.flow.node.conditions.comparison.placeholders.startsWith')
					}
					if (operator === 'ends_with') {
						return this.$t('components.flow.node.conditions.comparison.placeholders.endsWith')
					}
					return this.$t('components.flow.node.conditions.comparison.placeholders.textValue')
				case comparisonTypes.INTEGER: {
					return this.$t('components.flow.node.conditions.comparison.placeholders.numberValue')
				}
				case comparisonTypes.TAG:
					return this.$t('components.flow.node.conditions.comparison.placeholders.tagExample')
				case comparisonTypes.TEXT:
					if (operator === 'contains') {
						return this.$t('components.flow.node.conditions.comparison.placeholders.contains')
					}
					if (operator === 'starts_with') {
						return this.$t('components.flow.node.conditions.comparison.placeholders.startsWith')
					}
					if (operator === 'equals') {
						return this.$t('components.flow.node.conditions.comparison.placeholders.equals')
					}
					return this.$t('components.flow.node.conditions.comparison.placeholders.textValue')
				default:
					return ''
			}
		},
		getSummaryText() {
			const fieldName = this.node.config.field?.name || ''
			const operator = this.node.config.operator
			const value = this.node.config.value

			if (!operator) return this.$t('components.flow.node.conditions.comparison.messages.noComparisonSelected')

			const operatorObj = this.availableOperators.find((op) => op === operator)

			let operatorLabel = operator
			if (operatorObj) {
				operatorLabel = this.$t(`components.flow.node.conditions.comparison.operators.${operatorObj}`)
			}

			if (this.needsValue) {
				return `${operatorLabel}: ${value}`
			}

			return operatorLabel
		},
		addElseNode(node, fromNode = this.node) {
			if (this.node.guardNode('else')?.uuid) {
				alert(this.$t('components.flow.node.conditions.comparison.messages.elseNodeExists'))
				return
			}
			this.flowStore.flow.addNode(node, fromNode, 'else')
		},
		addElseEdge(toNodeUuid) {
			this.flowStore.flow.addEdge(this.node, this.flowStore.flow.getNodeByUuid(toNodeUuid), 'else')
		},
	},
}
</script>
