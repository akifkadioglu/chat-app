<template>
	<CustomDropdown
		ref="fieldSelectorDropdown"
		:popperTriggers="[]"
		container="#appPage"
		:placement="placement"
		@show="onDropdownShow"
		@hide="onDropdownHide"
	>
		<!-- This will be the popover reference (for the events and position) -->
		<slot name="triggerButton">
			<button tabindex="0" class="" :class="buttonClass">
				<slot name="button-content">
					<i v-if="icon" :class="icon" />
					<span v-if="label" class="ml-1">
						{{ label === 'Rule' ? $t('components.flow.node.conditions.fieldSelector.conditionLabel') : label }}
					</span>
				</slot>
			</button>
		</slot>

		<!-- This will be the content of the popover -->
		<template #popper="{ shown }">
			<div class="bg-base-100 rounded-lg shadow-lg mt-1 w-[600px] h-[320px]" :inert="!shown">
				<FieldList
					ref="fieldList"
					:excludeTypes="excludeTypes"
					:hideSocialFields="hideSocialFields"
					:hideTag="hideTag"
					:showCommentFields="showCommentFields"
					:customFields="customItems"
					:customFieldsLoading="customFieldsLoading"
					@fieldSelected="selectCondition"
				/>
			</div>
		</template>
	</CustomDropdown>
</template>

<script>
import { getFieldTypeIcon } from '~/models/Flow/utils/utils'
import CustomDropdown from '~/components/GlobalComponents/CustomDropdown.vue'
import FieldList from '~/components/Flow/Node/Conditions/FieldList.vue'

export default {
	components: {
		CustomDropdown,
		FieldList,
	},
	props: {
		icon: {
			type: String,
			default: 'fa fa-plus',
		},
		label: {
			type: String,
			default: 'Rule',
		},
		buttonClass: {
			type: String,
			default: 'btn btn-ghost btn-sm',
		},
		excludeTypes: {
			type: Array,
			default: () => [],
			description: 'Array of types to exclude (e.g., ["bool", "date"])',
		},
		hideSocialFields: {
			type: Boolean,
			default: false,
		},
		hideTag: {
			type: Boolean,
			default: false,
		},
		placement: {
			type: String,
			default: 'bottom',
		},
	},
	setup() {
		return {
			chatAccountsStore: useChatAccountsStore(),
			chatAccountAttributesStore: useChatAccountAttributesStore(),
			flowStore: useFlowStore(),
		}
	},
	data() {
		return {
			customFieldsLoading: false,
		}
	},
	computed: {
		chatAccount() {
			return this.chatAccountsStore.active || null
		},
		showCommentFields() {
			return this.flowStore.flow.hasCommentTrigger
		},
		customItems() {
			if (!this.chatAccount) return []

			const customFields = this.chatAccount?.customFields || []
			return [
				...customFields.map((field) => ({
					key: `custom.${field.key}`,
					name: field.key,
					description: this.$t('components.flow.node.conditions.fieldSelector.customField'),
					icon: this.getFieldTypeIcon(field.type || 'string'),
					type: field.type || 'string', // Custom field'lar için varsayılan type
					comparisonType: field.type || 'string',
				})),
			]
		},
	},
	mounted() {
		// Instagram section'ı System Fields'da varsayılan olarak açık
		if (this.selectedCategoryKey === 'system') {
			this.expandedSections.instagram = true
		}

		// Custom fields'ları getir
		// if (this.chatAccount) {
		// 	this.getCustomFields()
		// }
	},
	watch: {
		'chatAccount.id': {
			handler(newVal) {
				if (newVal) {
					this.customFieldsLoading = true
					this.chatAccountAttributesStore
						.fetchCustomFields(newVal)
						.finally(() => {
							this.customFieldsLoading = false
						})
				}
			},
			immediate: true,
		},
		selectedCategoryKey(newCategory) {
			// System Fields seçildiğinde Instagram section'ını aç
			if (newCategory === 'system') {
				this.expandedSections.instagram = true
			}
		},
	},
	emits: ['fieldSelected', 'dropdown-opened', 'dropdown-closed'],
	methods: {
		getFieldTypeIcon,
		selectCondition(condition) {
			if (condition.needsPro && !this.chatAccount.subscribed) {
				this.$refs.fieldSelectorDropdown.hide()
				this.$emitter.emit('showUpgradeModal', {
					chatAccount: this.chatAccount,
					feature: 'addField',
				})
				return
			}

			console.log('Selected condition:', condition)
			this.$emit('fieldSelected', condition)

			this.$refs.fieldSelectorDropdown.hide()
		},
		// async createCustomField() {
		// 	if (!this.newFieldKey || !this.newFieldType || !this.chatAccount) return
		//
		// 	this.createCustomFieldLoading = true
		// 	return this.chatAccountAttributesStore
		// 		.createCustomFieldRequest(this.chatAccount.id, this.newFieldKey, this.newFieldType)
		// 		.then()
		// 		.catch(() => {})
		// 		.finally(() => {
		// 			this.newFieldKey = ''
		// 			this.createCustomFieldLoading = false
		// 		})
		//
		// 	// return this.$requestAdapter
		// 	// 	.post(
		// 	// 		apiList.chat.instagram.chatAccountId.customFields.create,
		// 	// 		{
		// 	// 			key: this.newFieldKey,
		// 	// 			type: this.newFieldType,
		// 	// 		},
		// 	// 		{
		// 	// 			chatAccountId: this.chatAccount.id,
		// 	// 		},
		// 	// 	)
		// 	// 	.then((response) => {
		// 	// 		this.chatAccount.customFields.push(response.data)
		// 	// 		this.newFieldKey = ''
		// 	// 		this.newFieldType = fieldTypes.STRING
		// 	// 		this.showAddCustomField = false
		// 	// 		return response.data
		// 	// 	})
		// 	// 	.catch((error) => {
		// 	// 		console.error('Error creating custom field:', error)
		// 	// 	})
		// 	// 	.finally(() => {
		// 	// 		this.createCustomFieldLoading = false
		// 	// 	})
		// },
		// cancelAddCustomField() {
		// 	this.showAddCustomField = false
		// 	this.newFieldKey = ''
		// 	this.newFieldType = fieldTypes.STRING
		// },
		onDropdownShow() {
			this.$emit('dropdown-opened')
		},
		onDropdownHide() {
			this.$emit('dropdown-closed')
		},
	},
}
</script>
