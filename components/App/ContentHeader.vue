<template>
	<div class="flex justify-between items-center mb-10 flex-wrap">
		<div class="flex items-center gap-2">
			<button class="md:hidden" @click="$emit('toggleDrawer')">
				<i class="fa fa-bars"></i>
			</button>
			<h1 class="text-2xl md:text-3xl font-bold">{{ title }}</h1>
		</div>
		<slot name="actions" />
	</div>
</template>
<script>
export default {
	props: {
		title: {
			type: String,
			default: '',
		},
	},
	emits: ['toggleDrawer'],
}
</script>

<style scoped></style>
