<template>
	<span v-if="isLoading" :class="sizeClass" class="inline-flex items-center" v-bind="$attrs">
		<span class="loading loading-spinner" :class="loadingClass" :style="{ width: usingSize, height: usingSize }" />
	</span>
	<span v-else v-bind="$attrs">
		<slot />
	</span>
</template>

<script>
export default {
	props: {
		isLoading: {
			type: Boolean,
			default: true,
		},
		sizeClass: {
			type: String,
			default: '',
		},
		sizeRem: {
			type: Number,
			default: null,
		},
		sizeTW: {
			type: Number,
			default: null,
		},
		size: {
			default: '25',
		},
		// tag: {
		// 	type: String,
		// 	default: 'span',
		// },
		loadingClass: {
			type: String,
			default: '',
		},
	},
	computed: {
		usingSize() {
			if (this.sizeClass) return null
			if (this.sizeTW) return this.sizeInTW
			if (this.sizeRem) return this.sizeInRem
			return this.size + 'px'
		},
		sizeInRem() {
			return this.sizeRem ? this.sizeRem + 'rem' : null
		},
		sizeInTW() {
			return this.sizeTW ? this.sizeTW * 4 + 'px' : null
		},
	},
}
</script>
