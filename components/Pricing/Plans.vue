<template>
	<div class="max-w-4xl mx-auto">
		<div class="grid grid-cols-1 gap-6 justify-items-center" :class="{ 'md:grid-cols-5': !hideFree }">
			<div class="w-full flex md:col-span-5 md:flex-1">
				<div class="max-w-lg" :class="{ 'mx-auto': hideFree, 'ml-auto': !hideFree }">
					<PricingTestimonials class="pb-3" />
				</div>
			</div>
			<div v-if="!hideFree" class="w-full md:col-span-2 md:flex md:flex-col">
				<FreePlan class="md:flex-1" />
			</div>
			<div
				class="max-w-lg w-full md:col-span-3 md:flex md:flex-col"
				:class="{ 'md:justify-self-end': exceedsHighestPlan }"
			>
				<EnterprisePlan v-show="exceedsHighestPlan" :contactCount="contactCount" />
				<loading-element
					v-show="!exceedsHighestPlan"
					class="md:flex-1 md:flex md:flex-col"
					:is-loading="!showingSubscriptionPlanGroup"
				>
					<StackedPlan
						defaultSelectedPlanPeriod="yearly"
						:subscriptionPlanGroup="showingSubscriptionPlanGroup"
						:showInfluencerFeatures="influencer"
						:showBrandFeatures="brand"
						:showAgencyFeatures="agency"
					/>
				</loading-element>
			</div>
		</div>
		<div v-if="influencer || brand || agency" class="mt-3 text-right">
			<LocalizedLink class="link" name="pricing">
				{{ $t('components.pricing.plans.seeAllPlans') }}
				<i class="fa fa-chevron-right link-icon" />
			</LocalizedLink>
		</div>
	</div>
</template>
<script>
import PricingTestimonials from '~/components/Pricing/PricingTestimonials.vue'
import PlanElement from '~/components/Pricing/PlanElement.vue'
import AnimatedNumber from '~/components/GlobalComponents/AnimatedNumber.vue'
import StackedPlan from '~/components/Pricing/StackedPlan.vue'
import FreePlan from '~/components/Pricing/FreePlan.vue'
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import LocalizedLink from '~/components/GlobalComponents/LocalizedLink.vue'
import OveragePricingTable from '~/components/Pricing/OveragePricingTable.vue'
import EnterprisePlan from '~/components/Pricing/EnterprisePlan.vue'
import { PlanGroup } from '~/models/Pricing/PlanGroup.ts'
export default {
	components: {
		LocalizedLink,
		LoadingElement,
		FreePlan,
		StackedPlan,
		AnimatedNumber,
		PlanElement,
		PricingTestimonials,
		OveragePricingTable,
		EnterprisePlan,
	},
	props: {
		subscriptionPlanGroup: {
			type: PlanGroup,
		},
		hideFree: {
			type: Boolean,
			default: false,
		},
		influencer: {
			type: Boolean,
			default: false,
		},
		brand: {
			type: Boolean,
			default: false,
		},
		agency: {
			type: Boolean,
			default: false,
		},
		exceedsHighestPlan: {
			type: Boolean,
			default: false,
		},
		contactCount: {
			type: Number,
			default: 0,
		},
	},
	setup() {
		return {
			productsStore: useProductsStore(),
		}
	},
	data() {
		return {
			initialSubscriptionPlan: null,
		}
	},
	computed: {
		showingSubscriptionPlanGroup() {
			return this.subscriptionPlanGroup ?? this.initialSubscriptionPlan
		},
	},
	mounted() {
		if (!this.showingSubscriptionPlanGroup) {
			this.getProducts()
		}
	},
	methods: {
		async getProducts() {
			consoleLog('Fetching products for Plans component...')
			await this.productsStore.getProducts()
			this.initialSubscriptionPlan = this.productsStore?.subscriptionPlans[0] ?? null
		},
	},
}
</script>

<style scoped></style>
