<template>
	<div v-auto-animate class="w-full">
		<div v-if="triggers && triggers.length > 0" v-auto-animate>
			<div
				v-for="trigger in triggers"
				:key="trigger.uuid"
				class="flex items-center mb-3 group"
				:class="{
					'cursor-pointer': focusedTrigger?.uuid !== trigger.uuid,
				}"
				@click="focusTrigger(trigger)"
			>
				<div
					v-if="trigger"
					class="p-3 border rounded-lg flex-1"
					:class="{
						'border-subtle': focusedTrigger?.uuid !== trigger.uuid,
						'border-secondary shadow-sm': focusedTrigger?.uuid === trigger.uuid,
						'!border-error/60': getError(trigger),
					}"
				>
					<TriggerSummary :trigger="trigger" :showPostThumbnails="false" />

					<div v-auto-animate>
						<div v-if="getError(trigger)" class="text-error mt-5 text-sm opacity-75">
							<div class="flex items-baseline gap-2">
								<i class="fa fa-exclamation-circle" />
								<span class="text-xs">{{ getError(trigger).message }}</span>
							</div>
						</div>
					</div>
				</div>
				<button
					class="btn btn-circle btn-xs ml-2 transition duration-200 btn-outline btn-secondary opacity-10 group-hover:btn-warning group-hover:btn-soft group-hover:opacity-100"
					@click="removeTrigger(trigger)"
					type="button"
				>
					<i class="fa fa-trash" />
				</button>
			</div>
		</div>
		<NodeSummaryEmptyState v-else :text="$t('components.flow.node.summaries.triggers.emptyState')" />

		<div class="my-5" />

		<AddTrigger :node="node" @triggerAdded="focusTrigger" />
	</div>
</template>

<script>
import { Node } from '~/models/Flow/Node.js'
import TriggerSummary from '~/components/Flow/Node/Triggers/Partials/TriggerSummary.vue'
import NodeSummaryEmptyState from '~/components/Flow/Node/Summaries/NodeSummaryEmptyState.vue'
import AddTrigger from '~/components/Flow/Node/AddTrigger.vue'
import { errorsList } from '~/models/Flow/utils/defaultConfigs.ts'
import { triggerTypes } from '~/models/Flow/utils/utils.ts'

export default {
	components: {
		AddTrigger,
		TriggerSummary,
		NodeSummaryEmptyState,
	},
	props: {
		node: {
			type: Node,
			required: true,
		},
	},
	setup() {
		return {
			flowStore: useFlowStore(),
		}
	},
	computed: {
		triggers() {
			return this.node.triggers.filter((t) => t.type.availableInTriggers)
		},
		focusedTrigger() {
			return this.flowStore.focusedTrigger
		},
	},
	methods: {
		getError(trigger) {
			if (trigger.type.key === triggerTypes.receivedDM.key) {
				return this.flowStore.flow.validationErrors[this.node.uuid]?.find((err) => err.type === 'receivedDMNeedsFilter')
			}
			return null
		},
		removeTrigger(trigger) {
			this.node.removeTrigger(trigger.uuid)
		},
		focusTrigger(trigger) {
			this.flowStore.focusNode(this.node.uuid)
			this.flowStore.focusTrigger(trigger.uuid)
		},
	},
}
</script>
