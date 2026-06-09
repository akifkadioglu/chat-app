<template>
	<i18n-t keypath="components.pay.couponDescription.mainText">
		<template #couponValidAfterText>
			{{ $t('components.pay.couponDescription.couponValidAfterText', couponValidAfter) }}
		</template>

		<template #couponValidPeriodText>
			{{ $t('components.pay.couponDescription.couponValidPeriodText', couponValidPeriod) }}
		</template>

		<template #discountText>
			<span class="text-success fw-bold fs-4">
				<span v-if="discountType === 'percent'">
					{{ $t('components.pay.couponDescription.percentageDiscountText', { value: couponDiscountValueForPercent }) }}
				</span>
				<span v-else-if="discountType === 'amount'">
					{{
						$t('components.pay.couponDescription.amountDiscountText', {
							value: couponDiscountValueForAmount,
						})
					}}
				</span>
			</span>
		</template>
	</i18n-t>
</template>

<script>
export default {
	props: {
		discountType: {
			type: String,
			required: true,
		},
		discountValue: {
			type: [String, Number],
			required: true,
		},
		couponValidAfter: {
			type: Number,
			required: true,
		},
		couponValidPeriod: {
			type: Number,
			required: true,
		},
		currency: {
			type: Object,
			required: true,
		},
	},
	computed: {
		couponDiscountValueForPercent() {
			return this.$formatPrice(this.discountValue, this.$i18n.locale, this.currency.code)
		},
		couponDiscountValueForAmount() {
			const value = this.$formatPrice(this.discountValue, this.$i18n.locale, this.currency.code)
			if (this.currency.symbol_on_left) {
				return this.currency.symbol + value
			}
			return value + this.currency.symbol
		},
	},
}
</script>
