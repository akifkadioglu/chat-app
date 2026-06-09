<template>
	<div>
		<div class="max-w-3xl mb-12 mx-auto">
			<h3 class="text-3xl font-medium mb-1 text-center">{{ $t('components.pricing.features.title') }}</h3>
			<p class="text-sm">
				{{ $t('components.pricing.features.description') }}
			</p>
		</div>
		<div class="max-w-4xl mx-auto gap-8 grid grid-cols-1 md:grid-cols-2">
			<FeatureRenderer :feature-key="featureKeys.neverMissMessage" />
			<FeatureRenderer :feature-key="featureKeys.breakLanguageBarriers" />
			<FeatureRenderer :feature-key="featureKeys.turnCommentsToConversations" />
			<FeatureRenderer :feature-key="featureKeys.moderateSmarter" />
			<FeatureRenderer :feature-key="featureKeys.automateLikePro" />
			<FeatureRenderer :feature-key="featureKeys.startFastWithQuickFlows" />
			<FeatureRenderer :feature-key="featureKeys.instantlyKnowWhatMatters" />
			<FeatureRenderer :feature-key="featureKeys.knowWhatWorks" />
			<FeatureRenderer :feature-key="featureKeys.engageAuthentically" />
			<FeatureRenderer :feature-key="featureKeys.collaborateSeamlessly" />
		</div>
	</div>
</template>
<script>
import FeatureRenderer from '~/components/Pricing/FeatureRenderer.vue'
import featureKeys from '~/types/featureList.ts'

export default {
	name: 'Features',
	components: { FeatureRenderer },
	computed: {
		featureKeys() {
			return featureKeys
		},
	},
	props: {
		influencerFeaturesFirst: {
			type: Boolean,
			default: false,
		},
		brandFeaturesFirst: {
			type: Boolean,
			default: false,
		},
		agencyFeaturesFirst: {
			type: Boolean,
			default: false,
		},
	},
}
</script>

<style scoped></style>
