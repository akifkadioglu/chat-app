<template>
	<div class="">
		<AnimatedSimpliersLogo
			ref="simpliersLogo"
			:animateOnMount="animateOnMount"
			@deleteComplete="handleDeleteComplete"
			@typeComplete="handleTypeComplete"
			:typeSpeed="0.03"
			:deleteSpeed="0.02"
			:animateOnScroll="animateOnScroll"
		/>
		<AnimatedChatLogo ref="chatLogo" />
	</div>
</template>
<script>
import AnimatedChatLogo from '~/components/GlobalComponents/Brands/AnimatedChatLogo.vue'
import AnimatedSimpliersLogo from '~/components/GlobalComponents/Brands/AnimatedSimpliersLogo.vue'

export default {
	components: { AnimatedSimpliersLogo, AnimatedChatLogo },
	props: {
		animateOnMount: {
			type: Boolean,
			default: false,
		},
		animateOnScroll: {
			type: Boolean,
			default: false,
		},
		stuck: {
			type: Boolean,
			default: false,
		},
	},
	data() {
		const { largerThan } = useWindowSize()
		return {
			largerThan,
		}
	},
	mounted() {
		if (!this.animateOnScroll) {
			this.applyLogoState()
		}
	},
	watch: {
		'largerThan.sm': {
			handler(v) {
				this.applyLogoState(v)
			},
			// immediate: true,
		},
		stuck(newVal) {
			if (!this.animateOnScroll) return

			if (newVal) {
				this.$refs.simpliersLogo?.typeText?.()
				return
			}
			this.$refs.simpliersLogo?.deleteText?.()
		},
	},
	methods: {
		applyLogoState(isSmUp = this.largerThan.sm) {
			if (isSmUp) {
				this.$refs.simpliersLogo?.typeText?.()
				return
			}
			this.$refs.simpliersLogo?.deleteText?.()
		},

		handleDeleteComplete() {
			this.$refs.chatLogo.bounce()
		},
		handleTypeComplete() {
			this.$refs.chatLogo.shrink()
		},
	},
}
</script>

<style scoped></style>
