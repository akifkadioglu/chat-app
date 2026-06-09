import { deepMerge, nodeTypes } from '~/models/Flow/utils/utils.js'
import { v4 } from 'uuid'
import { Node } from '~/models/Flow/Node.ts'
import defaultConfigs from '~/models/Flow/utils/defaultConfigs.ts'
import { Edge } from '~/models/Flow/Edge.ts'

export default {
	data() {
		return {
			flowStore: useFlowStore(),
		}
	},
	methods: {
		addNode(node) {
			node.config.value = deepMerge(defaultConfigs(this.$t)[node.type.key], node.config.value)
			this.flowStore.flow.nodes.push(node)
			this.flowStore.focusedNodeUuid = node.uuid
		},
		removeNode(node) {
			if (node.type.key === nodeTypes.signature.key && !this.flowStore.flow.chatAccount.subscribed) {
				this.$emitter.emit('showUpgradeModal', {
					chatAccount: this.flowStore.flow.chatAccount,
					feature: 'removeSignatureNode',
				})
				return
			}

			if (node.type.key === nodeTypes.trigger.key) {
				return
			}

			this.$swal
				.fire({
					title: this.$t('components.flow.node.actions.deleteConfirmation.title'),
					text: this.$t('components.flow.node.actions.deleteConfirmation.text', { stepType: node.type.label }),
					icon: 'warning',
					showCancelButton: true,
					confirmButtonColor: '#3085d6',
					cancelButtonColor: '#d33',
					confirmButtonText: this.$t('components.flow.node.actions.deleteConfirmation.confirmButtonText'),
					cancelButtonText: this.$t('components.flow.node.actions.deleteConfirmation.cancelButtonText'),
				})
				.then((result) => {
					if (result.isConfirmed) {
						node.edges.forEach((edge) => {
							this.removeEdges(edge.fromNodeUuid, edge.toNodeUuid, edge.guard)
						})
						this.flowStore.flow.nodes = this.flowStore.flow.nodes.filter((n) => n.uuid !== node.uuid)
					}
				})
		},
		addEdge(fromNode, toNode, guard) {
			const hasEdgeWithSameGuard = this.flowStore.flow.edges.some(
				(edge) => edge.fromNodeUuid === fromNode.uuid && edge.guard === guard,
			)
			if (hasEdgeWithSameGuard) {
				return
			}
			this.flowStore.flow.edges.push(new Edge({ fromNode, toNode, guard }))
		},
		removeEdges(fromNodeUuid, toNodeUuid, guard = null) {
			this.flowStore.flow.edges = this.flowStore.flow.edges.filter(
				(edge) => !(edge.fromNodeUuid === fromNodeUuid && edge.toNodeUuid === toNodeUuid && edge.guard === guard),
			)
		},

		/**
		 * Node'u siler - edge durumuna göre uygun metodu çağırır
		 * @param {Object} node - Silinecek node
		 */
		removeNodeSafely(node) {
			// Signature node için subscription kontrolü
			if (node.type.key === nodeTypes.signature.key && !this.flowStore.flow.chatAccount.subscribed) {
				this.$emitter.emit('showUpgradeModal', {
					chatAccount: this.flowStore.flow.chatAccount,
					feature: 'removeSignatureNode',
				})
				return
			}

			if (node.type.key === nodeTypes.trigger.key) {
				return
			}

			this.$swal
				.fire({
					title: this.$t('components.flow.node.actions.deleteConfirmation.title'),
					text: this.$t('components.flow.node.actions.deleteConfirmation.text', { stepType: node.type.label }),
					icon: 'warning',
					showCancelButton: true,
					confirmButtonColor: '#3085d6',
					cancelButtonColor: '#d33',
					confirmButtonText: this.$t('components.flow.node.actions.deleteConfirmation.confirmButtonText'),
					cancelButtonText: this.$t('components.flow.node.actions.deleteConfirmation.cancelButtonText'),
				})
				.then((result) => {
					if (result.isConfirmed) {
						const hasEdges = this.flowStore.flow.edges.some(
							(edge) => edge.toNodeUuid === node.uuid || edge.fromNodeUuid === node.uuid,
						)

						if (!hasEdges) {
							this.removeStandaloneNode(node)
							consoleLog('removeStandaloneNode')
							// Parent component'e emit et (varsa)
							if (this.$emit) {
								this.$emit('removeNode', node)
							}
							return
						}

						this.flowStore.flow.removeNode(node)
						consoleLog('removeNode')

						// Parent component'e emit et (varsa)
						if (this.$emit) {
							this.$emit('removeNode', node)
						}
					}
				})
		},

		/**
		 * Standalone node'u siler (edge'siz)
		 * @param {Object} node - Silinecek node
		 */
		removeStandaloneNode(node) {
			// Node'u ve tüm bağlantılı edge'leri sil
			const connectedEdges = this.flow.edges.filter(
				(edge) => edge.fromNodeUuid === node.uuid || edge.toNodeUuid === node.uuid,
			)

			// Edge'leri tek tek sil
			connectedEdges.forEach((edge) => {
				this.flow.removeEdge(edge)
			})

			// Son olarak node'u sil
			const nodeIndex = this.flow.nodes.findIndex((n) => n.uuid === node.uuid)
			if (nodeIndex !== -1) {
				this.flow.nodes.splice(nodeIndex, 1)
			}

			console.log(`Node ${node.uuid} ve ${connectedEdges.length} edge silindi`)
		},

		/**
		 * fromNode'a bir node ekler
		 * @param {Node} node - Silinecek node
		 * @param {Node} fromNode - fromNode
		 * @param {String} guard - guard
		 */
		addNode_(node, fromNode, guard) {
			consoleLog('addNode', node, fromNode, guard)
			this.addActionKey = v4()
			this.addConditionKey = v4()

			this.flowStore.flow.addNode(node, fromNode, guard)
			this.$nextTick(() => {
				this.flowStore.focusNode(node.uuid)
				this.$emitter.emit('openSecondTrailingDrawer')

				// setTimeout(() => {
				// 	const nodeRef = this.$refs[`node-${node.uuid}`]
				// 	if (nodeRef && nodeRef[0] && nodeRef[0].$el) {
				// 		nodeRef[0].$el.scrollIntoView({
				// 			behavior: 'smooth',
				// 			block: 'center',
				// 			inline: 'nearest',
				// 		})
				// 	}
				// }, 1000)
			})
		},

		/**
		 * fromNode'a edge'leriyle beraber bir node ekler
		 * @param {Node} node - node
		 * @param {Node} fromNode - fromNode
		 * @param {String} guard - guard
		 */
		addNodeWithEdges(node, fromNode, guard) {
			this.addNode(node)
			this.addEdge(fromNode, node, guard)
		},

		/**
		 * Bir node'a focuslanır
		 * eğer node null gelirse focuslanan node temizlenir
		 * @param {Node} node - focuslanacak node
		 */
		focusedNode(node) {
			this.flowStore.focusedNodeUuid = node?.uuid
			if (!node) {
				this.$emitter.emit('closeSecondTrailingDrawer')
			}
			this.$emit('focusedNode', node)
			this.$emitter.emit('openSecondTrailingDrawer')

			// if (node.type.key === nodeTypes.trigger.key) {
			// 	return
			// }
		},
	},
	computed: {
		disableToRemove() {
			return (node) =>
				node.type.key === nodeTypes.commentActions.sendPrivateReply.key &&
				this.flowStore.flow.hasCommentTrigger &&
				this.flowStore.flow.hasSendMessageNode
		},

		hideConsentRequiredActions() {
			return (node) => node?.isBeforePrivateReplyNode && this.flowStore.flow?.hasCommentTrigger
		},
	},
}
