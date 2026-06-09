<template>
	<div class="bg-linear-to-b from-base-100 via-accent/5 to-base-100">
		<section ref="aiSection" class="relative py-32">
			<div class="page-container !max-w-7xl">
				<div class="text-center mb-20">
					<h2 ref="aiTitle" class="text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.05] mb-6">
						Everything you need to <span class="text-accent">grow</span>
					</h2>
					<p class="text-xl text-muted">Replies, analytics, translations and multi-account tools in one platform.</p>
				</div>

				<!-- Feature cards -->
				<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
					<FeatureCard
						v-for="(feature, i) in features"
						:key="i"
						ref="featureCards"
						:icon="feature.icon"
						:icon-bg="feature.iconBg"
						:title="feature.title"
						:desc="feature.desc"
						:preview-bg="feature.previewBg"
					/>
				</div>

				<div class="text-center mt-12">
					<button
						class="btn btn-accent btn-lg rounded-full shadow-lg shadow-accent/20 hover:scale-105 transition-transform duration-300"
					>
						Build your first Flow
					</button>
				</div>
			</div>
		</section>
	</div>
</template>

<script>
import { gsap } from 'gsap'
import FeatureCard from '~/components/Landing/Main2/FeatureCard.vue'

export default {
	components: { FeatureCard },
	data() {
		return {
			gsapCtx: null,
			features: [
				{
					icon: '\uD83D\uDCAC',
					iconBg: 'bg-primary/20',
					title: 'Real-time Chat',
					desc: 'Bring every Instagram DM into one clean, unified inbox. Respond faster, stay organized, and never lose context.',
					previewBg: 'bg-gradient-to-br from-primary/10 to-info/10',
				},
				{
					icon: '\u26A1',
					iconBg: 'bg-accent/20',
					title: 'Automated Flows',
					desc: 'Create powerful Flows that put your Instagram on autopilot. Set your Rules, define your Steps, and let the system handle the rest.',
					previewBg: 'bg-gradient-to-br from-accent/10 to-secondary/10',
				},
				{
					icon: '\uD83D\uDCCA',
					iconBg: 'bg-success/20',
					title: 'Comment Analysis',
					desc: 'Let AI read between the lines. Automatically detect sentiment, categorize comments, and see how your audience reacts.',
					previewBg: 'bg-gradient-to-br from-success/10 to-warning/10',
				},
				{
					icon: '\uD83C\uDF0D',
					iconBg: 'bg-info/20',
					title: 'Auto-Translate',
					desc: 'Break every language barrier. Translate incoming and outgoing messages instantly and connect with global audiences.',
					previewBg: 'bg-gradient-to-br from-info/10 to-primary/10',
				},
				{
					icon: '\uD83D\uDC65',
					iconBg: 'bg-warning/20',
					title: 'Multi-Account',
					desc: 'See all your Instagram accounts side-by-side. Monitor activity, manage conversations, and track performance across every profile.',
					previewBg: 'bg-gradient-to-br from-warning/10 to-error/10',
				},
				{
					icon: '\uD83D\uDD12',
					iconBg: 'bg-neutral/20',
					title: 'Secure & Approved',
					desc: 'Simpliers is a Meta-approved Tech Provider. Your data is encrypted and never shared with third parties.',
					previewBg: 'bg-gradient-to-br from-neutral/10 to-base-content/5',
				},
			],
		}
	},
	mounted() {
		this.initGSAP()
	},
	beforeUnmount() {
		if (this.gsapCtx) this.gsapCtx.revert()
	},
	methods: {
		initGSAP() {
			this.gsapCtx = gsap.context(() => {
				gsap.from(this.$refs.aiTitle, {
					opacity: 0,
					y: 60,
					duration: 1,
					ease: 'power3.out',
					scrollTrigger: {
						trigger: this.$refs.aiSection,
						start: 'top 70%',
					},
				})

				if (this.$refs.featureCards) {
					const cards = this.$refs.featureCards.map((c) => c.$el)
					gsap.to(cards, {
						opacity: 1,
						y: 0,
						duration: 0.8,
						stagger: 0.2,
						ease: 'power2.out',
						scrollTrigger: {
							trigger: cards[0],
							start: 'top 80%',
						},
					})
					gsap.from(cards, { y: 50 })
				}
			}, this.$el)
		},
	},
}
</script>
