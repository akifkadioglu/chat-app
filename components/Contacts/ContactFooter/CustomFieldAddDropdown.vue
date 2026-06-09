<template>
	<CustomDropdown ref="dropdown" placement="right-end">
		<slot name="trigger" />
		<template #popper>
			<div class="p-3 w-85">
				<CustomFieldSetter :isLoading="isLoading" :newField="newField" @cancel="cancel" @create="create">
					<input
						v-if="newField.type === fieldTypes.STRING"
						v-model="newField.value"
						type="text"
						:placeholder="$t('components.contacts.footer.dropdowns.enterValue')"
						class="input input-bordered w-full"
						@click.stop
					/>

					<input
						v-else-if="newField.type === fieldTypes.INTEGER"
						v-model.number="newField.value"
						type="number"
						:placeholder="$t('components.contacts.footer.dropdowns.enterNumber')"
						class="input input-bordered w-full"
						@click.stop
					/>

					<label
						v-else-if="newField.type === fieldTypes.BOOL"
						class="flex items-center gap-2 cursor-pointer"
						@click.stop
					>
						<input v-model="newField.value" type="checkbox" class="toggle toggle-primary" @click.stop />
						<span class="text-sm">{{
							newField.value
								? $t('components.contacts.footer.dropdowns.true')
								: $t('components.contacts.footer.dropdowns.false')
						}}</span>
					</label>

					<input
						v-else-if="newField.type === fieldTypes.DATE"
						v-model="newField.value"
						type="date"
						class="input input-bordered w-full"
						@click.stop
					/>
				</CustomFieldSetter>
			</div>
		</template>
	</CustomDropdown>
</template>

<script>
import CustomDropdown from '~/components/GlobalComponents/CustomDropdown.vue'
import CustomFieldSetter from '~/components/Flow/Node/Conditions/CustomFieldSetter.vue'
import { fieldTypes } from '~/models/Flow/utils/utils.ts'

export default {
	components: { CustomDropdown, CustomFieldSetter },
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
			chatAccountsStore: useChatAccountsStore(),
			contactsStore: useContactsStore(),
		}
	},
	data() {
		return {
			fieldTypes,
			newField: {
				key: '',
				type: fieldTypes.STRING,
				value: null,
			},
		}
	},
	watch: {
		'newField.type'() {
			this.newField.value = null
		},
	},
	methods: {
		hide() {
			this.$refs.dropdown?.hide()
		},
		resetForm() {
			this.newField = {
				key: '',
				type: fieldTypes.STRING,
				value: null,
			}
		},
		cancel() {
			this.resetForm()
			this.$refs.dropdown?.hide()
		},
		getConfirmText() {
			const total = this.contactsStore.currentScopeSlice?.total || 0
			let count = this.selectedContactIds.length
			if (this.selectionType === 'exclude') {
				count = total - this.selectedContactIds.length
			}
			return this.$t('components.contacts.bulkActions.addCustomField.description', {
				count,
				fieldName: this.newField.key,
			})
		},
		async create() {
			if (!this.newField.key || this.isLoading) return

			const result = await this.$swal.fire({
				title: this.$t('components.contacts.bulkActions.addCustomField.title'),
				text: this.getConfirmText(),
				icon: 'warning',
				showCancelButton: true,
				confirmButtonText: this.$t('components.contacts.bulkActions.confirm'),
				cancelButtonText: this.$t('components.contacts.bulkActions.cancel'),
			})
			if (!result.isConfirmed) return

			this.$emit('update:isLoading', true)

			this.contactsStore
				.createCustomFieldBulkRequest(
					this.selectedContactIds,
					this.selectionType,
					this.chatAccountsStore.active?.id,
					this.newField.key,
					this.newField.type,
					this.newField.value,
				)
				.then(() => {
					this.resetForm()
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
