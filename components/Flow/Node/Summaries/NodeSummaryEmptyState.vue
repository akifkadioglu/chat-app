<template>
	<div class="flex items-center gap-2 text-sm text-base-content/60">
		<slot>
			<i class="fa fa-plus-circle mr-2 text-primary" />
			<span>{{ text }}</span>
		</slot>
	</div>
</template>
<script>
export default {
	props: {
		text: {
			type: String,
			default: '',
		},
	},
}
</script>
