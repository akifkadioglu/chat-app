<template>
	<QuickFlowElement :nodeUuid="finalMessageNode?.uuid" :isSelected="!!sendFollowUp">
		<slot name="title">
			<h2 :class="titleClass">{{ title || $t('components.flow.quick.components.followUpMessage.title') }}</h2>
		</slot>
		<template #trailing>
			<slot name="trailing">
				<input
					v-if="checkPrivateReplyNodeActive"
					type="checkbox"
					class="toggle"
					:checked="sendFollowUp"
					@change="onSendFollowUpChange($event)"
				/>
			</slot>
		</template>
		<template #content>
			<TextMessage
				v-if="finalMessageNode"
				:node="finalMessageNode"
				:content="finalMessageNodeConfig.contents[0]"
				simplifiedActionList
			/>
		</template>
	</QuickFlowElement>
</template>
<script>
import TextareaAutosize from '~/components/GlobalComponents/Elements/TextareaAutosize.vue'
import { Field, Form, ErrorMessage } from 'vee-validate'
import { Flow } from '~/models/Flow/Flow.ts'
import TextMessage from '~/components/Flow/Node/Actions/SendMessagePartials/TextMessage.vue'
import QuickFlowElement from '~/components/Flow/Quick/Components/QuickFlowElement.vue'
import { Trigger } from '~/models/Flow/Trigger.ts'
import { nodeTypes, triggerTypes } from '~/models/Flow/utils/utils.ts'
import { Node } from '~/models/Flow/Node.ts'

export default {
	components: {
		QuickFlowElement,
		TextMessage,
		TextareaAutosize,
		VeeField: Field,
		VeeForm: Form,
		ErrorMessage,
	},
	props: {
		checkPrivateReplyNodeActive: {
			type: Boolean,
			default: false,
		},
		isPrivateReplyNodeActive: {
			type: Boolean,
			default: false,
		},
		lastNodeBeforeFinalMessageNode: {
			type: Node,
			default: null,
		},
		lastNodeBeforeFinalMessageNodeGuard: {
			type: String,
			default: null,
		},
		title: {
			type: String,
			default: '',
		},
		flow: {
			type: Flow,
			required: true,
		},
		requireOpeningDM: {
			type: Function,
			default: null,
		},
		titleClass: {
			type: String,
			default: 'font-semibold',
		},
	},
	setup() {
		// const { t } = useI18n()
		// defineRule('minMax', (value, [min, max], ctx) => {
		// 	const num = Number(value)
		// 	const fieldName = ctx.field
		// 	if (value === null || value === undefined || value === '') {
		// 		return true
		// 	}
		// 	if (num < min) {
		// 		return t('components.flow.quick.components.followUpMessage.validation.min', {
		// 			field: t('components.flow.quick.components.followUpMessage.' + fieldName),
		// 			min,
		// 		})
		// 	}
		//
		// 	if (num > max) {
		// 		return t('components.flow.quick.components.followUpMessage.validation.max', {
		// 			field: t('components.flow.quick.components.followUpMessage.' + fieldName),
		// 			max,
		// 		})
		// 	}
		// 	return true
		// })
	},
	computed: {
		finalMessageNodeConfig() {
			return this.finalMessageNode?.config
		},
		sendFollowUp: {
			get() {
				return !!this.finalMessageNode
			},
			set(val) {
				if (val) {
					this.addFollowUpNode()
					return
				}
				this.removeFollowUpNode()
			},
		},
		finalMessageNode() {
			return this.flow.nodes.find((n) => n.config.isFollowUp && n.type.key === nodeTypes.actions.sendMessage.key)
		},
	},
	data() {
		return {
			sendFollowUpIfNoClick: false,
			pendingEnable: false,
		}
	},
	watch: {
		isPrivateReplyNodeActive(newVal) {
			if (!newVal) {
				this.pendingEnable = false
				if (this.finalMessageNode && this.checkPrivateReplyNodeActive) {
					this.removeFollowUpNode()
				}
				return
			}
			if (this.pendingEnable) {
				this.pendingEnable = false
				this.addFollowUpNode()
			}
		},
	},
	methods: {
		onSendFollowUpChange(e) {
			const val = e.target.checked
			if (val && !this.isPrivateReplyNodeActive && this.checkPrivateReplyNodeActive) {
				e.target.checked = false
				this.pendingEnable = true
				if (this.requireOpeningDM) {
					this.requireOpeningDM()
				}
				return
			}
			if (val) {
				this.addFollowUpNode()
				return
			}
			this.removeFollowUpNode()
		},
		addTrigger({ action: newNode, guard }) {
			this.flowStore.flow.addNode(
				newNode,
				this.node,
				guard,
				this.$t('models.flow.utils.quick.firstDMActionPanel.defaultOpeningDMButton'),
			)
			this.node.addTrigger(
				new Trigger({
					type: triggerTypes.postback,
					config: {
						postback: guard,
					},
				}),
			)
		},
		addEdge({ toNodeUuid, guard }) {
			this.flowStore.flow.addEdge(this.node, this.flowStore.flow.getNodeByUuid(toNodeUuid), guard)
			this.node.addTrigger(
				new Trigger({
					type: triggerTypes.postback,
					config: {
						postback: guard,
					},
				}),
			)
		},
		removeFollowUpNode() {
			this.flow.removeNode(this.finalMessageNode)
		},
		addFollowUpNode() {
			consoleLog('addFollowUpNode', this.lastNodeBeforeFinalMessageNode)
			const finalMessageNode = new Node({
				type: nodeTypes.actions.sendMessage,
				config: {
					isFollowUp: true,
					contents: [
						{
							type: 'text',
							text: this.$t('models.flow.utils.quick.sendDmFromComments.defaultMessage'),
							buttons: [],
						},
					],
				},
			})
			this.flow.addNode(
				finalMessageNode,
				this.lastNodeBeforeFinalMessageNode,
				null,
				this.$t('models.flow.utils.quick.firstDMActionPanel.defaultOpeningDMButton'),
			)
		},
	},
}
</script>
