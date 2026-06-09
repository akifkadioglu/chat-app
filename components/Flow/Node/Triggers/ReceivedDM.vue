<template>
	<Filters :filterOptions="trigger.config" />
</template>
<script>
import { Trigger } from '~/models/Flow/Trigger.js'
import { Node } from '~/models/Flow/Node.js'
import Filters from '~/components/Flow/Node/Triggers/Partials/Filters.vue'
import { errorsList } from '~/models/Flow/utils/defaultConfigs.ts'

export default {
	components: { Filters },
	props: {
		node: {
			type: Node,
			required: true,
		},
		trigger: {
			type: Trigger,
			default: null,
		},
	},
	watch: {
		// 'trigger.config.wordFilters': {
		// 	handler() {
		// 		this.checkValidation()
		// 	},
		// 	deep: true,
		// },
		// 'trigger.config.intentFilter.intention'() {
		// 	this.checkValidation()
		// },
		// 'trigger.config.filterByWords'(newVal) {
		// 	this.checkValidation()
		// },
		// 'trigger.config.filterByIntent'(newVal) {
		// 	this.checkValidation()
		// },
	},
	methods: {
		// checkValidation() {
		// 	const hasWordFilter = (this.trigger.config?.wordFilters ?? []).some((rule) => {
		// 		if (rule.type === 'doesNotContain') {
		// 			return false // doesNotContain filtresi sayılmıyor.
		// 		}
		// 		return rule.keywords.length > 0
		// 	})
		//
		// 	if (hasWordFilter && this.trigger.config?.filterByWords) {
		// 		this.trigger.config.errors = []
		// 		return
		// 	}
		// 	const hasAiFilter = this.trigger.config.intentFilter?.intention
		// 	if (hasAiFilter && this.trigger.config?.filterByIntent) {
		// 		this.trigger.config.errors = []
		// 		return
		// 	}
		//
		// 	this.trigger.config.errors = [
		// 		{
		// 			...errorsList.receivedDMNeedsFilter,
		// 			message: this.$t(errorsList.receivedDMNeedsFilter.messageKey),
		// 		},
		// 	]
		// },
	},
}
</script>
