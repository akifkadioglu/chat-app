<template>
	<div
		v-if="devTestScenarioStore.getScenariosVisible()"
		class="absolute z-91 px-1"
		style="top: -100px; max-width: 100%"
	>
		<div
			class="d-flex gap-1 bg-white rounded p-1 border-warning border-2 shadow-warning overflow-auto"
			style="width: fit-content; max-width: 100%"
		>
			<button v-for="(button, i) in buttons" :key="i" class="btn btn-warning btn-xs" @click="button.action">
				Try {{ button.name }}
			</button>
		</div>
		<!-- End Row -->
	</div>
</template>

<script>
export default {
	props: {
		buttons: {
			type: Array,
			required: true,
		},
	},
	setup() {
		return {
			devTestScenarioStore: useDevTestScenarioStore(),
		}
	},
}
</script>
<style scoped></style>
