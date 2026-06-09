<template>
	<div class="w-full">
		<div class="p-5">
			<div class="space-y-6" v-auto-animate>
				<!-- Comment Trigger -->
				<CommentOnPostTrigger :flow="flowStore.flow" :showReplies="false" :showFilters="false" />

				<!-- Sentiment Score -->
				<QuickFlowElement
					:node-uuid="triggerNode?.uuid"
					:title="$t('components.flow.quick.positiveCommentReply.sentimentScore')"
					show-content
					show-helper-text
					:helper-text="$t('components.flow.quick.positiveCommentReply.sentimentScoreDesc')"
					:pointer-enabled="false"
				>
					<template #icon>
						<i class="fa-solid fa-star text-yellow-500" />
					</template>
					<template #trailing>
						<div class="badge badge-success badge-soft rounded-sm text-success">
							{{ $t('components.flow.quick.positiveCommentReply.scoreGreaterThan') }}
							{{ triggerNodeTrigger?.config?.filters?.sentimentFilter?.scoreFilter?.value }}
						</div>
					</template>
					<template #content>
						<div class="space-y-4">
							<div>
								<div class="mb-1 text-sm">
									{{ $t('components.flow.quick.positiveCommentReply.positivityThreshold') }}
									<span class="label-text-alt font-mono">
										{{ triggerNodeTrigger?.config?.filters?.sentimentFilter?.scoreFilter?.value }}/100
									</span>
								</div>
								<input
									v-model.number="triggerNodeTrigger.config.filters.sentimentFilter.scoreFilter.value"
									type="range"
									min="0"
									max="100"
									class="range"
									:style="{
										color: inputColor,
									}"
									step="5"
								/>
								<div class="w-full flex justify-between text-sm px-2 mt-1">
									<span>{{ $t('components.flow.quick.positiveCommentReply.neutral') }}</span>
									<span class="text-success font-semibold">
										{{ $t('components.flow.quick.positiveCommentReply.positive') }}
									</span>
								</div>
							</div>
						</div>
					</template>
				</QuickFlowElement>

				<!-- Reply Comment -->
				<QuickFlowElement
					v-if="replyCommentNode?.uuid"
					:node-uuid="replyCommentNode?.uuid"
					show-content
					:title="$t('components.flow.quick.positiveCommentReply.replyTitle')"
					:pointer-enabled="false"
				>
					<template #icon>
						<i class="fa-solid fa-reply text-blue-500" />
					</template>
					<template #content>
						<div class="space-y-3">
							<div class="text-sm text-base-content/70">
								{{ $t('components.flow.quick.positiveCommentReply.replyDesc') }}
							</div>
							<div class="space-y-2">
								<div
									v-for="(reply, index) in replyCommentNode.config?.replies || []"
									:key="index"
									class="flex items-center gap-2"
								>
									<input
										v-model="reply.text"
										type="text"
										class="input input-sm flex-1"
										:placeholder="$t('components.flow.quick.positiveCommentReply.replyPlaceholder')"
									/>
									<button
										v-if="replyCommentNode.config?.replies?.length > 1"
										@click="removeReply(index)"
										class="btn btn-sm btn-ghost text-error"
									>
										<i class="fa-solid fa-trash" />
									</button>
								</div>
								<button @click="addReply" class="btn btn-sm btn-outline btn-primary">
									<i class="fa-solid fa-plus mr-1" />
									{{ $t('components.flow.quick.positiveCommentReply.addReply') }}
								</button>
							</div>
							<div>
								<div class="w-full text-sm flex items-center gap-2 mt-4 mb-2 justify-between px-3">
									{{ $t('components.flow.quick.positiveCommentReply.sendRandomly') }}
									<input v-model="replyCommentNode.config.sendRandomly" type="checkbox" class="toggle toggle-primary" />
								</div>
							</div>
						</div>
					</template>
				</QuickFlowElement>

				<!-- Private Reply -->
				<QuickFlowElement
					:node-uuid="privateReplyNode?.uuid"
					:title="$t('components.flow.quick.positiveCommentReply.privateReplyTitle')"
					:is-selected="!!privateReplyNode"
				>
					<template #content v-if="privateReplyNode">
						<TextMessage
							:content="privateReplyNodeConfig"
							:node="privateReplyNode"
							:buttonCount="3"
							simplifiedActionList
						/>
					</template>
					<template #trailing>
						<input type="checkbox" class="toggle" :checked="!!privateReplyNode" @change="togglePrivateReplyNode" />
					</template>
				</QuickFlowElement>

				<PublishElementGroup />
			</div>
		</div>
	</div>
</template>

<script>
import { nodeTypes } from '~/models/Flow/utils/utils.ts'
import CommentOnPostTrigger from '~/components/Flow/Quick/Components/CommentOnPostTrigger.vue'
import QuickFlowElement from '~/components/Flow/Quick/Components/QuickFlowElement.vue'
import TextareaAutosize from '~/components/GlobalComponents/Elements/TextareaAutosize.vue'
import PublishElementGroup from '~/components/Flow/Quick/PublishElementGroup.vue'
import TextMessage from '~/components/Flow/Node/Actions/SendMessagePartials/TextMessage.vue'
import { Node } from '~/models/Flow/Node.js'
import defaultConfigs from '~/models/Flow/utils/defaultConfigs.ts'

export default {
	components: {
		PublishElementGroup,
		TextareaAutosize,
		CommentOnPostTrigger,
		QuickFlowElement,
		TextMessage,
	},
	setup() {
		return {
			flowStore: useFlowStore(),
		}
	},
	computed: {
		triggerNode() {
			return this.flowStore.flow?.nodes?.find((n) => n.type.key === nodeTypes.trigger.key)
		},
		triggerNodeTrigger() {
			return this.triggerNode?.triggers?.[0]
		},
		comparisonNode() {
			return this.flowStore.flow?.nodes?.find((n) => n.type.key === nodeTypes.conditions.comparison.key)
		},
		replyCommentNode() {
			return this.flowStore.flow?.nodes?.find((n) => n.type.key === nodeTypes.commentActions.replyComment.key)
		},
		inputColor() {
			const intensity = this.triggerNodeTrigger?.config?.filters?.sentimentFilter?.scoreFilter?.value

			const r = 40
			const g = intensity * 1.9
			const b = 40
			return `rgb(${r}, ${g}, ${b})`
		},
		privateReplyNode() {
			return this.flowStore.flow?.nodes?.find((n) => n.type.key === nodeTypes.commentActions.sendPrivateReply.key)
		},
		privateReplyNodeConfig() {
			return this.privateReplyNode?.config
		},
	},
	methods: {
		addReply() {
			if (!this.replyCommentNode.config.replies) {
				this.replyCommentNode.config.replies = []
			}
			this.replyCommentNode.config.replies.push({ text: '' })
		},
		removeReply(index) {
			if (this.replyCommentNode.config.replies && this.replyCommentNode.config.replies.length > 1) {
				this.replyCommentNode.config.replies.splice(index, 1)
			}
		},
		addPrivateReplyNode() {
			const privateReplyConfig = defaultConfigs(this.$t)[nodeTypes.commentActions.sendPrivateReply.key]
			privateReplyConfig.buttons = []
			const privateReplyNode = new Node({
				type: nodeTypes.commentActions.sendPrivateReply,
				config: privateReplyConfig,
			})

			this.flowStore.flow.addNode(privateReplyNode, this.replyCommentNode)
		},
		removePrivateReplyNode() {
			if (this.privateReplyNode) {
				this.flowStore.flow.removeNode(this.privateReplyNode)
			}
		},
		togglePrivateReplyNode() {
			if (this.privateReplyNode) {
				this.removePrivateReplyNode()
				return
			}
			this.addPrivateReplyNode()
		},
	},
}
</script>

<style scoped></style>
