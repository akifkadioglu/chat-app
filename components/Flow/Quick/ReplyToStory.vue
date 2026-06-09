<template>
	<div class="w-full">
		<div class="p-5">
			<div class="space-y-6" v-auto-animate>
				<!-- Header -->
				<div class="flex items-center gap-3">
					<i class="fa-solid fa-reply text-blue-500" />
					<div class="text-lg">{{ $t('components.flow.quick.replyToStory.title') }}</div>
				</div>
				<div class="divider" />
				<Filters :filterOptions="triggerNodeTrigger.config" />
				<QuickFlowElement
					:node-uuid="triggerNode?.uuid"
					:trigger-uuid="trigger?.uuid"
					:title="$t('components.flow.quick.replyToStory.reactWithHeart')"
					:is-selected="triggerConfig.likeReply"
					show-helper-text
					:helper-text="$t('components.flow.quick.replyToStory.reactWithHeartDesc')"
				>
					<template #icon>
						<i class="fa-solid fa-heart text-red" />
					</template>
					<template #trailing>
						<input v-model="triggerConfig.likeReply" class="toggle" type="checkbox" />
					</template>
				</QuickFlowElement>

				<QuickFlowElement
					v-if="sendMessageNode?.uuid"
					:node-uuid="sendMessageNode?.uuid"
					showContent
					:title="$t('components.flow.quick.replyToStory.sendMessageTitle')"
				>
					<template #icon> <i class="fa-regular fa-message"></i> </template>
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
import QuickFlowElement from '~/components/Flow/Quick/Components/QuickFlowElement.vue'
import QuickSignature from '~/components/Flow/Quick/Components/QuickSignature.vue'
import PublishElementGroup from '~/components/Flow/Quick/PublishElementGroup.vue'
import Filters from '~/components/Flow/Quick/Components/Filters.vue'

export default {
	components: { Filters, PublishElementGroup, QuickSignature, QuickFlowElement, TextMessage },
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
			return this.flowStore.flow?.nodes?.find(
				(n) => n.type.key === nodeTypes.actions.sendMessage.key && n.config.isFollowUp,
			)
		},
		triggerNodeTrigger() {
			return this.triggerNode?.triggers[0]
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
	},
}
</script>
