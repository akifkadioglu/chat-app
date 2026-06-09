import { defineStore } from 'pinia'

export const useDevTestScenarioStore = defineStore('scenario', {
	state: () => ({
		isScenariosVisible: false,
	}),
	actions: {
		setScenariosVisible(isVisible) {
			this.isScenariosVisible = isVisible
		},
		getScenariosVisible() {
			return this.isScenariosVisible
		},
	},
})
