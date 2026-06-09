<template>
	<span class="brand-name text-forms font-semibold" :class="[colorClass]" translate="no">Forms</span>
</template>

<script>
export default {
	props: {
		colorClass: {
			type: String,
			default: 'gradient-text-primary-to-forms',
		},
	},
}
</script>
