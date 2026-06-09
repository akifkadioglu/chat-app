<template>
	<g>
		<BaseEdge :id="id" :path="edgePath" :marker-end="markerEnd" :style="edgeStyle" />

		<path :d="edgePath" fill="none" stroke="transparent" />

		<EdgeLabelRenderer>
			<div
				v-if="showRemoveButton"
				class="edge-hover-label cursor-default absolute pointer-events-auto z-5"
				:style="{
					transform: `translate(-50%, -100%) translate(${selectedEdgePosition.x}px, ${selectedEdgePosition.y - 8}px)`,
				}"
			>
				<div class="bg-base-100 border border-base-300 rounded-lg shadow-lg px-3 py-2 text-sm">
					<div class="flex items-center gap-2 justify-between">
						<button @click="deleteEdge" class="btn btn-ghost btn-xs text-error hover:bg-error/10">
							<i class="fa fa-trash text-xs" />
						</button>
					</div>
				</div>
			</div>
		</EdgeLabelRenderer>
	</g>
</template>

<script>
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from '@vue-flow/core'
import FlowNodeMixin from '~/mixins/FlowNodeMixin.js'
import FlowDiagramMixin from '~/mixins/FlowDiagramMixin.js'

export default {
	components: {
		BaseEdge,
		EdgeLabelRenderer,
	},
	mixins: [FlowNodeMixin, FlowDiagramMixin],
	props: {
		id: {
			type: String,
			required: true,
		},
		sourceX: {
			type: Number,
			required: true,
		},
		sourceY: {
			type: Number,
			required: true,
		},
		targetX: {
			type: Number,
			required: true,
		},
		targetY: {
			type: Number,
			required: true,
		},
		sourcePosition: {
			type: String,
			required: true,
		},
		targetPosition: {
			type: String,
			required: true,
		},
		markerEnd: {
			type: String,
			default: '',
		},
		showRemoveButton: {
			type: Boolean,
			default: false,
		},
		selectedEdgePosition: {
			type: Object,
			default: () => ({ x: 0, y: 0 }),
		},
		style: {
			type: Object,
			default: () => ({}),
		},
	},
	setup() {
		return {
			flowStore: useFlowStore(),
		}
	},
	computed: {
		edgeStyle() {
			const edge = this.id.split('-id-')
			const fromNodeUuid = edge[0]
			const guard = edge[2]

			if (guard) {
				const guardStyle = this.getGuardStyleForEdge(fromNodeUuid, guard)
				return {
					stroke: guardStyle?.color || '#ff6b6b',
				}
			}
			return {
				...this.style,
			}
		},
		edgePath() {
			const [path] = getBezierPath({
				sourceX: this.sourceX,
				sourceY: this.sourceY,
				targetX: this.targetX,
				targetY: this.targetY,
				sourcePosition: this.sourcePosition,
				targetPosition: this.targetPosition,
			})
			return path
		},
	},
	methods: {
		deleteEdge() {
			const edge = this.id.split('-id-')
			const fromNodeUuid = edge[0]
			const toNodeUuid = edge[1]
			const guard = edge[2]
			if (fromNodeUuid && toNodeUuid) {
				this.removeEdges(fromNodeUuid, toNodeUuid, guard || null)
			}
			this.selectedEdgeId = null
		},
	},
}
</script>
