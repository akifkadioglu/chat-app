import { BaseClass } from '~/models/BaseClass'
import { Node } from '~/models/Flow/Node'
import { Flow } from '~/models/Flow/Flow'

export class Edge extends BaseClass {
	id: number | null
	flowId: number | null
	// flow: Flow | null
	// fromNodeId: number | null
	fromNodeUuid: string | null
	fromNode: Ref<Node | null>
	// toNodeId: number | null
	toNodeUuid: string | null
	toNode: Ref<Node | null>
	label: string | null
	guard: string | null
	createdAt: Date | null

	// removeEdge: () => void

	toJSON() {
		return {
			uuid: this.uuid,
			toNodeUuid: this.toNodeUuid,
			fromNodeUuid: this.fromNodeUuid,
			label: this.label,
			guard: this.guard,
		}
	}

	constructor(edge: any, flowInstance: Flow | null = null) {
		super(edge?.uuid ?? null)

		const flowStore = useFlowStore()

		this.id = edge?.id ?? null
		this.flowId = edge?.flow_id ?? null
		// this.flow = flowInstance ?? edge?.flow ?? useFlowStore().flow ?? null
		// this.fromNodeId = edge.fromNode?.id ?? edge?.from_node_id ?? null
		this.fromNodeUuid =
			edge.fromNodeUuid ??
			edge.fromNode?.uuid ??
			edge?.from_node_uuid ??
			// (edge?.from_node_id ? this.flow?.nodes.value?.find((n) => n.id === edge.from_node_id)?.uuid : null) ??
			null
		this.fromNode = edge.fromNode ?? flowInstance?.nodes.value?.find((n) => n.uuid === this.fromNodeUuid) ?? flowStore.flow?.nodes.value?.find((n) => n.uuid === this.fromNodeUuid) ?? null
		// this.toNodeId = edge.toNode?.id ?? edge?.to_node_id ?? null
		this.toNodeUuid =
			edge.toNodeUuid ??
			edge.toNode?.uuid ??
			edge?.to_node_uuid ??
			// (edge?.to_node_id ? this.flow?.nodes.value?.find((n) => n.id === edge.to_node_id)?.uuid : null) ??
			null
		this.toNode = edge.toNode ?? flowInstance?.nodes.value?.find((n) => n.uuid === this.toNodeUuid) ?? flowStore.flow?.nodes.value?.find((n) => n.uuid === this.toNodeUuid) ?? null
		this.label = edge?.label ?? null
		this.guard = edge?.guard ?? null
		this.createdAt = edge?.createdAt ?? null
		// this.removeEdge = () => {
		// 	consoleLog('Removing edge:', this)
		// 	this.flow.nodes.value = this.flow.nodes.value.filter((n) => n !== this.fromNode && n !== this.toNode)
		// 	this.flow.edges.value = this.flow.edges.value.filter((e) => e !== this)
		// }
	}
}
