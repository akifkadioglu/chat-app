<template>
	<!-- Special render for unlimited giveaways with plan data -->
	<FeatureSummary
		v-if="featureKey === featureKeys.unlimitedGiveaways && plan"
		:icon-class="customIconClass || featureData[featureKey].iconClass"
		:helper-text="customHelperText"
		v-bind="$attrs"
	>
		<template #title>
			<h4 class="font-medium">{{ $t('components.pricing.featureRenderer.features.unlimitedGiveaways.title') }}</h4>
		</template>
		<template #description>
			<i18n-t
				keypath="components.pricing.featureRenderer.features.unlimitedGiveaways.description"
				tag="div"
				class="text-sm text-muted"
			>
				<template #limit>
					<span class="bg-simpliers/10 text-simpliers px-1">{{ $formatNumber(plan.entryLimit, currentLocale) }}</span>
				</template>
				<template #link>
					<a href="https://simpliers.com" target="_blank" class="link link-info text-nowrap">
						{{ $t('components.pricing.featureRenderer.learnMore') }} <i class="fa fa-external-link-alt link-icon" />
					</a>
				</template>
			</i18n-t>
		</template>
	</FeatureSummary>
	<!-- Special render for access all features with link -->
	<FeatureSummary
		v-else-if="featureKey === featureKeys.accessAllFeatures"
		:icon-class="customIconClass || featureData[featureKey].iconClass"
		:description="customDescription || featureData[featureKey].description"
		:helper-text="customHelperText"
		v-bind="$attrs"
	>
		<template #title>
			<localized-link name="pricing" hash="#comparison-table" class="font-semibold text-primary">
				{{ $t('components.pricing.featureRenderer.features.accessAllFeatures.title') }}
				<i class="fa fa-chevron-right link-icon"></i>
			</localized-link>
		</template>
	</FeatureSummary>
	<!-- Special render for contact limit with plan data -->
	<FeatureSummary
		v-else-if="featureKey === featureKeys.contactLimit && plan"
		:icon-class="customIconClass || featureData[featureKey].iconClass"
		:helper-text="customHelperText"
		v-bind="$attrs"
	>
		<template #title>
			<i18n-t keypath="components.pricing.featureRenderer.contactLimit.title" tag="div">
				<template #limit>
					<span class="bg-primary/10 text-primary px-1">{{
						$formatNumber(activeContactLimitForTitle, currentLocale)
					}}</span>
				</template>
			</i18n-t>
		</template>
		<template #description>
			<i18n-t
				keypath="components.pricing.featureRenderer.contactLimit.description"
				tag="div"
				class="text-sm text-muted"
			>
				<template #periodName>
					<span v-if="plan.period === 'monthly'" class="text-primary font-bold">{{
						$t('components.pricing.featureRenderer.contactLimit.monthlyName')
					}}</span>
					<span v-else class="text-primary font-bold">{{
						$t('components.pricing.featureRenderer.contactLimit.yearlyName')
					}}</span>
				</template>
				<template #activePeople>
					<a
						href="#active-contacts-info"
						class="link link-primary underline decoration-dotted underline-offset-2 font-bold hover:brightness-75"
						@click.prevent="openActiveContactsInfoModal"
					>
						<i18n-t keypath="components.pricing.featureRenderer.contactLimit.activePeople" tag="u">
							<template #limit>
								{{ $formatNumber(plan.activeContactLimit, currentLocale) }}
							</template>
						</i18n-t>
					</a>
				</template>
			</i18n-t>
		</template>
	</FeatureSummary>
	<!-- Default render for all other features -->
	<FeatureSummary
		v-else-if="featureData[featureKey]"
		:title="customTitle || $t(`components.pricing.featureRenderer.features.${featureKey}.title`)"
		:description="customDescription || $t(`components.pricing.featureRenderer.features.${featureKey}.description`)"
		:duotone-path="customDuotonePath || featureData[featureKey].duotonePath"
		:icon-class="customIconClass || featureData[featureKey].iconClass"
		:helper-text="customHelperText"
		v-bind="$attrs"
	>
		<template v-if="$slots.icon" #icon>
			<slot name="icon" />
		</template>
		<template v-if="$slots.title" #title>
			<slot name="title" />
		</template>
		<template v-if="$slots.description" #description>
			<slot name="description" />
		</template>
		<template v-if="$slots.helperText" #helperText>
			<slot name="helperText" />
		</template>
	</FeatureSummary>
</template>

<script>
import FeatureSummary from '~/components/Pricing/FeatureSummary.vue'
import LocalizedLink from '~/components/GlobalComponents/LocalizedLink.vue'
import featureKeys from '~/types/featureList.ts'
import { Plan } from '~/models/Pricing/Plan.ts'

export default {
	inheritAttrs: false,
	components: {
		FeatureSummary,
		LocalizedLink,
	},
	props: {
		featureKey: {
			type: String,
			required: true,
		},
		plan: {
			type: Plan,
			default: null,
		},
		customTitle: {
			type: String,
			default: null,
		},
		customDescription: {
			type: String,
			default: null,
		},
		customDuotonePath: {
			type: String,
			default: null,
		},
		customIconClass: {
			type: String,
			default: null,
		},
		customHelperText: {
			type: String,
			default: null,
		},
	},
	computed: {
		featureKeys() {
			return featureKeys
		},
		currentLocale() {
			return this.$i18n?.locale || 'en'
		},
		activeContactLimitForTitle() {
			// if (this.plan.period === 'yearly') {
			// 	return this.plan.activeContactLimit / 12
			// }

			return this.plan.activeContactLimit
		},
	},
	methods: {
		openActiveContactsInfoModal() {
			this.$emitter.emit('showActiveContactsInfoModal')
		},
	},
	data() {
		return {
			featureData: {
				neverMissMessage: { duotonePath: 'com/com002' },
				breakLanguageBarriers: { duotonePath: 'com/com001' },
				turnCommentsToConversations: { duotonePath: 'com/com009' },
				moderateSmarter: { duotonePath: 'teh/teh003' },
				automateLikePro: { duotonePath: 'gen/gen002' },
				startFastWithQuickFlows: { duotonePath: 'abs/abs027' },
				instantlyKnowWhatMatters: { duotonePath: 'gen/gen025' },
				knowWhatWorks: { duotonePath: 'abs/abs003' },
				engageAuthentically: { duotonePath: 'gen/gen026' },
				collaborateSeamlessly: { duotonePath: 'soc/soc009' },
				// Plan Element Features
				contactLimit: { iconClass: 'fa fa-users' },
				accessAllFeatures: { iconClass: 'fa fa-wand-magic-sparkles text-primary' },
				unlimitedGiveaways: { iconClass: 'fa fa-bolt-lightning text-simpliers' },
				cancelAnytime: { iconClass: 'fa fa-check-circle text-success' },
			},
		}
	},
}
</script>
