<template>
	<div class="bg-success/10 rounded-lg p-5 space-y-3">
		<div class="flex items-start gap-2">
			<i class="fa fa-circle-check text-success mt-1" />
			<div class="flex-1">
				<p class="font-medium">
					{{ $t('components.pay.couponApplied.title', { code: coupon.code }) }}
				</p>
				<p v-if="coupon.discount_value" class="text-sm text-muted mt-1">
					<CouponDescription
						:coupon-valid-after="coupon.after_period_count"
						:coupon-valid-period="coupon.valid_period_count"
						:discount-type="coupon.discount_type"
						:discount-value="coupon.discount_value"
						:currency="subscriptionPlan.price.currency"
					/>
				</p>
			</div>
		</div>

		<div class="border-t border-success/20 pt-3 space-y-2">
			<div v-if="couponItem" class="flex justify-between text-sm text-success">
				<span>{{ $t('components.pay.couponApplied.discount') }}</span>
				<span v-html="formattedDiscount" />
			</div>
			<!--			<div v-if="paymentIntent" class="flex justify-between items-center">-->
			<!--				<span class="text-sm">{{ $t('components.pay.couponApplied.amountToPayNow') }}</span>-->
			<!--				<span class="text-subscribe text-lg font-medium" v-html="formattedNet" />-->
			<!--			</div>-->
		</div>
	</div>
</template>

<script>
import CouponDescription from '~/components/Pay/CouponDescription.vue'

export default {
	components: { CouponDescription },
	props: {
		subscriptionPlan: {
			type: Object,
			required: true,
		},
		coupon: {
			type: Object,
			required: true,
		},
		paymentIntent: {
			type: Object,
			default: null,
		},
	},
	computed: {
		couponItem() {
			return this.paymentIntent?.items?.find((item) => {
				const lastKey = item.model_type?.split('\\').pop()
				return lastKey === 'Coupon'
			})
		},
		formattedDiscount() {
			const code = this.couponItem?.currency_code ?? this.paymentIntent?.currency_code ?? ''
			const value = this.$formatPrice(this.couponItem?.amount ?? 0, this.$i18n.locale, code)
			return `${value} ${code}`
		},
		formattedNet() {
			const code = this.paymentIntent?.currency_code ?? ''
			const value = this.$formatPrice(this.paymentIntent?.amount ?? 0, this.$i18n.locale, code)
			return `${value} ${code}`
		},
	},
}
</script>
