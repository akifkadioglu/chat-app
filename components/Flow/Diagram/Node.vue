<template>
	<div class="bg-base-100">
		<div class="absolute bottom-6 left-0">
			<Handle
				v-if="hasTargetHandle"
				:position="data.targetPosition"
				type="target"
				:id="`${id}-output-`"
				class="node-handle"
			/>
		</div>

		<div class="relative group">
			<div
				class="border-subtle border rounded-xl transition-shadow hover:shadow-sm overflow-hidden"
				:class="{
					shadow: flowStore.focusedNodeUuid === data.node.uuid,
					'pb-12': hasNextStepHandle,
					'pb-1': !hasNextStepHandle,
				}"
			>
				<div class="pl-3 pt-3">
					<NodeTypeBadge :nodeType="data.node.type" />
				</div>
				<NodeSummaryContainer
					:showFocusedNodeInteractions="false"
					:showHovers="false"
					:node="data.node"
					hideIcon
					:isCompactMode="false"
					class="w-80 border-t-0 border-x-0 border-b bg-base-100 rounded-b-none"
					@focusedNode="$emit('focus', data.node)"
				>
					<template #default="props">
						<div class="pt-2 w-full mr-5 space-y-2" v-if="props?.buttons?.length > 0">
							<template v-for="button in props.buttons">
								<DiagramHandle
									v-for="trigger in filteredPostbackTriggers(button.guard)"
									:key="`trigger-${trigger.uuid}`"
									:handleId="`${id}-output-${trigger.config.postback}`"
									:position="data.sourcePosition"
									:label="trigger.name"
									:icon="trigger.icon"
									:color="trigger.color"
									:websiteLink="button.websiteLink"
								/>
							</template>
						</div>
					</template>
				</NodeSummaryContainer>

				<div
					class="flex flex-col items-end pt-2 w-fit ml-auto mr-5 space-y-2"
					v-if="nonSendMessageButtonTriggers.length > 0 || isComparisonNode || isDataCollectionNode"
				>
					<DiagramHandle
						v-for="trigger in nonSendMessageButtonTriggers"
						:key="`trigger-${trigger.uuid}`"
						:handleId="`${id}-output-${trigger.config.postback}`"
						:position="data.sourcePosition"
						:label="trigger.name"
						:icon="trigger.icon"
						:color="trigger.color"
					/>

					<!-- Comparison Node - Else Handle -->
					<DiagramHandle
						v-if="isComparisonNode"
						:handleId="`${id}-output-else`"
						:position="data.sourcePosition"
						:label="getGuardLabel(guardKeys.else)"
						:icon="guardStyles.else?.icon"
						:color="guardStyles.else?.color"
					/>

					<!-- DataCollection Node - Invalid & Expired Handles -->
					<template v-if="isDataCollectionNode">
						<DiagramHandle
							:handleId="`${id}-output-invalidReply`"
							:position="data.sourcePosition"
							:label="getGuardLabel(guardKeys.invalidReply)"
							:icon="guardStyles.invalidReply?.icon"
							:color="guardStyles.invalidReply?.color"
						/>
						<DiagramHandle
							:handleId="`${id}-output-expired`"
							:position="data.sourcePosition"
							:label="getGuardLabel(guardKeys.expired)"
							:icon="guardStyles.expired?.icon"
							:color="guardStyles.expired?.color"
						/>
					</template>
				</div>
				<div v-if="hasNextStepHandle" class="absolute bottom-3 right-0">
					<span class="pr-4">Next Step</span>
					<Handle
						type="source"
						:position="data.sourcePosition"
						connectable="single"
						:id="`${id}-output-`"
						class="node-handle"
					/>
				</div>
			</div>
			<button
				v-if="!isReadOnly && !isTriggerNode"
				@click.stop="$emit('remove', data.node)"
				class="absolute top-1 right-1 btn btn-error btn-link btn-sm z-3"
				title="Node'u Sil"
				:disabled="disableToRemove(data.node)"
			>
				<i class="fa fa-times" />
			</button>
		</div>
	</div>
</template>

<script>
import { Handle } from '@vue-flow/core'
import NodeSummaryContainer from '~/components/Flow/NodeSummaryContainer.vue'
import NodeTypeBadge from '~/components/Flow/NodeTypeBadge.vue'
import DiagramHandle from '~/components/Flow/Diagram/DiagramHandle.vue'
import { nodeTypes } from '~/models/Flow/utils/utils.ts'
import FlowNodeMixin from '~/mixins/FlowNodeMixin.js'
import FlowDiagramMixin from '~/mixins/FlowDiagramMixin.js'

export default {
	components: {
		Handle,
		NodeSummaryContainer,
		NodeTypeBadge,
		DiagramHandle,
	},
	mixins: [FlowNodeMixin, FlowDiagramMixin],
	props: {
		hasTargetHandle: {
			type: Boolean,
			default: true,
		},
		hasNextStepHandle: {
			type: Boolean,
			default: true,
		},
		id: {
			type: String,
			required: true,
		},
		data: {
			type: Object,
			required: true,
		},
		isReadOnly: {
			type: Boolean,
			default: false,
		},
	},
	emits: ['focus', 'remove'],
	setup() {
		return {
			flowStore: useFlowStore(),
		}
	},
	computed: {
		nodeTypes() {
			return nodeTypes
		},
		isTriggerNode() {
			return this.data.node.type.key === nodeTypes.trigger.key
		},
		isComparisonNode() {
			return this.data.node.type.key === nodeTypes.conditions.comparison.key
		},
		isDataCollectionNode() {
			return this.data.node.type.key === nodeTypes.actions.dataCollection.key
		},
		postbackTriggers() {
			return this.getPostbackTriggers(this.data.node)
		},
		filteredPostbackTriggers() {
			return (guard) => this.postbackTriggers.filter((trigger) => trigger.config.postback === guard)
		},
		sendMessageButtonGuards() {
			if (
				this.data.node.type.key !== nodeTypes.actions.sendMessage.key &&
				this.data.node.type.key !== nodeTypes.commentActions.sendPrivateReply.key
			)
				return []
			const { buttons } = this.getNodeGuardElements(this.data.node)
			return buttons.map((b) => b.guard)
		},
		nonSendMessageButtonTriggers() {
			return this.postbackTriggers.filter((trigger) => !this.sendMessageButtonGuards.includes(trigger.config.postback))
		},
	},
}
</script>
