<template>
	<DiagramPage />
</template>

<script>
import DiagramPage from '~/components/Flow/Diagram/DiagramPage.vue'

export default {
	components: { DiagramPage },
	setup() {
		definePageMeta({
			layout: 'app',
			middleware: ['auth-custom'],
		})
	},
}
</script>
