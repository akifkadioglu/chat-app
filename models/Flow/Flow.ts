import { BaseClass } from '~/models/BaseClass'
import { FLOW_TYPE_KEYS, nodeTypes, triggerTypes } from '~/models/Flow/utils/utils'
import { Node } from '~/models/Flow/Node'
import { Edge } from '~/models/Flow/Edge'
import { ChatAccount } from '~/models/ChatAccount'
import { Trigger } from '~/models/Flow/Trigger'
import { SharedFlow } from '~/models/Flow/SharedFlow'
import { v4 } from 'uuid'
import apiList from '~/apis/ApiList'
import {
	validatePrivateReply,
	validateRequiredField,
	validateSendMessage,
	validateTrigger,
} from '~/models/Flow/utils/validators'
import { QUICK_TYPES } from '~/models/Flow/utils/quick'
import { detectProFeatures, firstProHit, flowHasProFeature } from '~/models/Flow/utils/proFeatures'

export const FLOW_STATUS_DRAFT = 0
export const FLOW_STATUS_PUBLISHED = 1
export const FLOW_STATUS_ARCHIVED = 2

export class Flow extends BaseClass {
	id: number | null
	quickTypeKey: string | null = null
	typeKey: string | null = null
	chatAccountId: Ref<number | null>
	public chatAccount: ComputedRef<ChatAccount | null>
	name: string
	version: string | null = null
	previewCode: string | null = null
	publishedFlowVersion: Object | null = null
	nodes: Ref<Node[]> = ref([])
	orderedNodes: ComputedRef<Node[]>
	lastNode: ComputedRef<Node | null>
	edges: Ref<Edge[]> = ref([])
	publishedAt: Date | null
	createdAt: Date | null
	updatedAt: Date | null
	status: number | null = null
	sharedFlows: { link: SharedFlow | null; library: SharedFlow | null } = { link: null, library: null }
	sourceSharedFlow: SharedFlow | null = null
	flowRunsCount: number
	public isPublished: boolean = false
	hasCommentTrigger: ComputedRef<boolean>
	hasSendMessageNode: ComputedRef<boolean>
	hasProFeature: ComputedRef<boolean>
	usedProFeatures: ComputedRef<any[]>
	firstProHit: ComputedRef<any>
	raw: any
	getNodeByUuid: (uuid: string) => Node | undefined
	addNode: (toNode: Node, fromNode?: Node | null, guard?: string) => void
	removeNode: (node: Node) => void
	addEdge: (fromNode: Node | null, toNode: Node, guard?: string | null) => void
	removeEdge: (edge: Edge) => void
	insertEdgeBetween: (fromNode: Node | null, toNode: Node | null, existingEdge: Edge) => void
	clearBlindNodes: () => void
	clearBlindEdges: () => void
	orderedNodeUuidsBeforePrivateReply: ComputedRef<string[]>
	privateReplyUuid: ComputedRef<string | null>
	t: (any) => string
	validateNodes: ($t: any) => void
	validated: boolean = false
	validationErrors: Ref<any>
	nodeValidationErrors: (nodeUuid: string) => any

	constructor(flow: any, t: any = () => null) {
		super(flow?.uuid ?? null)

		this.t = t
		// Ortak data set işlemi
		this._setFlowData(flow)

		this.orderedNodes = computed(() => {
			const firstNode = this.nodes.value.find((n) => n.type.key === nodeTypes.trigger.key)

			// FirstNode'dan başlayarak guard'ı null olan edge'leri takip et
			const getSequentialNodes = (): Node[] => {
				if (!firstNode) return []

				const result: Node[] = []
				const visited = new Set<string>()
				let currentNode: Node | null = firstNode
				let nodeNumber = 1

				while (currentNode && !visited.has(currentNode.uuid!)) {
					// Node'a numara ata ve main node olarak işaretle
					currentNode.number = nodeNumber
					currentNode.isMainNode = true
					currentNode.isLast = false
					result.push(currentNode)
					visited.add(currentNode.uuid!)
					nodeNumber++

					// Bu node'dan çıkan edge'i bul
					// sendPrivateReply node'u için privateReplyGuard ile çık, diğerleri için null guard
					let expectedGuard: string | null = null

					if (currentNode.type.key === nodeTypes.commentActions.sendPrivateReply.key) {
						const privateReplyGuard = currentNode.config?.buttons?.find((b) => b.consentButton)?.guard
						expectedGuard = privateReplyGuard
					}
					const nextEdge = this.edges.value.find(
						(e) => e.fromNodeUuid === currentNode!.uuid && e.guard === expectedGuard,
					)

					if (currentNode && !nextEdge) {
						currentNode.isLast = true
					}

					if (nextEdge && nextEdge.toNodeUuid) {
						currentNode = this.nodes.value.find((n) => n.uuid === nextEdge.toNodeUuid) || null
					} else {
						currentNode = null
					}
				}

				return result
			}

			// Sequential nodes'u döndür (guard null olan path)
			return getSequentialNodes()
		})

		this.privateReplyUuid = computed(() => {
			const privateReplyNode = this.nodes.value.find(
				(n) => n.type.key === nodeTypes.commentActions.sendPrivateReply.key,
			)
			return privateReplyNode?.uuid || null
		})

		this.orderedNodeUuidsBeforePrivateReply = computed(() => {
			const privateReplyNodeUuid = this.privateReplyUuid.value
			if (!privateReplyNodeUuid) {
				return this.orderedNodes.value.map((n) => n.uuid!)
			}

			const uuids: string[] = []
			for (const node of this.orderedNodes.value) {
				if (node.uuid === privateReplyNodeUuid) {
					break
				}
				uuids.push(node.uuid!)
			}
			return uuids
		})

		this.lastNode = computed(() => {
			return this.orderedNodes.value.at(-1) || null
		})

		this.hasCommentTrigger = computed(() => {
			const triggerNode = this.nodes.value.find((n) => n.type.key === nodeTypes.trigger.key)
			if (!triggerNode) return false

			return triggerNode.triggers.some((t) =>
				[triggerTypes.commentOnLive.key, triggerTypes.commentOnPost.key].includes(t.type?.key),
			)
		})

		this.hasSendMessageNode = computed(() => {
			return this.nodes.value.some((n) => n.type.key === nodeTypes.actions.sendMessage.key)
		})

		this.usedProFeatures = computed(() => detectProFeatures(this))
		this.hasProFeature = computed(() => flowHasProFeature(this))
		this.firstProHit = computed(() => firstProHit(this))

		this.getNodeByUuid = (uuid: string) => {
			return this.nodes.value.find((n) => n.uuid === uuid)
		}
		this.addEdge = (fromNode: Node | null, toNode: Node, guard: string | null = null) => {
			this.edges.value.push(new Edge({ fromNode, toNode, guard }))
		}

		this.removeEdge = (edge: Edge) => {
			this.edges.value = this.edges.value.filter((e) => e !== edge)
		}

		this.insertEdgeBetween = (fromNode: Node | null, toNode: Node, existingEdge: Edge) => {
			const secondToNode = existingEdge.toNode
			// const existingGuard = existingEdge.guard

			this.removeEdge(existingEdge)
			if (fromNode.type.key === nodeTypes.commentActions.sendPrivateReply.key) {
				const fromNodeConfig = fromNode?.config?.value ?? fromNode?.config
				const consentGuard = fromNodeConfig.buttons[0].guard
				// consoleLog('Consent guard:', consentGuard)
				this.addEdge(fromNode, toNode, consentGuard)
			} else {
				this.addEdge(fromNode, toNode)
			}

			if (toNode.type.key === nodeTypes.commentActions.sendPrivateReply.key) {
				const toNodeConfig = toNode?.config?.value ?? toNode?.config
				const consentGuard = toNodeConfig.buttons.find((b) => b.consentButton)?.guard
				// consoleLog('Consent guard:', consentGuard)
				this.addEdge(toNode, secondToNode, consentGuard)
				return
			}
			this.addEdge(toNode, secondToNode)
		}

		this.addNode = (
			toNode: Node,
			fromNode: Node | null = null,
			guard: string | null = null,
			consentButtonText: null,
		) => {
			fromNode = fromNode ?? this.orderedNodes.value.at(-1) ?? null

			this.nodes.value.push(toNode)

			// sendMessage node'u eklendiğinde ve comment trigger varsa, öncesine sendPrivateReply ekle
			if ([nodeTypes.actions.sendMessage.key].includes(toNode.type.key) && this.hasCommentTrigger.value) {
				const privateReplyNode = this.nodes.value.find(
					(n) => n.type.key === nodeTypes.commentActions.sendPrivateReply.key,
				)
				if (!privateReplyNode) {
					const newPrivateReplyNode = new Node(
						{
							type: nodeTypes.commentActions.sendPrivateReply,
						},
						null,
						this.t,
					)
					this.nodes.value.push(newPrivateReplyNode)
					this.addEdge(fromNode, newPrivateReplyNode, guard)
					const consentGuard = newPrivateReplyNode.config.buttons?.find((b) => b.consentButton)
					// consoleLog('Adding edge from private reply to send message with consent guard:', consentGuard)
					this.addEdge(newPrivateReplyNode, toNode, consentGuard)
					return
				}
			}

			if (fromNode?.type.key === nodeTypes.commentActions.sendPrivateReply.key) {
				if (toNode.type.key !== nodeTypes.signature.key) {
					// consoleLog('From node is private reply node.', fromNode.config.buttons)
					const consentButton = fromNode.config.buttons.find((b: any) => b.consentButton)
					if (!guard) {
						guard = consentButton?.guard
					}
					if (consentButton) {
						consentButton.showRemoveButton = false
					} else {
						const buttons = fromNode.config.buttons
						let consentButton = buttons.find((b: any) => b.consentButton)
						consoleLog('Consent button: - guard', consentButton, guard)
						if (!consentButton && !guard) {
							consentButton = {
								text: consentButtonText ?? t('models.flow.utils.defaultNodeConfigs.sendPrivateReply.buttonText'),
								action: {},
								guard: v4(),
								consentButton: true,
								disableDeleting: true,
							}
							buttons.unshift(consentButton)
							fromNode.addTrigger(
								new Trigger({
									type: triggerTypes.postback,
									config: {
										postback: consentButton.guard,
									},
								}),
							)
							const flowStore = useFlowStore()
							flowStore.focusNode(toNode.uuid)
							fromNode.config.buttons = buttons
							guard = consentButton.guard
						}
						consoleLog('Adding consent button to private reply node:', consentButton)
					}

					// consoleLog('From node is private reply, using consent guard:', guard)
				}
			}

			const edge = this.edges.value.find((e) => e.fromNodeUuid === fromNode?.uuid && e.guard === guard)

			if (edge) {
				this.insertEdgeBetween(fromNode, toNode, edge)
				return
			}

			this.addEdge(fromNode, toNode, guard)

			this.clearBlindEdges()
			this.clearBlindNodes()

			fromNode?.refreshGuardedDots()
			toNode?.refreshGuardedDots()
		}

		this.removeNode = (node) => {
			// if silenen privateReplyNode ise trigger'ı kontrol et
			if (node.type.key === nodeTypes.commentActions.sendPrivateReply.key) {
				if (this.hasCommentTrigger.value && this.hasSendMessageNode.value) {
					consoleLog('Removing private reply node not allowed due to comment trigger and send message node exists.')
					return
				}
			}

			// 1. Önce guarded node'ları temizle
			const guardedNodesRef = node.guardNodes
			const guardedNodes = guardedNodesRef?.value

			let breakFunc = false
			if (guardedNodes?.length) {
				// Bu node'un fromNodes'larını al
				const fromNodeUuids = node.fromNodes.map((n) => n.uuid)
				consoleLog('From node UUIDs:', fromNodeUuids)
				guardedNodes.forEach((guardedNode) => {
					if (guardedNode.uuid === node.uuid) return

					if (this.orderedNodes.value.map((n) => n.uuid).includes(guardedNode.uuid)) return

					consoleLog('Removing guarded node:', guardedNode)
					this.removeNode(guardedNode)
				})
			}

			if (breakFunc) return

			// 2. Bu node'un bağlantılarını al
			const incomingEdges = this.edges.value.filter((e) => e.toNodeUuid === node.uuid)
			let outgoingEdges = this.edges.value.filter((e) => e.fromNodeUuid === node.uuid && e.guard === null)

			// Eğer silinen node privateReplyNode ise, consentGuard edge'ini de outgoing olarak al
			if (node.type.key === nodeTypes.commentActions.sendPrivateReply.key) {
				const consentGuard = node.config?.buttons?.[0]?.guard
				if (consentGuard) {
					const consentEdge = this.edges.value.find((e) => e.fromNodeUuid === node.uuid && e.guard === consentGuard)
					if (consentEdge) {
						outgoingEdges = [consentEdge]
					}
				}
			}

			consoleLog('Incoming Edges:', incomingEdges)
			consoleLog('Outgoing Edges:', outgoingEdges)
			// 3. Gelen ve giden edge'leri birleştir (bypass)
			incomingEdges.forEach((incomingEdge) => {
				outgoingEdges.forEach((outgoingEdge) => {
					consoleLog('Bypassing from', incomingEdge.fromNode, 'to', outgoingEdge.toNode)
					this.addEdge(incomingEdge.fromNode, outgoingEdge.toNode, incomingEdge.guard)
				})
			})

			// 4. Bu node'u ve edge'lerini sil
			this.nodes.value = this.nodes.value.filter((n) => n.uuid !== node.uuid)
			const nodeEdges = this.edges.value.filter((e) => e.fromNodeUuid === node.uuid || e.toNodeUuid === node.uuid)
			nodeEdges.forEach((edge) => this.removeEdge(edge))

			// 5. Bağlı node'ları kontrol et - başka bağlantısı yoksa sil
			const connectedNodeUuids = [
				...incomingEdges.map((e) => e.fromNodeUuid),
				...outgoingEdges.map((e) => e.toNodeUuid),
			].filter((uuid) => uuid && uuid !== node.uuid)

			connectedNodeUuids.forEach((nodeUuid) => {
				const connectedNode = this.nodes.value.find((n) => n.uuid === nodeUuid)
				if (!connectedNode) return

				// Bu node'un başka bağlantısı var mı kontrol et
				const hasOtherConnections = this.edges.value.some(
					(e) => e.fromNodeUuid === nodeUuid || e.toNodeUuid === nodeUuid,
				)

				// Başka bağlantısı yoksa ve final node değilse sil
				if (!hasOtherConnections && !connectedNode.isFinal) {
					this.removeNode(connectedNode)
				}
			})

			this.clearBlindEdges()
			this.clearBlindNodes()

			//private reply node'dan sonra başka bir node kalmadıysa consent buttonu sil
			const privateReply = this.nodes.value.find((n) => n.type.key === nodeTypes.commentActions.sendPrivateReply.key)
			const privateReplyGuard = privateReply?.config.buttons?.find((b) => b.consentButton)?.guard

			// consentButton'dan çıkan edge
			let consentEdge = this.edges.value.find((e) => e.guard === privateReplyGuard)
			if (consentEdge && consentEdge.toNode.type.key === nodeTypes.signature.key) {
				// consentguard'ı null guard yap
				consentEdge.guard = null
			}

			consentEdge = this.edges.value.find((e) => e.guard === privateReplyGuard)
			if (privateReply && !consentEdge) {
				privateReply.triggers = privateReply.triggers?.filter((t) => t.config.postback !== privateReplyGuard)
				privateReply.config.buttons = privateReply.config.buttons.filter((b) => !b.consentButton)
			}
		}

		this.clearBlindNodes = () => {
			// Hiçbir edge ile bağlantısı olmayan node'ları bul ve temizle
			const nodesToRemove: Node[] = []

			this.nodes.value.forEach((node) => {
				// Trigger node'u asla silme
				if (node.type.key === nodeTypes.trigger.key) {
					return
				}

				// Bu node'un herhangi bir edge bağlantısı var mı kontrol et
				const hasIncomingEdge = this.edges.value.some((edge) => edge.toNodeUuid === node.uuid)
				const hasOutgoingEdge = this.edges.value.some((edge) => edge.fromNodeUuid === node.uuid)

				// Hiçbir bağlantısı yoksa silme listesine ekle
				if (!hasIncomingEdge && !hasOutgoingEdge) {
					nodesToRemove.push(node)
				}
			})

			// Bulunan node'ları sil
			nodesToRemove.forEach((node) => {
				this.nodes.value = this.nodes.value.filter((n) => n.uuid !== node.uuid)
			})
		}

		this.clearBlindEdges = () => {
			// Var olmayan node'lara işaret eden edge'leri bul ve temizle
			const edgesToRemove: Edge[] = []

			this.edges.value.forEach((edge) => {
				// fromNode kontrolü
				if (edge.fromNodeUuid) {
					const fromNodeExists = this.nodes.value.some((node) => node.uuid === edge.fromNodeUuid)
					if (!fromNodeExists) {
						edgesToRemove.push(edge)
						return
					}
				}

				// toNode kontrolü
				if (edge.toNodeUuid) {
					const toNodeExists = this.nodes.value.some((node) => node.uuid === edge.toNodeUuid)
					if (!toNodeExists) {
						edgesToRemove.push(edge)
						return
					}
				}
			})

			// Bulunan edge'leri sil
			edgesToRemove.forEach((edge) => {
				this.removeEdge(edge)
			})
		}

		this.validateNodes = ($t) => {
			this.validationErrors.value = {}

			this.nodes.value.forEach((node) => {
				let errors

				if (node.type.key === nodeTypes.actions.sendMessage.key) {
					errors = validateSendMessage($t, node)
				}
				if (node.type.key === nodeTypes.commentActions.sendPrivateReply.key) {
					errors = validatePrivateReply($t, node)
				}
				if (node.type.key === nodeTypes.trigger.key) {
					errors = validateTrigger($t, node)
				}
				if (node.type.key === nodeTypes.conditions.comparison.key) {
					errors = validateRequiredField($t, node)
				}
				if (node.type.key === nodeTypes.actions.setContactField.key) {
					errors = validateRequiredField($t, node)
				}

				this.validationErrors.value[node.uuid] = errors
			})

			this.reportValidationErrors()
		}

		this.nodeValidationErrors = (nodeUuid: string) => {
			return this.validationErrors.value[nodeUuid]
		}

		if (this.nodes.value.length === 0) {
			this.addNode(
				new Node(
					{
						type: nodeTypes.trigger,
						triggers: [],
					},
					null,
					this.t,
				),
			)

			this.addNode(
				new Node(
					{
						type: nodeTypes.actions.sendMessage,
						isFinal: true,
					},
					null,
					this.t,
				),
			)

			this.addNode(
				new Node(
					{
						type: nodeTypes.signature,
					},
					null,
					this.t,
				),
			)
		}
	}

	private _setFlowData(flow: any, oldFlow: Flow | null = null) {
		// Temel alanları set et
		this.id = flow.flow_id /* flow_version.graph'dan gelince flow_id oluyor */ ?? flow?.id ?? oldFlow?.id ?? null
		this.chatAccountId = ref(flow?.chatAccountId ?? flow?.chat_account_id ?? oldFlow?.chatAccountId?.value ?? null)
		this.chatAccount = computed(() => {
			const chatAccountsStore = useChatAccountsStore()
			const chatAccountId = this.chatAccountId?.value ?? this.chatAccountId ?? null
			return chatAccountsStore.byId(chatAccountId) ?? null
			// if (chatAccounts.length && chatAccountId) {
			// 	return chatAccounts.find((account) => account.id === chatAccountId) || null
			// }
			// return null
		})
		this.name = flow?.name ?? oldFlow?.name ?? ''
		this.quickTypeKey = flow?.quickTypeKey ?? flow?.quick_type_key ?? oldFlow?.quickTypeKey ?? null
		this.typeKey = flow?.typeKey ?? flow?.type_key ?? oldFlow?.typeKey ?? null
		this.version = flow?.version ?? oldFlow?.version ?? null
		this.previewCode = flow?.previewCode ?? flow?.preview_code ?? oldFlow?.previewCode ?? null
		this.status = flow?.status ?? oldFlow?.status ?? null

		const sharedFlowsData = flow?.sharedFlows ?? flow?.shared_flows ?? null
		if (sharedFlowsData) {
			this.sharedFlows = {
				link: sharedFlowsData.link ? new SharedFlow(sharedFlowsData.link) : null,
				library: sharedFlowsData.library ? new SharedFlow(sharedFlowsData.library) : null,
			}
		} else {
			this.sharedFlows = oldFlow?.sharedFlows ?? { link: null, library: null }
		}

		const sourceSharedFlowData = flow?.sourceSharedFlow ?? flow?.source_shared_flow ?? null
		if (sourceSharedFlowData) {
			this.sourceSharedFlow = new SharedFlow(sourceSharedFlowData)
		} else {
			this.sourceSharedFlow = oldFlow?.sourceSharedFlow ?? null
		}
		this.flowRunsCount = flow?.flowRunsCount ?? flow?.flow_runs_count ?? oldFlow?.flowRunsCount ?? 0

		this.publishedFlowVersion = flow?.published_flow_version ?? oldFlow?.publishedFlowVersion ?? null

		// Tarih alanlarını set et
		this.publishedAt = flow?.publishedAt ?? new Date(flow.published_at) ?? oldFlow?.publishedAt ?? null
		this.createdAt = flow?.createdAt ?? new Date(flow.created_at) ?? oldFlow?.createdAt ?? null
		this.updatedAt = flow?.updatedAt ?? new Date(flow.updated_at) ?? oldFlow?.updatedAt ?? null
		this.validationErrors = ref({})
		// Status set et
		this.isPublished = flow?.status === FLOW_STATUS_PUBLISHED

		// Nodes ve edges varsa güncelle (opsiyonel)
		if (flow?.nodes) {
			this.nodes.value = flow.nodes.map((node: any) => new Node(node, this)) ?? oldFlow?.nodes.value ?? []
		}

		if (flow?.edges) {
			this.edges.value = flow.edges.map((edge: any) => new Edge(edge, this)) ?? oldFlow?.edges.value ?? []
		}

		// Raw data'yı set et
		this.raw = { ...oldFlow?.raw, ...flow }
	}

	private reportValidationErrors = () => {
		const hasErrors = Object.values(this.validationErrors.value).some((errors) => errors?.length > 0)
		if (!hasErrors) return
		//eğer flow kaydedilmediyse o zaman request atma
		if (!this.id) return

		const payload = Object.entries(this.validationErrors.value)
			.filter(([_, errors]) => errors?.length > 0)
			.map(([nodeUuid, errors]) => {
				const node = this.nodes.value.find((n) => n.uuid === nodeUuid)
				return {
					node,
					errorTypes: errors.map((error: any) => error.type),
				}
			})

		const requestAdapter = useRequestAdapter()
		requestAdapter.post(apiList.chat.flow.id.reportErrors, { errors: payload }, { id: this.id })
	}

	update(flow: any, oldFlow: Flow) {
		// newFlow ezer
		this._setFlowData(flow, oldFlow)
	}

	toJSON() {
		return {
			id: this.id,
			uuid: this.uuid,
			name: this.name,
			version: this.version,
			chatAccountId: toRaw(this.chatAccountId),
			nodes: this.nodes.map((n) => n.toJSON()),
			edges: this.edges.map((e) => e.toJSON()),
			createdAt: this.createdAt,
			quickTypeKey: this.quickTypeKey,
			typeKey: this.typeKey,
			sourceFlowId: this.sourceSharedFlow?.flowId,
		}
	}

	get nodeByUuid() {
		return (uuid: string) => {
			consoleLog(this.nodes)
			consoleLog(uuid)

			return this.nodes.find((n) => n.uuid === uuid)
		}
	}

	get route() {
		let name = 'flow-diagram-id'
		let params = { id: this.id || 'new' }

		if (this.typeKey === FLOW_TYPE_KEYS.quick) {
			const thisType = Object.values(QUICK_TYPES).find((q) => q.key === this.quickTypeKey)
			if (thisType) {
				name = 'flow-type-id'
				params = { ...params, type: thisType.path }
			}
		}
		if (this.typeKey === FLOW_TYPE_KEYS.diagram) {
			name = 'flow-diagram-id'
		}
		if (this.typeKey === FLOW_TYPE_KEYS.basic) {
			name = 'flow-id'
		}

		return { name, params }
	}

	get triggerByUuid() {
		return (uuid: string) => {
			consoleLog(this.nodes)
			consoleLog(uuid)
			return this.nodes.flatMap((n) => n.triggers || []).find((t) => t.uuid === uuid) || null
		}
	}
	public reset() {
		this.nodes.value = []
		this.edges.value = []
	}
}
