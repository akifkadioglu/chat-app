import { defineStore } from 'pinia'
import { Flow } from '~/models/Flow/Flow'
import { nodeTypes } from '~/models/Flow/utils/utils'

export const useFlowStore = defineStore('flow', {
	state: () => ({
		flow: null as Flow | null,
		focusedNodeUuid: null as string | null,
		focusedTriggerUuid: null as string | null,
		lockForFlowSetup: false,
	}),
	getters: {
		focusedNode(state) {
			if (!state.focusedNodeUuid || !state.flow) return null
			return state.flow.nodes.find((node) => node.uuid === state.focusedNodeUuid) || null
		},
		focusedTrigger(state) {
			if (!state.flow?.nodes) {
				return null
			}
			const triggerNode = state.flow.nodes.filter((node) => node.type.key === nodeTypes.trigger.key)[0]

			let focusedTrigger = null
			if (state.focusedTriggerUuid)
				focusedTrigger = triggerNode.triggers.find((trigger) => trigger.uuid === state.focusedTriggerUuid)

			if (!focusedTrigger) focusedTrigger = triggerNode.triggers[0] ?? null

			return focusedTrigger
		},
	},
	actions: {
		focusNode(nodeUuid: string | null) {
			this.focusedNodeUuid = nodeUuid
		},
		focusFirstNode() {
			if (!this.flow) return
			const orderedNodes = this.flow.orderedNodes
			if (orderedNodes.length > 0) {
				this.focusNode(orderedNodes[0].uuid || null)
			}
		},
		focusTrigger(triggerUuid: string | null) {
			this.focusedTriggerUuid = triggerUuid
		},
		focusNextNode() {
			if (!this.flow) return
			const orderedNodes = this.flow.orderedNodes
			if (this.focusedNodeUuid === null && orderedNodes.length > 0) {
				this.focusedNodeUuid = orderedNodes[0].uuid || null
				return
			}

			const currentIndex = orderedNodes.findIndex((node) => node.uuid === this.focusedNodeUuid)
			if (currentIndex >= 0 && currentIndex < orderedNodes.length - 1) {
				this.focusedNodeUuid = orderedNodes[currentIndex + 1].uuid || null
			}
		},
		focusPreviousNode() {
			if (!this.flow) return
			const orderedNodes = this.flow.orderedNodes
			if (this.focusedNodeUuid === null && orderedNodes.length > 0) {
				this.focusedNodeUuid = orderedNodes[orderedNodes.length - 1].uuid || null
				return
			}

			const currentIndex = orderedNodes.findIndex((node) => node.uuid === this.focusedNodeUuid)
			if (currentIndex > 0) {
				this.focusedNodeUuid = orderedNodes[currentIndex - 1].uuid || null
			}
		},
	},
})
