<template>
	<CustomDropdown ref="dropdown" placement="right-end">
		<slot name="trigger" />
		<template #popper>
			<div class="p-3 w-85 space-y-2">
				<input
					v-model="searchQuery"
					type="text"
					class="input input-sm input-bordered w-full"
					:placeholder="$t('components.contacts.footer.dropdowns.searchCustomField')"
					@click.stop
				/>
				<div class="max-h-40 overflow-y-auto space-y-1 w-full">
					<label
						v-for="field in filteredCustomFields"
						:key="field.id"
						class="flex items-center gap-2 cursor-pointer hover:bg-base-200 p-1 w-full rounded"
					>
						<input
							type="checkbox"
							class="checkbox checkbox-sm"
							:checked="selectedFieldIds.includes(field.id)"
							@change="toggleField(field)"
						/>
						<span class="w-full truncate">{{ field.key }}</span>
					</label>
					<div v-if="filteredCustomFields.length === 0" class="text-muted text-sm p-1">
						{{ $t('components.contacts.footer.dropdowns.noResults') }}
					</div>
				</div>
				<div v-if="selectedFieldIds.length > 0" class="text-xs text-muted">
					{{ $t('components.contacts.footer.dropdowns.fieldsSelected', { count: selectedFieldIds.length }) }}
				</div>
				<button
					class="btn btn-sm btn-soft btn-error w-full"
					:disabled="selectedFieldIds.length === 0 || isLoading"
					@click="removeFields"
				>
					<LoadingElement :isLoading="isLoading" size="20">
						<i class="fa fa-trash" />
					</LoadingElement>
					<span>{{ $t('components.contacts.footer.dropdowns.delete') }}</span>
				</button>
			</div>
		</template>
	</CustomDropdown>
</template>

<script>
import CustomDropdown from '~/components/GlobalComponents/CustomDropdown.vue'
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'

export default {
	components: { CustomDropdown, LoadingElement },
	props: {
		selectedContactIds: {
			type: Array,
			default: () => [],
		},
		selectionType: {
			type: String,
			required: true,
		},
		isLoading: {
			type: Boolean,
			default: false,
		},
	},
	emits: ['done', 'update:isLoading'],
	setup() {
		return {
			chatAccountAttributesStore: useChatAccountAttributesStore(),
			chatAccountsStore: useChatAccountsStore(),
			contactsStore: useContactsStore(),
		}
	},
	data() {
		return {
			selectedFieldIds: [],
			searchQuery: '',
		}
	},
	mounted() {
		const activeId = this.chatAccountsStore.active?.id
		if (activeId) {
			this.chatAccountAttributesStore.fetchCustomFields(activeId)
		}
	},
	computed: {
		rawCustomFields() {
			if (this.chatAccountsStore.active?.id) {
				return this.chatAccountAttributesStore.getCustomFieldsByChatAccountId(this.chatAccountsStore.active.id)
			}
			return Object.values(this.chatAccountAttributesStore.customFields).flat()
		},
		allCustomFields() {
			const grouped = {}
			this.rawCustomFields.forEach((field) => {
				const key = `${field.key}__${field.type}`
				if (!grouped[key]) {
					grouped[key] = { ...field, groupedIds: [field.id] }
				} else {
					grouped[key].groupedIds.push(field.id)
				}
			})
			return Object.values(grouped)
		},
		filteredCustomFields() {
			if (!this.searchQuery.trim()) return this.allCustomFields
			const query = this.searchQuery.toLowerCase().trim()
			return this.allCustomFields.filter((field) => field.key.toLowerCase().includes(query))
		},
	},
	methods: {
		hide() {
			this.$refs.dropdown?.hide()
		},
		toggleField(field) {
			const idsToToggle = field.groupedIds || [field.id]
			const isSelected = idsToToggle.some((id) => this.selectedFieldIds.includes(id))
			if (isSelected) {
				idsToToggle.forEach((id) => {
					const index = this.selectedFieldIds.indexOf(id)
					if (index !== -1) this.selectedFieldIds.splice(index, 1)
				})
				return
			}
			idsToToggle.forEach((id) => {
				if (!this.selectedFieldIds.includes(id)) this.selectedFieldIds.push(id)
			})
		},
		getConfirmText() {
			const total = this.contactsStore.currentScopeSlice?.total || 0
			let count = this.selectedContactIds.length
			if (this.selectionType === 'exclude') {
				count = total - this.selectedContactIds.length
			}

			const fieldNames = this.allCustomFields
				.filter((f) => this.selectedFieldIds.includes(f.id) || f.groupedIds?.some((id) => this.selectedFieldIds.includes(id)))
				.map((f) => f.key)
			const fields = fieldNames.join(', ')

			let fieldLabel = this.$t('components.contacts.bulkActions.removeCustomField.singular')
			if (fieldNames.length > 1) {
				fieldLabel = this.$t('components.contacts.bulkActions.removeCustomField.plural')
			}

			return this.$t('components.contacts.bulkActions.removeCustomField.description', { count, fields, fieldLabel })
		},
		async removeFields() {
			if (this.selectedFieldIds.length === 0 || this.isLoading) return

			const result = await this.$swal.fire({
				title: this.$t('components.contacts.bulkActions.removeCustomField.title'),
				text: this.getConfirmText(),
				icon: 'warning',
				showCancelButton: true,
				confirmButtonText: this.$t('components.contacts.bulkActions.confirm'),
				cancelButtonText: this.$t('components.contacts.bulkActions.cancel'),
			})
			if (!result.isConfirmed) return

			this.$emit('update:isLoading', true)

			await this.contactsStore
				.removeCustomFieldBulkRequest(
					this.selectedContactIds,
					this.selectionType,
					this.chatAccountsStore.active?.id,
					this.selectedFieldIds,
				)
				.then(() => {
					// this.selectedFieldIds = []
					this.$emit('done')
				})
				.finally(() => {
					consoleLog('customField finally')
					this.$emit('update:isLoading', false)
					consoleLog('customField finally2')
				})
		},
	},
}
</script>
