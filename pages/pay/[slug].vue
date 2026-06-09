<template>
	<AppLayout disableSelectAllAccount disableAccountChange>
		<div class="bs container">
			<div class="py-20 lg:pl-10">
				<h1 class="text-4xl font-medium">{{ $t(`pages.app.pay.subscription.title.${period}`) }}</h1>
				<div class="mt-2">
					<p class="text-sm">{{ $t('pages.app.pay.subscription.subtitle') }}</p>
					<p class="text-xs">
						<i class="fa fa-info-circle text-info" />
						{{ $t('pages.app.pay.subscription.info') }}
					</p>
				</div>
			</div>
			<div v-if="subscriptionPlan" class="flex flex-col md:flex-row gap-8 justify-center pb-24">
				<PricingTestimonials class="md:hidden" />
				<div class="flex-1 max-w-lg">
					<p class="text-muted text-xs mb-2">
						<i18n-t keypath="pages.app.pay.subscription.termsText">
							<template #termsOfPayment>
								<a href="javascript:" @click="$refs.termsOfPayment.showModal" class="text-simpliers text-nowrap">
									{{ $t('pages.app.pay.subscription.termsOfPayment') }}
								</a>
							</template>
						</i18n-t>
					</p>
					<PaymentElements
						class="shadow rounded-lg"
						:subscriptionPlan="subscriptionPlan"
						:productParameter="productParameter"
						@paymentSuccess="paymentSuccessful"
						:execPrice="execPrice"
					/>
				</div>
				<div class="max-w-md flex-1">
					<PricingTestimonials class="hidden md:block pl-8" />
					<div class="sticky top-0">
						<PlanElement :couponApplied="couponApplied" :plan="subscriptionPlan" :execPrice="planExecPrice" view-only />
						<UpgradeCard :paymentIntent="paymentIntent" />
						<CouponApplied
							v-if="couponApplied && coupon"
							class="mb-4"
							:subscriptionPlan="subscriptionPlan"
							:coupon="coupon"
							:paymentIntent
						/>
						<CouponCode
							:couponCodeResult="couponCodeResult"
							:couponCodeResultMessage="couponCodeResultMessage"
							:isCouponLoading="isCouponLoading"
							@applyCouponCode="applyCouponCode"
						/>
						<RefCode class="mt-4" :appliedRefCode :productParameter @redeemed="onRefCodeRedeemed" />
					</div>
				</div>
			</div>
			<TermsOfPayment ref="termsOfPayment" />
		</div>
	</AppLayout>
</template>
<script>
import PaymentElements from '~/components/Pay/PaymentElements.vue'
import apiList from '~/apis/ApiList.js'
import PlanElement from '~/components/Pricing/PlanElement.vue'
import TermsOfPayment from '~/components/Pay/TermsOfPayment.vue'
import { PERIODS, Plan } from '~/models/Pricing/Plan.ts'
import CouponCode from '~/components/Pay/CouponCode.vue'
import RefCode from '~/components/Pay/RefCode.vue'
import UpgradeCard from '~/components/Pay/UpgradeCard.vue'
import CouponApplied from '~/components/Pay/CouponApplied.vue'

export default {
	components: { CouponApplied, UpgradeCard, RefCode, CouponCode, TermsOfPayment, PlanElement, PaymentElements },
	data() {
		return {
			PERIODS,
			subscriptionPlan: null,
			couponCodeResult: null,
			couponCodeResultMessage: '',
			isCouponLoading: false,
			couponDiscount: 0,
			couponValidAt: null,
			productParameter: {},
			couponApplied: false,
			coupon: null,
			paymentIntent: null,
			appliedRefCode: '',
		}
	},
	computed: {
		slug() {
			return this.$route.params.slug
		},
		period() {
			return this.slug.includes('annual') ? PERIODS.yearly : PERIODS.monthly
		},
		execPrice() {
			const raw = this.paymentIntent?.amount ?? this.subscriptionPlan.price?.execPrice
			return raw != null ? Number(raw) : null
		},
		planExecPrice() {
			const raw =
				this.upgradeDetail?.subscription?.amount ?? this.paymentIntent?.amount ?? this.subscriptionPlan.price?.execPrice
			return raw != null ? Number(raw) : null
		},
		upgradeDetail() {
			return {
				existingSubscription: this.paymentIntent?.items.find((item) => {
					const modelType = item.model_type
					const lastKey = modelType.split('\\').pop()
					return lastKey === 'Subscription' && item.amount <= 0
				}),
				existingAdditionalAccounts: this.paymentIntent?.items.filter((item) => {
					const modelType = item.model_type
					const lastKey = modelType.split('\\').pop()
					return lastKey === 'SubscriptionAccount' && item.amount <= 0
				}),
				subscription: this.paymentIntent?.items.find((item) => {
					const modelType = item.model_type
					const lastKey = modelType.split('\\').pop()
					return lastKey === 'SubscriptionPlan' && item.amount > 0
				}),
				additionalAccounts: this.paymentIntent?.items.filter((item) => {
					const modelType = item.model_type
					const lastKey = modelType.split('\\').pop()
					return lastKey === 'SubscriptionAccount' && item.amount > 0
				}),
			}
			// return this.paymentIntent?.items.find((item) => {
			//   const modelType = item.model_type
			//   const lastKey = modelType.split('\\').pop()
			//   return lastKey === 'Subscription'
			// })
		},
	},
	setup() {
		definePageMeta({
			layout: 'app',
			middleware: ['auth-custom'],
		})
		return {
			chatAccountsStore: useChatAccountsStore(),
		}
	},
	mounted() {
		this.fetchProduct()
	},
	methods: {
		fetchProduct() {
			this.$requestAdapter
				.get(apiList.prices.subscription.get, { slug: this.slug })
				.then(async (response) => {
					this.subscriptionPlan = new Plan(response.data.subscription_plan)
					this.productParameter = { subscriptionPlanPriceId: this.subscriptionPlan.price.id }
					this.paymentIntent = response.data.payment_intent ?? null
					this.appliedRefCode = response.data.ref_code ?? ''

					await this.fetchPaymentIntent()
				})
				.catch((error) => {
					if (error.statusCode === 404) {
						showError({
							statusCode: error.statusCode,
							statusMessage: 'Not Found',
						})

						throw createError({
							statusCode: error.statusCode,
							statusMessage: 'Not Found',
							fatal: true,
						})
					}
				})
		},
		async fetchPaymentIntent() {
			const response = await this.$requestAdapter.post(apiList.prices.getPaymentIntent, {
				...this.productParameter,
				chatAccountId: this.chatAccountsStore.active.id,
			})
			this.paymentIntent = response.data.payment_intent ?? this.paymentIntent
			this.appliedRefCode = response.data.ref_code ?? this.appliedRefCode
		},
		paymentSuccessful(response) {
			this.$gtag('event', 'purchase', {
				currency: 'TRY',
				value: (response?.payment?.usd_amount ?? 100) * (response?.usd_rate ?? 1),
				payment: {
					currency: response?.payment?.currency_code ?? null,
					amount: response?.payment?.amount ?? null,
				},
			})
			this.$fbq('track', 'Subscribe', {
				currency: 'TRY',
				value: (response?.payment?.usd_amount ?? 100) * (response?.usd_rate ?? 1),
				predicted_ltv: (response?.payment?.usd_amount ?? 100) * (response?.usd_rate ?? 1) * 2,
			})
			this.$toast.success(this.$t('pages.app.pay.subscription.successMessage'))
			this.$emitter.emit('getChatAccounts')
			this.$emitter.emit('paymentSuccess')
		},
		async applyCouponCode(couponCode) {
			if (!couponCode) {
				return
			}
			this.isCouponLoading = true
			this.productParameter.couponId = null
			this.couponDiscount = 0
			this.couponApplied = false
			this.coupon = null
			this.couponValidAt = null
			this.couponCodeResult = null

			const queries = { ...this.$route.query }
			queries.coupon = couponCode
			if (this.$route.query?.coupon !== couponCode) {
				await this.$router.push({
					query: queries,
				})
			}

			await this.$requestAdapter
				.post(apiList.prices.coupon.apply.subscription, {
					subscriptionPlanPriceId: this.subscriptionPlan.price.id,
					code: couponCode,
				})
				.then(async (response) => {
					this.couponCodeResult = true
					this.couponCodeResultMessage = response.data.message

					if (response.data?.type === 'coupon' && response.data?.coupon) {
						this.couponDiscount = response.data.discount
						this.couponValidAt = response.data.utc_valid_at
						this.productParameter.couponId = response.data.coupon.id
						this.coupon = response.data.coupon
						this.couponApplied = true
					}
				})
				.catch((error) => {
					this.couponCodeResult = false
					this.couponCodeResultMessage = error.response?.data?.message ?? ''
				})
				.finally(() => {
					this.isCouponLoading = false
					this.fetchPaymentIntent().catch(() => {})
				})
		},
		onRefCodeRedeemed(data) {
			if (data?.type === 'coupon' && data?.coupon) {
				this.couponDiscount = data.discount
				this.couponValidAt = data.utc_valid_at
				this.couponCodeResult = true
				this.couponCodeResultMessage = data.message
				this.productParameter.couponId = data.coupon.id
				this.coupon = data.coupon
				this.couponApplied = true
			}
			this.fetchPaymentIntent().catch(() => {})
		},
	},
}
</script>
