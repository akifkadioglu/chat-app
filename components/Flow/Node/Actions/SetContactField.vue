<template>
	<div>
		<div class="flex items-center gap-4 mb-4">
			<!-- Field Selection -->
			<div>
				<label class="label">
					<span class="label-text font-medium">{{
						$t('components.flow.node.actions.setContactField.selectField')
					}}</span>
				</label>

				<FieldSelector
					:icon="node.config.field ? 'fa fa-square-check' : 'fa fa-plus'"
					:label="
						node.config.field ? getFieldDisplayName() : $t('components.flow.node.actions.setContactField.chooseField')
					"
					:button-class="node.config.field ? 'btn btn-success btn-soft btn-sm' : 'btn btn-info btn-sm'"
					hideSocialFields
					hideTag
					@fieldSelected="onFieldSelected"
				/>
			</div>

			<!-- Operation Selection -->
			<div v-if="node.config.field">
				<label class="label">
					<span class="label-text font-medium">{{ $t('components.flow.node.actions.setContactField.operation') }}</span>
				</label>

				<CustomDropdown ref="operationsDropdown" placement="bottom" container="#appPage">
					<button class="btn btn-outline btn-sm w-full justify-between">
						<span>{{
							node.config.operation
								? getOperationLabel()
								: $t('components.flow.node.actions.setContactField.selectOperation')
						}}</span>
						<i class="fa fa-chevron-down text-xs"></i>
					</button>

					<template #popper="{ shown, hide }">
						<div class="bg-base-100 rounded-lg shadow-lg mt-1 min-w-[200px]">
							<ul class="menu p-1 w-full">
								<li v-for="operation in availableOperations" :key="operation.value">
									<a
										@click="selectOperation(operation.value)"
										:class="{ active: node.config.operation === operation.value }"
									>
										<i v-if="node.config.operation === operation.value" class="fa fa-check text-primary"></i>
										<span>{{ operation.label }}</span>
									</a>
								</li>
							</ul>
						</div>
					</template>
				</CustomDropdown>
			</div>
		</div>
		<!-- Value Input -->
		<div v-if="node.config.field && node.config.operation && showValue()" class="mb-4">
			<label class="label">
				<span class="label-text font-medium">{{ getValueLabel() }}</span>
			</label>

			<!-- String/Text Input -->
			<input
				v-if="getFieldType() === fieldTypes.STRING"
				v-model="node.config.value"
				type="text"
				class="input input-bordered w-full"
				:placeholder="getValuePlaceholder()"
			/>

			<!-- Integer Input -->
			<input
				v-else-if="getFieldType() === fieldTypes.INTEGER"
				v-model.number="node.config.value"
				type="number"
				class="input input-bordered w-full"
				:placeholder="getValuePlaceholder()"
			/>

			<!-- Date Input -->
			<input
				v-else-if="getFieldType() === fieldTypes.DATE"
				v-model="node.config.value"
				type="date"
				class="input input-bordered w-full"
			/>

			<!-- Boolean Select -->
			<CustomDropdown v-else-if="getFieldType() === fieldTypes.BOOL" placement="bottom" container="#appPage">
				<button class="btn btn-outline btn-sm w-full justify-between">
					<span>{{
						node.config.value !== '' && node.config.value !== null && node.config.value !== undefined
							? getBooleanValueLabel()
							: $t('components.flow.node.actions.setContactField.selectValue')
					}}</span>
					<i class="fa fa-chevron-down text-xs"></i>
				</button>

				<template #popper="{ shown, hide }">
					<div class="bg-base-100 rounded-lg shadow-lg mt-1 min-w-[200px]">
						<ul class="menu p-1 w-full">
							<li>
								<a @click="selectBooleanValue('true')" :class="{ active: node.config.value === 'true' }">
									<i v-if="node.config.value === 'true'" class="fa fa-check text-primary"></i>
									<span>{{ $t('components.flow.node.actions.setContactField.true') }}</span>
								</a>
							</li>
							<li>
								<a @click="selectBooleanValue('false')" :class="{ active: node.config.value === 'false' }">
									<i v-if="node.config.value === 'false'" class="fa fa-check text-primary"></i>
									<span>{{ $t('components.flow.node.actions.setContactField.false') }}</span>
								</a>
							</li>
						</ul>
					</div>
				</template>
			</CustomDropdown>

			<!-- Default Text Input -->
			<input
				v-else
				v-model="node.config.value"
				type="text"
				class="input input-bordered w-full"
				:placeholder="getValuePlaceholder()"
			/>
		</div>

		<!-- Help Text -->
		<div v-if="node.config.field && node.config.operation" class="text-xs text-base-content/60">
			{{ getHelpText() }}
		</div>
	</div>
</template>

<script>
import FieldSelector from '~/components/Flow/Node/Conditions/FieldSelector.vue'
import { fieldTypes } from '~/models/Flow/utils/utils.ts'
import CustomDropdown from '~/components/GlobalComponents/CustomDropdown.vue'

export default {
	components: {
		CustomDropdown,
		FieldSelector,
	},
	props: {
		node: {
			type: Object,
			required: true,
		},
	},
	setup() {
		return {
			flowStore: useFlowStore(),
		}
	},
	data() {
		return {
			fieldTypes,
		}
	},
	computed: {
		availableOperations() {
			if (!this.node.config.field) return []

			const fieldType = this.getFieldType()
			const operations = []

			// Her field type için uygun operasyonlar
			if (fieldType === fieldTypes.INTEGER) {
				operations.push(
					{ value: 'set', label: this.$t('components.flow.node.actions.setContactField.operations.set') },
					{ value: 'increment', label: this.$t('components.flow.node.actions.setContactField.operations.increment') },
					{ value: 'decrement', label: this.$t('components.flow.node.actions.setContactField.operations.decrement') },
					{ value: 'clear', label: this.$t('components.flow.node.actions.setContactField.operations.clear') },
				)
			} else if (fieldType === fieldTypes.STRING) {
				operations.push(
					{ value: 'set', label: this.$t('components.flow.node.actions.setContactField.operations.set') },
					{ value: 'append', label: this.$t('components.flow.node.actions.setContactField.operations.append') },
					{ value: 'prepend', label: this.$t('components.flow.node.actions.setContactField.operations.prepend') },
					{ value: 'clear', label: this.$t('components.flow.node.actions.setContactField.operations.clear') },
				)
			} else if (fieldType === fieldTypes.BOOL) {
				operations.push(
					{ value: 'set', label: this.$t('components.flow.node.actions.setContactField.operations.set') },
					{ value: 'toggle', label: this.$t('components.flow.node.actions.setContactField.operations.toggle') },
					{ value: 'clear', label: this.$t('components.flow.node.actions.setContactField.operations.clear') },
				)
			} else if (fieldType === fieldTypes.DATE) {
				operations.push(
					{ value: 'set', label: this.$t('components.flow.node.actions.setContactField.operations.set') },
					{ value: 'clear', label: this.$t('components.flow.node.actions.setContactField.operations.clear') },
				)
			} else {
				// Default operations for unknown types
				operations.push(
					{ value: 'set', label: this.$t('components.flow.node.actions.setContactField.operations.set') },
					{ value: 'clear', label: this.$t('components.flow.node.actions.setContactField.operations.clear') },
				)
			}

			return operations
		},
	},
	mounted() {
		// Initialize config if not exists
		if (!this.node.config) {
			this.node.config = {}
		}
	},
	methods: {
		onFieldSelected(field) {
			console.log('Selected field:', field)
			this.node.config.field = field
			// Reset operation and value when field changes
			this.node.config.operation = ''
			this.node.config.value = ''
		},

		onOperationChange() {
			// Reset value when operation changes
			this.node.config.value = ''
		},

		selectOperation(operationValue) {
			this.node.config.operation = operationValue
			// Reset value when operation changes
			this.node.config.value = ''

			this.$refs.operationsDropdown.hide()
		},

		selectBooleanValue(value) {
			this.node.config.value = value
		},

		getBooleanValueLabel() {
			if (this.node.config.value === 'true') {
				return this.$t('components.flow.node.actions.setContactField.true')
			} else if (this.node.config.value === 'false') {
				return this.$t('components.flow.node.actions.setContactField.false')
			}
			return ''
		},

		getFieldType() {
			if (!this.node.config.field) return fieldTypes.STRING
			return this.node.config.field.type || this.node.config.field.comparisonType || fieldTypes.STRING
		},

		getFieldDisplayName() {
			if (!this.node.config.field) return ''

			// Custom field ise key'ini göster
			if (this.node.config.field.key && this.node.config.field.key.startsWith('custom.')) {
				return this.node.config.field.name || this.node.config.field.key.replace('custom.', '')
			}

			// System field ise çevirisini göster
			return this.node.config.field.name || this.node.config.field.key
		},

		getOperationLabel() {
			if (!this.node.config.operation) return ''

			const operation = this.availableOperations.find((op) => op.value === this.node.config.operation)
			return operation ? operation.label : this.node.config.operation
		},

		showValue() {
			// Clear ve toggle operasyonları value gerektirmez
			return this.node.config.operation && !['clear', 'toggle'].includes(this.node.config.operation)
		},

		getValueLabel() {
			const operation = this.node.config.operation
			const fieldType = this.getFieldType()

			if (operation === 'increment' || operation === 'decrement') {
				return this.$t('components.flow.node.actions.setContactField.amount')
			} else if (operation === 'append') {
				return this.$t('components.flow.node.actions.setContactField.textToAppend')
			} else if (operation === 'prepend') {
				return this.$t('components.flow.node.actions.setContactField.textToPrepend')
			} else {
				return this.$t('components.flow.node.actions.setContactField.value')
			}
		},

		getValuePlaceholder() {
			const operation = this.node.config.operation
			const fieldType = this.getFieldType()

			if (operation === 'increment' || operation === 'decrement') {
				return '1'
			} else if (operation === 'append') {
				return this.$t('components.flow.node.actions.setContactField.appendPlaceholder')
			} else if (operation === 'prepend') {
				return this.$t('components.flow.node.actions.setContactField.prependPlaceholder')
			} else if (fieldType === fieldTypes.INTEGER) {
				return '0'
			} else {
				return this.$t('components.flow.node.actions.setContactField.valuePlaceholder')
			}
		},

		getHelpText() {
			const operation = this.node.config.operation
			const fieldName = this.getFieldDisplayName()

			switch (operation) {
				case 'set':
					return this.$t('components.flow.node.actions.setContactField.help.set', { field: fieldName })
				case 'increment':
					return this.$t('components.flow.node.actions.setContactField.help.increment', { field: fieldName })
				case 'decrement':
					return this.$t('components.flow.node.actions.setContactField.help.decrement', { field: fieldName })
				case 'append':
					return this.$t('components.flow.node.actions.setContactField.help.append', { field: fieldName })
				case 'prepend':
					return this.$t('components.flow.node.actions.setContactField.help.prepend', { field: fieldName })
				case 'toggle':
					return this.$t('components.flow.node.actions.setContactField.help.toggle', { field: fieldName })
				case 'clear':
					return this.$t('components.flow.node.actions.setContactField.help.clear', { field: fieldName })
				default:
					return ''
			}
		},
	},
}
</script>
