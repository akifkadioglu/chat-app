<template>
	<div class="mt-auto mb-3 pl-3 flex justify-start items-center gap-2 pt-3 border-t border-base-300">
		<span class="text-sm text-muted">
			<template v-if="selectionType === SELECTION_TYPES.EXCLUDE">
				{{ $t('components.contacts.footer.allSelected') }}
				<template v-if="selectedContactIds.length > 0">
					{{ $t('components.contacts.footer.allSelectedExcept', { count: selectedContactIds.length }) }}
				</template>
			</template>
			<template v-else>
				{{ $t('components.contacts.footer.selectedCount', { count: selectedContactIds.length }) }}
			</template>
		</span>

		<CustomDropdown ref="dropdown" placement="top-start">
			<button class="btn btn-sm btn-soft" :disabled="isLoading">
				<LoadingElement :isLoading="isLoading" />
				<span>{{ $t('components.contacts.footer.bulkActions') }}</span>
				<i class="fa fa-chevron-up text-xs" />
			</button>
			<template #popper>
				<ul :class="{ 'opacity-50 pointer-events-none': isLoading }" class="menu bg-base-100 rounded-lg min-w-48 p-1">
					<TagAddDropdown
						v-model:isLoading="isLoading"
						:selectedContactIds="selectedContactIds"
						:selectionType="selectionType"
						@done="done"
					>
						<template #trigger>
							<li>
								<a href="javascript:">
									<i class="fa fa-tag" />
									<span>{{ $t('components.contacts.footer.dropdowns.addTag') }}</span>
								</a>
							</li>
						</template>
					</TagAddDropdown>
					<TagRemoveDropdown
						v-model:isLoading="isLoading"
						:selectedContactIds="selectedContactIds"
						:selectionType="selectionType"
						@done="done"
					>
						<template #trigger>
							<li>
								<a href="javascript:">
									<i class="fa fa-tag text-subtle" />
									<span>{{ $t('components.contacts.footer.dropdowns.removeTag') }}</span>
								</a>
							</li>
						</template>
					</TagRemoveDropdown>
					<CustomFieldAddDropdown
						v-model:isLoading="isLoading"
						:selectedContactIds="selectedContactIds"
						:selectionType="selectionType"
						@done="done"
					>
						<template #trigger>
							<li>
								<a href="javascript:">
									<i class="fa fa-list-alt" />
									<span>{{ $t('components.contacts.footer.dropdowns.addCustomField') }}</span>
								</a>
							</li>
						</template>
					</CustomFieldAddDropdown>
					<CustomFieldRemoveDropdown
						v-model:isLoading="isLoading"
						:selectedContactIds="selectedContactIds"
						:selectionType="selectionType"
						@done="done"
					>
						<template #trigger>
							<li>
								<a href="javascript:">
									<i class="fa fa-list-alt text-subtle" />
									<span>{{ $t('components.contacts.footer.dropdowns.removeCustomField') }}</span>
								</a>
							</li>
						</template>
					</CustomFieldRemoveDropdown>
					<CustomFieldUpdateDropdown
						v-model:isLoading="isLoading"
						:selectedContactIds="selectedContactIds"
						:selectionType="selectionType"
						@done="done"
					>
						<template #trigger>
							<li>
								<a href="javascript:">
									<i class="fa fa-list-alt text-info" />
									<span>{{ $t('components.contacts.footer.dropdowns.updateCustomField') }}</span>
								</a>
							</li>
						</template>
					</CustomFieldUpdateDropdown>
					<li :class="{ 'opacity-50 pointer-events-none': isLoading }">
						<a href="javascript:" @click="handleResumeFlows">
							<i class="fa-solid fa-paper-plane" />
							<span>{{ $t('components.contacts.footer.resumeFlows') }}</span>
						</a>
					</li>
					<PauseFlowsDropdown @pauseFlows="handlePauseFlows" placement="right-end">
						<template #trigger>
							<li :class="{ 'opacity-50 pointer-events-none': isLoading }">
								<a href="javascript:">
									<i class="fa fa-pause" />
									<span>{{ $t('components.contacts.footer.pauseFlows') }}</span>
								</a>
							</li>
						</template>
					</PauseFlowsDropdown>
					<li :class="{ 'opacity-50 pointer-events-none': isLoading }">
						<a href="javascript:" class="text-error" @click="handleDeleteContacts">
							<!--							:class="{ 'opacity-50 pointer-events-none': selectionType === SELECTION_TYPES.EXCLUDE && authStore.user?.id !== ILYAS_GUNES_USER_ID, }"-->
							<i class="fa fa-trash" />
							<span>{{ $t('components.contacts.footer.deleteContacts') }}</span>
						</a>
					</li>
				</ul>
			</template>
		</CustomDropdown>
	</div>
</template>
<script>
import CustomDropdown from '~/components/GlobalComponents/CustomDropdown.vue'
import { SELECTION_TYPES } from '~/models/Contact/Contact.ts'
import TagAddDropdown from '~/components/Contacts/ContactFooter/TagAddDropdown.vue'
import TagRemoveDropdown from '~/components/Contacts/ContactFooter/TagRemoveDropdown.vue'
import CustomFieldAddDropdown from '~/components/Contacts/ContactFooter/CustomFieldAddDropdown.vue'
import CustomFieldRemoveDropdown from '~/components/Contacts/ContactFooter/CustomFieldRemoveDropdown.vue'
import CustomFieldUpdateDropdown from '~/components/Contacts/ContactFooter/CustomFieldUpdateDropdown.vue'
import PauseFlowsDropdown from '~/components/Chat/ContactInfo/PauseFlowsDropdown.vue'
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import apiList from '~/apis/ApiList.js'

// user'ın ismi Umutcan Çetin (ilyasgunesofficial hesabının yöneticisi (sanırım))
const ILYAS_GUNES_USER_ID = 2510771

export default {
	components: {
		LoadingElement,
		PauseFlowsDropdown,
		CustomDropdown,
		TagAddDropdown,
		TagRemoveDropdown,
		CustomFieldAddDropdown,
		CustomFieldRemoveDropdown,
		CustomFieldUpdateDropdown,
	},
	props: {
		selectedContactIds: {
			type: Array,
			default: () => [],
		},
		selectionType: {
			type: String,
			default: SELECTION_TYPES.INCLUDE,
		},
	},
	emits: ['contactsDeleted', 'done'],
	setup() {
		return {
			contactsStore: useContactsStore(),
			chatAccountsStore: useChatAccountsStore(),
			conversationsStore: useConversationsStore(),
			authStore: useAuthStore(),
		}
	},
	data() {
		return {
			ILYAS_GUNES_USER_ID,
			SELECTION_TYPES,
			isLoading: false,
		}
	},
	methods: {
		done() {
			this.$refs.dropdown?.hide()
			consoleLog('done')
			this.isLoading = false
			this.$emit('done')
		},
		getAffectedCount() {
			const total = this.contactsStore.currentScopeSlice?.total || 0
			if (this.selectionType === SELECTION_TYPES.EXCLUDE) {
				return total - this.selectedContactIds.length
			}
			return this.selectedContactIds.length
		},
		async handleDeleteContacts() {
			//Bu özelliği ilyas güneş'e threads'te bu özellik var dediğimiz fakat sonradan fikrimizi değiştirdiğimiz için ona özel açıyoruz.
			// if (this.selectionType === SELECTION_TYPES.EXCLUDE && this.authStore.user?.id !== ILYAS_GUNES_USER_ID) return

			const count = this.getAffectedCount()
			const result = await this.$swal.fire({
				title: this.$t('components.contacts.bulkActions.deleteContacts.title'),
				text: this.$t('components.contacts.bulkActions.deleteContacts.description', { count }),
				icon: 'warning',
				showCancelButton: true,
				confirmButtonText: this.$t('components.contacts.bulkActions.confirm'),
				cancelButtonText: this.$t('components.contacts.bulkActions.cancel'),
			})
			if (!result.isConfirmed) return
			this.deleteSelectedContacts()
		},
		getDurationText(durationMinutes) {
			if (!durationMinutes || durationMinutes === 'forever' || durationMinutes <= 0) {
				return this.$t('components.contacts.bulkActions.pauseFlows.forever')
			}
			if (durationMinutes >= 1440 && durationMinutes % 1440 === 0) {
				return this.$t('components.contacts.bulkActions.pauseFlows.days', { value: durationMinutes / 1440 })
			}
			if (durationMinutes >= 60 && durationMinutes % 60 === 0) {
				return this.$t('components.contacts.bulkActions.pauseFlows.hours', { value: durationMinutes / 60 })
			}
			return this.$t('components.contacts.bulkActions.pauseFlows.minutes', { value: durationMinutes })
		},
		async handlePauseFlows(durationMinutes) {
			const count = this.getAffectedCount()
			const duration = this.getDurationText(durationMinutes)
			const result = await this.$swal.fire({
				title: this.$t('components.contacts.bulkActions.pauseFlows.title'),
				text: this.$t('components.contacts.bulkActions.pauseFlows.description', { count, duration }),
				icon: 'warning',
				showCancelButton: true,
				confirmButtonText: this.$t('components.contacts.bulkActions.confirm'),
				cancelButtonText: this.$t('components.contacts.bulkActions.cancel'),
			})
			if (!result.isConfirmed) return
			this.pauseFlows(durationMinutes)
		},
		async handleResumeFlows() {
			const count = this.getAffectedCount()
			const result = await this.$swal.fire({
				title: this.$t('components.contacts.bulkActions.resumeFlows.title'),
				text: this.$t('components.contacts.bulkActions.resumeFlows.description', { count }),
				icon: 'warning',
				showCancelButton: true,
				confirmButtonText: this.$t('components.contacts.bulkActions.confirm'),
				cancelButtonText: this.$t('components.contacts.bulkActions.cancel'),
			})
			if (!result.isConfirmed) return
			this.resumeFlows()
		},
		deleteSelectedContacts() {
			if (this.isLoading) return

			this.isLoading = true

			this.$requestAdapter
				.post(apiList.chat.instagram.contacts.delete, {
					contactIds: this.selectedContactIds,
					selectionType: this.selectionType,
					chatAccountId: this.chatAccountsStore.active?.id,
				})
				.then(() => {
					const chatAccountId = this.chatAccountsStore.active?.id
					const scopeKey = chatAccountId ? `chatAccount-${chatAccountId}` : 'all'
					const scopeContacts = this.contactsStore.contactsForScope(scopeKey)

					if (this.selectionType === SELECTION_TYPES.EXCLUDE) {
						scopeContacts
							.filter((contact) => !this.selectedContactIds.includes(contact.id))
							.forEach((contact) => {
								this.conversationsStore.deleteConversationByContactId(contact.id)
								this.contactsStore.deleteContacts(contact.id)
							})
						return
					}
					this.selectedContactIds.forEach((contactId) => {
						this.conversationsStore.deleteConversationByContactId(contactId)
						this.contactsStore.deleteContacts(contactId)
					})

					this.done()
				})
				.catch((error) => {
					consoleLog('Error deleting contacts:', error)
				})
				.finally(() => {
					this.isLoading = false
				})
		},
		pauseFlows(durationMinutes) {
			if (this.isLoading) return

			this.isLoading = true
			this.$requestAdapter
				.post(apiList.chat.instagram.contacts.flows.pause, {
					contactIds: this.selectedContactIds,
					selectionType: this.selectionType,
					chatAccountId: this.chatAccountsStore.active?.id,
					durationMinutes,
				})
				.then((response) => {
					const pauseUntil = response.data.pause_until
					response.data.contact_ids.forEach((id) => {
						this.contactsStore.getContactById(id).flowsPauseUntil = new Date(pauseUntil)
					})
					this.done()
				})
				.finally(() => {
					this.isLoading = false
				})
		},
		resumeFlows() {
			if (this.isLoading) return

			this.isLoading = true

			this.$requestAdapter
				.post(apiList.chat.instagram.contacts.flows.resume, {
					contactIds: this.selectedContactIds,
					selectionType: this.selectionType,
					chatAccountId: this.chatAccountsStore.active?.id,
				})
				.then((response) => {
					this.$refs.dropdown?.hide()
					response.data.contact_ids.forEach((id) => {
						this.contactsStore.getContactById(id).flowsPauseUntil = null
					})
					this.done()
				})
				.finally(() => {
					this.isLoading = false
				})
		},
	},
}
</script>
