<template>
	<QuickFlowElement
		:node-uuid="signatureNode?.uuid"
		:show-content="!!signatureNode"
		show-helper-text
		:helper-text="$t('components.flow.quick.components.quickSignature.helperText')"
	>
		<i18n-t :keypath="titlePath">
			<template #simpliersChat>
				<SimpliersLogo />
				<ChatLogo />
			</template>
		</i18n-t>
		<template #icon>
			<i class="fa fa-signature" />
		</template>
		<template #trailing>
			<input v-model="isSignatureActive" class="toggle" type="checkbox" />
		</template>
		<template #content>
			<SignatureTextMessage :node="signatureNode" />

<!--			<TextMessage-->
<!--				:node="signatureNode"-->
<!--				:content="signatureNode?.config?.contents?.[0]"-->
<!--				readOnly-->
<!--				lockedButton-->
<!--				:buttonCount="1"-->
<!--			/>-->
			<!--			<div class="space-y-3">-->
			<!--				<div class="text-sm text-muted">-->
			<!--					{{ content || signatureNode?.config?.contents?.[0]?.text }}-->
			<!--				</div>-->
			<!--			</div>-->
		</template>
	</QuickFlowElement>
</template>
<script>
import QuickFlowElement from '~/components/Flow/Quick/Components/QuickFlowElement.vue'
import { Flow } from '~/models/Flow/Flow.ts'
import { Node } from '~/models/Flow/Node.ts'
import { nodeTypes } from '~/models/Flow/utils/utils.ts'
import SimpliersLogo from '~/components/GlobalComponents/Brands/SimpliersLogo.vue'
import ChatLogo from '~/components/GlobalComponents/Brands/ChatLogo.vue'
import TextMessage from '~/components/Flow/Node/Actions/SendMessagePartials/TextMessage.vue'
import defaultConfigs from '~/models/Flow/utils/defaultConfigs.ts'
import SignatureTextMessage from '~/components/Flow/Node/Actions/Components/SignatureTextMessage.vue'

export default {
	components: { SignatureTextMessage, TextMessage, ChatLogo, SimpliersLogo, QuickFlowElement },
	props: {
		flow: {
			type: Flow,
		},
		titlePath: {
			type: String,
			default: 'components.flow.node.actions.signature.contentTypeSummary',
		},
		content: {
			type: String,
		},
		fromNodes: {
			type: Array,
		},
	},
	data() {
		return {
			isSignatureActive: false,
		}
	},
	mounted() {
		this.isSignatureActive = !!this.signatureNode
	},
	computed: {
		signatureNode() {
			return this.flow.nodes.find((node) => node.type.key === nodeTypes.signature.key)
		},
	},
	watch: {
		isSignatureActive(newVal) {
			if (!newVal) {
				// signature'u kapatmışsa ama subscribe değilse
				if (!this.flow.chatAccount?.subscribed) {
					this.$emitter.emit('showUpgradeModal', { chatAccount: this.flow.chatAccount, feature: 'upgrade' })
					this.$nextTick(() => {
						this.isSignatureActive = true
					})
					return
				}

				// signature'u kapatmışsa ama subscribe ise ve signature node varsa
				if (this.signatureNode) {
					this.flow.removeNode(this.signatureNode)
					return
				}
				return
			}

			//eğer açarsa ve signature node yoksa
			if (!this.signatureNode) {
				const newSignatureNode = new Node({ type: nodeTypes.signature })
				newSignatureNode.config = defaultConfigs(this.$t)[nodeTypes.signature.key]

				if (this.fromNodes?.length > 0) {
					this.flow.addNode(newSignatureNode)
					this.flow.edges
						.filter((edge) => edge.toNodeUuid === newSignatureNode.uuid)
						.forEach((edge) => {
							this.flow.removeEdge(edge)
						})
					this.fromNodes.forEach((node) => {
						this.flow.addEdge(node, newSignatureNode)
					})
				} else {
					this.flow.addNode(newSignatureNode, this.flow.lastNode)
				}
			}
		},
		'flow.chatAccount.subscribed'(newVal) {
			this.isSignatureActive = !newVal
		},
	},
}
</script>

<style scoped></style>
