<template>
	<div class="flex-1">
		<div class="sticky top-0 bg-base-100 z-2 p-2 gap-1 flex flex-wrap items-center mb-4 px-2">
			<h3 class="text-xl flex items-center gap-2">
				<i class="fa fa-list-alt text-secondary" />
				{{ $t('components.accounts.attributesTab.chatAccountCustomFields.title') }}
				<span class="badge badge-primary badge-soft badge-sm">{{ customFields.length }}</span>
			</h3>
			<div class="flex items-center gap-3 ms-auto">
				<CustomDropdown placement="bottom-end" :distance="8" class="w-full max-w-96">
					<button class="btn btn-sm btn-info btn-transition">
						<i class="fa fa-plus" />
					</button>
					<template #popper="{ hide }">
						<div class="p-3 w-80">
							<CustomFieldCreator :chatAccountId="account.id" @customFieldCreated="hide" @customFieldCancelled="hide" />
						</div>
						<!--						<div class="p-5 flex gap-2">-->
						<!--							<input-->
						<!--								:readonly="customFieldLoading"-->
						<!--								@keydown.enter="saveNewCustomFields(hide)"-->
						<!--								class="input"-->
						<!--								v-model="newCustomFieldKey"-->
						<!--								ref="newCustomField"-->
						<!--								:placeholder="$t('components.accounts.attributesTab.chatAccountCustomFields.fieldNamePlaceholder')"-->
						<!--							/>-->
						<!--							<button :disabled="customFieldLoading" @click="saveNewCustomFields(hide)" class="btn btn-soft btn-info">-->
						<!--								<LoadingElement size="18" :is-loading="customFieldLoading">-->
						<!--									<i class="fa fa-save" />-->
						<!--								</LoadingElement>-->
						<!--							</button>-->
						<!--						</div>-->
					</template>
				</CustomDropdown>
				<button :disabled="customFieldLoading" class="btn btn-sm btn-primary" @click="updateCustomFields">
					<LoadingElement size="15" :is-loading="customFieldLoading">
						<i class="fa fa-check" />
					</LoadingElement>
					{{ $t('components.accounts.attributesTab.chatAccountCustomFields.save') }}
				</button>
			</div>
		</div>
		<div class="flex-1 md:pl-2">
			<State :is-loading="customFieldsLoading" :is-empty="customFields.length === 0" empty-img-url="">
				<label class="pb-5">
					<input ref="allCheckbox" class="checkbox checkbox-xs" type="checkbox" @change="toggleSelectAll" />
					<small>{{ $t('components.accounts.attributesTab.chatAccountCustomFields.selectAll') }}</small>
				</label>
				<ul>
					<li v-for="field in customFields" :key="field.id" class="w-full rounded-none py-1">
						<div class="flex items-center gap-4">
							<input v-model="selectedCustomFields" :value="field.id" type="checkbox" class="checkbox checkbox-xs" />

							<label class="flex items-center gap-2">
								<i class="fa" :class="getFieldTypeIcon(field.type)" />
								<input class="input input-sm" v-model="field.key" />
							</label>
						</div>
					</li>
				</ul>
				<template #emptyIcon>
					<i class="fa fa-list-alt text-4xl text-subtle" />
				</template>
				<template #emptyTitle>
					<span class="text-subtle">
						{{ $t('components.accounts.attributesTab.chatAccountCustomFields.emptyState.title') }}
					</span>
				</template>
			</State>

			<div v-if="selectedCustomFields.length !== 0" class="sticky bottom-0 py-5 left-0 bg-base-100">
				<button class="btn btn-sm btn-error btn-soft" @click="askToRemoveCustomFields">
					<LoadingElement :is-loading="customFieldsRemoving">
						<i class="fa fa-trash" />
						<span v-if="selectedCustomFields.length > 0" class="ml-1">({{ selectedCustomFields.length }})</span>
					</LoadingElement>
				</button>
			</div>
		</div>
	</div>
</template>

<script>
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import State from '~/components/GlobalComponents/State.vue'
import { useChatAccountAttributesStore } from '~/stores/chatAccountAttributes.ts'
import CustomFieldCreator from '~/components/Flow/Node/Conditions/CustomFieldCreator.vue'
import { getFieldTypeIcon } from '~/models/Flow/utils/utils.ts'
import CustomDropdown from '~/components/GlobalComponents/CustomDropdown.vue'

export default {
	components: {
		CustomFieldCreator,
		CustomDropdown,
		LoadingElement,
		State,
	},

	props: {
		account: {
			type: Object,
			required: true,
		},
	},
	setup() {
		return {
			chatAccountAttributes: useChatAccountAttributesStore(),
		}
	},
	data() {
		return {
			selectedCustomFields: [],
			newCustomFieldKey: '',
			customFieldLoading: false,
			customFieldsLoading: false,
			customFieldsRemoving: false,
		}
	},
	computed: {
		customFields() {
			return this.account.customFields
		},
		// hasChanged() {
		// 	return JSON.stringify(this.customFields) !== JSON.stringify(this.account.customFields)
		// },
	},
	mounted() {
		this.customFieldsLoading = true
		this.chatAccountAttributes.fetchCustomFields(this.account.id).finally(() => {
			this.customFieldsLoading = false
		})
	},
	watch: {
		selectedCustomFields() {
			if (!this.$refs.allCheckbox) return

			if (this.selectedCustomFields.length === 0) {
				this.$refs.allCheckbox.checked = false
				this.$refs.allCheckbox.indeterminate = false
				return
			}

			if (this.selectedCustomFields.length < this.customFields.length) {
				this.$refs.allCheckbox.indeterminate = true
				return
			}
			if (this.selectedCustomFields.length === this.customFields.length) {
				this.$refs.allCheckbox.checked = true
				this.$refs.allCheckbox.indeterminate = false
			}
		},
	},
	methods: {
		getFieldTypeIcon,
		// prepareCustomFields() {
		// 	this.customFields = JSON.parse(JSON.stringify(this.account.customFields))
		// },

		toggleSelectAll($event) {
			if ($event.target.checked) {
				this.selectedCustomFields = this.customFields.map((field) => field.id)
			} else {
				this.selectedCustomFields = []
			}
		},
		askToRemoveCustomFields() {
			this.$swal
				.fire({
					title: this.$t('components.accounts.attributesTab.chatAccountCustomFields.deleteConfirmation.title'),
					text: this.$t('components.accounts.attributesTab.chatAccountCustomFields.deleteConfirmation.text', {
						count: this.selectedCustomFields.length,
					}),
					icon: 'warning',
					showCancelButton: true,
					confirmButtonColor: '#3085d6',
					cancelButtonColor: '#d33',
					confirmButtonText: this.$t(
						'components.accounts.attributesTab.chatAccountCustomFields.deleteConfirmation.confirm',
					),
					cancelButtonText: this.$t(
						'components.accounts.attributesTab.chatAccountCustomFields.deleteConfirmation.cancel',
					),
				})
				.then((result) => {
					if (result.isConfirmed) {
						this.removeSelectedCustomFields()
					}
				})
		},
		updateCustomFields() {
			this.customFieldLoading = true
			this.chatAccountAttributes.updateCustomFields(this.account.id, this.customFields).finally(() => {
				this.customFieldLoading = false
			})
		},

		// async saveNewCustomFields(hideFunc) {
		// 	if (!this.newCustomFieldKey.trim()) return
		//
		// 	this.customFieldLoading = true
		// 	await this.chatAccountAttributes
		// 		.createCustomFieldRequest(this.account.id, this.newCustomFieldKey)
		// 		.then((response) => {
		// 			this.newCustomFieldKey = ''
		// 			hideFunc?.()
		// 			this.prepareCustomFields()
		// 		})
		// 		.finally(() => {
		// 			this.customFieldLoading = false
		// 		})
		// },

		removeSelectedCustomFields() {
			if (this.selectedCustomFields.length === 0) return

			const fieldsToRemove = [...this.selectedCustomFields]
			this.customFieldsRemoving = true
			this.chatAccountAttributes.removeCustomFields(this.account.id, fieldsToRemove).finally(() => {
				this.customFieldsRemoving = false
				this.selectedCustomFields = []
				// this.prepareCustomFields()
			})
		},
	},
}
</script>
