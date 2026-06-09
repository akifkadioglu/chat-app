<template>
	<div>
		<div v-if="chatAccount.subscription.dueDateAction === DUE_DATE_ACTION.RENEW">
			<div class="flex justify-between">
				<button
					@click="$emitter.emit('showUpgradeModal', { chatAccount: chatAccount, feature: 'upgrade' })"
					class="btn btn-primary"
				>
					{{ $t('components.accounts.billingTab.actions.changePlan') }}
				</button>

				<button class="btn btn-ghost text-base-content/50" @click="$emitter.emit('showCancelSubscriptionModal')">
					{{ $t('components.accounts.billingTab.actions.cancelSubscription') }}
				</button>
				<!-- Cancel Sub. Modal -->
				<CancelSubscriptionModal v-model="showCancelModal" @subscriptionCanceled="subscriptionCanceled" />
			</div>
		</div>
		<div v-else-if="chatAccount.subscription.dueDateAction === DUE_DATE_ACTION.CANCEL">
			<button class="btn btn-primary" :disabled="continueLoading" @click="continueSubscription">
				<span v-if="continueLoading" class="loading loading-spinner loading-sm"></span>
				{{ $t('components.accounts.billingTab.actions.continueSubscription') }}
			</button>
			<div class="mt-1">
				<small class="text-muted">
					{{ $t('components.accounts.billingTab.actions.continueSubscriptionDescription') }}
				</small>
			</div>
		</div>
	</div>
</template>

<script>
import LocalizedLink from '~/components/GlobalComponents/LocalizedLink.vue'
import apiList from '~/apis/ApiList'
import CancelSubscriptionModal from '~/components/Accounts/BillingTab/CancelSubscriptionModal.vue'
import { DUE_DATE_ACTION } from '~/models/Pricing/Subscription.ts'
export default {
	components: {
		CancelSubscriptionModal,
		LocalizedLink,
	},
	setup() {
		return {
			DUE_DATE_ACTION,
			chatAccountsStore: useChatAccountsStore(),
		}
	},
	data() {
		return {
			showCancelModal: false,
			continueLoading: false,
		}
	},
	computed: {
		chatAccount() {
			return this.chatAccountsStore.active
		},
	},
	methods: {
		async continueSubscription() {
			this.continueLoading = true
			await this.$requestAdapter
				.post(
					apiList.chat.instagram.chatAccountId.subscription.continue,
					{},
					{
						chatAccountId: this.chatAccount.id,
					},
				)
				.then((response) => {
					this.$emit('updateSubscription', response.data.subscription)
					this.$toast.info(this.$t('components.accounts.billingTab.actions.continued'))
				})
				.catch(() => {})
				.finally(() => {
					this.continueLoading = false
				})
		},
		subscriptionCanceled(subscription) {
			this.$emit('updateSubscription', subscription)
		},
	},
}
</script>

<style></style>
