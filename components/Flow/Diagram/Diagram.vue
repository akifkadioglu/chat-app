<template>
	<div class="relative w-full h-full">
		<VueFlow
			ref="vueFlow"
			v-model="elements"
			:default-viewport="{ zoom: 0.5 }"
			:min-zoom="0.2"
			:max-zoom="4"
			@node-click=""
			@edge-click="onEdgeClick"
			@edge-double-click=""
			@pane-click="onPaneClick"
			@node-drag-stop="onNodeDragStop"
			@connect="onConnect"
			@connect-start="onConnectStart"
			@connect-end="onConnectEnd"
			@nodes-initialized="layoutGraph({ fit: isFirstFit })"
		>
			<Background pattern-color="#aaa" :gap="16" />

			<template #node-custom="{ data, id }">
				<Node
					:id="id"
					:hasTargetHandle="hasTargetHandle(data.node)"
					:hasNextStepHandle="hasNextStepHandle(data.node)"
					:data="data"
					:isReadOnly="isReadOnly"
					@click="focusedNode(data.node)"
					@focus="$emit('focusedNode', data.node)"
					@remove="removeNode"
				/>
			</template>

			<template
				#edge-custom="{ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, markerEnd, style }"
			>
				<Edge
					:id="id"
					:sourceX="sourceX"
					:sourceY="sourceY"
					:targetX="targetX"
					:targetY="targetY"
					:sourcePosition="sourcePosition"
					:targetPosition="targetPosition"
					:markerEnd="markerEnd"
					:showRemoveButton="selectedEdgeId === id"
					:selectedEdgePosition="selectedEdgePosition"
					:style="style"
				/>
			</template>

			<div class="flex items-end gap-4 absolute bottom-4 right-4 z-10">
				<div class="flex join join-vertical">
					<AddAction
						@addNode="addNodeByType($event, ADD_NODE_TYPES.STANDALONE)"
						showAddConditionButton
						ref="addStandaloneNodeAction"
					>
						<template #triggerButton>
							<button class="btn btn-soft btn-sm join-item" type="button">
								<i class="fa fa-plus" />
								{{ $t('components.flow.addNodePartials.addAction.buttonText') }}
							</button>
						</template>
					</AddAction>

					<AddCondition
						:hideConsentRequiredActions="hideConsentRequiredActions(flowStore.focusedNode)"
						@addNode="addNodeByType($event, ADD_NODE_TYPES.STANDALONE)"
						ref="addStandaloneNodeCondition"
					>
						<template #triggerButton>
							<button class="btn btn-soft btn-sm join-item rounded-b-md" type="button">
								<i class="fa fa-plus" />
								{{ $t('components.flow.node.conditions.fieldSelector.conditionLabel') }}
							</button>
						</template>
					</AddCondition>
				</div>

				<div class="flex flex-col join join-vertical bg-base-100">
					<button @click="smoothZoomIn" class="btn btn-sm btn-square join-item">
						<i class="fa-solid fa-magnifying-glass-plus" />
					</button>
					<button @click="smoothZoomOut" class="btn btn-sm btn-square join-item">
						<i class="fa-solid fa-magnifying-glass-minus" />
					</button>
					<button @click="fitView" class="btn btn-sm btn-square join-item">
						<i class="fa-solid fa-expand" />
					</button>
					<button @click="layoutGraph({ force: true, fit: true })" class="btn btn-sm btn-square join-item">
						<i class="fa-solid fa-wand-magic-sparkles" />
					</button>
				</div>
			</div>
			<!--			<MiniMap />-->
		</VueFlow>

		<!-- Dinamik AddAction dropdown (edge bırakıldığında) -->
		<div
			v-if="showDynamicAddAction"
			:style="{
				position: 'absolute',
				left: dynamicAddActionPosition.x + 'px',
				top: dynamicAddActionPosition.y + 'px',
				zIndex: 2,
			}"
		>
			<AddAction
				ref="dynamicAddAction"
				:hideConsentRequiredActions="
					hideConsentRequiredActions(flow.nodes.find((n) => n.uuid === currentConnection?.nodeId))
				"
				@addNode="addNodeByType($event, ADD_NODE_TYPES.DYNAMIC)"
				@dropdownClosed="hideDynamicAddAction"
				showAddConditionButton
			/>
		</div>
	</div>
</template>

<script>
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/controls/dist/style.css'

import { useVueFlow, VueFlow, MarkerType, Position } from '@vue-flow/core'
import AddAction from '~/components/Flow/AddNodePartials/AddAction.vue'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import AddCondition from '~/components/Flow/AddNodePartials/AddCondition.vue'
import FlowNodeMixin from '~/mixins/FlowNodeMixin.js'
import FlowDiagramMixin from '~/mixins/FlowDiagramMixin.js'
import dagre from '@dagrejs/dagre'
import { nodeTypes } from '~/models/Flow/utils/utils.ts'
import Edge from '~/components/Flow/Diagram/Edge.vue'
import Node from '~/components/Flow/Diagram/Node.vue'
export const ADD_NODE_TYPES = {
	STANDALONE: 'standalone',
	DYNAMIC: 'dynamic',
}

export default {
	components: {
		AddCondition,
		MiniMap,
		Controls,
		Background,
		VueFlow,
		AddAction,
		Edge,
		Node,
	},
	mixins: [FlowNodeMixin, FlowDiagramMixin],
	props: {
		isReadOnly: {
			type: Boolean,
			default: false,
		},
	},

	setup() {
		const {
			findNode,
			fitView,
			zoomIn,
			zoomOut,
			zoomTo,
			getViewport,
			getIntersectingNodes,
			screenToFlowCoordinate,
			connectOnClick,
		} = useVueFlow()
		return {
			flowStore: useFlowStore(),
			findNode,
			fitView,
			zoomIn,
			zoomOut,
			zoomTo,
			getViewport,
			getIntersectingNodes,
			screenToFlowCoordinate,
			connectOnClick,
		}
	},

	data() {
		return {
			ADD_NODE_TYPES,
			nodeTypes,
			isFirstFit: true,
			elements: [],
			showDynamicAddAction: false,
			dynamicAddActionPosition: { x: 0, y: 0 },
			pendingConnection: null,
			lastSuccessfulConnection: null,
			currentConnection: null,
			selectedEdgeId: null,
			selectedEdgePosition: { x: 0, y: 0 },
		}
	},
	computed: {
		flow() {
			return this.flowStore.flow
		},
		vueFlowNodes() {
			if (!this.flow || !this.flow.nodes) {
				return []
			}
			this.selectedEdgeId = null

			return this.flow.nodes.map((node, index) => {
				return {
					id: node.uuid,
					type: 'custom',
					position: {
						x: node.positionX || 0,
						y: node.positionY || 0,
					},
					data: {
						node: node,
						label: node.type.label || node.type.key,
						sourcePosition: Position.Right,
						targetPosition: Position.Left,
					},
				}
			})
		},
		vueFlowEdges() {
			if (!this.flow || !this.flow.edges) {
				return []
			}

			return this.flow.edges
				.map((edge) => {
					//en baştaki trigger'ın node'unun source'u (fromNodeUuid'i) olmadığı için warning veriyor
					if (!edge.fromNodeUuid) return
					return {
						id: `${edge.fromNodeUuid}-id-${edge.toNodeUuid}-id-${edge.guard ?? ''}`,
						source: edge.fromNodeUuid,
						sourceHandle: `${edge.fromNodeUuid}-output-${edge.guard ?? ''}`,
						target: edge.toNodeUuid,
						targetHandle: `${edge.toNodeUuid}-output-`,
						type: 'custom',
						style: edge.guard ? { stroke: '#ff6b6b' } : { stroke: '#555' },
						zIndex: 2,
						markerEnd: {
							type: MarkerType.ArrowClosed,
							height: 40,
							width: 40,
						},
						data: { edge },
					}
				})
				.filter(Boolean)
		},
		hasTargetHandle() {
			return (node) => node.type.key !== nodeTypes.trigger.key
		},
		hasNextStepHandle() {
			return (node) =>
				!(node.type.key === nodeTypes.signature.key || node.type.key === nodeTypes.commentActions.sendPrivateReply.key)
		},
	},
	watch: {
		vueFlowNodes: {
			handler() {
				this.updateElements()
			},
			deep: true,
			immediate: true,
		},
		vueFlowEdges: {
			handler() {
				this.updateElements()
			},
			deep: true,
			immediate: true,
		},
	},
	mounted() {
		document.addEventListener('keydown', this.handleKeyDown)
	},
	beforeUnmount() {
		document.removeEventListener('keydown', this.handleKeyDown)
	},
	methods: {
		handleKeyDown(event) {
			if (event.key === 'Escape' && this.currentConnection) {
				document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))
				this.currentConnection = null
				this.hideDynamicAddAction()
			}
		},
		processLayout() {
			const dagreGraph = new dagre.graphlib.Graph()

			dagreGraph.setDefaultEdgeLabel(() => ({}))
			dagreGraph.setGraph({ rankdir: 'LR', align: 'UL', nodesep: 200, ranksep: 100 })

			for (const node of this.vueFlowNodes) {
				const graphNode = this.findNode(node.id)
				dagreGraph.setNode(node.id, {
					width: graphNode?.dimensions?.width || 450,
					height: graphNode?.dimensions?.height || 150,
				})
			}
			for (const edge of this.vueFlowEdges) {
				dagreGraph.setEdge(edge.source, edge.target, { ...edge })
			}

			dagre.layout(dagreGraph)

			return this.vueFlowNodes
				.map((node) => {
					const nodeWithPosition = dagreGraph.node(node.id)
					if (!nodeWithPosition) return
					return {
						position: {
							x: nodeWithPosition.x,
							y: nodeWithPosition.y,
						},
						id: node.id,
					}
				})
				.filter(Boolean)
		},
		async layoutGraph({ force = false, fit = true }) {
			const processedNodes = this.processLayout()
			if (this.flow && this.flow.nodes) {
				processedNodes.forEach((processedNode) => {
					const flowNode = this.flow.nodes.find((n) => n.uuid === processedNode.id)
					if (flowNode) {
						const positionX = force ? processedNode.position.x : flowNode.positionX || processedNode.position.x
						const positionY = force ? processedNode.position.y : flowNode.positionY || processedNode.position.y
						flowNode.positionX = positionX
						flowNode.positionY = positionY
					}
				})
			}

			if (fit) {
				this.$nextTick(() => {
					this.fitView()
				})
				this.isFirstFit = false
			}
		},
		updateElements() {
			this.elements = [...this.vueFlowNodes, ...this.vueFlowEdges]
		},
		smoothZoomIn() {
			const currentZoom = this.getViewport().zoom
			const newZoom = Math.min(currentZoom * 1.2, 4) // Max zoom 4
			this.zoomTo(newZoom, { duration: 300 })
		},
		smoothZoomOut() {
			const currentZoom = this.getViewport().zoom
			const newZoom = Math.max(currentZoom * 0.8, 0.2) // Min zoom 0.2
			this.zoomTo(newZoom, { duration: 300 })
		},
		onConnectStart(event) {
			this.currentConnection = {
				...event,
				isFromTarget: event.handleType === 'target',
			}
		},
		onConnect(connection) {
			this.lastSuccessfulConnection = {
				source: connection.source,
				target: connection.target,
				sourceHandle: connection.sourceHandle,
				targetHandle: connection.targetHandle,
				timestamp: Date.now(),
			}

			const sourceNodeId = connection.source
			const targetNodeId = connection.target

			const sourceNode = this.flow.nodes.find((n) => n.uuid === sourceNodeId)
			const targetNode = this.flow.nodes.find((n) => n.uuid === targetNodeId)

			if (sourceNode && targetNode) {
				const guard = this.extractGuardFromHandle(connection.sourceHandle)
				this.addEdge(sourceNode, targetNode, guard)
			}
		},
		onNodeDragStop(event) {
			const { node } = event
			const flowNode = this.flow.nodes.find((n) => n.uuid === node.id)

			if (flowNode) {
				flowNode.positionX = node.position.x
				flowNode.positionY = node.position.y
			}
		},
		onConnectEnd(event) {
			const now = Date.now()
			const recentConnection = this.lastSuccessfulConnection && now - this.lastSuccessfulConnection.timestamp < 100

			if (recentConnection) return

			const draggedNodeId = this.currentConnection?.nodeId
			const draggedHandle = this.currentConnection?.handleId
			const isFromTarget = this.currentConnection?.isFromTarget

			if (!draggedNodeId) return

			const draggedNode = this.flow.nodes.find((n) => n.uuid === draggedNodeId)
			if (!draggedNode) return

			// Node üzerine drop edildi mi kontrol et
			const droppedOnNode = this.getNodeAtPosition(event.clientX, event.clientY)
			if (droppedOnNode && droppedOnNode.uuid !== draggedNodeId) {
				if (isFromTarget) {
					// NextStep handle'ı olmayan node'lardan (signature, sendPrivateReply) bağlantı yapılamaz
					if (!this.hasNextStepHandle(droppedOnNode)) return
					this.addEdge(droppedOnNode, draggedNode, null)
					return
				}

				// Target handle'ı olmayan node'lara (trigger gibi) bağlanamaz
				if (!this.hasTargetHandle(droppedOnNode)) return
				const guard = this.extractGuardFromHandle(draggedHandle)
				this.addEdge(draggedNode, droppedOnNode, guard)
				return
			}

			// Target'tan çekildiyse boş alana bırakınca bir şey yapma
			if (isFromTarget) return

			// Boş alana bırakıldıysa AddAction dropdown'ını göster (sadece source'dan)
			const rect = this.$refs.vueFlow.$el.getBoundingClientRect()
			const x = event.clientX - rect.left
			const y = event.clientY - rect.top

			this.dynamicAddActionPosition = { x, y }
			this.showDynamicAddAction = true
			this.pendingConnection = { source: draggedNodeId, sourceHandle: draggedHandle }

			this.$nextTick(() => {
				if (this.$refs.dynamicAddAction) {
					this.$refs.dynamicAddAction.showDropdown()
				}
			})
		},
		getNodeAtPosition(clientX, clientY) {
			const flowCoord = this.screenToFlowCoordinate({ x: clientX, y: clientY })
			const intersecting = this.getIntersectingNodes({ x: flowCoord.x, y: flowCoord.y, width: 1, height: 1 })

			if (intersecting.length === 0) return null
			return this.flow.nodes.find((n) => n.uuid === intersecting[0].id)
		},
		hideDynamicAddAction() {
			this.showDynamicAddAction = false
			this.pendingConnection = null
		},
		addNodeByType(newNode, type = ADD_NODE_TYPES.STANDALONE, position = null) {
			if (type === ADD_NODE_TYPES.DYNAMIC) {
				this.setDynamicNodePosition(newNode)
				const { sourceNode, guard } = this.getPendingConnectionInfo()
				if (sourceNode) {
					this.addNodeWithEdges(newNode, sourceNode, guard)
					this.$refs.dynamicAddAction.hideDropdown()
				}
				return
			}
			this.setNodePosition(newNode, position)
			this.addNode(newNode, position)
			this.$refs.addStandaloneNodeAction.hideDropdown()
		},
		setNodePosition(newNode, position = null) {
			// Viewport ortasına pozisyon hesapla
			const vueFlowInstance = this.$refs.vueFlow
			const viewport = vueFlowInstance?.viewport || { x: 0, y: 0, zoom: 0.5 }
			// VueFlow container boyutlarını al
			const containerRect = vueFlowInstance?.$el?.getBoundingClientRect() || { width: 800, height: 600 }

			// Viewport'un ortasını hesapla
			const viewportCenterX = -viewport.x / viewport.zoom + containerRect.width / 2 / viewport.zoom
			const viewportCenterY = -viewport.y / viewport.zoom + containerRect.height / 2 / viewport.zoom

			// Her yeni node 20 piksel sağa kayacak
			const edgelessNodeCount = this.flow.nodes.filter((n) => n.edges.length === 0).length

			newNode.positionX.value = position ? position.x : viewportCenterX - 140 + edgelessNodeCount * 20
			newNode.positionY.value = position ? position.y : viewportCenterY + edgelessNodeCount * 40
			return newNode
		},
		setDynamicNodePosition(newNode) {
			const viewport = this.$refs.vueFlow?.viewport || { x: 0, y: 0, zoom: 0.5 }
			const worldX = (this.dynamicAddActionPosition.x - viewport.x) / viewport.zoom
			const worldY = (this.dynamicAddActionPosition.y - viewport.y) / viewport.zoom

			newNode.positionX.value = worldX
			newNode.positionY.value = worldY
		},
		getPendingConnectionInfo() {
			const sourceNode = this.flow.nodes.find((n) => n.uuid === this.pendingConnection.source)
			const guard = this.extractGuardFromHandle(this.pendingConnection.sourceHandle)
			return { sourceNode, guard }
		},
		extractGuardFromHandle(sourceHandle) {
			if (sourceHandle && sourceHandle.includes('-output-')) {
				const parts = sourceHandle.split('-output-')
				if (parts.length > 1 && parts[1] !== '') {
					return parts[1]
				}
			}
			return null
		},
		onEdgeClick(event) {
			// Edge'e tıklandığında seç ve fare pozisyonunu kaydet
			this.selectedEdgeId = event.edge.id
			const flowCoord = this.screenToFlowCoordinate({ x: event.event.clientX, y: event.event.clientY })
			this.selectedEdgePosition = {
				x: flowCoord.x,
				y: flowCoord.y,
			}
		},
		onPaneClick() {
			// Boş alana tıklandığında seçimi kaldır
			this.selectedEdgeId = null
		},
	},
}
</script>
