<template>
	<div></div>
</template>

<script>
export default {
	name: 'AuthorizationSocketListener',
	setup() {
		return {
			authStore: useAuthStore(),
			chatAccountsStore: useChatAccountsStore(),
		}
	},
	watch: {
		'authStore.user'(newVal, oldVal) {
			if (newVal) {
				this.subscribeAccountAuthorized(newVal)
				this.subscribeAccountLoading(newVal)
				this.subscribeFacebookAccountConnected(this.authStore.user)
			}

			if (oldVal) {
				this.unsubscribeAccountAuthorized(oldVal)
				this.unsubscribeAccountLoading(oldVal)
				this.unsubscribeFacebookAccountConnected(oldVal)
			}
		},
	},
	async mounted() {
		this.subscribeAccountAuthorized(this.authStore.user)
		this.subscribeAccountLoading(this.authStore.user)

		this.subscribeFacebookAccountConnected(this.authStore.user)
	},
	beforeUnmount() {
		this.unsubscribeAccountAuthorized(this.authStore.user)
		this.unsubscribeAccountLoading(this.authStore.user)

		this.unsubscribeFacebookAccountConnected(this.authStore.user)
	},
	emits: ['accountAdded'],
	methods: {
		subscribeAccountLoading(user) {
			this.$echo
				.channel('account-authorized-loading-' + user.id)
				.listen('Chat.Instagram.AccountAuthorizedSetLoadingEvent', (e) => {
					this.$emitter.emit('setLoadingAddAccountModal', e)
				})
		},
		unsubscribeAccountLoading(user) {
			this.$echo.leaveChannel('account-authorized-loading-' + user.id)
		},
		async subscribeAccountAuthorized(user) {
			this.$echo.channel('account-authorized-' + user.id).listen('Chat.Instagram.AccountAuthorizedEvent', async (e) => {
				consoleLog('AccountAuthorizedEvent received', e)
				const chatAccount = e.chat_account
				chatAccount.postAccount = e.post_account
				await this.chatAccountsStore.addAccount(chatAccount)
				await this.$nextTick()
				this.chatAccountsStore.setActive(chatAccount.id)
				this.$emitter.emit('hideAddAccountModal')

				await this.$router.push(
					this.$localeRoute({
						name: 'account',
						query: { ...this.$route.query, username: chatAccount.postAccount.username, accountAdded: 1 },
					}),
				)

				await this.$nextTick()
				this.$emitter.emit('accountAdded')
				this.$gtag('event', 'chatAccountAdded', {
					account: chatAccount?.postAccount.username,
				})
				this.$fbq('track', 'Lead', {
					content_name: chatAccount?.postAccount.username,
				})
				this.$fbq('track', 'CompleteRegistration', {
					content_name: chatAccount?.postAccount.username,
					status: true,
				})
			})
		},
		unsubscribeAccountAuthorized(user) {
			this.$echo.leaveChannel('account-authorized-' + user.id)
		},
		subscribeFacebookAccountConnected(user) {
			consoleLog('Subscribing to facebook-account-connected-' + user.id)
			this.$echo.channel('facebook-account-connected-' + user.id).listen('Chat.Facebook.AccountConnectedEvent', (e) => {
				consoleLog('AccountConnectedEvent received', e)

				this.$emitter.emit('hideAddAccountModal')
				this.$router.push(this.$localeRoute({ name: 'pre-meta-accounts' }))
			})
		},
		unsubscribeFacebookAccountConnected(user) {
			this.$echo.leaveChannel('facebook-account-connected-' + user.id)
		},
		async test() {
			this.$emitter.emit('hideAddAccountModal')

			await this.$router.push(
				this.$localeRoute({
					name: 'account',
					query: { ...this.$route.query, username: 'obamatrump20' },
				}),
			)

			await this.$nextTick()
			this.$emitter.emit('accountAdded')
		},
	},
}
</script>
