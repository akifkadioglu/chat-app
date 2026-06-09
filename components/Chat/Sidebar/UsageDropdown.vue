<template>
	<CustomDropdown placement="top-start">
		<button v-tooltip.right="$t('components.chat.sidebar.usageDropdown.tooltip')" class="btn btn-sm w-full relative">
			<i class="fa-solid fa-chart-pie fa-xl" />
			<span v-if="hasWarning" class="absolute top-1 right-1 size-1.5 rounded-full bg-warning" />
		</button>
		<template #popper>
			<div class="bg-base-100 rounded-xl shadow-lg border border-base-300 w-72 overflow-hidden">
				<div class="px-4 py-3 flex items-center justify-between">
					<h3 class="text-sm font-semibold text-base-content truncate">
						{{ $t('components.chat.sidebar.usageDropdown.title') }}
					</h3>
					<localized-link
						name="account-tab"
						:params="{ tab: 'billing' }"
						class="text-[11px] text-muted hover:text-primary inline-flex items-center gap-1"
					>
						{{ $t('components.chat.sidebar.usageDropdown.manageBilling') }}
						<i class="fa-solid fa-chevron-right text-xs link-icon" />
					</localized-link>
				</div>

				<div v-if="!chatAccounts.length" class="px-4 pb-4 text-center">
					<p class="text-xs text-muted">
						{{ $t('components.chat.sidebar.usageDropdown.empty.message') }}
					</p>
				</div>

				<ul v-else class="px-2 pb-2 max-h-80 overflow-y-auto">
					<li v-for="chatAccount in chatAccounts" :key="chatAccount.id" class="px-2 py-3 rounded-lg">
						<div class="flex items-center justify-between gap-2 mb-1.5">
							<LocalizedLink
								name="account-tab"
								:params="{ tab: 'billing' }"
								:query="{ username: chatAccount.postAccount?.username }"
								class="text-xs font-medium text-base-content truncate min-w-0"
							>
								{{ chatAccount.postAccount.username }}
								<i class="fa fa-chevron-right link-icon text-xs" />
							</LocalizedLink>
							<span class="text-[11px] font-mono text-muted shrink-0">
								{{ $formatNumber(activeCount(chatAccount), $i18n.locale) }}
								<span class="text-subtle">/ {{ $formatNumber(contactLimit(chatAccount), $i18n.locale) }}</span>
							</span>
						</div>
						<div class="h-1 rounded-full bg-base-200 overflow-hidden">
							<div
								class="h-full rounded-full transition-all duration-500 ease-out"
								:class="barColorClass(chatAccount)"
								:style="{ width: barWidth(chatAccount) }"
							/>
						</div>
					</li>
				</ul>
			</div>
		</template>
	</CustomDropdown>
</template>

<script>
import CustomDropdown from '~/components/GlobalComponents/CustomDropdown.vue'
import LocalizedLink from '~/components/GlobalComponents/LocalizedLink.vue'
import { FREE_ACTIVE_CONTACTS_LIMIT } from '~/models/Pricing/Plan.ts'

export default {
	components: {
		CustomDropdown,
		LocalizedLink,
	},
	setup() {
		return {
			chatAccountsStore: useChatAccountsStore(),
		}
	},
	computed: {
		chatAccounts() {
			return this.chatAccountsStore.all
		},
		hasWarning() {
			return this.chatAccounts.some((acc) => this.barPercent(acc) >= 80)
		},
		contactLimit() {
			return (chatAccount) =>
				chatAccount.subscription?.effective_active_contact_limit  || FREE_ACTIVE_CONTACTS_LIMIT
		},
		activeCount() {
			return (chatAccount) => chatAccount.activeContactsCount
		},
		barPercent() {
			return (chatAccount) => {
				const limit = this.contactLimit(chatAccount)
				if (!limit) return 0
				return Math.max(0, ((this.activeCount(chatAccount) || 0) / limit) * 100)
			}
		},
		barWidth() {
			return (chatAccount) => Math.min(Math.round(this.barPercent(chatAccount)), 100) + '%'
		},
		barColorClass() {
			return (chatAccount) => {
				const pct = this.barPercent(chatAccount)
				if (pct >= 90) return 'bg-error'
				if (pct >= 60) return 'bg-warning'
				return 'bg-primary'
			}
		},
	},
}
</script>
