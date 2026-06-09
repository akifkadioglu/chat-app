<template>
	<div class="flex justify-between w-full items-center h-12 gap-2 overflow-x-auto">
		<!--					<SelectAccount class="hidden md:block" />-->
		<!-- Name Input -->
		<div class="flex-1 flex items-center gap-3">
			<ShareFlowDropdown :saveFunc="saveFunc" />
			<label class="flex items-center gap-1 min-w-24 flex-1 max-w-60">
				<i class="fa fa-pen text-sm text-muted" />
				<input
					type="text"
					v-model="flowStore.flow.name"
					:placeholder="$t('components.flow.flowSetup.flowNamePlaceholder')"
					class="input input-ghost input-sm focus:outline-none focus:bg-base-200 transition-colors duration-200"
				/>
			</label>
			<!--							:style="{ width: Math.max(120, Math.min(384, (flowStore.flow.name?.length || 9) * 8 + 32)) + 'px' }"-->
		</div>

		<button id="regenerateFlowUuids" class="btn btn-sm btn-ghost hidden" @click="regenerateFlowUuids">
			{{ $t('components.flow.flowSetup.contentHeader.regenerateButton') }}
		</button>
		<AutoSaveStatus ref="autoSaveStatus" v-if="showAutoSaveStatus" :saveFunction="saveFunc" :debounce-time="3000" />
		<FlowDiagramButton v-if="authStore.isAdmin || isDev" />
		<!-- Name Input -->
		<PublishElement previewPlacement="bottom-end" previewLocation="ContentHeader" compactOnMobile />
	</div>
</template>
<script>
import AutoSaveStatus from '~/components/BaseComponents/AutoSaveStatus.vue'
import { useFlowStore } from '~/stores/flow.ts'
import PublishElement from '~/components/Flow/FlowSetup/PublishElement.vue'
import FlowDiagramButton from '~/components/Flow/FlowSetup/FlowDiagramButton.vue'
import ShareFlowDropdown from '~/components/Flow/FlowSetup/ShareFlowDropdown.vue'
import { regenerateUuids } from '~/models/Flow/utils/utils.ts'

export default {
	components: {
		ShareFlowDropdown,
		AutoSaveStatus,
		FlowDiagramButton,
		PublishElement,
	},
	props: {
		showAutoSaveStatus: {
			type: Boolean,
			default: true,
		},
		saveFunc: {
			type: Function,
		},
	},
	setup() {
		return {
			flowStore: useFlowStore(),
			authStore: useAuthStore(),
		}
	},
	data() {
		return {
			saving: false,
			isDev: import.meta.dev,
		}
	},
	methods: {
		regenerateFlowUuids() {
			regenerateUuids(this.flowStore.flow)
		},
	},
}
</script>

<style scoped></style>
