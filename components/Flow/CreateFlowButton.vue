<template>
	<button @click="$emitter.emit('showCreateFlowModal', { params, queries })" :class="buttonClass">
		<i v-if="!isIconRight" :class="iconClass" />
		<span>{{ title || $t('components.flow.flowCreateDropdown.createFlowButton') }}</span>
		<i v-if="isIconRight" :class="iconClass" />
	</button>
</template>
<script>
import LocalizedLink from '~/components/GlobalComponents/LocalizedLink.vue'
import { QUICK_TYPES } from '~/models/Flow/utils/quick.ts'
import CreateFlowModal from '~/components/Flow/CreateFlowModal.vue'

export default {
	props: {
		title: {
			type: String,
			default: '',
		},
		buttonClass: {
			type: String,
			default: 'btn btn-primary btn-transition gap-2 shadow-sm',
		},
		iconClass: {
			type: String,
			default: 'fa fa-paper-plane',
		},
		isIconRight: {
			type: Boolean,
			default: false,
		},
		params: {
			type: Object,
			default: {},
		},
		queries: {
			type: Object,
			default: {},
		},
	},
	computed: {
		QUICK_TYPES() {
			return QUICK_TYPES
		},
	},
	components: { CreateFlowModal, LocalizedLink },
}
</script>

<style scoped></style>
