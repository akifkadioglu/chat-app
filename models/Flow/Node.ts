import { BaseClass } from '~/models/BaseClass'
import { NodeType } from '~/models/Flow/NodeType'
import { Trigger } from '~/models/Flow/Trigger'
import { Flow } from '~/models/Flow/Flow'
import { Edge } from '~/models/Flow/Edge'
import { deepMerge, guardKeys, nodeTypes, randomizerConstants, triggerTypes } from '~/models/Flow/utils/utils'
import type { Reactive } from 'vue'
import defaultConfigs from '~/models/Flow/utils/defaultConfigs'

export class Node extends BaseClass {
	t: any = () => null

	id: number | null
	tempId: number | null
	flowId: number | null
	// flow: Flow | null
	type: NodeType
	name: string
	config: Reactive<any>
	triggers: Ref<Trigger[]>
	positionX: Ref<number>
	positionY: Ref<number>
	createdAt: Date | null
	// isFinal: boolean = false
	number: number | null = null
	isLast: boolean = false
	edges: ComputedRef<Edge[]>
	toEdges: ComputedRef<Edge[]>
	fromEdges: ComputedRef<Edge[]>
	guardedDots: ComputedRef<[]>
	guardedDotsRefresh: Ref<number>
	refreshGuardedDots: () => void

	isSingle: boolean = false

	toNodes: ComputedRef<Node[]>
	fromNodes: ComputedRef<Node[]>

	// validateNode: ($t: any) => boolean

	// elseGuardEdge: ComputedRef<Edge | undefined>
	// elseGuardExists: ComputedRef<boolean>
	// elseNode: ComputedRef<Node | null>

	guardedEdges: (guard?: string | null) => ComputedRef<Edge[]>
	guardExists: (guard?: string | null) => ComputedRef<boolean>
	guardNodes: (guard?: string | null) => ComputedRef<Node[] | null>
	guardNode: (guard: string) => Node | null

	addTrigger: (triggerNode: Trigger) => void
	removeTrigger: (triggerNodeUuid: String) => void
	removeTriggerByPostback: (postback: string) => void

	isBeforePrivateReplyNode: ComputedRef<boolean>
	// setConfig: (config: any) => void

	triggerErrors: ComputedRef<Array>
	hasErrors: ComputedRef<boolean>
	private _lastValidatedConfig: any = null

	constructor(node: any, flowInstance: Flow | null = null, t: any = () => null) {
		super(node?.uuid ?? null)
		this.t = t
		this.tempId = node?.tempId ?? null

		this.id = node?.id ?? null
		this.flowId = node?.flow_id ?? node?.flowId ?? null
		// this.flow = flowInstance ?? node?.flow ?? useFlowStore().flow ?? null
		this.type = new NodeType(node?.type ?? node.node_type ?? {})
		this.name = node?.name ?? ''

		// const mergedConfig = {
		// 	...defaultConfigs(t)[this.type.key],
		// 	...(node?.config ?? {}),
		// }

		const mergedConfig = deepMerge(defaultConfigs(t)[this.type.key], node?.config ?? {})

		this.config = ref(mergedConfig)
		if (this.type.key === nodeTypes.commentActions.sendPrivateReply.key) {
			const consentGuard = this.config.value.buttons?.find((b: any) => b.consentButton)
			if (consentGuard) {
				const consentTriggerExists = node.triggers?.find((t: any) => {
					return t.config.postback === consentGuard.guard
				})
				if (!consentTriggerExists) {
					node.triggers = node.triggers ?? []
					node.triggers.push({
						type: triggerTypes.postback,
						config: {
							postback: consentGuard.guard,
						},
					})
				}
			}
		}
		if (this.type.key === nodeTypes.actions.randomizer.key) {
			this.config.value.variations.forEach((variation) => {
				const triggerExists = node.triggers?.find((t: any) => {
					return t.config.postback === variation.uuid
				})
				if (!triggerExists) {
					node.triggers = node.triggers ?? []
					node.triggers.push({
						type: triggerTypes.postback,
						config: {
							postback: variation.uuid,
						},
					})
				}
			})
		}
		this.triggers = ref(node?.triggers?.map((trigger) => new Trigger(trigger)) ?? [])
		this.positionX = ref(node?.positionX ?? node?.pos_x ?? 0)
		this.positionY = ref(node?.positionY ?? node?.pos_y ?? 0)
		this.guardedDotsRefresh = ref(0)
		this.createdAt = node?.createdAt ?? null
		// this.isFinal = node?.isFinal ?? node.is_final ?? false

		this.isSingle = node.isSingle ?? node.is_single ?? false
		this.number = node?.number ?? null

		// this.setConfig = (config) => {
		// 	this.config.value = config
		// 	this.refreshGuardedDots() // Config değişince otomatik refresh
		// }

		this.refreshGuardedDots = () => {
			this.guardedDotsRefresh.value++
		}
		const flowStore = useFlowStore()

		this.addTrigger = (triggerNode) => {
			consoleLog('Adding trigger:', triggerNode)
			if (!this.triggers.value.find((n) => n.uuid === triggerNode.uuid)) {
				this.triggers.value.push(triggerNode)
			}

			// comment trigger'ı ise ve sendMessage node'u varsa, sendMessage'ın öncesine private reply ekle
			if (
				[triggerTypes.commentOnPost.key, triggerTypes.commentOnLive.key].includes(triggerNode.type.key) &&
				flowStore.flow.hasSendMessageNode
			) {
				const privateReplyNode = flowStore.flow.nodes.find(
					(n) => n.type.key === nodeTypes.commentActions.sendPrivateReply.key,
				)

				if (!privateReplyNode) {
					// orderedNodes'taki ilk node'dan (trigger) sonraya ekle
					const firstNode = flowStore.flow.orderedNodes[0] // trigger node
					const t = flowStore.flow?.t
					const newPrivateReplyNode = new Node(
						{
							type: nodeTypes.commentActions.sendPrivateReply,
						},
						null,
						t,
					)

					// Flow'un addNode metodunu kullan ki doğru şekilde eklensin
					flowStore.flow.addNode(newPrivateReplyNode, firstNode)
				}
			}
		}

		this.removeTrigger = (triggerNodeUuid) => {
			this.triggers.value = this.triggers.value.filter((n) => n.uuid !== triggerNodeUuid)

			// triggerNode'da ise ve comment trigger'ı kalmadı ise, private reply node'unu varsa sil
			if (
				this.type.key === nodeTypes.trigger.key &&
				!this.triggers.value.find((n) =>
					[triggerTypes.commentOnPost.key, triggerTypes.commentOnLive.key].includes(n.type.key),
				)
			) {
				const privateReplyNode = flowStore.flow.nodes.find(
					(n) => n.type.key === nodeTypes.commentActions.sendPrivateReply.key,
				)
				if (privateReplyNode) {
					flowStore.flow.removeNode(privateReplyNode)
				}
			}
		}

		this.removeTriggerByPostback = (postback) => {
			//TODO :: Şu an günü kurtarıyorum bunu ayır ya da isminin gerçekten ByPostback ile bitmesi lazım mı diye düşün
			const trigger = this.triggers.value.find(
				(t) =>
					(t.type.key === triggerTypes.postback.key || t.type.key === triggerTypes.quickReply.key) &&
					t.config?.postback === postback,
			)
			if (trigger) {
				this.removeTrigger(trigger.uuid)
			}
		}

		this.edges = computed(() => {
			return (
				flowStore.flow?.edges?.filter(
					(e) =>
						e.fromNodeId === this.id ||
						e.toNodeId === this.id ||
						e.fromNodeUuid === this.uuid ||
						e.toNodeUuid === this.uuid,
				) ?? []
			)
		})
		this.toEdges = computed(() => {
			return this.edges.value.filter((e) => e.fromNodeUuid === this.uuid)
		})

		this.guardedDots = computed(() => {
			// Refresh trigger'ını oku (manuel tetikleme için)
			this.guardedDotsRefresh.value

			// config.contents içindeki buttons göre düğümler oluştur
			const buttons =
				this.config.value?.contents
					?.flatMap((content: any) => content.buttons ?? [])
					.map((g) => ({
						...g,
						guardType: guardKeys.button,
					}))
					.filter((g) => !!g.guard) ?? []

			const quickReplies =
				this.config.value?.quickReplies
					?.map((g) => ({
						...g,
						guard: g.payload,
						guardType: guardKeys.quickReply,
					}))
					.filter((g: any) => !!g.guard) ?? []

			const contentQuickReplies =
				this.config.value?.contents
					?.flatMap((content: any) => content.quick_replies ?? [])
					.map((g) => ({
						...g,
						guard: g.payload,
						guardType: guardKeys.quickReply,
					}))
					.filter((g: any) => !!g.guard) ?? []

			const invalidGuard: any = []
			const expiredGuard: any = []
			if (this.type.key === nodeTypes.actions.dataCollection.key) {
				invalidGuard.push({
					guardType: guardKeys.invalidReply,
					guard: guardKeys.invalidReply,
				})
				expiredGuard.push({
					guardType: guardKeys.expired,
					guard: guardKeys.expired,
				})
			}

			const variations =
				this.config.value?.variations?.map((v, i) => ({
					...v,
					label: randomizerConstants.variationLabels[i % randomizerConstants.variationLabels.length],
					guard: v.uuid,
					guardType: guardKeys.variation,
				})) ?? []

			const elseGuard: any = []
			if (this.type.key === nodeTypes.conditions.comparison.key) {
				elseGuard.push({
					guardType: guardKeys.else,
					guard: guardKeys.else,
				})
			}

			return [
				...buttons,
				...contentQuickReplies,
				...quickReplies,
				...expiredGuard,
				...invalidGuard,
				...variations,
				...elseGuard,
			]
		})

		this.fromEdges = computed(() => {
			return this.edges.value.filter((e) => e.toNodeUuid === this.uuid)
		})
		this.toNodes = computed(() => {
			return this.toEdges.value.map((e) => e.toNode).filter((n): n is Node => n !== null && n !== undefined)
		})
		this.fromNodes = computed(() => {
			return this.fromEdges.value.map((e) => e.fromNode).filter((n): n is Node => n !== null && n !== undefined)
		})

		this.isBeforePrivateReplyNode = computed(() => {
			return flowStore.flow?.orderedNodeUuidsBeforePrivateReply.includes(this.uuid)
		})

		this.triggerErrors = computed(() => {
			const errors: Array<any> = []
			this.triggers?.value?.forEach((trigger) => {
				errors.push(...(trigger.config?.errors ?? []))
			})
			return errors
		})

		this.hasErrors = computed(() => {
			return this.triggerErrors.value.length > 0 || this.config.value?.errors?.length > 0
		})

		// this.elseGuardEdge = computed(() => {
		// 	return this.toEdges.value.find((edge) => edge.guard === 'else')
		// })
		// this.elseGuardExists = computed(() => {
		// 	return !!this.elseGuardEdge.value?.uuid
		// })
		// this.elseNode = computed(() => {
		// 	return this.toEdges.value.find((edge) => edge.guard === 'else')?.toNode ?? null
		// })

		this.guardedEdges = (guard = null) =>
			computed(() => {
				return this.toEdges.value.filter((edge) => (guard ? edge.guard === guard : edge.guard))
			})
		this.guardExists = (guard = null) =>
			computed(() => {
				return this.guardedEdges(guard).value.length > 0
			})
		this.guardNodes = (guard = null) =>
			computed(() => {
				const nodes = this.guardedEdges(guard)
					.value.map((edge) => edge.toNode)
					.filter((n): n is Node => !!n)
				return nodes.length ? nodes : null
			})

		this.guardNode = (guard) => this.guardedEdges(guard).value[0]?.toNode ?? null

		// this.validateNode = ($t) => {
		// 	let valid = true
		// 	if (this.type.key === nodeTypes.actions.sendMessage.key) {
		// 		const contents = this.config.value?.contents ?? []
		// 		if (contents.length === 0) {
		// 			this.config.value.errors = [
		// 				{ ...errorsList.sendMessageNeedsMessage, message: $t(errorsList.sendMessageNeedsMessage.messageKey) },
		// 			]
		// 			valid = false
		// 		}
		// 		for (const content of contents) {
		// 			const text = content.text?.trim() ?? ''
		// 			if (!text && !content.attachment) {
		// 				this.config.value.errors = [
		// 					{ ...errorsList.sendMessageNeedsMessage, message: $t(errorsList.sendMessageNeedsMessage.messageKey) },
		// 				]
		// 				valid = false
		// 			}
		// 		}
		// 	}
		//
		// 	if (this.type.key === nodeTypes.trigger.key && this.triggers.value.length === 0) {
		// 		valid = false
		// 		this.config.value.errors = [
		// 			{ ...errorsList.triggersNeedsTrigger, message: $t(errorsList.triggersNeedsTrigger.messageKey) },
		// 		]
		// 	}
		//
		// 	if (valid) {
		// 		this.config.value.errors = []
		// 	}
		// 	return valid
		// }
	}

	toJSON() {
		// consoleLog('Node toJSON called:', this, this.triggers)
		return {
			uuid: this.uuid,
			id: this.id,
			type: this.type,
			name: this.name,
			// isFinal: this.isFinal,
			// number: this.number,
			config: toRaw(this.config),
			triggers: this.triggers?.value?.map((t) => t.toJSON()) ?? this.triggers.map((t) => t.toJSON()) ?? [],
			positionX: this.positionX,
			positionY: this.positionY,
		}
	}
}
