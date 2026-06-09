<template>
	<div class="w-full">
		<div class="p-5">
			<div class="space-y-6" v-auto-animate>
				<!-- Comment Trigger -->
				<CommentOnPostTrigger :flow="flowStore.flow" />

				<ReEnterGiveaway :flow="flowStore.flow" />

				<!-- Winner Announcement -->
				<QuickFlowElement
					v-if="randomizerNode?.uuid"
					:node-uuid="randomizerNode?.uuid"
					:title="$t('components.flow.quick.runGiveaway.winnerSelection')"
					show-content
					showHelperText
					:helper-text="$t('components.flow.quick.runGiveaway.winnerSelectionDesc')"
					:pointerEnabled="false"
				>
					<template #icon>
						<i class="fa-solid fa-dice text-purple-500" />
					</template>
					<template #content>
						<div class="space-y-4">
							<div>
								<span>
									<span class="label-text">{{ $t('components.flow.quick.runGiveaway.winningChance') }}</span>
									<span class="label-text-alt font-mono">{{ winnerPercentage }}%</span>
								</span>
								<input
									v-model.number="winnerPercentage"
									type="range"
									min="1"
									max="99"
									class="range range-secondary"
									step="1"
								/>
								<div class="w-full flex justify-between text-xs px-2 mt-1">
									<span class="text-error">{{ $t('components.flow.quick.runGiveaway.rare') }}</span>
									<span class="text-success">{{ $t('components.flow.quick.runGiveaway.common') }}</span>
								</div>
							</div>
						</div>
					</template>
				</QuickFlowElement>

				<!-- Winner Message -->
				<QuickFlowElement
					v-if="winnerMessageNode?.uuid"
					:node-uuid="winnerMessageNode?.uuid"
					:title="$t('components.flow.quick.runGiveaway.winnerMessage')"
					showHelperText
					:helperText="$t('components.flow.quick.runGiveaway.winnerMessageDesc')"
					show-content
					:pointerEnabled="false"
				>
					<template #icon>
						<i class="fa-solid fa-trophy text-yellow-500" />
					</template>
					<template #content>
						<TextMessage
							:content="winnerMessageNode.config?.contents?.[0]"
							:node="winnerMessageNode"
							:placeholder="$t('components.flow.quick.runGiveaway.winnerMessagePlaceholder')"
						/>
					</template>
				</QuickFlowElement>

				<!-- Loser Message -->
				<QuickFlowElement
					v-if="loserMessageNode?.uuid"
					:node-uuid="loserMessageNode?.uuid"
					:title="$t('components.flow.quick.runGiveaway.loserMessage')"
					showHelperText
					:helperText="$t('components.flow.quick.runGiveaway.loserMessageDesc')"
					show-content
					:pointerEnabled="false"
				>
					<template #icon>
						<i class="fa-solid fa-heart-crack text-red-500" />
					</template>
					<template #content>
						<TextMessage
							:content="loserMessageNode.config?.contents?.[0]"
							:node="loserMessageNode"
							:placeholder="$t('components.flow.quick.runGiveaway.loserMessagePlaceholder')"
						/>
					</template>
				</QuickFlowElement>

				<!-- Signature -->
				<QuickSignature :flow="flowStore.flow" :fromNodes="[winnerMessageNode, loserMessageNode]" />

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
import Tag from '~/components/Chat/ContactInfo/Partials/Tag.vue'
import QuickSignature from '~/components/Flow/Quick/Components/QuickSignature.vue'
import ReEnterGiveaway from '~/components/Flow/Quick/Components/ReEnterGiveaway.vue'
import PublishElementGroup from '~/components/Flow/Quick/PublishElementGroup.vue'

export default {
	components: {
		PublishElementGroup,
		ReEnterGiveaway,
		QuickSignature,
		CommentOnPostTrigger,
		QuickFlowElement,
		TextMessage,
		Tag,
	},
	setup() {
		return {
			flowStore: useFlowStore(),
		}
	},
	computed: {
		randomizerNode() {
			return this.flowStore.flow?.nodes?.find((n) => n.type.key === nodeTypes.actions.randomizer.key)
		},
		winnerMessageNode() {
			// Find sendMessage node with isWinnerResponse: true flag
			return this.flowStore.flow?.nodes?.find(
				(n) => n.type.key === nodeTypes.actions.sendMessage.key && n.config?.isWinnerResponse === true,
			)
		},
		loserMessageNode() {
			// Find sendMessage node with isWinnerResponse: false flag
			return this.flowStore.flow?.nodes?.find(
				(n) => n.type.key === nodeTypes.actions.sendMessage.key && n.config?.isWinnerResponse === false,
			)
		},
		winnerPercentage: {
			get() {
				const variations = this.randomizerNode?.config?.variations
				if (!variations || variations.length < 2) return 50
				return variations[0].percentage || 50
			},
			set(value) {
				if (this.randomizerNode?.config?.variations) {
					this.randomizerNode.config.variations[0].percentage = value
					this.randomizerNode.config.variations[1].percentage = 100 - value
				}
			},
		},
	},
	methods: {
		addTrigger({ action: newNode, guard }) {
			this.flowStore.flow.addNode(newNode, this.winnerMessageNode || this.loserMessageNode, guard)
			const targetNode = this.winnerMessageNode || this.loserMessageNode
			targetNode?.addTrigger(
				new Trigger({
					type: triggerTypes.postback,
					config: {
						postback: guard,
					},
				}),
			)
		},
		addEdge({ toNodeUuid, guard }) {
			const targetNode = this.winnerMessageNode || this.loserMessageNode
			this.flowStore.flow.addEdge(targetNode, this.flowStore.flow.getNodeByUuid(toNodeUuid), guard)
			targetNode?.addTrigger(
				new Trigger({
					type: triggerTypes.postback,
					config: {
						postback: guard || 'button_clicked',
					},
				}),
			)
		},
	},
}
</script>

<style scoped></style>
