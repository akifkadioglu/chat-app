<template>
	<AppLayout
		:disableSelectAllAccount="true"
		sidebarTrailingWidthClasses="w-4/5 max-w-80 md:min-w-80 border-r border-subtle"
	>
		<template #contentHeader>
			<div v-if="activeChatAccount" class="flex items-center justify-between w-full flex-wrap">
				<h2 class="text-xl">
					{{ $t('pages.app.accounts.tabs.' + currentTabKey) }}
				</h2>
				<div>
					<RefreshPermissionButton
						:title="$t('pages.app.accounts.header.refreshPermissionsButton')"
						titleClass=""
						class="btn-soft btn-sm"
					/>
				</div>
			</div>
		</template>
		<template v-if="activeChatAccount && $route.params.tab" #sidebarTrailing>
			<ChatAccountSidebar :activeChatAccount="activeChatAccount" />
		</template>

		<div class="pt-5 pb-10">
			<NuxtPage v-if="activeChatAccount" />
		</div>
	</AppLayout>
</template>

<script>
import IsVerifiedImg from '~/components/GlobalComponents/isVerifiedImg.vue'
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import LocalizedLink from '~/components/GlobalComponents/LocalizedLink.vue'
import ChatAccountSidebar from '~/components/Accounts/ChatAccountSidebar.vue'
import { TABS } from '~/models/ChatAccount.ts'
import RefreshPermissionButton from '~/components/GlobalComponents/RefreshPermissionButton.vue'

export default {
	components: {
		RefreshPermissionButton,
		ChatAccountSidebar,
		LocalizedLink,
		LoadingElement,
		IsVerifiedImg,
	},
	setup() {
		definePageMeta({
			layout: 'app',
			middleware: ['auth-custom'],
		})
		return {
			chatAccountsStore: useChatAccountsStore(),
			localeRoute: useLocaleRoute(),
		}
	},
	computed: {
		chatAccounts() {
			return this.chatAccountsStore.all
		},
		chatAccountsCount() {
			return this.chatAccountsStore.count
		},
		activeChatAccount() {
			return this.chatAccountsStore.active
		},
		currentTabKey() {
			return this.$route.params.tab ?? TABS.overview.key
		},
	},
	mounted() {
		// this.getInstagramUrl()
		// // Seçilen hesap yoksa ve hesaplar varsa, ilk hesabı seç
		// if (!this.activeChatAccount && this.chatAccountsCount > 0) {
		// 	this.chatAccountsStore.setActive(this.chatAccounts[0].id)
		// }
	},
	data() {
		return {
			TABS,
		}
	},
	methods: {
		selectAccount(account) {
			this.chatAccountsStore.setActive(account?.id ?? null)
		},
	},
}
</script>
