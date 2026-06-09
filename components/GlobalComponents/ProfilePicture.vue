<template>
	<div class="avatar avatar-placeholder">
		<div
			:class="[showSkeleton ? 'skeleton' : ' ', { [ring]: ringColor }, ringColor, bgColor]"
			class="text-base-content rounded-full"
			:style="{ width: size + 'px', height: size + 'px' }"
		>
			<img :alt="alt" :src="imgSrc" class="rounded-full" />
		</div>
	</div>
</template>
<script>
const EMPTY_IMG_URL = '/images/ui/user.png'
export default {
	props: {
		showSkeleton: {
			type: Boolean,
			default: false,
		},
		ringColor: {
			type: String,
		},
		ring: {
			type: String,
			default: 'ring-3',
		},
		bgColor: {
			default: 'bg-base-200',
		},
		alt: {
			type: String,
		},
		src: {
			type: String,
		},
		size: {
			type: [Number, String],
			default: 50,
		},
	},
	computed: {
		imgSrc() {
			if (this.showSkeleton) {
				return EMPTY_IMG_URL
			}
			if (!this.src) {
				return EMPTY_IMG_URL
			}
			return this.src
		},
	},
}
</script>

<style scoped></style>
