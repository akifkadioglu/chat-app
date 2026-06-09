<template>
	<div class="space-y-5">
		<slot name="title">
			<h2 class="text-xl font-semibold">
				{{ title || $t('components.flow.quick.components.firstDMActionPanel.defaultTitle') }}
			</h2>
		</slot>
		<div class="space-y-1 overflow-hidden">
			<!-- An opening DM -->
			<QuickFlowElement
				:node-uuid="privateReplyNode?.uuid"
				:title="$t('components.flow.quick.components.firstDMActionPanel.anOpeningDM')"
				:is-selected="!!privateReplyNode"
			>
				<template #content v-if="privateReplyNode">
					<TextMessage
						:content="privateReplyNodeConfig"
						:node="privateReplyNode"
						:buttonCount="3"
						simplifiedActionList
					/>
					<a
						class="text-info text-xs hover:underline"
						href="javascript:"
						@click.prevent="$refs.OpeningDMRequiredModal.showModal(false)"
					>
						<i class="fa fa-info-circle" />
						{{ $t('components.flow.quick.components.firstDMActionPanel.whatIsOpeningDM') }}
					</a>
				</template>
				<template #trailing v-if="showPrivateReplyMessageTrailing">
					<input
						type="checkbox"
						class="toggle"
						:checked="!!privateReplyNode"
						v-model="isPrivateReplyMessageLocalActive"
					/>
				</template>
			</QuickFlowElement>

			<!-- A DM asking to follow you before they get the link -->
			<QuickFlowElement
				v-if="showAskFollowBeforeLink"
				:is-selected="askFollowBeforeLink"
				:title="$t('components.flow.quick.components.firstDMActionPanel.askToFollowBeforeLink')"
			>
				<template #content>
					<TextMessage
						v-if="sendMessageNode"
						:node="sendMessageNode"
						:content="sendMessageNode.config.contents[0]"
						:button-count="1"
					/>
				</template>
				<template #trailing v-if="showAskFollowBeforeLinkTrailing">
					<input type="checkbox" class="toggle" :checked="askFollowBeforeLink" @change="onAskFollowChange($event)" />
				</template>
			</QuickFlowElement>

			<!-- a DM asking for their email	-->
			<QuickFlowElement
				v-if="showAskForEmailDM"
				:node-uuid="emailCollectionNode?.uuid"
				:is-selected="askForEmailDM"
				:title="$t('components.flow.quick.components.firstDMActionPanel.askForEmail')"
			>
				<template #trailing>
					<input type="checkbox" class="toggle" :checked="askForEmailDM" @change="onAskEmailChange($event)" />
				</template>
				<template #content>
					<TextMessage
						v-if="emailCollectionNode"
						:content="emailCollectionNode.config.message"
						:node="emailCollectionNode"
						hide-buttons
						simplifiedActionList
					/>
				</template>
			</QuickFlowElement>

			<!-- Another -->
			<slot
				:isPrivateReplyNodeActive="!!privateReplyNode"
				:lastNode="lastNode"
				:lastNodeGuard="lastNodeGuard"
				:requireOpeningDM="requireOpeningDM"
			/>
		</div>
		<OpeningDMRequiredModal
			:hasOpeningDM="!!privateReplyNode"
			@addOpeningDM="addOpeningDM"
			@closeOpeningDM="closeOpeningDM"
			ref="OpeningDMRequiredModal"
		/>
	</div>
</template>
<script>
import SelectMedia from '~/components/Flow/Node/Triggers/Partials/SelectMedia.vue'
import TagsInput from '~/components/GlobalComponents/TagsInput.vue'
import TextareaAutosize from '~/components/GlobalComponents/Elements/TextareaAutosize.vue'
import { Flow } from '~/models/Flow/Flow.ts'
import { nodeTypes, triggerTypes } from '~/models/Flow/utils/utils.ts'
import { Node } from '~/models/Flow/Node.js'
import TextMessage from '~/components/Flow/Node/Actions/SendMessagePartials/TextMessage.vue'
import { v4 } from 'uuid'
import { INSTAGRAM_PROFILE_URL_PREFIX } from '~/models/Flow/utils/utils'
import { Trigger } from '~/models/Flow/Trigger.ts'
import Modal from '~/components/GlobalComponents/Modal.vue'
import OpeningDMRequiredModal from './OpeningDMRequiredModal.vue'
import QuickFlowElement from '~/components/Flow/Quick/Components/QuickFlowElement.vue'
// import { privateReplyGuard } from '~/models/Flow/utils/defaultConfigs.ts'
export default {
	components: {
		QuickFlowElement,
		OpeningDMRequiredModal,
		Modal,
		TextMessage,
		TextareaAutosize,
		TagsInput,
		SelectMedia,
	},
	props: {
		showPrivateReplyMessageTrailing: {
			type: Boolean,
			default: true,
		},
		showAskFollowBeforeLink: {
			type: Boolean,
			default: true,
		},
		showAskFollowBeforeLinkTrailing: {
			type: Boolean,
			default: true,
		},
		title: {
			type: String,
			default: '',
		},
		flow: {
			type: Flow,
			required: true,
		},
		showAskForEmailDM: {
			type: Boolean,
			default: true,
		},
	},
	setup() {
		return {
			chatAccountsStore: useChatAccountsStore(),
		}
	},
	computed: {
		nodeTypes() {
			return nodeTypes
		},
		triggerNode() {
			return this.flow.nodes.find((n) => n.type.key === nodeTypes.trigger.key)
		},
		askFollowBeforeLink: {
			get() {
				return !!this.flow.nodes.find((n) => n.type.key === nodeTypes.conditions.comparison.key)
			},
			set(val) {
				if (val) {
					this.addFollowBeforeLinkNodes()
					return
				}
				this.removeRequiredNodes()
				// this.removeConsentButtonFromPrivateReply()
			},
		},
		askForEmailDM: {
			get() {
				return !!this.flow.nodes.find((n) => n.type.key === nodeTypes.actions.dataCollection.key)
			},
			set(val) {
				if (val) {
					this.addAskEmailNode()
					return
				}
				this.removeEmailCollectionNode()
				// this.removeConsentButtonFromPrivateReply()
			},
		},
		emailCollectionNode() {
			return this.flow.nodes.find((n) => n.type.key === nodeTypes.actions.dataCollection.key)
		},
		sendMessageNode() {
			return this.flow.nodes.find((n) => n.type.key === nodeTypes.actions.sendMessage.key && !n.config.isFollowUp)
		},
		comparisonNode() {
			return this.flow.nodes.find((n) => n.type.key === nodeTypes.conditions.comparison.key)
		},
		privateReplyNode() {
			return this.flow.nodes.find((n) => n.type.key === nodeTypes.commentActions.sendPrivateReply.key)
		},
		privateReplyNodeConfig() {
			return this.privateReplyNode?.config
		},
		lastNode() {
			return this.emailCollectionNode || this.comparisonNode || this.privateReplyNode || this.triggerNode
		},
		lastNodeGuard() {
			if (this.lastNode.uuid === this.privateReplyNode?.uuid) {
				return null // this.privateReplyNodeConfig?.buttons?.find((b) => b.consentButton)?.guard
			}
			return null
		},
		anySendMessageNodes() {
			return this.flow.nodes.filter((n) => n.type.key === nodeTypes.actions.sendMessage.key)
		},
	},
	data() {
		return {
			isPrivateReplyMessageLocalActive: false,
			isInitialized: false,
			pendingAskFollow: false,
			pendingAskEmail: false,
		}
	},
	mounted() {
		this.isPrivateReplyMessageLocalActive = !!this.privateReplyNode
		this.$nextTick(() => {
			this.isInitialized = true

			// this.privateReplyNode.$t = this.$t //TODO :: neden olduğunu sor
		})
	},
	watch: {
		isPrivateReplyMessageLocalActive(newVal) {
			if (!this.isInitialized) return

			if (!newVal) {
				if (this.comparisonNode || this.emailCollectionNode || this.anySendMessageNodes.length > 0) {
					this.$refs.OpeningDMRequiredModal.showModal()
					// Snap back — node hâlâ var, toggle görsel olarak true kalmalı
					this.$nextTick(() => {
						this.isPrivateReplyMessageLocalActive = true
					})
					return
				}
				if (this.privateReplyNode) {
					consoleLog('removePrivateReplyNode isPrivateReplyMessageLocalActive')
					this.removePrivateReplyNode()
				}
				return
			}
			if (!this.privateReplyNode) {
				this.addPrivateReplyNode()
			}
		},
		// anySendMessageNodes(newVal) {
		// 	if (newVal.length === 0) {
		// 		this.removeConsentButtonFromPrivateReply()
		// 	}
		// },
	},
	methods: {
		requireOpeningDM() {
			this.$refs.OpeningDMRequiredModal.showModal()
		},
		onAskFollowChange(e) {
			const val = e.target.checked
			if (val && !this.privateReplyNode) {
				e.target.checked = false
				this.pendingAskFollow = true
				this.$refs.OpeningDMRequiredModal.showModal()
				return
			}
			this.askFollowBeforeLink = val
		},
		onAskEmailChange(e) {
			const val = e.target.checked
			if (val && !this.privateReplyNode) {
				e.target.checked = false
				this.pendingAskEmail = true
				this.$refs.OpeningDMRequiredModal.showModal()
				return
			}
			this.askForEmailDM = val
		},
		addOpeningDM() {
			this.isPrivateReplyMessageLocalActive = true
			this.$nextTick(() => {
				if (this.pendingAskFollow) {
					this.pendingAskFollow = false
					this.askFollowBeforeLink = true
				}
				if (this.pendingAskEmail) {
					this.pendingAskEmail = false
					this.askForEmailDM = true
				}
			})
		},
		closeOpeningDM() {
			this.pendingAskFollow = false
			this.pendingAskEmail = false
			// Node'ları önce sil — yoksa watcher tetiklendiğinde onları hâlâ görür ve modal'ı yeniden açar
			this.anySendMessageNodes.forEach((n) => {
				this.flow.removeNode(n)
			})
			this.removeRequiredNodes()
			this.removeEmailCollectionNode()
			consoleLog('removePrivateReplyNode closeOpeningDM')
			this.removePrivateReplyNode()
			// Node'lar kaldırıldıktan sonra flag'i değiştir; watcher artık bağımlı node görmez
			this.isPrivateReplyMessageLocalActive = false
		},
		addAskEmailNode() {
			const emailCollectionNode = new Node({
				type: nodeTypes.actions.dataCollection,
				config: {
					message: {
						text: this.$t('components.flow.quick.components.firstDMActionPanel.defaultEmailMessage'),
						type: 'text',
					},
					options: [],
					replyType: 'email',
					contactField: {
						key: 'email',
						icon: 'fa fa-envelope',
						type: 'string',
						categories: ['recommended', 'contact'],
						comparisonType: 'string',
					},
					expireMinutes: 30,
					retryInvalidAttempts: 3,
				},
			})
			let fromNode = this.privateReplyNode
			// let guard = this.privateReplyNode?.config?.buttons?.[0]?.guard ?? null

			if (this.askFollowBeforeLink) {
				fromNode = this.comparisonNode
				// guard = null
			}

			this.flow.addNode(
				emailCollectionNode,
				fromNode,
				null,
				this.$t('models.flow.utils.quick.firstDMActionPanel.defaultOpeningDMButton'),
			)
		},
		addFollowBeforeLinkNodes() {
			const comparisonNode = new Node({
				type: nodeTypes.conditions.comparison,
				config: {
					field: {
						key: 'ig.follows_account',
						icon: 'fa fa-user-plus',
						name: 'Instagram Hesabını Takip Ediyor',
						type: 'bool',
						categories: ['instagram'],
						description: 'Instagram hesabınızı takip edip etmediği.',
						comparisonType: 'bool',
					},
					value: null,
					operator: 'is_true',
				},
			})

			const postback = v4()
			const sendMessageTrigger = new Trigger({
				config: {
					postback: postback,
				},
			})
			sendMessageTrigger.type = triggerTypes.postback
			const sendMessageNode = new Node({
				type: nodeTypes.actions.sendMessage,
				config: {
					contents: [
						{
							type: 'text',
							text: this.$t('components.flow.quick.components.firstDMActionPanel.defaultFollowMessage'),
							buttons: [
								{
									text: this.$t('components.flow.quick.components.firstDMActionPanel.defaultGoToProfileButton'),
									websiteLink: true,
									url: `${INSTAGRAM_PROFILE_URL_PREFIX}${this.chatAccountsStore.active.postAccount.username}`,
									disableDeleting: true,
									showRemoveButton: false,
									consentButton: false,
								},
								{
									text: this.$t('components.flow.quick.components.firstDMActionPanel.defaultFollowMessageButton'),
									action: {},
									disableDeleting: true,
									guard: postback,
									showRemoveButton: false,
									consentButton: true,
								},
							],
						},
					],
				},
			})
			sendMessageNode.addTrigger(sendMessageTrigger)

			const privateReplyGuard = this.privateReplyNode?.config?.buttons?.find((b) => b.consentButton)?.guard ?? null
			this.flow.addNode(
				comparisonNode,
				this.privateReplyNode,
				privateReplyGuard,
				this.$t('models.flow.utils.quick.firstDMActionPanel.defaultOpeningDMButton'),
			)
			this.flow.addNode(sendMessageNode, comparisonNode, 'else')
			this.flow.addEdge(sendMessageNode, comparisonNode, postback)
		},
		removeRequiredNodes() {
			if (this.comparisonNode) {
				this.flow.removeNode(this.comparisonNode)
			}
			if (this.sendMessageNode) {
				this.flow.removeNode(this.sendMessageNode)
			}
		},
		// removeConsentButtonFromPrivateReply() {
		// if (
		// 	this.comparisonNode ||
		// 	this.emailCollectionNode ||
		// 	this.anySendMessageNodes.length > 0 ||
		// 	!this.privateReplyNode
		// ) {
		// 	return
		// }
		// this.privateReplyNode.config.buttons = []
		// this.privateReplyNode.triggers = []
		// },
		removeEmailCollectionNode() {
			if (this.emailCollectionNode) {
				this.flow.removeNode(this.emailCollectionNode)
			}
		},
		focusNode() {
			this.flow.focusedNodeUuid = this.sendMessageNode.uuid
		},
		removePrivateReplyNode() {
			consoleLog('removePrivateReplyNode X')

			if (this.privateReplyNode) {
				consoleLog('removePrivateReplyNode this.privateReplyNode', this.privateReplyNode)
				consoleLog('removePrivateReplyNode this.privateReplyNode', this.privateReplyNode.type.key)
				this.flow.removeNode(this.privateReplyNode)
			}
		},
		addPrivateReplyNode() {
			consoleLog('addPrivateReplyNode')
			// const guard = v4()
			const privateReplyNode = new Node({
				type: nodeTypes.commentActions.sendPrivateReply,
				config: {
					text: this.$t('models.flow.utils.quick.firstDMActionPanel.defaultOpeningDMMessage', {
						igUsername: '{{ig.username}}',
					}),
					buttons: [
						// {
						// 	text: this.$t('models.flow.utils.quick.firstDMActionPanel.defaultOpeningDMButton'),
						// 	disableDeleting: true,
						// 	showRemoveButton: false,
						// 	consentButton: true,
						// 	guard: v4(),
						// },
					],
				},
				// triggers: [
				// 	{
				// 		type: triggerTypes.postback,
				// 		config: {
				// 			postback: guard,
				// 		},
				// 	},
				// ],
			})

			consoleLog('addPrivateReplyNode privateReplyNode', privateReplyNode)
			this.flow.addNode(
				privateReplyNode,
				this.triggerNode,
				null,
				this.$t('models.flow.utils.quick.firstDMActionPanel.defaultOpeningDMButton'),
			)
		},
	},
}
</script>