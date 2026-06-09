<template>
	<div class="w-full">
		<div class="p-5">
			<div class="space-y-6" v-auto-animate>
				<!-- Header -->
				<div class="flex items-center gap-3">
					<i class="fa-solid fa-reply text-blue-500" />
					<div class="text-lg">{{ $t('components.flow.quick.replyToDm.title') }}</div>
				</div>
				<div class="divider" />
				<Filters requireOne :filterOptions="triggerNodeTrigger.config" />

				<!-- TODO: buraya email iste, takip iste, adını sor, bilgi iste(data collection) Başka bilgi iste gibi opsiynoel adımlar ekleyelim -->
				<!-- TODO: hatta, data collection'daki istenecek datayı değiştirilebilir yapabilirsek müthiş olur.  -->

				<!-- TODO: Add Tag opsiyonel step koy (tag'in içine, filtredeki ilk kelimeyi otomatik ekle) -->

				<QuickFlowElement
					:node-uuid="sendMessageNode?.uuid"
					:is-selected="sendDMEnabled"
					:title="$t('components.flow.quick.replyToStory.sendMessageTitle')"
				>
					<template #icon> <i class="fa-regular fa-message"></i> </template>
					<template #trailing>
						<input type="checkbox" v-model="sendDMEnabled" class="toggle" />
					</template>
					<template #content>
						<TextMessage
							v-if="sendMessageNode.config?.contents?.length"
							:content="sendMessageNode.config?.contents[0]"
							:node="sendMessageNode"
						/>
					</template>
				</QuickFlowElement>

				<QuickSignature :flow="flowStore.flow" />

				<PublishElementGroup />
			</div>
		</div>
	</div>
</template>

<script>
import TextMessage from '~/components/Flow/Node/Actions/SendMessagePartials/TextMessage.vue'
import { nodeTypes, triggerTypes } from '~/models/Flow/utils/utils.ts'
import { Trigger } from '~/models/Flow/Trigger.ts'
import { Node } from '~/models/Flow/Node.ts'
import QuickFlowElement from '~/components/Flow/Quick/Components/QuickFlowElement.vue'
import QuickSignature from '~/components/Flow/Quick/Components/QuickSignature.vue'
import PublishElementGroup from '~/components/Flow/Quick/PublishElementGroup.vue'
import Filters from '~/components/Flow/Quick/Components/Filters.vue'
import FirstDMActionPanel from '~/components/Flow/Quick/Components/FirstDMActionPanel.vue'
import FollowUpMessage from '~/components/Flow/Quick/Components/FollowUpMessage.vue'

export default {
	components: {
		FollowUpMessage,
		FirstDMActionPanel,
		Filters,
		PublishElementGroup,
		QuickSignature,
		QuickFlowElement,
		TextMessage,
	},
	setup() {
		return {
			flowStore: useFlowStore(),
		}
	},
	computed: {
		triggerConfig() {
			return this.trigger?.config ?? {}
		},
		trigger() {
			return this.triggerNode?.triggers[0]
		},
		triggerNode() {
			return this.flowStore.flow?.nodes?.find((n) => n.type.key === nodeTypes.trigger.key)
		},
		sendMessageNode() {
			return this.flowStore.flow?.nodes?.find((n) => n.type.key === nodeTypes.actions.sendMessage.key)
		},
		triggerNodeTrigger() {
			return this.triggerNode?.triggers[0]
		},
		sendDMEnabled: {
			get() {
				return !!this.sendMessageNode
			},
			set(val) {
				if (val) {
					this.createSendMessageNode()
				} else {
					this.removeSendMessageNode()
				}
			},
		},
	},
	methods: {
		addTrigger({ action: newNode, guard }) {
			this.flowStore.flow.addNode(newNode, this.sendMessageNode, guard)
			this.sendMessageNode?.addTrigger(
				new Trigger({
					type: triggerTypes.postback,
					config: {
						postback: guard,
					},
				}),
			)
		},

		addEdge({ toNodeUuid, guard }) {
			this.flowStore.flow.addEdge(this.sendMessageNode, this.flowStore.flow.getNodeByUuid(toNodeUuid), guard)
			this.sendMessageNode?.addTrigger(
				new Trigger({
					type: triggerTypes.postback,
					config: {
						postback: guard,
					},
				}),
			)
		},
		createSendMessageNode() {
			if (this.sendMessageNode) return
			const newNode = new Node({
				type: nodeTypes.actions.sendMessage,
				config: {
					contents: [
						{
							type: 'text',
							text: this.$t('models.flow.utils.quick.replyToDm.sendMessageText'),
							buttons: [],
						},
					],
				},
			})
			this.flowStore.flow.addNode(newNode, this.triggerNode)
		},
		removeSendMessageNode() {
			if (!this.sendMessageNode) return
			this.flowStore.flow.removeNode(this.sendMessageNode)
		},
	},
}
</script>
