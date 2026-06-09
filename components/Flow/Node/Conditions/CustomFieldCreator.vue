<template>
	<CustomFieldSetter
		:isLoading="createCustomFieldLoading"
		:newField="newField"
		@cancel="cancelAddCustomField"
		@create="createCustomField"
	/>
</template>
<script>
import { fieldTypes } from '~/models/Flow/utils/utils.ts'
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import CustomFieldSetter from '~/components/Flow/Node/Conditions/CustomFieldSetter.vue'

export default {
	components: { CustomFieldSetter, LoadingElement },
	props: {
		chatAccountId: {
			type: Number,
			required: true,
		},
	},
	setup() {
		return {
			chatAccountAttributesStore: useChatAccountAttributesStore(),
		}
	},
	emits: ['customFieldCreated', 'customFieldCancelled'],
	mounted() {
		setTimeout(() => {
			this.$refs.newCustomFieldInput.focus()
		}, 150)
	},
	data() {
		return {
			newField: {
				key: '',
				type: fieldTypes.STRING,
			},
			createCustomFieldLoading: false,
		}
	},
	methods: {
		resetField() {
			this.newField = {
				key: '',
				type: fieldTypes.STRING,
			}
		},
		cancelAddCustomField() {
			this.resetField()
			this.$emit('customFieldCancelled')
		},
		async createCustomField() {
			if (!this.newField.key || !this.newField.type || !this.chatAccountId) return

			this.createCustomFieldLoading = true
			return this.chatAccountAttributesStore
				.createCustomFieldRequest(this.chatAccountId, this.newField.key, this.newField.type)
				.then(() => {
					this.$emit('customFieldCreated')
				})
				.catch(() => {})
				.finally(() => {
					this.resetField()
					this.createCustomFieldLoading = false
				})
		},
	},
}
</script>
