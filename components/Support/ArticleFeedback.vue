<template>
	<div class="text-center">
		<div v-if="isSubmitted" class="font-semibold pb-2 text-info/75">
			<i class="fas fa-comments mr-2" />
			{{ $t('components.support.articleFeedback.thankYou') }}
		</div>
		<div v-else>
			<p class="text-sm mb-3">
				{{ $t('components.support.articleFeedback.title') }}
			</p>
			<div class="mb-3">
				<button
					class="btn btn-outline btn-success btn-sm transition-all duration-300 hover:scale-105 mb-2 sm:mb-0 mx-1 px-6"
					@click="submit(true)"
				>
					<i class="fas fa-thumbs-up mr-2" />
					{{ $t('components.support.articleFeedback.yes') }}
				</button>
				<button
					class="btn btn-error btn-sm transition-all duration-300 hover:scale-105 mb-2 sm:mb-0 mx-1 px-6"
					@click="submit(false)"
				>
					<i class="fas fa-thumbs-down mr-2" />
					{{ $t('components.support.articleFeedback.no') }}
				</button>
			</div>
		</div>
	</div>
</template>

<script>
import ApiList from '~/apis/ApiList.js'

export default {
	name: 'ArticleFeedback',
	props: {
		faqId: {
			type: Number,
			required: true,
		},
	},
	data() {
		return {
			isSubmitted: false,
		}
	},
	mounted() {
		if (process.client) {
			this.isSubmitted = !!localStorage.getItem(`faqSubmitted_${this.faqId}`)
		}
	},
	methods: {
		submit(isHelpful) {
			this.$requestAdapter
				.post(ApiList.faq.rate, {
					faqId: this.faqId,
					rate: isHelpful,
				})
				.then(() => {
					this.isSubmitted = true
					localStorage.setItem(`faqSubmitted_${this.faqId}`, 'submitted')
				})
				.catch(() => {
					this.$toast.error(this.$t('components.support.articleFeedback.error'))
					this.isSubmitted = false
				})
		},
	},
}
</script>

<style scoped></style>
