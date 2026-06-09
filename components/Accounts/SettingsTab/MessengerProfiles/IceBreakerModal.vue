<template>
	<Modal ref="modal" size="max-w-5xl">
		<div class="grid grid-cols-2 h-full">
			<!-- Editor -->
			<div class="h-full overflow-y-auto col-span-2 md:col-span-1">
				<Editor
					:key="MenuTypes.ICE_BREAKERS"
					:chat-account-id="chatAccountId"
					:type="MenuTypes.ICE_BREAKERS"
					:menu="menu"
					:default-locale="defaultLocale"
					:is-loading="isLoading"
					@save="handleSave"
					@update:default-locale="handleDefaultLocaleChange"
					@update:selected-locale="handleSelectedLocaleChange"
					@locale-removed="handleLocaleRemoved"
				>
					<template #header>
						<div class="py-5 space-y-2">
							<div class="text-xl">
								{{ $t('components.accounts.settingsTab.messengerProfiles.iceBreakerModal.title') }}
							</div>
							<div class="opacity-50 text-sm">
								{{ $t('components.accounts.settingsTab.messengerProfiles.iceBreakerModal.description') }}
							</div>
						</div>
					</template>
				</Editor>
			</div>

			<!-- Mobile Preview -->
			<div class="items-center justify-center h-full hidden md:flex">
				<MobilePreview>
					<template #screen>
						<ChatScreen :postAccount="postAccount" />
					</template>

					<template #options>
						<div class="pb-25">
							<p class="text-center opacity-50 py-3">
								<i18n-t keypath="components.accounts.settingsTab.messengerProfiles.iceBreakerModal.suggestionText">
									<template #username>{{ postAccount.username }}</template>
								</i18n-t>
							</p>
							<div class="flex flex-col gap-4 justify-center">
								<div
									v-for="cta in currentCtas"
									:key="cta.question"
									class="bg-base-300 border-base-300 text-[#2A7EFFFF] py-2 px-5 text-xl rounded-4xl mx-auto whitespace-normal break-words break-all text-center"
								>
									{{ cta.question }}
								</div>
							</div>
						</div>
					</template>
				</MobilePreview>
			</div>
		</div>
	</Modal>
</template>
<script>
import Modal from '~/components/GlobalComponents/Modal.vue'
import MobilePreview from '~/components/Chat/MobilePreview/MobilePreview.vue'
import Editor from '~/components/Chat/AccountMenuEditor/Editor.vue'
import ChatScreen from '~/components/Chat/MobilePreview/ChatScreen.vue'
import { MenuTypes, MessengerProfileMenuModel } from '~/models/messengerProfileMenu.ts'

export default {
	props: {
		hasIceBreakers: {
			type: Boolean,
			default: false,
		},
		menu: {
			type: MessengerProfileMenuModel,
			required: true,
		},
		defaultLocale: {
			type: String,
			required: true,
		},
		chatAccountId: {
			type: Number,
			required: true,
		},
		isLoading: {
			type: Boolean,
			default: false,
		},
	},
	components: {
		ChatScreen,
		Editor,
		MobilePreview,
		Modal,
	},
	data() {
		return {
			MenuTypes,
			postAccount: {},
			ctas: [],
			selectedLocale: this.defaultLocale,
		}
	},
	computed: {
		currentCtas() {
			if (!this.selectedLocale) {
				this.handleSelectedLocaleChange(this.defaultLocale)
			}

			const currentMenu = this.menu.getIceBreakerByLocale(this.selectedLocale)
			if (!currentMenu) {
				// Create default menu if not exists
				this.menu.addIceBreakerLocale(this.selectedLocale)
				const newMenu = this.menu.getIceBreakerByLocale(this.selectedLocale)
				if (newMenu && newMenu.call_to_actions.length === 0) {
					newMenu.addCallToAction({ question: '' })
				}
				return newMenu?.call_to_actions || []
			}

			return currentMenu.call_to_actions || []
		},
	},
	watch: {
		'menu.ice_breakers': {
			handler() {
				this.ctas = [...this.currentCtas]
			},
			deep: true,
			immediate: true,
		},
		selectedLocale: {
			handler() {
				this.ctas = [...this.currentCtas]
			},
			immediate: true,
		},
	},
	methods: {
		showModal(postAccount) {
			this.postAccount = postAccount
			this.ctas = [...this.currentCtas]
			this.$refs.modal.showModal()
		},
		handleSave(data) {
			this.$emit('save', data)
		},
		handleDefaultLocaleChange(newDefaultLocale) {
			this.$emit('update:defaultLocale', newDefaultLocale)
		},
		handleSelectedLocaleChange(newSelectedLocale) {
			this.selectedLocale = newSelectedLocale
		},
		handleLocaleRemoved(data) {
			this.selectedLocale = data.defaultLocale
			this.$emit('locale-removed', data)
		},
	},
}
</script>
<style scoped></style>
