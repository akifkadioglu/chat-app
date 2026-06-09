<template>
	<MenuCardCreator
		:key="chatAccount.id"
		:title="$t('components.accounts.overviewTab.iceBreaker.title')"
		:description="$t('components.accounts.overviewTab.iceBreaker.description')"
		:has-menu="hasIceBreakers"
		:is-loading="isLoading"
		@askRemoveMenu="askToRemoveMenu"
		@setupMenu="this.$refs.iceBreakerModal.showModal(chatAccount.postAccount)"
	>
		<template #icon>
			<i class="fa-regular fa-snowflake" />
		</template>
	</MenuCardCreator>
	<IceBreakerModal
		:hasIceBreakers="hasIceBreakers"
		:menu="menu"
		:defaultLocale="defaultLocale"
		:chat-account-id="chatAccount.id"
		:is-loading="isLoading"
		ref="iceBreakerModal"
		@save="handleSave"
		@update:defaultLocale="handleDefaultLocaleUpdate"
		@locale-removed="handleLocaleRemoved"
	/>
</template>
<script>
import IceBreakerModal from '~/components/Accounts/SettingsTab/MessengerProfiles/IceBreakerModal.vue'
import apiList from '~/apis/ApiList.js'
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import { MessengerProfileMenuModel } from '~/models/messengerProfileMenu.ts'
import { getCustomizedLanguage } from '~/helpers/availableLanguages.js'
import { ChatAccount } from '~/models/ChatAccount.ts'
import MenuCardCreator from '~/components/Accounts/SettingsTab/MessengerProfiles/MenuCardCreator.vue'

export default {
	name: 'IceBreakerMenuCard',
	components: { MenuCardCreator, LoadingElement, IceBreakerModal },
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
			hasIceBreakers: false,
		}
	},
	computed: {
		iceBreakerLocalizationsLength() {
			return this.menu.getIceBreakerLocales().length
		},
		iceBreakerItemsLength() {
			return this.menu.getTotalCallToActions('ice_breakers')
		},
	},
	mounted() {
		this.loadIceBreakers()
	},
	methods: {
		async loadIceBreakers() {
			this.isLoading = true
			this.$requestAdapter
				.get(apiList.chat.instagram.chatAccountId.iceBreakers.get, {
					chatAccountId: this.chatAccount.id,
				})
				.then((res) => {
					if (res.data) {
						this.menu = MessengerProfileMenuModel.fromJSON({
							platform: res.data.platform || 'instagram',
							ice_breakers: res.data.ice_breakers?.filter((menu) => menu.locale !== 'default') || [],
						})
						this.defaultLocale = res.data.default_locale ?? getCustomizedLanguage(this.sessionStore.data.country).locale
						this.hasIceBreakers = this.menu.hasIceBreakers()
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
				.post(apiList.chat.instagram.chatAccountId.iceBreakers.create, data, {
					chatAccountId: this.chatAccount.id,
				})
				.then((res) => {
					this.$toast.success(this.$t('components.accounts.overviewTab.iceBreaker.messages.success'))
					this.hasIceBreakers = this.menu.hasIceBreakers()
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
			await this.handleSave(data)
		},
		askToRemoveMenu() {
			this.$swal
				.fire({
					title: this.$t('components.accounts.overviewTab.iceBreaker.messages.remove.title'),
					text: this.$t('components.accounts.overviewTab.iceBreaker.messages.remove.message'),
					icon: 'warning',
					showCancelButton: true,
					confirmButtonColor: '#3085d6',
					cancelButtonColor: '#d33',
					confirmButtonText: this.$t('components.chat.accountMenuEditor.editor.confirmDialog.confirmButtonText'),
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
					apiList.chat.instagram.chatAccountId.iceBreakers.delete,
					{},
					{
						chatAccountId: this.chatAccount.id,
					},
				)
				.then((res) => {
					this.$toast.success(this.$t('components.accounts.overviewTab.iceBreaker.messages.remove.success'))
					this.menu = MessengerProfileMenuModel.createEmpty()
					this.hasIceBreakers = false
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
