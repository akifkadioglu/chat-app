<template>
	<ChatSvgLogo ref="logoWrapper" />
</template>

<script>
import { gsap } from 'gsap'
import ChatSvgLogo from '~/components/GlobalComponents/Brands/ChatSvgLogo.vue'

export default {
	name: 'AnimatedChatLogo',
	components: { ChatSvgLogo },
	props: {
		bounceScale: {
			type: Number,
			default: 1.1,
		},
		bounceDuration: {
			type: Number,
			default: 0.15,
		},
	},
	emits: ['bounceComplete'],
	methods: {
		bounce() {
			if (!this.$refs.logoWrapper) return

			const tl = gsap.timeline({
				onComplete: () => {
					this.$emit('bounceComplete')
				},
			})

			tl.to(this.$refs.logoWrapper, {
				scale: 1.3,
				x: -2,
				duration: this.bounceDuration,
				ease: 'power2.out',
			}).to(this.$refs.logoWrapper, {
				scale: 1.2,
				x: 0,
				duration: this.bounceDuration,
				ease: 'power2.inOut',
			})
		},
		shrink() {
			if (!this.$refs.logoWrapper) return
			gsap.to(this.$refs.logoWrapper, {
				scale: 1,
				x: 0,
				duration: this.bounceDuration,
				ease: 'power2.out',
			})
		},
	},
}
</script>
