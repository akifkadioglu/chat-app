<template>
	<button class="btn btn-info w-max" :disabled="!rollbackAvailable || publishing" @click="replacePublishedVersion">
		<loading-element :is-loading="publishing" size="16">
			<i class="fas fa-sync-alt"></i>
		</loading-element>
		{{ $t('components.flow.flowSetup.publishedFlowWarning.goToLiveButton') }}
	</button>
</template>
<script>
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import { FLOW_STATUS_PUBLISHED } from '~/models/Flow/Flow.ts'

export default {
	components: { LoadingElement },
	inject: ['publishing', 'saving'],
	setup() {
		return {
			flowStore: useFlowStore(),
		}
	},
	methods: {
		replacePublishedVersion() {
			this.$emitter.emit('replacePublishedVersion')
		},
	},
	computed: {
		rollbackAvailable() {
			return this.flowStore.flow?.raw?.publishedVersion?.version !== this.flowStore.flow?.version
		},

		statusPublished() {
			return this.flowStore.flow?.status === FLOW_STATUS_PUBLISHED
		},
	},
}
</script>
