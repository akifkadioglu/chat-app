<template>
	<div class="flex flex-col h-full">
		<div class="py-2">
			<PeriodToggle :initial-value="selectedPlanPeriod" :savings-percent="50" @change="periodToggleChange" />
		</div>
		<div class="bg-base-100 rounded-lg flex-1 flex flex-col shadow-xl">
			<PlanElement
				v-if="plan"
				:plan="plan"
				:showAllFeature="!showInfluencerFeatures && !showBrandFeatures && !showAgencyFeatures"
				:showGiveawayFeature="!showInfluencerFeatures"
			>
				<template #title>
					<div class="text-xl font-medium">
						{{
							isMonthly
								? $t('components.pricing.stackedPlan.monthlyPlan')
								: $t('components.pricing.stackedPlan.yearlyPlan')
						}}
						<i18n-t
							v-if="!isMonthly"
							keypath="components.pricing.stackedPlan.save"
							tag="span"
							class="badge badge-soft badge-sm badge-success"
						>
							<template #percent>
								<span class="font-semibold">
									{{ $t('components.pricing.stackedPlan.percentage', { number: 50 }) }}
								</span>
							</template>
						</i18n-t>
					</div>
				</template>

				<template #features>
					<div v-if="showInfluencerFeatures || showBrandFeatures || showAgencyFeatures" class="my-2" />
					<template v-if="showInfluencerFeatures">
						<FeatureRenderer :feature-key="featureKeys.neverMissMessage" />
						<FeatureRenderer :feature-key="featureKeys.automateLikePro" />
						<FeatureRenderer :feature-key="featureKeys.startFastWithQuickFlows" />
					</template>

					<template v-if="showBrandFeatures">
						<FeatureRenderer :feature-key="featureKeys.breakLanguageBarriers" />
						<FeatureRenderer :feature-key="featureKeys.turnCommentsToConversations" />
						<FeatureRenderer :feature-key="featureKeys.startFastWithQuickFlows" />
					</template>
					<template v-if="showAgencyFeatures">
						<FeatureRenderer :feature-key="featureKeys.neverMissMessage" />
						<FeatureRenderer :feature-key="featureKeys.moderateSmarter" />
						<FeatureRenderer :feature-key="featureKeys.collaborateSeamlessly" />
					</template>
					<div v-if="showInfluencerFeatures || showBrandFeatures || showAgencyFeatures" class="my-2" />
				</template>
			</PlanElement>
		</div>
	</div>
</template>
<script>
import FeatureRenderer from '~/components/Pricing/FeatureRenderer.vue'
import PlanElement from '~/components/Pricing/PlanElement.vue'
import AnimatedNumber from '~/components/GlobalComponents/AnimatedNumber.vue'
import PeriodToggle from '~/components/Pricing/PeriodToggle.vue'
import featureKeys from '~/types/featureList.ts'
import { PlanGroup } from '~/models/Pricing/PlanGroup.ts'
import { PERIODS } from '~/models/Pricing/Plan.ts'

export default {
	components: { AnimatedNumber, PlanElement, FeatureRenderer, PeriodToggle },
	props: {
		subscriptionPlanGroup: {
			type: PlanGroup,
		},
		defaultSelectedPlanPeriod: {
			type: String,
			default: PERIODS.monthly,
		},
		showInfluencerFeatures: {
			type: Boolean,
			default: false,
		},
		showBrandFeatures: {
			type: Boolean,
			default: false,
		},
		showAgencyFeatures: {
			type: Boolean,
			default: false,
		},
	},
	data() {
		return {
			featureKeys,
			PERIODS,
			selectedPlanPeriod: this.defaultSelectedPlanPeriod,
		}
	},
	computed: {
		plan() {
			return this.subscriptionPlanGroup?.plans?.find((plan) => plan.period === this.selectedPlanPeriod)
		},
		isMonthly() {
			return this.plan.period === PERIODS.monthly
		},
	},
	mounted() {
		this.$emitter.on('periodToggleChange', this.syncPeriod)
	},
	beforeUnmount() {
		this.$emitter.off('periodToggleChange', this.syncPeriod)
	},
	methods: {
		periodToggleChange(period) {
			if (this.selectedPlanPeriod === period) return
			this.selectedPlanPeriod = period
			this.$emitter.emit('periodToggleChange', period)
		},
		syncPeriod(period) {
			this.selectedPlanPeriod = period
		},
	},
}
</script>

<style scoped></style>
