<template>
	<div>
		<!--		<div class="flex items-center gap-2 mb-1">-->
		<div class="flex flex-col sm:flex-row gap-2 mb-1 sm:items-center">
			<slot name="icon">
				<img
					v-if="duotonePath"
					:src="`/images/theme/vendor/duotone-icons/${duotonePath}.svg`"
					:alt="`${title} Icon`"
					class="size-8 mr-2"
				/>
				<i v-if="iconClass" :class="iconClass"></i>
			</slot>
			<slot name="title">
				<div class="font-semibold">
					{{ title }}
				</div>
			</slot>
		</div>
		<slot name="description">
			<div class="text-sm text-muted">
				{{ description }}
			</div>
		</slot>
		<div class="text-xs text-muted" v-if="helperText || $slots.helperText">
			<!--			<i class="fa fa-info-circle text-info" />-->
			<slot name="helperText">
				{{ helperText }}
			</slot>
		</div>
	</div>
</template>
<script>
export default {
	props: {
		title: {
			type: String,
		},
		description: {
			type: String,
		},
		helperText: {
			type: String,
		},
		iconClass: {
			type: String,
			default: null,
		},
		duotonePath: {
			type: String,
		},
	},
}
</script>

<style scoped></style>
