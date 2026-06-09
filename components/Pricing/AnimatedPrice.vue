<template>
	<span
		class="font-medium"
		:class="[
			$attrs.class,
			{
				'strikethrough before:border-error text-subtle': isDiscounted,
			},
		]"
	>
		<span v-if="symbolOnLeft" v-html="symbol" /><span :class="$attrs.class">
			<AnimatedNumber
				:price-type="true"
				:end-number="execPrice"
				:currency-code="currencyCode"
				:decimals="decimals"
				:animate="animate"
			/>
		</span>
		<span v-if="!symbolOnLeft" v-html="symbol" /><span v-if="showPeriod" class="text-muted text-base">{{
			$t('components.pricing.planElement.perMonth')
		}}</span>
	</span>
</template>
<script>
import AnimatedNumber from '~/components/GlobalComponents/AnimatedNumber.vue'

export default {
	name: 'AnimatedPrice',
	components: { AnimatedNumber },
	props: {
		isDiscounted: {
			type: Boolean,
			default: false,
		},
		execPrice: {
			type: Number,
			default: 0,
		},
		symbolOnLeft: {
			type: Boolean,
			default: false,
		},
		symbol: {
			type: String,
			default: '$',
		},
		showPeriod: {
			type: Boolean,
			default: true,
		},
		currencyCode: {
			type: String,
			default: null,
		},
		decimals: {
			type: Number,
			default: 0,
		},
		animate: {
			type: Boolean,
			default: true,
		},
	},
}
</script>

<style scoped></style>
