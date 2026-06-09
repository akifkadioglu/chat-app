<template>
	<span class="brand-name font-medium" :class="colorClass" translate="no">
		{{ $t('components.globalComponents.brands.giveaway') }}
	</span>
</template>

<script>
export default {
	props: {
		colorClass: {
			type: String,
			default: 'text-base-content',
		},
	},
}
</script>
