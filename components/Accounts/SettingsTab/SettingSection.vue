<template>
	<div class="space-y-5">
		<div class="flex flex-wrap items-center justify-between">
			<slot name="title">
				<h2 class="text-2xl">
					{{ title }}
				</h2>
			</slot>
			<div class="ml-auto">
				<slot name="titleTrailing" />
			</div>
		</div>
		<div
			class="space-y-4"
			:class="{
				'pointer-events-none opacity-50': isLoading,
			}"
		>
			<slot />
		</div>
	</div>
</template>
<script>
export default {
	name: 'SettingSection',
	props: {
		isLoading: {
			type: Boolean,
			default: false,
		},
		title: {
			type: String,
		},
	},
}
</script>
