<template>
	<NuxtPage />
</template>
<script>
export default {
	name: 'pay',
	setup() {
		definePageMeta({
			layout: 'app',
			middleware: ['auth-custom'],
		})
	},
}
</script>

<style scoped></style>
