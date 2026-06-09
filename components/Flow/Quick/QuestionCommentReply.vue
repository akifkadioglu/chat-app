<template>
	<div class="w-full">
		<div class="p-5">
			<div class="space-y-6" v-auto-animate>
				<!-- Comment Trigger -->
				<CommentOnPostTrigger :flow="flowStore.flow" />

				<!-- Intent Detection -->
				<QuickFlowElement
					:node-uuid="comparisonNode?.uuid"
					:title="$t('components.flow.quick.questionCommentReply.intentDetection')"
					show-content
					show-helper-text
					:helper-text="$t('components.flow.quick.questionCommentReply.intentDetectionDesc')"
					:pointer-enabled="false"
				>
					<template #icon>
						<i class="fa-solid fa-lightbulb text-yellow-500" />
					</template>
					<template #trailing>
						<div class="badge badge-info badge-soft rounded-sm text-info">
							<i class="fa-solid fa-question mr-1" />
							{{ $t('components.flow.quick.questionCommentReply.question') }}
						</div>
					</template>
				</QuickFlowElement>

				<!-- Private Reply -->
				<QuickFlowElement
					v-if="privateReplyNode?.uuid"
					:node-uuid="privateReplyNode?.uuid"
					show-content
					:title="$t('components.flow.quick.questionCommentReply.privateReplyTitle')"
					:pointer-enabled="false"
				>
					<template #icon>
						<i class="fa-solid fa-reply text-blue-500" />
					</template>
					<template #content>
						<div class="space-y-3">
							<div class="text-sm text-base-content/70">
								{{ $t('components.flow.quick.questionCommentReply.privateReplyDesc') }}
							</div>
							<TextMessage
								:content="privateReplyNode.config"
								:node="privateReplyNode"
								:placeholder="$t('components.flow.quick.questionCommentReply.privateReplyPlaceholder')"
							/>
						</div>
					</template>
				</QuickFlowElement>

				<PublishElementGroup />
			</div>
		</div>
	</div>
</template>

<script>
import { nodeTypes, triggerTypes } from '~/models/Flow/utils/utils.ts'
import { Trigger } from '~/models/Flow/Trigger.ts'
import CommentOnPostTrigger from '~/components/Flow/Quick/Components/CommentOnPostTrigger.vue'
import QuickFlowElement from '~/components/Flow/Quick/Components/QuickFlowElement.vue'
import TextMessage from '~/components/Flow/Node/Actions/SendMessagePartials/TextMessage.vue'
import PublishElementGroup from '~/components/Flow/Quick/PublishElementGroup.vue'

export default {
	components: { PublishElementGroup, CommentOnPostTrigger, QuickFlowElement, TextMessage },
	setup() {
		return {
			flowStore: useFlowStore(),
		}
	},
	computed: {
		comparisonNode() {
			return this.flowStore.flow?.nodes?.find((n) => n.type.key === nodeTypes.conditions.comparison.key)
		},
		privateReplyNode() {
			return this.flowStore.flow?.nodes?.find((n) => n.type.key === nodeTypes.commentActions.sendPrivateReply.key)
		},
	},
	methods: {
		addTrigger({ action: newNode, guard }) {
			this.flowStore.flow.addNode(newNode, this.privateReplyNode, guard)
			this.privateReplyNode?.addTrigger(
				new Trigger({
					type: triggerTypes.postback,
					config: {
						postback: guard,
					},
				}),
			)
		},
		addEdge({ toNodeUuid, guard }) {
			this.flowStore.flow.addEdge(this.privateReplyNode, this.flowStore.flow.getNodeByUuid(toNodeUuid), guard)
			this.privateReplyNode?.addTrigger(
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

<style scoped></style>
