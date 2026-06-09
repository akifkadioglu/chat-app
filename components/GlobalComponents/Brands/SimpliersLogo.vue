<template>
	<span class="font-normal notranslate" :class="[colorClass]" translate="no">
		{{ hideBrand ? '' : name }}
	</span>
</template>

<script>
export default {
	props: {
		hideBrand: {
			// for typedjs
			type: Boolean,
			default: false,
		},
		ucword: {
			type: Boolean,
			default: false,
		},
		colorClass: {
			type: String,
			default: 'text-simpliers',
		},
	},
	data() {
		return {
			name: this.ucword ? 'Simpliers' : 'simpliers',
		}
	},
}
</script>
