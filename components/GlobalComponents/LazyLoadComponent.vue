<template>
	<div ref="lazyTrigger" :class="containerClass">
		<LoadingElement :is-loading="!shouldLoad" :loading-class="loadingContainerClass">
			<slot />
		</LoadingElement>
	</div>
</template>

<script>
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'

export default {
	name: 'LazyLoadComponent',
	components: { LoadingElement },
	props: {
		rootMargin: {
			type: String,
			default: '200px',
		},
		threshold: {
			type: Number,
			default: 0.1,
		},
		containerClass: {
			type: String,
			default: 'w-full h-full',
		},
		loadingContainerClass: {
			type: String,
			default: 'w-full h-full flex items-center justify-center',
		},
	},
	emits: ['loaded', 'visible', 'hidden'],
	data() {
		return {
			shouldLoad: false,
			observer: null,
		}
	},
	mounted() {
		if (import.meta.client) {
			this.setupIntersectionObserver()
		}
	},
	beforeUnmount() {
		if (this.observer) {
			this.observer.disconnect()
		}
	},
	methods: {
		setupIntersectionObserver() {
			this.observer = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						if (entry.isIntersecting) {
							this.shouldLoad = true
							this.$emit('visible')
							this.$nextTick(() => {
								this.$emit('loaded')
							})
						} else {
							// Screen'den çıktığında içeriği boşalt
							this.shouldLoad = false
							this.$emit('hidden')
						}
					})
				},
				{
					rootMargin: this.rootMargin,
					threshold: this.threshold,
				},
			)

			if (this.$refs.lazyTrigger) {
				this.observer.observe(this.$refs.lazyTrigger)
			}
		},
	},
}
</script>
