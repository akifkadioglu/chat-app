<template>
	<div class="space-y-16">
		<div class="max-w-6xl mx-auto">
			<!-- Contact Calculator -->
			<div>
				<slot name="tiersTitle">
					<h3 class="h2 mb-5 text-center">{{ $t('components.pricing.packages.title') }}</h3>
				</slot>

				<ContactCalculator
					v-if="showCalculator"
					:subscriptionPlanGroups="subscriptionPlanGroups"
					:showPricingPlans="showPricingPlans"
					:initial-contact-count="contactCount"
					@update:contact-count="contactCount = $event"
					@update:selected-plan="selectedSubscriptionPlanGroupKey = $event"
				/>

				<div v-if="!showPricingTiers" class="text-center">
					<button @click="showPricingPlans = !showPricingPlans" class="link link-primary text-xs">
						{{
							showPricingPlans
								? $t('components.pricing.packages.hideTiers')
								: $t('components.pricing.packages.viewAllTiers')
						}}
					</button>
				</div>

				<!-- Original Entry Selection (Hidden by default) -->
				<div class="text-center mb-16">
					<LoadingElement :isLoading="productsStore.productsFetching">
						<div v-auto-animate class="mt-5 text-start">
							<div v-if="showPricingPlans || showPricingTiers" class="space-y-8">
								<div class="max-w-5xl mx-auto flex flex-wrap gap-2">
									<PlanOption
										v-for="subscriptionPlanGroup in subscriptionPlanGroups"
										v-model:currentPlanGroupKey="selectedSubscriptionPlanGroupKey"
										@change="handleContactCount"
										:plan-group-key="subscriptionPlanGroup.groupKey"
										:limit="subscriptionPlanGroup.activeContactLimit"
										:disabled="
											minActiveContactLimit > 0 &&
											(subscriptionPlanGroup.activeContactLimit ?? 0) < minActiveContactLimit
										"
									/>
								</div>
							</div>
						</div>
					</LoadingElement>
				</div>

				<!-- Pricing Plans -->
				<Plans
					v-if="subscriptionPlanGroup || exceedsHighestPlan"
					:subscriptionPlanGroup="subscriptionPlanGroup"
					:hideFree="hideFree || exceedsHighestPlan"
					:exceedsHighestPlan="exceedsHighestPlan"
					:contactCount="contactCount"
				/>
			</div>
		</div>
	</div>
</template>
<script>
import PlanOption from '~/components/Pricing/PlanOption.vue'
import PricingTestimonials from '~/components/Pricing/PricingTestimonials.vue'
import Plans from '~/components/Pricing/Plans.vue'
import Modal from '~/components/GlobalComponents/Modal.vue'
import StackedPlan from '~/components/Pricing/StackedPlan.vue'
import ContactCalculator from '~/components/Pricing/ContactCalculator.vue'
import LocalizedLink from '~/components/GlobalComponents/LocalizedLink.vue'
import FreePlan from '~/components/Pricing/FreePlan.vue'
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import OveragePricingTable from '~/components/Pricing/OveragePricingTable.vue'

export default {
	components: {
		LoadingElement,
		OveragePricingTable,
		FreePlan,
		LocalizedLink,
		ContactCalculator,
		StackedPlan,
		Modal,
		Plans,
		PricingTestimonials,
		PlanOption,
	},
	props: {
		initialContactCount: {
			type: Number,
			default: 750,
		},
		showCalculator: {
			type: Boolean,
			default: true,
		},
		showPricingTiers: {
			type: Boolean,
			default: false,
		},
		hideFree: {
			type: Boolean,
			default: false,
		},
		lockedActiveContactsCount: {
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
			userSelectedKey: null,
			contactCount: this.initialContactCount,
			showPricingPlans: false,
		}
	},
	mounted() {
		this.getProducts()
		this.$emitter.on('planGroupKeyChange', this.syncGroupKey)
	},
	beforeUnmount() {
		this.$emitter.off('planGroupKeyChange', this.syncGroupKey)
	},
	computed: {
		subscriptionPlanGroups() {
			return this.productsStore?.subscriptionPlans ?? []
		},
		sortedPlanGroups() {
			return this.subscriptionPlanGroups
				.slice()
				.sort((a, b) => (a.activeContactLimit ?? 0) - (b.activeContactLimit ?? 0))
		},
		matchedPlanGroupByContactCount() {
			const sorted = this.sortedPlanGroups
			if (!sorted.length) return null
			const match = sorted.find((g) => this.contactCount <= (g.activeContactLimit ?? 0))
			return match ?? sorted[sorted.length - 1]
		},
		minPlanGroup() {
			if (!this.lockedActiveContactsCount) return null
			const sorted = this.sortedPlanGroups
			if (!sorted.length) return null
			const match = sorted.find((g) => this.lockedActiveContactsCount <= (g.activeContactLimit ?? 0))
			return match ?? sorted[sorted.length - 1]
		},
		minActiveContactLimit() {
			return this.minPlanGroup?.activeContactLimit ?? 0
		},
		selectedSubscriptionPlanGroupKey: {
			get() {
				if (this.userSelectedKey) {
					const explicit = this.subscriptionPlanGroups.find((g) => g.groupKey === this.userSelectedKey)
					if (explicit) return explicit.groupKey
				}
				return this.minPlanGroup?.groupKey ?? null
			},
			set(value) {
				if (this.userSelectedKey === value) return
				this.userSelectedKey = value
				this.$emitter.emit('planGroupKeyChange', value)
			},
		},
		subscriptionPlanGroup() {
			const explicit = this.subscriptionPlanGroups.find((g) => g.groupKey === this.selectedSubscriptionPlanGroupKey)
			return explicit ?? this.minPlanGroup ?? this.matchedPlanGroupByContactCount
		},
		highestActiveContactLimit() {
			if (!this.subscriptionPlanGroups.length) return 0
			return Math.max(...this.subscriptionPlanGroups.map((g) => g.activeContactLimit ?? 0))
		},
		exceedsHighestPlan() {
			return this.highestActiveContactLimit > 0 && this.contactCount > this.highestActiveContactLimit
		},
	},
	methods: {
		async getProducts() {
			await this.productsStore.getProducts()
		},
		handleContactCount() {
			this.contactCount = this.subscriptionPlanGroup?.activeContactLimit ?? this.contactCount
		},
		syncGroupKey(key) {
			this.userSelectedKey = key
		},
	},
}
</script>
