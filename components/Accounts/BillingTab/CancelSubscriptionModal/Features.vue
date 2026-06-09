<template>
	<div class="space-y-5">
		<div class="flex flex-col items-center pt-8 px-4">
			<LazyLoadImage src="/images/accounts/plan-billing-tab/features.png" alt="features-image" class-name="mb-6 w-36" />
			<div class="mb-2">
				<i18n-t
					keypath="components.accounts.billingTab.cancelSubscriptionModal.featuresSection.title"
					class="text-xl font-medium text-center"
					tag="h4"
				>
					<template #chatAccount>
						<span class="font-bold text-primary">
							{{ chatAccount.postAccount.username }}
						</span>
					</template>
					{{ $t('components.accounts.billingTab.cancelSubscriptionModal.featuresSection.title') }}
				</i18n-t>
			</div>
		</div>
		<div class="p-4 overflow-x-auto">
			<!-- Table -->
			<table class="table table-zebra w-full">
				<thead>
					<tr>
						<th class="w-2/5" />

						<th class="w-1/5 text-center">
							<span class="block">
								{{
									$t(
										'components.accounts.billingTab.cancelSubscriptionModal.featuresSection.premiumAdvantagesTable.free',
									)
								}}
							</span>
						</th>

						<th class="w-1/5 text-center">
							<span class="block text-subscribe">{{
								$t(
									'components.accounts.billingTab.cancelSubscriptionModal.featuresSection.premiumAdvantagesTable.subscription',
								)
							}}</span>
						</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="row in tableRows" :key="row.key">
						<th class="font-normal">
							<i18n-t
								:keypath="`components.accounts.billingTab.cancelSubscriptionModal.featuresSection.premiumAdvantagesTable.${row.key}`"
							>
								<template #simpliersChat> <SimpliersLogo /> <ChatLogo /> </template>
							</i18n-t>
						</th>
						<td class="text-center">
							<span v-if="row.free === 'limited'" class="badge badge-warning">
								{{
									$t(
										'components.accounts.billingTab.cancelSubscriptionModal.featuresSection.premiumAdvantagesTable.limited',
									)
								}}
							</span>
							<span v-else-if="row.free === false">
								<i class="fa fa-times text-error" />
							</span>
							<span v-else>{{ row.free }}</span>
						</td>
						<td class="text-center">
							<i v-if="row.pro === true" class="fa fa-circle-check text-success" />
							<span v-else> {{ row.pro }} </span>
						</td>
					</tr>
				</tbody>
			</table>
			<!-- End Table -->
		</div>
		<div class="flex flex-col flex-wrap border-t border-subtle pt-4 px-4">
			<div class="text-left w-full">
				{{ $t('components.accounts.billingTab.cancelSubscriptionModal.featuresSection.cancelingQuestion') }}
			</div>
			<div class="text-muted text-sm mb-4 w-full">
				{{ $t('components.accounts.billingTab.cancelSubscriptionModal.featuresSection.cancelingQuestionDescription') }}
			</div>
			<div class="flex items-center flex-wrap justify-between w-full gap-3">
				<ChatAccountChip :chat-account="chatAccount" />
				<div class="flex items-center gap-2 flex-wrap">
					<button type="button" class="btn btn-ghost" :disabled="processing" @click="cancelSubscription">
						<LoadingElement :is-loading="processing">
							{{ $t('components.accounts.billingTab.cancelSubscriptionModal.featuresSection.noButton') }}
						</LoadingElement>
					</button>
					<button type="button" class="btn btn-success btn-soft" @click="$emit('closeModal')">
						{{ $t('components.accounts.billingTab.cancelSubscriptionModal.featuresSection.yesButton') }}
					</button>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
import apiList from '~/apis/ApiList'
import LoadingElement from '~/components/GlobalComponents/LoadingElement'
import LazyLoadImage from '~/components/GlobalComponents/LazyLoadImage.vue'
import ChatAccountChip from '~/components/Accounts/BillingTab/CancelSubscriptionModal/ChatAccountChip.vue'
import { useChatAccountsStore } from '~/stores/chatAccounts'
import SimpliersLogo from '~/components/GlobalComponents/Brands/SimpliersLogo.vue'
import ChatLogo from '~/components/GlobalComponents/Brands/ChatLogo.vue'

export default {
	components: {
		ChatLogo,
		SimpliersLogo,
		ChatAccountChip,
		LazyLoadImage,
		LoadingElement,
	},
	setup() {
		return {
			chatAccountsStore: useChatAccountsStore(),
		}
	},

	props: {
		reasons: {
			type: Array,
			default: () => [],
		},
		comment: {
			type: String,
			default: '',
		},
	},
	data() {
		return {
			processing: false,
		}
	},
	computed: {
		chatAccount() {
			return this.chatAccountsStore.active
		},
		tableRows() {
			return [
				{
					key: 'contactCount',
					free: '50',
					pro: this.chatAccount.subscription.plan.contact_limit,
				},
				{ key: 'toxicComment', free: false, pro: true },
				{ key: 'autoTranslate', free: false, pro: true },
				{ key: 'commentModeration', free: false, pro: true },
				{ key: 'signature', free: false, pro: true },
				{ key: 'aiModeration', free: false, pro: true },
			]
		},
	},
	methods: {
		async cancelSubscription() {
			this.processing = true
			await this.$requestAdapter
				.post(
					apiList.chat.instagram.chatAccountId.subscription.cancel,
					{
						cancelReason: this.reasons,
						cancelReasonComment: this.comment,
					},
					{
						chatAccountId: this.chatAccount?.id,
					},
				)
				.then((response) => {
					consoleLog('cancelSubscription', response)
					const subscription = response.data.subscription
					subscription.plan.price = response.data.subscription.plan_price
					this.$toast.success(
						this.$t('components.accounts.billingTab.cancelSubscriptionModal.featuresSection.cancelled'),
					)
					this.$emit('subscriptionCanceled', subscription)
				})
				.finally(() => {
					this.processing = false
				})
		},
	},
}
</script>

<style scoped></style>
