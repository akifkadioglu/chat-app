<template>
	<span v-if="priceType" ref="stat" v-bind="$attrs">{{ $formatPrice(displayNumber, $i18n.locale, effectiveCurrencyCode, decimals || undefined) }}</span>
	<span v-else-if="socialCountType" ref="stat" v-bind="$attrs">{{ $formatSocialCount(Math.round(displayNumber), $i18n.locale) }}</span>
	<span v-else ref="stat" v-bind="$attrs">{{ $formatNumber(displayNumber, $i18n.locale, decimals) }}</span>
</template>

<script>
export default {
	props: {
		startNumber: {
			type: Number,
			default: 0,
		},
		endNumber: {
			type: Number,
			required: true,
		},
		duration: {
			type: Number,
			default: 1000,
		},
		decimals: {
			type: Number,
			default: 0,
		},
		priceType: {
			type: Boolean,
			default: false,
		},
		currencyCode: {
			type: String,
			default: null,
		},
		socialCountType: {
			type: Boolean,
			default: false,
		},
		triggerOnScroll: {
			type: Boolean,
			default: true,
		},
		animate: {
			type: Boolean,
			default: true,
		},
	},
	data() {
		return {
			displayNumber: this.endNumber,
			interval: null,
			observer: null,
			hasAnimated: false,
		}
	},
	setup() {
		return {
			sessionStore: useSessionStore(),
		}
	},
	computed: {
		effectiveCurrencyCode() {
			return this.currencyCode ?? this.sessionStore.data.currency
		},
	},
	watch: {
		endNumber(val) {
			if (this.animate && this.hasAnimated) {
				this.animateNumber(val)
			} else {
				this.displayNumber = val
			}
		},
	},
	mounted() {
		if (!this.animate) {
			this.displayNumber = this.endNumber
			return
		}
		if (this.triggerOnScroll) {
			this.observeViewport()
		} else {
			this.startAnimation()
		}
	},
	beforeUnmount() {
		this.observer?.disconnect()
		this.observer = null
		clearInterval(this.interval)
	},
	methods: {
		observeViewport() {
			if (typeof IntersectionObserver === 'undefined' || !this.$refs.stat) {
				this.startAnimation()
				return
			}
			this.observer = new IntersectionObserver(
				([entry]) => {
					if (entry.isIntersecting) {
						this.startAnimation()
						this.observer?.disconnect()
						this.observer = null
					}
				},
				{ threshold: 0.1 },
			)
			this.observer.observe(this.$refs.stat)
		},
		startAnimation() {
			if (this.hasAnimated) return
			this.hasAnimated = true
			this.displayNumber = this.startNumber
			setTimeout(() => {
				this.displayNumber = this.startNumber
				this.animateNumber()
			}, 150)
		},
		animateNumber() {
			clearInterval(this.interval)
			const raising = this.endNumber > this.displayNumber
			const freq = 100
			const step = ((this.endNumber - this.displayNumber) * freq) / this.duration
			this.interval = window.setInterval(() => {
				if ((raising && this.displayNumber >= this.endNumber) || (!raising && this.displayNumber <= this.endNumber)) {
					clearInterval(this.interval)
					this.displayNumber = this.endNumber
					return
				}
				this.displayNumber = this.displayNumber + step
			}, freq)
		},
	},
}
</script>

<style scoped></style>
