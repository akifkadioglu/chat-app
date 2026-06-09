<template>
	<!-- Always show inputs, but with readonly state -->
	<Form v-slot="{ errors }" class="space-y-4" @submit="toggleEditMode">
		<div class="flex justify-between">
			<div class="mb-3">
				<h4 class="text-xl">{{ $t('components.chat.contactInfo.contactFields.title') }}</h4>
				<small v-if="isError" class="text-error">
					{{ $t('components.chat.contactInfo.contactFields.errorMessage') }}
				</small>
			</div>
			<div>
				<button
					v-if="allowEditing"
					:disabled="isLoading"
					type="submit"
					class="btn btn-ghost btn-xs"
					:class="{ 'btn-primary': allowEditing }"
				>
					<loading-element :is-loading="isLoading">
						<i class="fa fa-save" />
					</loading-element>
					{{ $t('components.chat.contactInfo.contactFields.saveButton') }}
				</button>
				<button
					@click="allowEditing = true"
					v-else
					class="btn btn-ghost btn-xs"
					:class="{ 'btn-primary': allowEditing }"
				>
					<i class="fa fa-edit" />
					{{ $t('components.chat.contactInfo.contactFields.editButton') }}
				</button>
			</div>
		</div>
		<div class="space-y-4">
			<div class="form-control">
				<label class="label">
					<span class="label-text">{{ $t('components.chat.contactInfo.contactFields.firstNameLabel') }}</span>
				</label>
				<input
					v-model="editableContactInfo.firstName"
					type="text"
					:placeholder="allowEditing ? $t('components.chat.contactInfo.contactFields.firstNamePlaceholder') : ''"
					:readonly="!allowEditing || isLoading"
					:disabled="!allowEditing"
					:tabindex="allowEditing ? 0 : -1"
					class="input input-bordered input-sm"
				/>
			</div>
			<div class="form-control">
				<label class="label">
					<span class="label-text">{{ $t('components.chat.contactInfo.contactFields.lastNameLabel') }}</span>
				</label>
				<input
					v-model="editableContactInfo.lastName"
					type="text"
					:placeholder="allowEditing ? $t('components.chat.contactInfo.contactFields.lastNamePlaceholder') : ''"
					:readonly="!allowEditing || isLoading"
					:disabled="!allowEditing"
					:tabindex="allowEditing ? 0 : -1"
					class="input input-bordered input-sm"
				/>
			</div>
			<div class="form-control">
				<label class="label">
					<span class="label-text">{{ $t('components.chat.contactInfo.contactFields.emailLabel') }}</span>
				</label>
				<Field
					v-model="editableContactInfo.email"
					name="email"
					type="email"
					rules="email"
					:placeholder="allowEditing ? $t('components.chat.contactInfo.contactFields.emailPlaceholder') : ''"
					:readonly="!allowEditing || isLoading"
					:disabled="!allowEditing"
					:tabindex="allowEditing ? 0 : -1"
					class="input input-bordered input-sm"
					:class="{
						'input-error': errors.email && allowEditing,
					}"
				/>
				<ErrorMessage name="email" class="text-error text-xs mt-1" />
			</div>
			<div class="form-control">
				<label class="label">
					<span class="label-text">{{ $t('components.chat.contactInfo.contactFields.notesLabel') }}</span>
				</label>
				<textarea
					v-model="editableContactInfo.notes"
					:placeholder="allowEditing ? $t('components.chat.contactInfo.contactFields.notesPlaceholder') : ''"
					:readonly="!allowEditing || isLoading"
					:disabled="!allowEditing"
					:tabindex="allowEditing ? 0 : -1"
					class="textarea resize-none pr-12 focus:outline-none max-h-16"
					rows="1"
				></textarea>
			</div>
			<div class="form-control">
				<label class="label">
					<span class="label-text">{{ $t('components.chat.contactInfo.contactFields.addressLabel') }}</span>
				</label>
				<textarea
					v-model="editableContactInfo.address"
					:placeholder="allowEditing ? $t('components.chat.contactInfo.contactFields.addressPlaceholder') : ''"
					:readonly="!allowEditing || isLoading"
					:disabled="!allowEditing"
					:tabindex="allowEditing ? 0 : -1"
					class="textarea resize-none pr-12 focus:outline-none max-h-16"
					rows="1"
				/>
			</div>
			<div class="form-control">
				<label class="label">
					<span class="label-text">{{ $t('components.chat.contactInfo.contactFields.phoneLabel') }}</span>
				</label>
				<input
					v-model="editableContactInfo.phone"
					type="tel"
					:placeholder="allowEditing ? $t('components.chat.contactInfo.contactFields.phonePlaceholder') : ''"
					:readonly="!allowEditing || isLoading"
					:disabled="!allowEditing"
					:tabindex="allowEditing ? 0 : -1"
					class="input input-bordered input-sm"
				/>
			</div>
			<div class="form-control">
				<label class="label">
					<span class="label-text">{{ $t('components.chat.contactInfo.contactFields.timezoneLabel') }}</span>
				</label>
				<input
					v-model="editableContactInfo.timezone"
					type="email"
					:placeholder="allowEditing ? $t('components.chat.contactInfo.contactFields.timezonePlaceholder') : ''"
					:readonly="!allowEditing || isLoading"
					:disabled="!allowEditing"
					:tabindex="allowEditing ? 0 : -1"
					class="input input-bordered input-sm"
				/>
			</div>
		</div>
	</Form>
</template>

<script>
import { ErrorMessage, Field, Form } from 'vee-validate'
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import { useContactsStore } from '~/stores/contacts.js'

export default {
	name: 'ContactFields',
	components: { LoadingElement, Form, Field, ErrorMessage },
	props: {
		contactId: {
			type: [String, Number],
			default: null,
		},
		chatAccountId: {
			type: [String, Number],
			default: null,
		},
	},
	emits: ['update:contactInfo', 'update:customFields', 'save'],
	setup() {
		return {
			contactsStore: useContactsStore(),
		}
	},
	computed: {
		contact() {
			return this.contactsStore.getContactById(this.contactId)
		},
	},
	data() {
		return {
			allowEditing: false,
			isLoading: false,
			isError: false,
			editableContactInfo: {
				firstName: '',
				lastName: '',
				email: '',
				notes: '',
				address: '',
				phone: '',
				timezone: '',
			},
		}
	},
	mounted() {
		if (this.contact) {
			this.setEditableContactInfo()
		}
	},

	watch: {
		'contact.id'() {
			this.setEditableContactInfo()
		},
	},
	methods: {
		setEditableContactInfo() {
			this.editableContactInfo = {
				firstName: this.contact.firstName,
				lastName: this.contact.lastName,
				email: this.contact.email,
				notes: this.contact.notes,
				address: this.contact.address,
				phone: this.contact.phone,
				timezone: this.contact.timezone,
			}
		},
		toggleEditMode() {
			if (this.allowEditing) {
				this.saveContactInfo()
			}
		},
		async saveContactInfo() {
			this.isLoading = true
			this.isError = false

			await this.contactsStore
				.updateContact(this.contactId, this.editableContactInfo, this.chatAccountId)
				.then(() => {
					this.allowEditing = false
				})
				.catch((err) => {
					this.isError = true
					this.allowEditing = true
				})
				.finally(() => {
					this.isLoading = false
				})
		},
	},
}
</script>
