<template>
	<MenuCardCreator
		:key="chatAccount.id"
		:title="$t('components.accounts.overviewTab.persistentMenu.title')"
		:description="$t('components.accounts.overviewTab.persistentMenu.description')"
		:has-menu="hasPersistentMenu"
		:is-loading="isLoading"
		@askRemoveMenu="askToRemoveMenu"
		@setupMenu="this.$refs.persistentModal.showModal(chatAccount.postAccount)"
	>
		<template #icon>
			<i class="fas fa-bars" />
		</template>
	</MenuCardCreator>

	<PersistentModal
		:hasPersistentMenu="hasPersistentMenu"
		:menu="menu"
		:defaultLocale="defaultLocale"
		:chat-account-id="chatAccount.id"
		:is-loading="isLoading"
		ref="persistentModal"
		@save="handleSave"
		@update:defaultLocale="handleDefaultLocaleUpdate"
		@locale-removed="handleLocaleRemoved"
	/>
</template>
<script>
import PersistentModal from '~/components/Accounts/SettingsTab/MessengerProfiles/PersistentModal.vue'
import apiList from '~/apis/ApiList.js'
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import { MessengerProfileMenuModel } from '~/models/messengerProfileMenu.ts'
import { getCustomizedLanguage } from '~/helpers/availableLanguages.js'
import { ChatAccount } from '~/models/ChatAccount.ts'
import MenuCardCreator from '~/components/Accounts/SettingsTab/MessengerProfiles/MenuCardCreator.vue'
export default {
	name: 'PersistentMenuCard',
	components: { MenuCardCreator, LoadingElement, PersistentModal },
	props: {
		chatAccount: {
			type: ChatAccount,
			required: true,
		},
	},
	setup() {
		return {
			sessionStore: useSessionStore(),
		}
	},
	data() {
		return {
			isLoading: false,
			menu: MessengerProfileMenuModel.createEmpty(),
			defaultLocale: '',
			hasPersistentMenu: false,
		}
	},
	watch: {
		'chatAccount.id'() {
			this.isLoading = false
			this.menu = MessengerProfileMenuModel.createEmpty()
			this.defaultLocale = ''
			this.hasPersistentMenu = false
			this.loadPersistentMenu()
		},
	},
	computed: {
		persistentMenuLocalizationsLength() {
			return this.menu.getPersistentMenuLocales().length
		},
		persistentMenuItemsLength() {
			return this.menu.getTotalCallToActions('persistent_menu')
		},
	},
	mounted() {
		this.loadPersistentMenu()
	},
	methods: {
		async loadPersistentMenu() {
			this.isLoading = true
			this.$requestAdapter
				.get(apiList.chat.instagram.chatAccountId.persistentMenu.get, {
					chatAccountId: this.chatAccount.id,
				})
				.then((res) => {
					if (res.data) {
						const filteredMenus = res.data.persistent_menu?.filter((menu) => menu.locale !== 'default') || []
						this.menu = MessengerProfileMenuModel.fromJSON({
							platform: res.data.platform || 'instagram',
							persistent_menu: filteredMenus,
						})
						this.defaultLocale = res.data.default_locale ?? getCustomizedLanguage(this.sessionStore.data.country).locale
						this.hasPersistentMenu = this.menu.hasPersistentMenu()
					}
				})
				.catch((err) => {
					this.isError = true
					consoleLog(err)
				})
				.finally(() => {
					this.isLoading = false
				})
		},
		async handleSave(data) {
			this.isLoading = true
			this.menu = data.menu
			this.handleDefaultLocaleUpdate(data.defaultLocale)
			this.$requestAdapter
				.post(apiList.chat.instagram.chatAccountId.persistentMenu.create, data, {
					chatAccountId: this.chatAccount.id,
				})
				.then((res) => {
					this.$toast.success(this.$t('components.accounts.overviewTab.persistentMenu.messages.success'))
					this.hasPersistentMenu = this.menu.hasPersistentMenu()
				})
				.catch((error) => {
					consoleLog(error)
				})
				.finally(() => {
					this.isLoading = false
				})
		},
		handleDefaultLocaleUpdate(newDefaultLocale) {
			this.defaultLocale = newDefaultLocale
		},
		async handleLocaleRemoved(data) {
			this.menu = data.menu
		},
		askToRemoveMenu() {
			this.$swal
				.fire({
					title: this.$t('components.accounts.overviewTab.persistentMenu.messages.remove.title'),
					text: this.$t('components.accounts.overviewTab.persistentMenu.messages.remove.message'),
					icon: 'warning',
					showCancelButton: true,
					confirmButtonColor: '#3085d6',
					cancelButtonColor: '#d33',
					confirmButtonText: this.$t('components.chat.accountMenuEditor.editor.confirmDialog.confirmButtonText'),
					cancelButtonText: this.$t('components.chat.accountMenuEditor.editor.confirmDialog.cancelButtonText'),
				})
				.then((result) => {
					if (result.isConfirmed) {
						this.removeMenu()
					}
				})
		},
		async removeMenu() {
			this.isLoading = true
			this.$requestAdapter
				.post(
					apiList.chat.instagram.chatAccountId.persistentMenu.delete,
					{},
					{
						chatAccountId: this.chatAccount.id,
					},
				)
				.then((res) => {
					this.$toast.success(this.$t('components.accounts.overviewTab.persistentMenu.messages.remove.success'))
					this.menu = MessengerProfileMenuModel.createEmpty()
					this.hasPersistentMenu = false
				})
				.catch((error) => {
					consoleLog(error)
				})
				.finally(() => {
					this.isLoading = false
				})
		},
	},
}
</script>
