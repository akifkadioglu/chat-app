<template>
	<Modal ref="modal" :closeable="false" :showCloseButton="false" :showXButton="false">
		<div class="text-center mb-6">
			<div class="absolute">
				<a @click.prevent="goBackOrFlows" href="javascript:" class="btn btn-ghost">
					<i class="fa fa-chevron-left" />
				</a>
			</div>
			<h3 class="text-xl font-bold text-base-content mb-2">{{ $t('components.flow.selectAccountModal.title') }}</h3>
			<p class="text-base-content/70 text-sm">{{ $t('components.flow.selectAccountModal.description') }}</p>
		</div>
		<div class="space-y-3">
			<div
				v-for="chatAccount in allAccounts"
				:key="chatAccount.id"
				@click="selectAccount(chatAccount.id)"
				:class="[
					'flex items-center gap-4 p-4 rounded-lg border transition-all duration-200 cursor-pointer group relative',
					chatAccount.id === activeAccountId
						? 'border-primary bg-primary/10 ring-2 ring-primary/20'
						: 'border-base-300 hover:border-primary hover:bg-primary/5',
				]"
			>
				<i
					class="pointer-events-none absolute left-2 top-4 z-1 fa fa-xl"
					:class="{
						'fa-exclamation-circle text-warning': chatAccount.needsUpgrade,
						'fa-exclamation-circle text-error': !chatAccount.isStatusActive,
					}"
				/>

				<ProfilePicture
					:src="chatAccount.postAccount.profilePicture"
					ring="ring-2"
					ringColor="ring-base-300 group-hover:ring-primary"
				/>
				<div class="flex-1 min-w-0">
					<div
						:class="[
							'font-medium transition-colors',
							chatAccount.id === activeAccountId ? 'text-primary' : 'text-base-content group-hover:text-primary',
						]"
					>
						{{ chatAccount.postAccount.name }}
					</div>
					<div class="text-sm text-base-content/60">@{{ chatAccount.postAccount.username }}</div>
				</div>
				<div
					:class="[
						'transition-opacity',
						chatAccount.id === activeAccountId ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
					]"
				>
					<svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
					</svg>
				</div>
			</div>

			<div class="mt-10">
				<button
					class="btn btn-primary btn-soft btn-transition btn-block transition duration-100 hover:text-white"
					@click="$emitter.emit('showAddAccountModal')"
				>
					<i class="fa fa-plus"></i>
					<span>{{ $t('components.chat.sidebar.accountSelector.addAccountButton') }}</span>
				</button>
			</div>
		</div>
	</Modal>
</template>
<script>
import Modal from '~/components/GlobalComponents/Modal.vue'
import ProfilePicture from '~/components/GlobalComponents/ProfilePicture.vue'

export default {
	components: {
		ProfilePicture,
		Modal,
	},
	setup() {
		return {
			localeRoute: useLocaleRoute(),
		}
	},
	data() {
		return {
			flowStore: useFlowStore(),
			chatAccountsStore: useChatAccountsStore(),
		}
	},
	mounted() {
		this.$emitter.on('showSelectAccountModal', () => {
			if (this.chatAccountsStore.count === 1) {
				return this.selectAccount(this.chatAccountsStore.all[0].id)
			}
			this.$refs.modal?.showModal()
			// this.selectAccount(this.allAccounts[0].id)
		})
		this.$emitter.on('hideSelectAccountModal', () => {
			this.$refs.modal?.hideModal()
			// this.selectAccount(this.allAccounts[0].id)
		})
	},
	computed: {
		activeAccountId() {
			return this.chatAccountsStore.active
		},
		allAccounts() {
			return this.chatAccountsStore.all
		},
	},
	watch: {
		//AppLayout'ta kullanılıyor bu modal ama AppLayout'ta sadece flowlar yok chat, account, comment sayfaları da var
		// 'flowStore.flow.chatAccountId'(newVal) {
		// 	consoleLog('watch: {flowStore.flow.chatAccountId(newVal) {', newVal)
		// 	this.chatAccountsStore.setActive(newVal)
		// },
	},
	methods: {
		selectAccount(accountId) {
			if (this.flowStore.flow) {
				this.flowStore.flow.chatAccountId = accountId
			}
			consoleLog('selectAccount çağırıldı', accountId)
			this.chatAccountsStore.setActive(accountId)

			this.$refs.modal?.hideModal()
		},
		goBackOrFlows() {
			this.$refs.modal.hideModal()
			if (window.history.length > 1) {
				return this.$router.back()
			}
			this.$router.push(this.localeRoute('flows'))
		},
	},
}
</script>
