<template>
	<div class="pb-5">
		<slot name="title">
			<div class="flex gap-2 items-center mb-3">
				<slot name="icon" />
				<h3 class="text-lg">{{ title }}</h3>
			</div>
		</slot>
		<div class="space-y-5 pl-5" v-auto-animate>
			<slot />
		</div>
	</div>
</template>
<script>
export default {
	props: {
		title: {
			type: String,
		},
	},
}
</script>

<style scoped></style>
