<template>
	<div class="flex flex-wrap">
		<div
			v-if="subscription.statusReasonCode === STATUS_REASON.WAITING_FOR_PAYMENT_RETRY"
			class="alert bg-error/10 mx-auto mb-5 pr-0!"
		>
			<div class="w-full">
				<div class="flex items-baseline">
					<i class="fa fa-exclamation text-error fa-lg mr-2" />
					<h5 class="text-error h5 mb-2">
						{{ $t('components.accounts.billingTab.renewOnDueDate.waitingForPaymentRetry.alert.title') }}
					</h5>
				</div>
				<p class="text-sm">
					{{ $t('components.accounts.billingTab.renewOnDueDate.waitingForPaymentRetry.alert.text') }}
				</p>

				<div class="bg-base-100 rounded-lg my-5">
					<SubscriptionStoredCards :subscription="subscription" />
				</div>

				<div class="mt-5 text-sm">
					{{ $t('components.accounts.billingTab.renewOnDueDate.alreadyUpdatePaymentMethod') }}
					<div class="text-center mt-5">
						<button
							class="btn btn-info btn-transition w-full"
							:disabled="retryPaymentButtonLoading"
							@click.prevent="retryPayment"
						>
							<LoadingElement :is-loading="retryPaymentButtonLoading">
								{{ $t('components.accounts.billingTab.renewOnDueDate.retryPaymentButton') }}
							</LoadingElement>
						</button>
					</div>
				</div>
			</div>
		</div>
		<div v-else class="alert alert-warning alert-soft">
			<div>
				<i class="fa fa-exclamation" />
				<i18n-t tag="span" keypath="components.accounts.billingTab.renewOnDueDate.willRenewText">
					<template #date>
						<span class="font-bold">
							{{ $formatDate(subscription?.renew_at, $i18n.locale) }}
							<!--							{{ new Date(subscription?.renew_at).toLocaleDateString($i18n.locale) }}-->
						</span>
					</template>
				</i18n-t>
			</div>
		</div>
	</div>
</template>

<script>
import apiList from '~/apis/ApiList'
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import SubscriptionStoredCards from '~/components/Accounts/BillingTab/SubscriptionStoredCards.vue'
import { STATUS_REASON } from '~/models/Pricing/Subscription.ts'

export default {
	components: { SubscriptionStoredCards, LoadingElement },
	props: {
		subscription: {
			type: Object,
			required: true,
		},
	},
	setup() {
		return {
			STATUS_REASON,
			chatAccountsStore: useChatAccountsStore(),
		}
	},
	data() {
		return {
			retryPaymentButtonLoading: false,
		}
	},
	methods: {
		retryPayment() {
			this.retryPaymentButtonLoading = true
			this.$requestAdapter
				.post(
					apiList.chat.instagram.chatAccountId.subscription.retryPayment,
					{},
					{ chatAccountId: this.chatAccountsStore.active.id },
				)
				.then((response) => {
					this.$emit('updateSubscription', response.data.subscription)
					if (response.data.payment_status) {
						this.$toast.success(response.data.result_message)
						return
					}
					this.$toast.error(response.data.result_message)
				})
				.catch(() => {})
				.finally(() => {
					this.retryPaymentButtonLoading = false
				})
		},
	},
}
</script>

<style></style>
