<template>
	<div class="h-full">
		<InstagramBrowserWarning v-if="showInstagramWarning" />
		<State
			:empty-title="$t('pages.app.emptyState.title')"
			:empty-content="$t('pages.app.emptyState.message')"
			:is-loading="loading"
			:is-error="!!error"
			:is-empty="isEmpty"
		>
			<template #error>
				<ErrorState :content="error?.data?.data?.message" @retry="getChatAccounts" />
			</template>
			<template #empty>
				<EmptyCase />
			</template>
			<div class="relative h-full">
				<slot />
			</div>
		</State>
	</div>
</template>

<script>
import State from '~/components/GlobalComponents/State.vue'
import AccountSelector from '~/components/Chat/Sidebar/AccountSelector.vue'
import StateElement from '~/components/GlobalComponents/StateElement.vue'
import CloseAction from '~/components/Flow/Node/CloseAction.vue'
import EmptyCase from '~/components/App/EmptyCase.vue'
import AccountConnectedView from '~/components/App/AccountConnectedView.vue'
import AuthorizationSocketListener from '~/components/App/AuthorizationSocketListener.vue'
import PaymentSuccessful from '~/components/Pricing/PaymentSuccessful.vue'
import InstagramBrowserWarning from '~/components/GlobalComponents/InstagramBrowserWarning.vue'
import ErrorState from '~/components/GlobalComponents/ErrorState.vue'

export default {
	components: {
		ErrorState,
		PaymentSuccessful,
		AuthorizationSocketListener,
		AccountConnectedView,
		EmptyCase,
		CloseAction,
		StateElement,
		AccountSelector,
		State,
		InstagramBrowserWarning,
	},
	setup() {
		const { isInstagramBrowser } = useInstagramBrowser()

		return {
			chatAccountsStore: useChatAccountsStore(),
			teamStore: useTeamStore(),
			localeRoute: useLocaleRoute(),
			authStore: useAuthStore(),
			isInstagramBrowser,
		}
	},
	data() {
		return {
			loading: true,
			showInstagramWarning: false,
		}
	},
	computed: {
		isEmpty() {
			return this.chatAccounts.length === 0
		},
		chatAccounts() {
			return this.chatAccountsStore.all
		},
		error() {
			return this.chatAccountsStore.error
		},
	},
	mounted() {
		consoleLog('App mounted - fetching chat accounts')

		// Check for Instagram browser and show warning modal once per session
		if (import.meta.client) {
			const hasSeenWarning = sessionStorage.getItem('instagram_warning_shown')

			if (this.isInstagramBrowser() && !hasSeenWarning) {
				this.showInstagramWarning = true
				sessionStorage.setItem('instagram_warning_shown', 'true')
			}
		}

		this.$emitter.on('getChatAccounts', async ($event) => {
			await this.getChatAccounts($event)
		})

		this.getChatAccounts()
		this.teamStore.fetchTeam()
	},
	methods: {
		async getChatAccounts(selectedAccountId = null) {
			this.loading = true
			await this.chatAccountsStore.fetchAll()
			await this.$nextTick()

			if (this.$route.query.username) {
				const chatAccount = this.chatAccountsStore.byUsername(this.$route.query.username)
				consoleLog('getChatAccounts methodu çağırıldı chatAccountsStore.setActive', chatAccount?.id)
				this.chatAccountsStore.setActive(chatAccount?.id)
			}

			if (this.$route.query.accountAdded) {
				this.$route.query.accountAdded = undefined
				this.$emitter.emit('accountAdded')
			}

			this.loading = false
		},
	},
}
</script>
