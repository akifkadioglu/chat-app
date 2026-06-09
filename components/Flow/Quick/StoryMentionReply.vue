<template>
	<!--			ref="leftPanel"-->
	<div class="w-full">
		<div class="p-5">
			<div class="space-y-6" v-auto-animate>
				<!-- Header -->
				<div class="flex items-center gap-3">
					<i class="fa-solid fa-at text-purple-500" />
					<div class="text-lg">{{ $t('components.flow.quick.storyMentionReply.title') }}</div>
				</div>

				<div class="divider" />

				<QuickFlowElement
					:node-uuid="triggerNode?.uuid"
					:trigger-uuid="trigger?.uuid"
					:title="$t('components.flow.quick.storyMentionReply.reactWithHeart')"
					:is-selected="triggerConfig.autoLike"
					show-helper-text
					:helper-text="$t('components.flow.quick.storyMentionReply.reactWithHeartDesc')"
				>
					<template #icon>
						<i class="fa-solid fa-heart text-red" />
					</template>
					<template #trailing>
						<input v-model="triggerConfig.autoLike" class="toggle" type="checkbox" />
					</template>
				</QuickFlowElement>

				<QuickFlowElement
					:node-uuid="finalSendMessageNode?.uuid"
					:title="$t('components.flow.quick.storyMentionReply.sendMessageTitle')"
					show-content
				>
					<template #icon>
						<i class="fa-regular fa-message" />
					</template>
					<template #content>
						<TextMessage
							v-if="finalSendMessageConfig.contents"
							:content="finalSendMessageConfig.contents[0]"
							:node="finalSendMessageNode"
						/>
					</template>
				</QuickFlowElement>

				<QuickFlowElement
					:title="$t('components.flow.quick.storyMentionReply.perContactADay')"
					:is-selected="triggerConfig.perContactADay"
					show-helper-text
				>
					<template #icon>
						<i class="fa-regular fa-clock" />
					</template>
					<template #helper>
						<small class="text-xs text-muted block leading-4 py-2">
							<i18n-t keypath="components.flow.quick.storyMentionReply.perContactADayDesc.text" tag="span">
								<template #time>
									<b>
										<u>
											{{ $t('components.flow.quick.storyMentionReply.perContactADayDesc.hour', { hour: 24 }) }}
										</u>
									</b>
								</template>
							</i18n-t>
						</small>
					</template>
					<template #trailing>
						<input v-model="triggerConfig.perContactADay" class="toggle" type="checkbox" />
					</template>
				</QuickFlowElement>

				<QuickSignature :flow="flowStore.flow" />

				<PublishElementGroup />
			</div>
		</div>
	</div>
</template>

<script>
import FirstDMActionPanel from '~/components/Flow/Quick/Components/FirstDMActionPanel.vue'
import FollowUpMessage from '~/components/Flow/Quick/Components/FollowUpMessage.vue'
import CommentOnPostTrigger from '~/components/Flow/Quick/Components/CommentOnPostTrigger.vue'
import Modal from '~/components/GlobalComponents/Modal.vue'
import TextMessage from '~/components/Flow/Node/Actions/SendMessagePartials/TextMessage.vue'
import { nodeTypes, triggerTypes } from '~/models/Flow/utils/utils.ts'
import { Trigger } from '~/models/Flow/Trigger.ts'
import QuickFlowElement from '~/components/Flow/Quick/Components/QuickFlowElement.vue'
import QuickSignature from '~/components/Flow/Quick/Components/QuickSignature.vue'
import PublishElementGroup from '~/components/Flow/Quick/PublishElementGroup.vue'

export default {
	components: {
		PublishElementGroup,
		QuickSignature,
		QuickFlowElement,
		TextMessage,
		Modal,
		CommentOnPostTrigger,
		FollowUpMessage,
		FirstDMActionPanel,
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
		finalSendMessageNode() {
			return this.flowStore.flow?.nodes?.find(
				(n) => n.type.key === nodeTypes.actions.sendMessage.key && n.config.isFollowUp,
			)
		},
		finalSendMessageConfig() {
			return this.finalSendMessageNode?.config ?? {}
		},
	},
	methods: {
		addTrigger({ action: newNode, guard }) {
			this.flowStore.flow.addNode(newNode, this.finalSendMessageNode, guard)
			this.finalSendMessageNode?.addTrigger(
				new Trigger({
					type: triggerTypes.postback,
					config: {
						postback: guard,
					},
				}),
			)
		},

		addEdge({ toNodeUuid, guard }) {
			this.flowStore.flow.addEdge(this.finalSendMessageNode, this.flowStore.flow.getNodeByUuid(toNodeUuid), guard)
			this.finalSendMessageNode?.addTrigger(
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
