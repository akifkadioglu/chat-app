<template>
	<client-only>
		<component
			v-if="lottieComponent"
			:is="lottieComponent"
			:animation-link="animationLink"
			:height="height"
			:width="width"
			:loop="loop"
			:autoplay="autoplay"
		/>
		<div v-else :style="`width: ${width}px; height: ${height}px`"></div>
	</client-only>
</template>

<script>
import { markRaw } from 'vue'

export default {
	props: {
		animationLink: String,
		height: [String, Number],
		width: [String, Number],
		loop: {
			type: Boolean,
			default: true,
		},
		autoplay: {
			type: Boolean,
			default: true,
		},
	},
	data() {
		return {
			lottieComponent: null,
		}
	},
	async mounted() {
		if (import.meta.client) {
			// Dynamic import - sadece client tarafında ve kullanıldığında yüklenir
			const { Vue3Lottie } = await import('vue3-lottie')
			this.lottieComponent = markRaw(Vue3Lottie)
		}
	},
}
</script>

<style scoped></style>
