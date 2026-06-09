<template>
	<div class="sticky top-0 px-5 z-1">
		<!-- Published Flow Warning -->
		<div
			v-if="statusPublished"
			class="w-full !shadow-sm shadow-warning/50 rounded-t-none alert alert-warning alert-sm alert-soft !border !border-warning/50 items-center py-2 self-start z-1 flex flex-col md:grid"
		>
			<div class="flex flex-1 items-center gap-2">
				<i class="fas fa-exclamation-triangle"></i>
				<i18n-t keypath="components.flow.flowSetup.publishedFlowWarning.text" tag="span" class="text-base-content">
					<template #publishedFlow>
						<span class="font-semibold">{{ $t('components.flow.flowSetup.publishedFlowWarning.publishedFLow') }}</span>
					</template>
				</i18n-t>
			</div>
			<div class="ml-auto mr-0 flex-row-reverse flex md:flex-col gap-1 items-center justify-around">
				<!--				<button-->
				<!--					@click="replacePublishedVersion"-->
				<!--					class="btn btn-info btn-sm btn-transition w-max"-->
				<!--					:disabled="!rollbackAvailable"-->
				<!--				>-->
				<!--					<loading-element :is-loading="publishing" size="16">-->
				<!--						<i class="fas fa-sync-alt"></i>-->
				<!--					</loading-element>-->
				<!--					{{ $t('components.flow.flowSetup.publishedFlowWarning.goToLiveButton') }}-->
				<!--				</button>-->

				<PublishChangesButton class="btn-sm btn-transition" />
				<a
					href="javascript:"
					@click="rollbackToPublished"
					class="text-xs text-center text-base-content"
					:class="{
						'text-gray-400 cursor-not-allowed': rollingBack || !rollbackAvailable,
						'hover:underline': rollbackAvailable,
					}"
				>
					<loading-element size="16" :is-loading="rollingBack">
						<i class="fas fa-undo"></i>
					</loading-element>
					<span class="text-xs">
						{{ $t('components.flow.flowSetup.publishedFlowWarning.rollbackButton') }}
					</span>
				</a>
			</div>
		</div>
		<!-- Published Flow Warning -->
	</div>
</template>
<script>
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import apiList from '~/apis/ApiList.js'
import { useFlowStore } from '~/stores/flow.ts'
import { FLOW_STATUS_PUBLISHED } from '~/models/Flow/Flow.ts'
import PublishChangesButton from '~/components/Flow/FlowSetup/PublishChangesButton.vue'

export default {
	components: { PublishChangesButton, LoadingElement },
	props: {
		rollbackAvailable: {
			type: Boolean,
			default: false,
		},
		publishing: {
			type: Boolean,
			default: false,
		},
		getFlowFunc: {
			type: Function,
			default: () => {},
		},
	},
	emits: ['rollbackToPublished'],
	setup() {
		return {
			flowStore: useFlowStore(),
		}
	},
	data() {
		return {
			rollingBack: false,
		}
	},
	computed: {
		statusPublished() {
			return this.flowStore.flow?.status === FLOW_STATUS_PUBLISHED
		},
	},
	methods: {
		async rollbackToPublished() {
			if (this.rollingBack || !this.rollbackAvailable) return
			this.rollingBack = true
			await this.$requestAdapter
				.post(
					apiList.chat.flow.id.rollback,
					{},
					{
						id: this.flowStore.flow.id,
					},
				)
				.then((res) => {
					this.flowStore.$reset()
					this.getFlowFunc()
				})
				.catch((err) => {})
				.finally(() => {
					this.rollingBack = false
				})
		},
	},
}
</script>

<style scoped></style>
