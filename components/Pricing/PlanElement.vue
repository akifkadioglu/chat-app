<template>
	<div class="p-8 flex-1 h-full flex flex-col">
		<div class="space-y-5">
			<slot name="title">
				<h3 v-if="title" class="text-xl font-medium">{{ title }}</h3>
			</slot>
			<slot name="price">
				<div v-if="plan?.price" class="text-nowrap">
					<AnimatedPrice
						v-if="couponApplied"
						:isDiscounted="couponApplied"
						class="text-2xl"
						:symbolOnLeft="plan.price?.currency.symbolOnLeft"
						:execPrice="plan.period === 'monthly' ? plan.price?.price : plan.price?.price / 12"
						:symbol="plan.price?.currency.symbol"
					/>
					<br />
					<AnimatedPrice
						class="text-4xl"
						:symbolOnLeft="plan.price?.currency.symbolOnLeft"
						:execPrice="plan.period === 'monthly' ? price : (price ?? 0) / 12"
						:symbol="plan.price?.currency.symbol"
					/>
					<slot name="billedAt">
						<p v-if="plan.period === 'monthly'" class="text-xs mt-2">
							{{ $t('components.pricing.planElement.billedMonthly') }}
						</p>
						<i18n-t v-else keypath="components.pricing.planElement.billedYearly" tag="p" class="text-xs mt-2">
							<template #price>
								<AnimatedPrice
									:showPeriod="false"
									:symbolOnLeft="plan.price?.currency.symbolOnLeft"
									:symbol="plan.price?.currency.symbol"
									:execPrice="price"
								/>
							</template>
						</i18n-t>
					</slot>
				</div>
			</slot>
		</div>
		<div class="divider" />
		<div class="gap-5 flex flex-col flex-1">
			<FeatureRenderer :feature-key="featureKeys.contactLimit" :plan="plan" />

			<slot name="features" />

			<FeatureRenderer v-if="showAllFeature" :feature-key="featureKeys.accessAllFeatures" />

			<FeatureRenderer
				v-if="showGiveawayFeature"
				:feature-key="featureKeys.unlimitedGiveaways"
				:plan="plan"
				class="my-2"
			/>

			<FeatureRenderer v-if="showCancelFeature" :feature-key="featureKeys.cancelAnytime" />
		</div>
		<div v-if="!viewOnly" class="mt-auto pt-8" :class="{ 'pb-8': $slots.bottomOfButton }">
			<slot name="button">
				<localized-link
					class="btn btn-transition btn-primary w-full font-normal"
					name="pay-slug"
					:params="{ slug: plan.slug }"
					:query="{ username: chatAccount?.postAccount?.username }"
					rel="noopener noreferrer nofollow"
				>
					{{ buttonText || $t('components.pricing.planElement.startButton') }}
				</localized-link>
			</slot>
		</div>
		<slot name="bottomOfButton" />
	</div>
</template>
<script>
import AnimatedNumber from '~/components/GlobalComponents/AnimatedNumber.vue'
import LocalizedLink from '~/components/GlobalComponents/LocalizedLink.vue'
import FeatureRenderer from '~/components/Pricing/FeatureRenderer.vue'
import featureKeys from '~/types/featureList.ts'
import { Plan } from '~/models/Pricing/Plan.ts'
import AnimatedPrice from '~/components/Pricing/AnimatedPrice.vue'

export default {
	components: { AnimatedPrice, FeatureRenderer, LocalizedLink, AnimatedNumber },
	computed: {
		featureKeys() {
			return featureKeys
		},
		price() {
			return this.execPrice ?? this.plan?.price.price
		},
	},
	props: {
		plan: {
			type: Plan,
		},
		title: {
			type: String,
			default: null,
		},
		buttonText: {
			type: String,
			default: null,
		},
		viewOnly: {
			type: Boolean,
			default: false,
		},
		showGiveawayFeature: {
			type: Boolean,
			default: true,
		},
		showAllFeature: {
			type: Boolean,
			default: true,
		},
		showCancelFeature: {
			type: Boolean,
			default: true,
		},
		execPrice: {
			type: Number,
		},
		couponApplied: {
			type: Boolean,
			default: false,
		},
	},
	inject: {
		chatAccount: {
			default: null,
		},
	},
}
</script>

<style scoped></style>
