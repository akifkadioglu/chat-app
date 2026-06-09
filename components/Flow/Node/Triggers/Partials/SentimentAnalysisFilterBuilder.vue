<template>
	<div class="flex flex-col gap-3">
		<!-- Rule Card -->
		<div class="flex items-start gap-2">
			<div class="flex flex-col items-baseline gap-2 w-full">
				<!-- Sentiment Selector -->
				<div class="w-full ps-4 pb-4">
					<!-- Description -->
					<div class="mb-4 text-sm font-semibold">
						{{ $t('components.flow.node.triggers.partials.sentimentFilterBuilder.description') }}
					</div>

					<div class="flex flex-col w-full gap-4">
						<label
							v-for="sentiment in availableSentiments"
							:key="sentiment"
							class="flex items-center gap-2 cursor-pointer rounded-lg"
						>
							<input
								type="radio"
								name="sentiment"
								:value="sentiment"
								v-model="options.label"
								class="radio radio-xs radio-primary"
							/>
							<i :class="getSentimentIcon(sentiment)"></i>
							<span class="text-xs">
								{{ $t(`components.flow.node.triggers.partials.sentimentFilterBuilder.sentiments.${sentiment}`) }}
							</span>
						</label>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { comparisonOperators } from '~/models/Flow/utils/utils'

export default {
	name: 'SentimentAnalysisFilterBuilder',
	props: {
		options: {
			type: Object,
			required: true,
		},
	},
	computed: {
		availableSentiments() {
			return comparisonOperators.sentiment || []
		},
	},
	methods: {
		getSentimentIcon(sentiment) {
			switch (sentiment) {
				case 'positive':
					return 'fa fa-smile text-success'
				case 'neutral':
					return 'fa fa-meh text-warning'
				case 'negative':
					return 'fa fa-frown text-error'
				default:
					return 'fa fa-circle'
			}
		},
	},
}
</script>

<style scoped></style>
