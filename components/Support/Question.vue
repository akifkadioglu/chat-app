<template>
	<!--	<div class="px-2 my-2">-->
	<!--		<button-->
	<!--			class="w-full text-left py-4 flex justify-between items-center hover:text-blue-600 transition-colors"-->
	<!--			role="button"-->
	<!--			@click="toggleCollapse"-->
	<!--			:aria-expanded="isExpanded"-->
	<!--			itemscope-->
	<!--			itemprop="mainEntity"-->
	<!--			itemtype="https://schema.org/Question"-->
	<!--		>-->
	<!--			<svg-->
	<!--				class="w-5 h-5 transform transition-transform duration-200"-->
	<!--				:class="{ 'rotate-180': isExpanded }"-->
	<!--				fill="none"-->
	<!--				stroke="currentColor"-->
	<!--				viewBox="0 0 24 24"-->
	<!--			>-->
	<!--				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>-->
	<!--			</svg>-->
	<!--		</button>-->
	<Collapse itemprop="mainEntity" itemscope itemtype="https://schema.org/Question" showArrow>
		<template #title>
			<span class="text-lg" itemprop="name">{{ faq.question }}</span>
		</template>
		<div class="overflow-hidden" itemprop="acceptedAnswer" itemscope itemtype="https://schema.org/Answer">
			<div class="pb-4 text-gray-700" itemprop="text" v-html="faq.answer" />
			<client-only>
				<article-feedback :faq-id="faq.id" />
			</client-only>
		</div>
	</Collapse>
	<!--		<transition-->
	<!--			name="collapse"-->
	<!--			enter-active-class="transition-all duration-300 ease-in"-->
	<!--			leave-active-class="transition-all duration-300 ease-in-out"-->
	<!--			enter-from-class="max-h-0 opacity-0"-->
	<!--			enter-to-class="max-h-96 opacity-100"-->
	<!--			leave-from-class="max-h-96 opacity-100"-->
	<!--			leave-to-class="max-h-0 opacity-0"-->
	<!--		>-->
	<!--			<div class="overflow-hidden" itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">-->
	<!--				<div class="pb-4 text-gray-700" itemprop="text" v-html="faq.answer" />-->
	<!--				<client-only>-->
	<!--					<article-feedback :faq-id="faq.id" />-->
	<!--				</client-only>-->
	<!--			</div>-->
	<!--		</transition>-->
	<!--	</div>-->
</template>

<script>
import ArticleFeedback from '~/components/Support/ArticleFeedback.vue'
import Collapse from '~/components/GlobalComponents/Collapse.vue'

export default {
	name: 'Question',
	components: { Collapse, ArticleFeedback },
	props: {
		parentId: {
			type: String,
			required: true,
		},
		faq: {
			type: Object,
			required: true,
		},
	},
	data() {
		return {
			isExpanded: false,
		}
	},
	methods: {
		toggleCollapse() {
			this.isExpanded = !this.isExpanded
		},
	},
}
</script>

<style scoped></style>
