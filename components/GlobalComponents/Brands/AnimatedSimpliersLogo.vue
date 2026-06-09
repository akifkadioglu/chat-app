<template>
	<span class="font-normal notranslate text-simpliers overflow-hidden whitespace-nowrap inline-flex">
		<span
			v-for="(char, index) in displayChars"
			:key="index"
			:ref="'char-' + index"
			class="inline-block"
			:style="initialCharStyle"
		>
			{{ char }}
		</span>
	</span>
</template>

<script>
import { gsap } from 'gsap'

export default {
	props: {
		typeSpeed: {
			type: Number,
			default: 0.05,
		},
		deleteSpeed: {
			type: Number,
			default: 0.03,
		},
		animateOnMount: {
			type: Boolean,
			default: true,
		},
		animateOnScroll: {
			type: Boolean,
			default: false,
		},
	},
	emits: ['typeComplete', 'deleteComplete'],
	setup(props) {
		const { largerThan } = useWindowSize()
		const simpliersText = 'simpliers'

		let initialChars = []
		if (props.animateOnScroll) {
			initialChars = []
		} else if (!props.animateOnMount && largerThan.sm) {
			initialChars = simpliersText.split('')
		}

		return {
			largerThan,
			simpliersText,
			initialChars,
		}
	},
	data() {
		return {
			displayChars: [...this.initialChars],
			isAnimating: false,
			timeline: null,
		}
	},
	computed: {
		initialCharStyle() {
			return this.animateOnMount ? { opacity: 0, transform: 'translateY(10px)', width: 0 } : {}
		},
	},
	methods: {
		typeText() {
			if (this.displayChars.length === this.simpliersText.length) {
				return
			}
			if (this.isAnimating) {
				return
			}
			this.isAnimating = true
			this.displayChars = this.simpliersText.split('')

			this.$nextTick(() => {
				if (!this.animateOnMount) {
					this.displayChars.forEach((char, i) => {
						const charEl = this.$refs['char-' + i]?.[0]
						if (charEl) {
							gsap.set(charEl, { opacity: 0, y: 10, width: 0 })
						}
					})
				}

				const timeline = gsap.timeline({
					onComplete: () => {
						this.isAnimating = false
						this.$emit('typeComplete')
					},
				})

				this.displayChars.forEach((char, i) => {
					const charEl = this.$refs['char-' + i]?.[0]
					if (charEl) {
						timeline.to(
							charEl,
							{
								opacity: 1,
								y: 0,
								width: 'auto',
								duration: 0.08,
								ease: 'power2.out',
							},
							i * this.typeSpeed,
						)
					}
				})
			})
		},
		deleteText() {
			if (this.displayChars.length === 0) {
				return
			}
			if (this.isAnimating) {
				return
			}
			this.isAnimating = true

			const timeline = gsap.timeline({
				onComplete: () => {
					this.isAnimating = false
					this.displayChars = []
					this.$emit('deleteComplete')
				},
			})

			const length = this.displayChars.length
			for (let i = length - 1; i >= 0; i--) {
				const charEl = this.$refs['char-' + i]?.[0]
				if (charEl) {
					timeline.to(
						charEl,
						{
							opacity: 0,
							y: 10,
							width: 0,
							duration: 0.06,
							ease: 'power2.in',
						},
						(length - 1 - i) * this.deleteSpeed,
					)
				}
			}
		},
	},
	beforeUnmount() {
		if (this.timeline) {
			this.timeline.kill()
		}
	},
}
</script>
