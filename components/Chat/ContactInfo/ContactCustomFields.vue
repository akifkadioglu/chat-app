<template>
	<Form v-slot="{ errors }" @submit="saveCustomFields">
		<div class="mb-3">
			<h5 class="text-lg font-medium">{{ $t('components.chat.contactInfo.contactCustomFields.title') }}</h5>
			<div class="flex items-center justify-end">
				<button type="button" @click="addCustomField" class="btn btn-ghost btn-xs">
					<i class="fa fa-plus"></i>
					{{ $t('components.chat.contactInfo.contactCustomFields.addFieldButton') }}
				</button>
				<div>
					<button
						:disabled="!localCustomFields.length > 0 || isLoading"
						type="submit"
						v-if="allowEditing || isLoading"
						class="btn btn-ghost btn-xs btn-primary"
					>
						<LoadingElement v-if="isLoading" is-loading />
						<i v-else class="fa fa-save" />
						{{ $t('components.chat.contactInfo.contactCustomFields.saveButton') }}
					</button>
					<button :disabled="!customFields.length > 0" @click="allowEditing = true" v-else class="btn btn-ghost btn-xs">
						<i class="fa fa-edit" />
						{{ $t('components.chat.contactInfo.contactCustomFields.editButton') }}
					</button>
				</div>
				<button @click="askToResetCustomFields" type="button" :disabled="!allowEditing" class="btn btn-ghost btn-xs">
					<i class="fa fa-undo" />
					{{ $t('components.chat.contactInfo.contactCustomFields.cancelButton') }}
				</button>
			</div>
		</div>
		<div v-if="customFieldsLoading" class="flex justify-center py-4">
			<span class="loading loading-spinner loading-sm"></span>
		</div>
		<div v-else-if="localCustomFields.length > 0" class="space-y-3" v-auto-animate>
			<div v-for="field in localCustomFields" :key="field.uuid" class="rounded-lg">
				<div class="flex gap-3 items-top">
					<div class="form-control flex-1">
						<label>
							<span class="label-text text-xs">
								{{ $t('components.chat.contactInfo.contactCustomFields.fieldNameLabel') }}
							</span>
							<input
								v-model="field.key"
								type="text"
								:placeholder="$t('components.chat.contactInfo.contactCustomFields.fieldNamePlaceholder')"
								:readonly="!allowEditing || isLoading || !field.isTemporary"
								:disabled="!allowEditing || !field.isTemporary"
								class="input input-sm"
								:class="{
									'input-ghost': !allowEditing,
									'input-bordered': allowEditing,
									'input-error': errors[`custom_field_${field.uuid}_key`] && allowEditing,
								}"
							/>
						</label>
					</div>
					<div class="form-control flex-1">
						<label>
							<span class="label-text text-xs">
								{{ $t('components.chat.contactInfo.contactCustomFields.valueLabel') }}
							</span>

							<!--						chatAccountAttributesStore.getPivot(field.id, contactId).value-->
							<!--							:value="chatAccountAttributesStore.getPivot(field.id, contactId)?.value ?? ''"-->
							<input
								v-model="field.value"
								type="text"
								:placeholder="$t('components.chat.contactInfo.contactCustomFields.valuePlaceholder')"
								:readonly="!allowEditing || isLoading || removingFields.includes(field.id)"
								:disabled="!allowEditing"
								class="input input-sm"
								:class="{
									'input-ghost': !allowEditing,
									'input-bordered': allowEditing,
									'input-error': errors[`custom_field_${field.uuid}_value`] && allowEditing,
								}"
							/>
						</label>
					</div>
					<button
						:disabled="
							!allowEditing ||
							removingFields.includes(field.id) ||
							!contactsStore.getCustomFieldsByContactIdAndCustomFieldId(contactId, field.id)
						"
						type="button"
						@click="removeCustomField(field.id)"
						class="btn btn-xs btn-soft btn-transition btn-error tooltip mt-7"
					>
						<LoadingElement size="15" :is-loading="removingFields.includes(field.id)">
							<i class="fa fa-trash" />
						</LoadingElement>
					</button>
				</div>
			</div>
		</div>

		<!-- Empty state for custom fields -->
		<div v-else class="text-center py-4">
			<div class="text-base-content/40 text-sm mb-3">
				{{ $t('components.chat.contactInfo.contactCustomFields.emptyState') }}
			</div>
		</div>
	</Form>
</template>

<script>
import { ErrorMessage, Field, Form } from 'vee-validate'
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import State from '~/components/GlobalComponents/State.vue'
import { useContactsStore } from '~/stores/contacts.js'
import { CustomField } from '~/models/Contact/CustomField.js'
import { v4 } from 'uuid'

export default {
	name: 'ContactCustomFields',
	components: { State, LoadingElement, Form, Field, ErrorMessage },
	props: {
		contactId: {
			type: Number,
			default: null,
		},
		chatAccountId: {
			type: Number,
			default: null,
		},
	},
	setup() {
		return {
			contactsStore: useContactsStore(),
			chatAccountsStore: useChatAccountsStore(),
			chatAccountAttributesStore: useChatAccountAttributesStore(),
		}
	},
	emits: ['update:contactInfo', 'update:customFields', 'save'],
	computed: {
		customFields() {
			return this.chatAccountAttributesStore.getCustomFieldsByChatAccountId(this.chatAccountId)
		},
		contact() {
			return this.contactsStore.getContactById(this.contactId)
		},
	},
	data() {
		return {
			allowEditing: false,
			isLoading: false,
			customFieldsLoading: false,
			removingFields: [],
			localCustomFields: {},
		}
	},
	mounted() {
		this.loadCustomFields()
	},
	watch: {
		'contact.id': {
			handler() {
				this.resetCustomFields()
			},
			immediate: true,
		},
		'contact.customFieldsValues': {
			handler() {
				this.resetCustomFields()
			},
			immediate: true,
		},
	},
	methods: {
		askToResetCustomFields() {
			this.$swal
				.fire({
					title: this.$t('components.chat.contactInfo.contactCustomFields.resetConfirmation.title'),
					text: this.$t('components.chat.contactInfo.contactCustomFields.resetConfirmation.text'),
					icon: 'warning',
					showCancelButton: true,
					confirmButtonColor: '#3085d6',
					confirmButtonText: this.$t('components.chat.contactInfo.contactCustomFields.resetConfirmation.confirmButton'),
					cancelButtonText: this.$t('components.chat.contactInfo.contactCustomFields.resetConfirmation.cancelButton'),
				})
				.then((result) => {
					if (result.isConfirmed) {
						this.resetCustomFields()
					}
				})
		},
		loadCustomFields() {
			if (!this.chatAccountId) return
			this.customFieldsLoading = true
			this.chatAccountAttributesStore
				.fetchCustomFields(this.chatAccountId)
				.then(() => {
					this.resetCustomFields()
				})
				.finally(() => {
					this.customFieldsLoading = false
				})
		},
		resetCustomFields() {
			const localCustomFields = []
			this.customFields.forEach((field) => {
				const pivot = this.contact?.customFieldsValues?.find((value) => value.customFieldId === field.id)
				localCustomFields.push({
					id: field.id,
					key: field.key,
					value: pivot?.value ?? '',
				})
			})

			this.localCustomFields = JSON.parse(JSON.stringify(localCustomFields))

			this.allowEditing = false
		},
		addCustomField() {
			this.allowEditing = true
			const tempField = new CustomField({
				id: v4(), // Geçici bir Id
				key: '',
				value: '',
				isTemporary: true,
			})
			this.localCustomFields.push(tempField)
		},
		async removeCustomField(fieldId) {
			this.removingFields.push(fieldId)
			await this.contactsStore
				.removeCustomField(this.contactId, this.chatAccountId, fieldId)
				.then(() => {
					this.localCustomFields.find((field) => field.id === fieldId).value = ''
				})
				.catch((err) => {
					consoleLog(err)
				})
				.finally(() => {
					this.removingFields = this.removingFields.filter((id) => id !== fieldId)
				})
		},
		async saveCustomFields() {
			if (!this.allowEditing) {
				return
			}
			this.isLoading = true

			const validFields = this.localCustomFields
				.map((field) => {
					if (!field.value) return
					return field
				})
				.filter(Boolean)

			if (validFields.length === 0) {
				this.allowEditing = false
				this.isLoading = false
				return
			}

			await this.contactsStore
				.saveCustomFields(this.contactId, this.chatAccountId, validFields)
				.then((res) => {
					this.allowEditing = false
					this.localCustomFields.map((field) => {
						if (field.isTemporary) {
							const thisField = res.data.find((f) => f.key === field.key)
							field.id = thisField.id
							field.isTemporary = false
						}
					})
				})
				.catch((error) => {
					consoleLog(error)
					this.allowEditing = true
				})
				.finally(() => {
					this.isLoading = false
				})
		},
	},
}
</script>
