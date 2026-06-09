<template>
	<div class="w-full">
		<div class="p-5">
			<div class="space-y-6" v-auto-animate>
				<!-- Comment Trigger -->
				<CommentOnPostTrigger :flow="flowStore.flow" :showReplies="false" :showFilters="false" />

				<!-- Sentiment Score -->
				<QuickFlowElement
					:node-uuid="triggerNode?.uuid"
					:title="$t('components.flow.quick.hideCommentNegative.sentimentScore')"
					show-content
					show-helper-text
					:helper-text="$t('components.flow.quick.hideCommentNegative.sentimentScoreDesc')"
					:pointer-enabled="false"
				>
					<template #icon>
						<i class="fa-solid fa-star text-yellow-500" />
					</template>
					<template #trailing>
						<div class="badge badge-error badge-soft rounded-sm text-error">
							{{ $t('components.flow.quick.hideCommentNegative.scoreLessThan') }}
							{{ triggerNodeTrigger?.config?.filters?.sentimentFilter?.scoreFilter?.value }}
						</div>
					</template>
					<template #content>
						<div class="space-y-4">
							<div>
								<div class="mb-1 text-sm">
									{{ $t('components.flow.quick.hideCommentNegative.negativityThreshold') }}
									<span class="label-text-alt font-mono ml-2">
										{{ triggerNodeTrigger?.config?.filters?.sentimentFilter?.scoreFilter?.value }}/100
									</span>
								</div>
								<input
									v-model.number="triggerNodeTrigger.config.filters.sentimentFilter.scoreFilter.value"
									type="range"
									min="-100"
									max="0"
									class="range"
									:style="{
										color: `rgb(${Math.abs(triggerNodeTrigger?.config?.filters?.sentimentFilter?.scoreFilter?.value) * 2.55}, 0, 0)`,
									}"
									step="5"
								/>
								<div class="w-full flex justify-between text-xs px-2 mt-1">
									<span class="text-error font-semibold text-sm">
										{{ $t('components.flow.quick.hideCommentNegative.negative') }}
									</span>
									<span class="text-sm">{{ $t('components.flow.quick.hideCommentNegative.neutral') }}</span>
								</div>
							</div>
						</div>
					</template>
				</QuickFlowElement>

				<!-- Hide Comment Action -->
				<QuickFlowElement
					v-if="hideCommentNode?.uuid"
					:node-uuid="hideCommentNode?.uuid"
					:title="$t('components.flow.quick.hideCommentNegative.hideCommentTitle')"
					show-helper-text
					:helper-text="$t('components.flow.quick.hideCommentNegative.hideCommentDesc')"
					:pointer-enabled="false"
				>
					<template #icon>
						<i class="fa-solid fa-eye-slash text-red-500" />
					</template>
				</QuickFlowElement>

				<!-- Send Dm -->
				<QuickFlowElement
					:node-uuid="privateReplyNode?.uuid"
					:title="$t('components.flow.quick.hideCommentNegative.privateReplyTitle')"
					:is-selected="privateReplyEnabled"
				>
					<template #icon>
						<i class="fa-regular fa-message"></i>
					</template>
					<template #trailing>
						<input type="checkbox" v-model="privateReplyEnabled" class="toggle" />
					</template>
					<template #content v-if="privateReplyEnabled">
						<TextMessage :content="privateReplyNodeConfig" :node="privateReplyNode" hideButtons />
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
import PublishElementGroup from '~/components/Flow/Quick/PublishElementGroup.vue'
import TextMessage from '~/components/Flow/Node/Actions/SendMessagePartials/TextMessage.vue'
import { Node } from '~/models/Flow/Node.ts'

export default {
	components: { TextMessage, PublishElementGroup, CommentOnPostTrigger, QuickFlowElement },
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
		hideCommentNode() {
			return this.flowStore.flow?.nodes?.find((n) => n.type.key === nodeTypes.commentActions.hideComment.key)
		},
		inputColor() {
			const intensity = this.triggerNodeTrigger?.config?.filters?.sentimentFilter?.scoreFilter?.value
			const r = intensity * 1.9
			const g = 40
			const b = 40
			return `rgb(${r}, ${g}, ${b})`
		},
		privateReplyNode() {
			return this.flowStore.flow?.nodes?.find((n) => n.type.key === nodeTypes.commentActions.sendPrivateReply.key)
		},
		privateReplyNodeConfig() {
			return this.privateReplyNode?.config
		},

		privateReplyEnabled: {
			get() {
				return !!this.privateReplyNode
			},
			set(val) {
				if (val) {
					this.createPrivateReplyNode()
				} else {
					this.removePrivateReplyNode()
				}
			},
		},
	},
	methods: {
		createPrivateReplyNode() {
			if (this.privateReplyNode || !this.hideCommentNode) return

			const sourceNode = this.comparisonNode || this.triggerNode
			if (!sourceNode) return

			const newNode = new Node({
				type: nodeTypes.commentActions.sendPrivateReply,
				config: {
					text: this.$t('models.flow.utils.quick.hideCommentNegative.sendPrivateReply'),
					buttons: [],
				},
			})

			// Flow.addNode mevcut edge'in arasına ekleyip privateReply -> next bağlantısını null guard ile kurar.
			this.flowStore.flow.addNode(newNode, sourceNode, null)
		},
		removePrivateReplyNode() {
			if (!this.privateReplyNode) return
			this.flowStore.flow.removeNode(this.privateReplyNode)
		},
	},
}
</script>

<style scoped></style>
