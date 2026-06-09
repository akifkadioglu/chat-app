<template>
	<CustomDropdown ref="dropdown" placement="right-end">
		<slot name="trigger" />
		<template #popper>
			<div class="p-3 w-85 space-y-2">
				<CustomDropdown ref="fieldSelectDropdown" placement="bottom-start">
					<button class="btn btn-sm btn-outline w-full justify-between" @click.stop>
						<span>{{ selectedField?.key || $t('components.contacts.footer.dropdowns.selectField') }}</span>
						<i class="fa fa-chevron-down text-xs" />
					</button>
					<template #popper>
						<div class="p-2 w-64 space-y-2">
							<input
								v-model="searchQuery"
								type="text"
								class="input input-sm input-bordered w-full"
								:placeholder="$t('components.contacts.footer.dropdowns.searchField')"
								@click.stop
							/>
							<ul class="menu bg-base-100 max-h-40 overflow-y-auto flex-nowrap p-0 w-full">
								<li v-for="field in filteredCustomFields" :key="field.id">
									<a
										href="javascript:"
										:class="{ 'bg-base-200': selectedFieldId === field.id }"
										@click="selectField(field)"
									>
										<i v-if="selectedFieldId === field.id" class="fa fa-check text-primary" />
										<span>{{ field.key }}</span>
									</a>
								</li>
								<li v-if="filteredCustomFields.length === 0">
									<span class="text-muted">{{ $t('components.contacts.footer.dropdowns.noResults') }}</span>
								</li>
							</ul>
						</div>
					</template>
				</CustomDropdown>
				<template v-if="selectedField">
					<input
						v-if="selectedField.type === fieldTypes.STRING"
						v-model="fieldValue"
						type="text"
						class="input input-sm input-bordered w-full"
						:placeholder="$t('components.contacts.footer.dropdowns.enterValue')"
						@click.stop
					/>
					<input
						v-else-if="selectedField.type === fieldTypes.INTEGER"
						v-model.number="fieldValue"
						type="number"
						class="input input-sm input-bordered w-full"
						:placeholder="$t('components.contacts.footer.dropdowns.enterNumber')"
						@click.stop
					/>
					<input
						v-else-if="selectedField.type === fieldTypes.DATE"
						v-model="fieldValue"
						type="date"
						class="input input-sm input-bordered w-full"
						@click.stop
					/>

					<label v-else-if="selectedField.type === fieldTypes.BOOL" class="flex items-center gap-2 cursor-pointer">
						<input v-model="fieldValue" type="checkbox" class="toggle toggle-primary" />
						<span>{{
							fieldValue
								? $t('components.contacts.footer.dropdowns.yes')
								: $t('components.contacts.footer.dropdowns.no')
						}}</span>
					</label>
				</template>
				<button
					class="btn btn-sm btn-soft btn-primary w-full"
					:disabled="!selectedFieldId || isLoading"
					@click="updateField"
				>
					<LoadingElement :isLoading="isLoading" size="20">
						<i class="fa fa-save" />
					</LoadingElement>
					<span>{{ $t('components.contacts.footer.dropdowns.save') }}</span>
				</button>
			</div>
		</template>
	</CustomDropdown>
</template>

<script>
import CustomDropdown from '~/components/GlobalComponents/CustomDropdown.vue'
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import { fieldTypes } from '~/models/Flow/utils/utils.ts'

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
			fieldTypes,
			selectedFieldId: null,
			selectedFieldGroupedIds: [],
			fieldValue: null,
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
		selectedField() {
			if (!this.selectedFieldId) return null
			return this.allCustomFields.find((f) => f.id === this.selectedFieldId)
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
		selectField(field) {
			this.selectedFieldId = field.id
			this.selectedFieldGroupedIds = field.groupedIds || [field.id]
			this.searchQuery = ''
			this.$refs.fieldSelectDropdown?.hide()

			if (field.type === this.fieldTypes.STRING) this.fieldValue = ''
			if (field.type === this.fieldTypes.INTEGER) this.fieldValue = 0
			if (field.type === this.fieldTypes.BOOL) this.fieldValue = false
			if (field.type === this.fieldTypes.DATE) this.fieldValue = new Date().toISOString().split('T')[0]
		},
		getConfirmText() {
			const total = this.contactsStore.currentScopeSlice?.total || 0
			let count = this.selectedContactIds.length
			if (this.selectionType === 'exclude') {
				count = total - this.selectedContactIds.length
			}
			return this.$t('components.contacts.bulkActions.updateCustomField.description', {
				count,
				fieldName: this.selectedField?.key || '',
			})
		},
		async updateField() {
			if (!this.selectedFieldId || this.isLoading) return

			const result = await this.$swal.fire({
				title: this.$t('components.contacts.bulkActions.updateCustomField.title'),
				text: this.getConfirmText(),
				icon: 'warning',
				showCancelButton: true,
				confirmButtonText: this.$t('components.contacts.bulkActions.confirm'),
				cancelButtonText: this.$t('components.contacts.bulkActions.cancel'),
			})
			if (!result.isConfirmed) return

			this.$emit('update:isLoading', true)

			this.contactsStore
				.updateCustomFieldBulkRequest(
					this.selectedContactIds,
					this.selectionType,
					this.chatAccountsStore.active?.id,
					this.selectedFieldId,
					this.fieldValue,
				)
				.then(() => {
					this.selectedFieldId = null
					this.fieldValue = null
					this.$refs.dropdown?.hide()
					this.$emit('done')
				})
				.catch((err) => {
					consoleLog(err)
				})
				.finally(() => {
					this.$emit('update:isLoading', false)
				})
		},
	},
}
</script>
