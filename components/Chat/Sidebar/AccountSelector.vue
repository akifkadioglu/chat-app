<template>
	<nav class="relative w-24 border-r border-base-300 h-full">
		<ul class="menu h-full w-full gap-2 overflow-y-auto flex-nowrap">
			<!-- get all conversations -->
			<li v-tooltip.right="$t('components.chat.sidebar.accountSelector.allAccountsTooltip')" class="w-full">
				<a
					href="javascript:"
					:class="{ 'menu-active': !selectedAccount?.id, 'opacity-50 pointer-events-none': disableSelectAllAccount }"
					class="menu-item flex flex-col justify-center"
					@click="selectAllAccounts"
				>
					<!--					<div class="relative">-->
					<i class="fa fa-users text-lg block" />
					<!--					</div>-->
					<div class="text-xs">{{ $t('components.chat.sidebar.accountSelector.allAccountsLabel') }}</div>
				</a>
			</li>

			<!-- get accounts conversations -->
			<li
				v-for="account in chatAccounts"
				:key="account.id"
				v-tooltip.right="account.postAccount.username"
				class="menu-item w-full relative"
				:class="{
					'opacity-50 pointer-events-none':
						disableAccountChange && selectedAccount?.id && selectedAccount?.id !== account.id,
				}"
			>
				<i
					class="pointer-events-none absolute left-1 top-2 z-1 fa fa-xl"
					:class="{
						'fa-exclamation-circle text-warning': account.needsUpgrade,
						'fa-exclamation-circle text-error': !account.isStatusActive,
					}"
				/>
				<a
					:class="[
						{ 'menu-active': selectedAccount?.id === account.id },
						`border-account ${account?.borderAccountColor}`,
					]"
					class="gap-1 py-3 px-2 w-full flex flex-col"
					@click="selectAccount(account)"
				>
					<div class="relative">
						<ProfilePicture
							:src="account.postAccount.profilePicture"
							:ringColor="account.ringColor"
							ring="ring-2 ring-opacity-60"
							size="32"
						/>
						<span class="social-frame absolute flex items-center justify-center -bottom-2 -right-2 size-6 rounded-full">
							<i
								:class="`fa-${account.postAccount.social.name} text-${account.postAccount.social.name}`"
								class="fa-brands text-xl"
							/>
						</span>
					</div>
					<!--					<span  class="text-xs truncate w-full"> {{ account?.name ? account?.name.split(' ')[0] : account.username }} </span>-->
					<div
						v-if="account.unreadCount > 0"
						class="badge bg-simpliers text-white badge-sm absolute -top-1 -right-1 w-7 h-7 rounded-full border-0"
					>
						{{ account.unreadCount > 99 ? '99+' : account.unreadCount }}
					</div>
					<div
						class="w-full truncate text-xs mask-ellipse text-center font-username"
						:class="{ 'font-semibold underline underline-offset-2': account.subscribed }"
					>
						{{ account.postAccount.username }}
					</div>
				</a>
			</li>

			<UsageDropdown class="mt-auto" />
			<li class="w-full">
				<button
					tabindex="0"
					class="btn btn-primary btn-soft transition duration-100 hover:text-white py-1 h-auto w-full flex flex-wrap items-center gap-1"
					@click="$emitter.emit('showAddAccountModal')"
				>
					<i class="fa fa-plus"></i>
					<span>{{ $t('components.chat.sidebar.accountSelector.addAccountButton') }}</span>
				</button>
			</li>
			<li>
				<localized-link name="index" class="btn btn-sm">
					<i class="fa-regular fa-house fa-xl" />
				</localized-link>
			</li>
		</ul>

		<!-- Add Account Button -->
	</nav>
</template>
<script>
import LocalizedLink from '~/components/GlobalComponents/LocalizedLink.vue'
import ProfilePicture from '~/components/GlobalComponents/ProfilePicture.vue'
import UsageDropdown from '~/components/Chat/Sidebar/UsageDropdown.vue'

export default {
	components: { UsageDropdown, ProfilePicture, LocalizedLink },
	props: {
		disableSelectAllAccount: {
			type: Boolean,
			default: false,
		},
		disableAccountChange: {
			type: Boolean,
			default: false,
		},
	},
	computed: {
		chatAccounts() {
			return this.chatAccountsStore.all
		},
		chatAccountsCount() {
			return this.chatAccountsStore.count
		},
		selectedAccount() {
			return this.chatAccountsStore.active
		},
	},
	setup() {
		return {
			chatAccountsStore: useChatAccountsStore(),
		}
	},
	data() {
		return {
			instagramAuthUrl: '',
			// allAccountsSelectedBefore: false, // çıktıktan sonra girdiğim route'u da bilmem laızm. Bunu belki store'da tutmak lazım
		}
	},
	mounted() {
		this.$nextTick(() => {
			if (this.disableSelectAllAccount && this.selectedAccount === null) {
				this.$emitter.emit('showSelectAccountModal')
				// this.allAccountsSelectedBefore = true
			}
		})
	},
	// beforeUnmount() {
	// 	consoleLog('AccountSelector beforeUnmount', this.allAccountsSelectedBefore)
	// 	if (this.allAccountsSelectedBefore) {
	// 		this.allAccountsSelectedBefore = false
	// 		this.chatAccountsStore.setActive(null)
	// 	}
	// },
	methods: {
		selectAccount(account) {
			if (this.disableAccountChange && this.selectedAccount) return
			consoleLog('selectAccount methodu çağırıldı chatAccountsStore.setActive', account?.id)
			this.chatAccountsStore.setActive(account?.id ?? null)
		},
		selectAllAccounts() {
			if (this.disableSelectAllAccount) return
			consoleLog('selectAllAccounts methodu çağırıldı chatAccountsStore.setActive null')
			this.chatAccountsStore.setActive(null)
		},
	},
}
</script>
