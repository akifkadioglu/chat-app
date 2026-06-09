<template>
	<Html :lang="head.htmlAttrs.lang" :dir="head.htmlAttrs.dir" class="bg-simpliers">
		<Body class="overflow-hidden">
			<div id="simpliersFrame" class="simpliers-frame h-dvh flex flex-col pb-1!">
				<div v-if="nodeEnv === 'development' || (auth.loggedIn && auth.isAdmin)" class="rounded print:hidden">
					<LazyBaseComponentsAdminActions />
				</div>
				<MainHeader id="main-header h-[32px]" app-layout />
				<!--				<div class="text-sm text-center py-1">-->
				<!--					<simpliers-logo color-class="text-white opacity-30" />-->
				<!--				</div>-->
				<section
					class="flex flex-col flex-1 overflow-hidden rounded-lg relative"
					:class="{ 'rounded rounded-t-lg': chatAccountsStore.count === 0 }"
					:style="`height: calc(100dvh - 36px)`"
				>
					<transition
						name="fade"
						mode="out-in"
						enter-active-class="animate__animated animate__fadeIn"
						leave-active-class="animate__animated animate__fadeOut animate__faster"
					>
						<div v-if="showSuccessFeedback" class="absolute h-full w-full z-20 top-0 left-0">
							<div v-if="newChatAccount" class="relative h-full bg-base-100">
								<AccountConnectedView @close="newChatAccount = false" />
							</div>
							<div v-else-if="paymentSuccess" class="relative h-full bg-base-100">
								<PaymentSuccessful @close="paymentSuccess = false" />
							</div>
							<div v-else-if="flowJustPublished" class="relative h-full bg-base-100">
								<FlowJustPublished @close="flowJustPublished = false" />
							</div>
						</div>
					</transition>
					<div class="w-full h-full flex flex-col">
						<ChatHeader v-if="chatAccountsStore.count > 0" />
						<div id="appPage" class="flex-1 bg-base-100 overflow-y-auto">
							<!--						:style="`height: calc(100dvh - 84px ${showAccountStatusBanner ? ' - 34px' : ''}) !important`"-->
							<AppShell>
								<NuxtPage />
							</AppShell>
						</div>
					</div>
				</section>
			</div>
			<AuthorizationSocketListener />
			<AddAccountModal v-if="auth.loggedIn" />
			<RefreshPermissionModal />
			<CreateFlowModal />
			<SupportLauncher inApp />
			<UpgradeModal />
			<ActiveContactsInfoModal />
			<MaxOverageLimitModal v-if="auth.loggedIn" />
		</Body>
	</Html>
</template>

<script>
import AppShell from '~/components/App/AppShell.vue'
import AddAccountModal from '~/components/BaseComponents/AddAccountModal.vue'
import SimpliersLogo from '~/components/GlobalComponents/Brands/SimpliersLogo.vue'
import CreateFlowModal from '~/components/Flow/CreateFlowModal.vue'
import UpgradeModal from '~/components/Accounts/UpgradeModal.vue'
import RefreshPermissionModal from '~/components/BaseComponents/RefreshPermissionModal.vue'
import PaymentSuccessful from '~/components/Pricing/PaymentSuccessful.vue'
import AccountConnectedView from '~/components/App/AccountConnectedView.vue'
import AuthorizationSocketListener from '~/components/App/AuthorizationSocketListener.vue'
import FlowJustPublished from '~/components/Flow/FlowJustPublished.vue'
import ChatHeader from '~/components/BaseComponents/ChatHeader.vue'
import ActiveContactsInfoModal from '~/components/Pricing/ActiveContactsInfoModal.vue'
import MaxOverageLimitModal from '~/components/Accounts/BillingTab/MaxOverageLimitModal.vue'

export default {
	components: {
		AppShell,
		MaxOverageLimitModal,
		ActiveContactsInfoModal,
		ChatHeader,
		FlowJustPublished,
		AuthorizationSocketListener,
		AccountConnectedView,
		PaymentSuccessful,
		RefreshPermissionModal,
		UpgradeModal,
		CreateFlowModal,
		SimpliersLogo,
		AddAccountModal,
		MainHeader: defineAsyncComponent(() => import('~/components/BaseComponents/Header/MainHeader.vue')),
		SupportLauncher: defineAsyncComponent(() => import('~/components/Support/SupportLauncher.vue')),
	},
	computed: {
		showSuccessFeedback() {
			return this.newChatAccount || this.paymentSuccess || this.flowJustPublished
		},
	},
	setup() {
		const head = useLocaleHead()
		const settingsStore = useSettingsStore()

		usePageMeta({
			meta: [
				{
					name: 'server',
					content: settingsStore.serverName,
				},
			],
		})
		return {
			head,
			auth: useAuthStore(),
			router: useRouter(),
			localePath: useLocalePath(),
			localeRoute: useLocaleRoute(),
			settingsStore,
			sessionStore: useSessionStore(),
			colorMode: useColorMode(),
			chatAccountsStore: useChatAccountsStore(),
		}
	},
	data() {
		return {
			listeningMessages: false,
			nodeEnv: import.meta.env.NODE_ENV,
			newChatAccount: false,
			paymentSuccess: false,
			flowJustPublished: false,
		}
	},
	watch: {
		'$route.path'() {
			this.newChatAccount = false
			this.paymentSuccess = false
			this.flowJustPublished = false
		},
	},
	mounted() {
		if (import.meta.client) {
			// FontAwesome'ı asenkron yüklemek için
			setTimeout(() => {
				this.$domHelpers.loadExternalStyleSheet('/fonts/fontawesome710/css/all.min.css')
			}, 0)
		}

		this.$emitter.on('closeDropdowns', () => {
			this.closeDropdown()
		})
		this.$emitter.on('closeDropdown', () => {
			this.closeDropdown()
		})

		this.$emitter.on('paymentSuccess', () => {
			this.paymentSuccess = true
		})
		this.$emitter.on('flowPublished', () => {
			this.flowJustPublished = true
			setTimeout(() => {
				this.flowJustPublished = false
			}, 10000)
		})
		this.$emitter.on('accountAdded', () => {
			this.newChatAccount = true
		})
	},
	beforeUnmount() {
		this.$emitter.off('closeDropdowns')
		this.$emitter.off('closeDropdown')
		this.$emitter.off('paymentSuccess')
		this.$emitter.off('flowPublished')
		this.$emitter.off('accountAdded')

		consoleLog("layouts/app'te beforeUnmount anında chatAccountsStore.setActive null oluyor")
		this.chatAccountsStore.setActive(null)
	},
	methods: {
		closeDropdown() {
			// if (typeof document !== 'undefined' && document.activeElement) {
			// 	document.activeElement.blur()
			// }
		},
	},
}
</script>

<style>
/* @media (min-width: 768px) { */
/* md and up */
/* 	.app-page { */
/* height: calc(100dvh - 104px) !important; */
/* 	} */
/* } */
</style>
