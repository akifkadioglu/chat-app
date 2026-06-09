<template>
	<div
		class="card flex-1 border border-subtle p-0 py-3 px-3 transition-shadow duration-500 overflow-hidden"
		:class="{
			'border-secondary shadow': flowStore.focusedNodeUuid === node.uuid && showFocusedNodeInteractions,
			'cursor-pointer': flowStore.focusedNodeUuid !== node.uuid && showFocusedNodeInteractions,
			'bg-info/5': isCommentAction,
			'!border-error/60': flowStore.flow.validated && nodeValidationErrors.length,
			'!border-error': isCommentAction && !flowStore.flow?.hasCommentTrigger,
			'hover:shadow-sm': showHovers,
		}"
		@click.stop="focusedNode(node)"
	>
		<div class="flex items-start justify-between w-full gap-2">
			<div v-if="!hideIcon" class="ml-auto flex flex-col items-end gap-2" v-auto-animate>
				<i
					v-if="flowStore.flow.validated && nodeValidationErrors.length"
					class="fa fa-exclamation text-error text-2xl opacity-75"
				/>
				<NodeTypeBadge v-else :nodeType="node.type" />
			</div>
			<div class="mb-3 ml-2 flex flex-col items-start gap-2 w-full wrap-anywhere">
				<!--						{{ node.uuid}}-->
				<h5 class="-mt-2">{{ node.name }}</h5>
				<NodeSummaryRenderer v-if="node" :node="node" :isCompactMode="isCompactMode">
					<template #default="props">
						<slot v-bind="props" />
					</template>
				</NodeSummaryRenderer>
			</div>
			<div class="absolute bottom-1 right-2 text-end">
				<div class="text-2xl font-black font-mono opacity-10 select-none -mb-3">#{{ node.number }}</div>
				<small class="text-sm font-mono opacity-10 select-none">
					<NodeTypeBadge :nodeType="node.type" label-only />
				</small>
			</div>
		</div>

		<div v-auto-animate>
			<div v-if="nodeValidationErrors.length" class="text-error mt-5" v-auto-animate>
				<div v-for="(error, index) in nodeValidationErrors" class="flex items-center gap-2" :key="index">
					<i class="fa fa-exclamation-circle" />
					<span class="text-xs">{{ error.message }}</span>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
import NodeSummaryRenderer from '~/components/Flow/Node/NodeSummaryRenderer.vue'
import NodeTypeBadge from '~/components/Flow/NodeTypeBadge.vue'
import { nodeTypes } from '~/models/Flow/utils/utils.ts'
import { Node } from '~/models/Flow/Node.ts'
import FlowNodeMixin from '~/mixins/FlowNodeMixin.js'

export default {
	name: 'NodeSummaryContainer',
	components: { NodeSummaryRenderer, NodeTypeBadge },
	mixins: [FlowNodeMixin],
	props: {
		node: {
			type: Node,
			required: true,
		},
		showFocusedNodeInteractions: {
			type: Boolean,
			default: true,
		},
		showHovers: {
			type: Boolean,
			default: true,
		},
		hideIcon: {
			type: Boolean,
			default: false,
		},
		isCompactMode: {
			type: Boolean,
			default: false,
		},
	},
	setup() {
		return {
			flowStore: useFlowStore(),
		}
	},
	computed: {
		nodeTypes() {
			return nodeTypes
		},
		isCommentAction() {
			return Object.values(nodeTypes.commentActions)
				.map((type) => type.key)
				.includes(this.node.type.key)
		},
		nodeValidationErrors() {
			return this.flowStore.flow?.nodeValidationErrors(this.node.uuid) ?? []
		},
	},
}
</script>
