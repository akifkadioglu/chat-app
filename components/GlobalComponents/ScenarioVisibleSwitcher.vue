<template>
	<div class="flex items-center gap-2 text-nowrap">
		<label>
			<small>Scenarios</small>
			<input v-model="isScenariosVisible" type="checkbox" class="toggle toggle-sm" />
		</label>
	</div>
</template>

<script>
export default {
	data() {
		return {
			isScenariosVisible: this.devTestScenarioStore.getScenariosVisible(),
		}
	},
	setup() {
		return {
			devTestScenarioStore: useDevTestScenarioStore(),
		}
	},
	watch: {
		isScenariosVisible(newValue) {
			this.devTestScenarioStore.setScenariosVisible(newValue)
		},
	},
}
</script>
