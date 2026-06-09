<template>
	<!--	<div class="flex join">-->
	<PublishElement
		:class="{ 'w-full': !(rollbackAvailable && statusPublished) }"
		buttonClass="btn btn-sm py-5 join-item"
		showPublishChangesButton
		previewPlacement="top-start"
		previewLocation="PublishElementGroup"
	/>
	<!--		<PublishChangesButton v-if="rollbackAvailable && statusPublished" class="btn-sm btn-soft join-item flex-1 w-full py-5" />-->
	<!--	</div>-->
</template>

<script>
import PublishElement from '~/components/Flow/FlowSetup/PublishElement.vue'
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import { FLOW_STATUS_PUBLISHED } from '~/models/Flow/Flow.ts'
import PublishChangesButton from '~/components/Flow/FlowSetup/PublishChangesButton.vue'

export default {
	components: { PublishChangesButton, LoadingElement, PublishElement },
	inject: ['publishing'],
	setup() {
		return {
			flowStore: useFlowStore(),
		}
	},
	emits: ['replacePublishedVersion'],
	computed: {
		statusPublished() {
			return this.flowStore.flow?.status === FLOW_STATUS_PUBLISHED
		},

		rollbackAvailable() {
			return this.flowStore.flow?.raw?.publishedVersion?.version !== this.flowStore.flow?.version
		},
	},
}
</script>
