<template>
	<div class="flex join">
		<!-- Publish Flow Button -->
		<PreviewFlowDropdown
			class="join-item"
			:buttonClass="`${buttonClass} btn-primary btn-soft rounded-r-none!`"
			:placement="previewPlacement"
			:location="previewLocation"
			:compactOnMobile
		/>
		<button
			v-if="!statusPublished"
			@click="publishFlow"
			:disabled="publishing"
			:class="buttonClass"
			class="btn-primary btn-transition join-item"
		>
			<loading-element size="16" :is-loading="publishing">
				<i class="fas fa-rocket"></i>
			</loading-element>
			<span
				class="text-xs"
				:class="{
					'hidden sm:block': compactOnMobile,
				}"
			>
				{{ $t('components.flow.flowSetup.publishButton') }}
			</span>
		</button>

		<PublishChangesButton
			v-if="showPublishChangesButton && statusPublished"
			class="grow btn-soft text-xs join-item rounded-none"
			:class="[buttonClass, buttonVariant]"
		/>

		<!-- StopFlow Button -->
		<button
			@click="stopFlow"
			:class="buttonClass"
			class="btn-error btn-soft join-item"
			:disabled="flowStopLoading"
			v-if="statusPublished"
		>
			<loading-element size="16" :is-loading="flowStopLoading">
				<i class="fas fa-pause" />
			</loading-element>
			<span class="text-xs">
				{{ $t('components.flow.flowSetup.publishedFlowWarning.pauseFlow') }}
			</span>
		</button>
	</div>
</template>
<script>
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import { FLOW_STATUS_PUBLISHED } from '~/models/Flow/Flow.ts'
import { useFlowStore } from '~/stores/flow.ts'
import PublishChangesButton from '~/components/Flow/FlowSetup/PublishChangesButton.vue'
import PreviewFlowDropdown from '~/components/Flow/FlowSetup/PreviewFlowDropdown.vue'

export default {
	components: { PublishChangesButton, LoadingElement, PreviewFlowDropdown },
	props: {
		buttonClass: {
			type: String,
			default: 'btn btn-sm',
		},
		buttonVariant: {
			type: String,
			default: 'btn-primary',
		},
		showOnlyButton: {
			type: Boolean,
			default: false,
		},
		showPublishChangesButton: {
			type: Boolean,
			default: false,
		},
		previewPlacement: {
			type: String,
			default: 'bottom-end',
		},
		previewLocation: {
			type: String,
		},
		compactOnMobile: {
			type: Boolean,
			default: false,
		},
	},
	setup() {
		return {
			flowStore: useFlowStore(),
		}
	},
	inject: ['showAutoSaveStatus', 'publishing', 'flowStopLoading'],
	computed: {
		statusPublished() {
			return this.flowStore.flow?.status === FLOW_STATUS_PUBLISHED
		},
	},
	methods: {
		publishFlow() {
			this.$emitter.emit('publishFlow')
		},
		stopFlow() {
			this.$emitter.emit('stopFlow')
		},
	},
}
</script>

<style scoped></style>
