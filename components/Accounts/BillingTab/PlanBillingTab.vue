<template>
	<State :is-loading="loading" :isError="error">
		<div class="space-y-16 max-w-3xl mx-auto px-5">
			<div v-if="!subscription && unlinkedSubscriptions.length" class="space-y-4 pb-10 border-b border-subtle">
				<div class="mb-4">
					<div class="flex items-center gap-2">
						<i class="fa fa-link text-info" />
						<h3 class="text-base font-medium m-0">
							{{ $t('components.accounts.billingTab.planBillingTab.unlinkedSubscriptions.title') }}
						</h3>
					</div>
					<p class="text-sm text-muted">
						{{ $t('components.accounts.billingTab.planBillingTab.unlinkedSubscriptions.description') }}
					</p>
				</div>
				<UnlinkedSubscriptionCard
					v-for="unlinkedSubscription in unlinkedSubscriptions"
					:key="unlinkedSubscription.id"
					:subscription="unlinkedSubscription"
					@linked="linkedSubscription"
				/>
			</div>

			<div class="flex items-center justify-between flex-wrap">
				<h2 class="text-2xl">{{ $t('components.accounts.billingTab.planBillingTab.title') }}</h2>
				<button
					class="btn btn-primary btn-transition btn-sm ml-auto my-2"
					@click="$emitter.emit('showUpgradeModal', { chatAccount: chatAccount, feature: 'upgrade' })"
				>
					<i class="fa fa-credit-card mr-2"></i>
					{{ $t('components.accounts.billingTab.planBillingTab.upgradePlan') }}
				</button>
			</div>

			<h3 class="text-xl mb-4">{{ $t('components.accounts.billingTab.planBillingTab.currentPlan') }}</h3>
			<div class="pl-4 relative">
				<div class="card max-w-lg border border-subtle mx-auto">
					<div class="card-body">
						<PlanElement
							v-if="subscription"
							:plan="subscription.plan"
							:execPrice="subscription.plan.price?.execPrice"
							:viewOnly="true"
							class="flex-wrap items-start p-0! gap-4"
						/>
						<FreePlan v-else view-only class="flex-col md:flex-row flex-wrap items-start p-0! gap-4" />
					</div>
				</div>
				<DevTestScenario :buttons="devButtons" />
				<div v-if="subscription" class="w-full max-w-lg mx-auto items-center my-10">
					<RenewOnDueDate
						v-if="chatAccount?.subscription?.dueDateAction === DUE_DATE_ACTION.RENEW"
						:subscription="chatAccount.subscription"
						@updateSubscription="updateSubscription"
					/>

					<CancelOnDueDate
						v-else-if="chatAccount?.subscription?.dueDateAction === DUE_DATE_ACTION.CANCEL"
						:subscription="chatAccount.subscription"
					/>

					<ContactLimitCard
						v-if="subscription"
						:subscription="chatAccount.subscription"
						:active-contacts-count="chatAccount.activeContactsCount"
						:contact-limit="contactLimit"
						:overage-contacts-count="chatAccount.overageContactsCount"
						:effective-max-overage-limit="maxOverageLimit"
						class="my-6"
					/>

					<Actions @updateSubscription="updateSubscription" class="mt-5 w-full" />
				</div>
			</div>

			<div v-if="subscription" class="bg-success/10 rounded-lg flex items-center justify-between p-5 gap-5">
				<div v-if="coupon.discount_value" class="text-lg font-medium flex-1">
					<CouponDescription
						:coupon-valid-after="coupon.after_period_count"
						:coupon-valid-period="coupon.valid_period_count"
						:discount-type="coupon.discount_type"
						:discount-value="coupon.discount_value"
						:currency="subscription.plan.price.currency"
					/>
				</div>
				<CouponCode
					class="flex-1"
					:applyOnMounted="false"
					:couponCodeResult="couponCodeResult"
					:couponCodeResultMessage="couponCodeResultMessage"
					:isCouponLoading="isCouponLoading"
					@applyCouponCode="applyCouponCode"
				/>
			</div>
			<div>
				<h2 class="text-2xl mb-4">{{ $t('components.accounts.billingTab.planBillingTab.usage.title') }}</h2>
				<SubscriptionCard
					:contactsCount="contactsCount || 0"
					:contactLimit="contactLimit"
					:maxOverageLimit="maxOverageLimit"
					:messagesCount="messagesCount"
					:commentsCount="commentsCount"
					:analysisCount="analysisCount"
					:flowRunsCount="flowRunsCount"
					:teamUsersCount="teamUsersCount"
					:isFree="!subscription"
					:periodInfo="periodInfo"
					@upgrade="$emitter.emit('showUpgradeModal', { chatAccount: chatAccount, feature: 'upgrade' })"
				/>
			</div>
		</div>
	</State>
</template>

<script>
import { useChatAccountsStore } from '~/stores/chatAccounts.ts'
import State from '~/components/GlobalComponents/State.vue'
import UnlinkedSubscriptionCard from '~/components/Accounts/BillingTab/UnlinkedSubscriptionCard.vue'
import SubscriptionCard from '~/components/Accounts/BillingTab/SubscriptionCard.vue'
import apiList from '~/apis/ApiList.js'
import { DUE_DATE_ACTION, STATUS_REASON, Subscription } from '~/models/Pricing/Subscription.ts'
import { FREE_ACTIVE_CONTACTS_LIMIT } from '~/models/Pricing/Plan.ts'
import CouponCode from '~/components/Pay/CouponCode.vue'
import CouponDescription from '~/components/Pay/CouponDescription.vue'
import PlanElement from '~/components/Pricing/PlanElement.vue'
import LocalizedLink from '~/components/GlobalComponents/LocalizedLink.vue'
import FreePlan from '~/components/Pricing/FreePlan.vue'
import Actions from '~/components/Accounts/BillingTab/Actions.vue'
import RenewOnDueDate from '~/components/Accounts/BillingTab/RenewOnDueDate.vue'
import CancelOnDueDate from '~/components/Accounts/BillingTab/CancelOnDueDate.vue'
import ContactLimitCard from '~/components/Accounts/BillingTab/ContactLimitCard.vue'
import DevTestScenario from '~/components/GlobalComponents/DevTestScenario.vue'

export default {
	components: {
		LocalizedLink,
		PlanElement,
		FreePlan,
		DevTestScenario,
		CancelOnDueDate,
		ContactLimitCard,
		RenewOnDueDate,
		Actions,
		CouponDescription,
		CouponCode,
		State,
		UnlinkedSubscriptionCard,
		SubscriptionCard,
	},
	setup() {
		const chatAccountStore = useChatAccountsStore()
		return {
			DUE_DATE_ACTION,
			chatAccount: chatAccountStore.active,
		}
	},
	data() {
		return {
			loading: true,
			error: null,
			unlinkedSubscriptions: [],

			contactsCount: 0,
			messagesCount: null,
			commentsCount: null,
			analysisCount: null,
			flowRunsCount: null,
			teamUsersCount: null,
			periodInfo: null,

			couponCodeResult: null,
			couponCodeResultMessage: null,
			isCouponLoading: false,

			devButtons: [
				{
					name: 'Due: Renew',
					action: () => {
						if (this.chatAccount?.subscription) {
							this.chatAccount.subscription.dueDateAction = DUE_DATE_ACTION.RENEW
						}
					},
				},
				{
					name: 'Due: Cancel',
					action: () => {
						if (this.chatAccount?.subscription) {
							this.chatAccount.subscription.dueDateAction = DUE_DATE_ACTION.CANCEL
						}
					},
				},
				{
					name: 'Status: Pending',
					action: () => {
						if (this.chatAccount?.subscription) {
							this.chatAccount.subscription.statusReasonCode = STATUS_REASON.PENDING
						}
					},
				},
				{
					name: 'Status: Active',
					action: () => {
						if (this.chatAccount?.subscription) {
							this.chatAccount.subscription.statusReasonCode = STATUS_REASON.ACTIVE
						}
					},
				},
				{
					name: 'Status: Waiting Payment Retry',
					action: () => {
						if (this.chatAccount?.subscription) {
							this.chatAccount.subscription.statusReasonCode = STATUS_REASON.WAITING_FOR_PAYMENT_RETRY
						}
					},
				},
				{
					name: 'Status: Cancelled (Payment Fail)',
					action: () => {
						if (this.chatAccount?.subscription) {
							this.chatAccount.subscription.statusReasonCode = STATUS_REASON.CANCELLED_FOR_PAYMENT_FAILURES
						}
					},
				},
				{
					name: 'Status: Cancelled (User)',
					action: () => {
						if (this.chatAccount?.subscription) {
							this.chatAccount.subscription.statusReasonCode = STATUS_REASON.CANCELLED_FOR_USER_REQUEST
						}
					},
				},
				{
					name: 'Status: Cancelled (Refund)',
					action: () => {
						if (this.chatAccount?.subscription) {
							this.chatAccount.subscription.statusReasonCode = STATUS_REASON.CANCELLED_BY_REFUND
						}
					},
				},
				{
					name: 'Status: Cancelled (Remove Account)',
					action: () => {
						if (this.chatAccount?.subscription) {
							this.chatAccount.subscription.statusReasonCode = STATUS_REASON.CANCELLED_BY_REMOVE_ACCOUNT
						}
					},
				},
				{
					name: 'Status: Upgraded',
					action: () => {
						if (this.chatAccount?.subscription) {
							this.chatAccount.subscription.statusReasonCode = STATUS_REASON.UPGRADED
						}
					},
				},
				{
					name: 'Status: Plan→Unlimited',
					action: () => {
						if (this.chatAccount?.subscription) {
							this.chatAccount.subscription.statusReasonCode = STATUS_REASON.PLAN_CHANGED_TO_UNLIMITED
						}
					},
				},
				{
					name: 'Status: Cancelled (Admin)',
					action: () => {
						if (this.chatAccount?.subscription) {
							this.chatAccount.subscription.statusReasonCode = STATUS_REASON.CANCELLED_BY_ADMIN
						}
					},
				},
				{
					name: 'Toggle Overage (100)',
					action: () => {
						if (this.chatAccount.overageContactsCount > 0) {
							this.chatAccount.overageContactsCount = ref(0)
						} else {
							this.chatAccount.overageContactsCount = ref(100)
						}
					},
				},
			],
		}
	},
	mounted() {
		this.getChatAccountInfo()
		this.$emitter.on('subscriptionCanceled', this.getChatAccountInfo)
	},
	beforeUnmount() {
		this.$emitter.off('subscriptionCanceled', this.getChatAccountInfo)
	},
	computed: {
		subscription() {
			return this.chatAccount?.subscription ?? null
		},
		coupon() {
			return this.subscription?.coupon ?? {}
		},
		planName() {
			return this.subscription?.plan?.name || 'Free'
		},
		contactLimit() {
			return this.subscription?.effectiveActiveContactLimit ?? FREE_ACTIVE_CONTACTS_LIMIT
		},
		maxOverageLimit() {
			return this.subscription?.effectiveMaxOverageLimit ?? 0
		},
	},
	methods: {
		updateSubscription(subscription) {
			this.chatAccount.subscription = subscription ? new Subscription(subscription) : null
		},
		async applyCouponCode(couponCode) {
			if (!couponCode) {
				return
			}
			this.isCouponLoading = true

			const queries = { ...this.$route.query }
			queries.coupon = couponCode
			if (this.$route.query?.coupon !== couponCode) {
				await this.$router.push({
					query: queries,
				})
			}

			await this.$requestAdapter
				.post(apiList.account.subscription.addCoupon, {
					couponCode: couponCode,
				})
				.then((response) => {
					this.couponCodeResultMessage = response.data.message
					this.couponCodeResult = true
					this.getChatAccountInfo()
				})
				.catch((error) => {
					this.couponCodeResultMessage = error.response.data.message
					this.couponCodeResult = false
				})
				.finally(() => {
					this.isCouponLoading = false
				})
		},

		async getChatAccountInfo() {
			this.loading = true
			await this.$requestAdapter
				.get(apiList.chat.instagram.chatAccountId.planInfo, {
					chatAccountId: this.chatAccount.id,
				})
				.then((response) => {
					consoleLog('Plan ve Faturalama Bilgisi:', response.data)
					this.chatAccount.subscription = response.data.subscription
						? new Subscription(response.data.subscription)
						: null
					this.unlinkedSubscriptions = response.data.unlinked_subscriptions.map((sub) => new Subscription(sub))
					this.contactsCount = response.data.active_contacts_count ?? response.data.contacts_count ?? 0
					this.messagesCount = response.data.messages_count
					this.commentsCount = response.data.post_comments_count
					this.analysisCount = response.data.analysis_count
					this.flowRunsCount = response.data.flow_runs_count
					this.teamUsersCount = response.data.team_users_count
					this.periodInfo = response.data.period_info ?? null
				})
				.catch((error) => {
					this.error = error
				})
				.finally(() => {
					this.loading = false
				})
		},
		async linkedSubscription() {
			await this.getChatAccountInfo()
			await this.$nextTick()
			this.$emitter.emit('getChatAccounts')
			this.$emitter.emit('paymentSuccess')
		},
	},
}
</script>
