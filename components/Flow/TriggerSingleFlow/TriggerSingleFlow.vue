<template>
	<CustomDropdown ref="dropdown" placement="bottom-start" skidding="-10" @show="onDropdownShow" @hide="$emit('hide')">
		<slot name="triggerButton">
			<button class="btn btn-ghost btn-sm" :disabled="disabled">
				<i class="fa fa-paper-plane" />
			</button>
		</slot>

		<template #popper>
			<div
				:class="[
					'flex flex-col max-h-[80dvh] p-4',
					{
						'w-xl max-w-dvw': flows.length > 0,
						'min-w-10 max-w-xl': !(flows.length > 0),
					},
				]"
			>
				<State :isLoading="isLoading" :isEmpty="flows.length === 0" class="flex flex-col min-h-0 flex-1">
					<template #empty>
						<div class="text-center">
							<div><i class="fa fa-paper-plane text-2xl" /></div>
							<div class="py-4">{{ $t('components.flow.triggerSingleFlow.emptyState.title') }}</div>
							<LocalizedLink name="flows">
								{{ $t('components.flow.triggerSingleFlow.emptyState.goToFlows') }}
								<i class="fa fa-chevron-right link-icon" />
							</LocalizedLink>
						</div>
					</template>

					<div class="flex flex-col min-h-0 flex-1">
						<div class="px-4 pt-4 pb-2">
							<h3 class="font-semibold text-base">{{ $t('components.flow.triggerSingleFlow.title') }}</h3>
							<p class="text-sm text-muted">{{ $t('components.flow.triggerSingleFlow.description') }}</p>
						</div>

						<div class="overflow-y-auto px-4 pb-4 space-y-2">
							<FlowCompactCard
								v-for="flow in flows"
								:key="flow.id"
								:flow="flow"
								:runningFlowIds="runningFlowIds"
								@triggerFlowById="runFlow(flow.id)"
							/>
						</div>
					</div>
				</State>
			</div>
		</template>
	</CustomDropdown>
</template>
<script>
import CustomDropdown from '~/components/GlobalComponents/CustomDropdown.vue'
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import apiList from '~/apis/ApiList.js'
import { Flow } from '~/models/Flow/Flow.ts'
import State from '~/components/GlobalComponents/State.vue'
import FlowCompactCard from '~/components/Flow/TriggerSingleFlow/FlowCompactCard.vue'
import LocalizedLink from '~/components/GlobalComponents/LocalizedLink.vue'

export default {
	components: { LocalizedLink, FlowCompactCard, State, LoadingElement, CustomDropdown },
	emits: ['show', 'hide'],
	props: {
		contactId: {
			type: String,
			required: true,
		},
		commentId: {
			type: String,
		},
		disabled: {
			type: Boolean,
			default: false,
		},
	},
	data() {
		return {
			flows: [],
			isLoading: false,
			runningFlowIds: [],
		}
	},
	methods: {
		onDropdownShow() {
			this.fetchFlows()
			this.$emit('show')
		},
		fetchFlows() {
			this.isLoading = true
			this.flows = []
			this.$requestAdapter
				.get(apiList.chat.instagram.contacts.flows.get, {
					query: {
						contactId: this.contactId,
						commentId: this.commentId,
					},
				})
				.then((res) => {
					this.flows = res.data?.map((flow) => new Flow(flow)) ?? []
				})
				.catch((err) => {
					this.$refs.dropdown.hide()
				})
				.finally(() => {
					this.isLoading = false
				})
		},
		runFlow(flowId) {
			this.runningFlowIds.push(flowId)
			this.$requestAdapter
				.post(
					apiList.chat.flow.id.run,
					{
						contactId: this.contactId,
						commentId: this.commentId,
					},
					{
						id: flowId,
					},
				)
				.then(() => {
					this.$toast.success(this.$t('components.flow.triggerSingleFlow.runFlowSuccess'))
					this.$refs.dropdown.hide()
				})
				.finally(() => {
					this.runningFlowIds = this.runningFlowIds.filter((id) => id !== flowId)
				})
		},
	},
}
</script>

<style scoped></style>
