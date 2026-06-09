<template>
	<!--			ref="leftPanel"-->
	<div class="w-full">
		<div class="p-5">
			<div class="space-y-10" v-auto-animate>
				<CommentOnPostTrigger :flow="flowStore.flow" v-if="0 <= step" />
				<FirstDMActionPanel
					v-if="1 <= step"
					:flow="flowStore.flow"
					:showAskFollowBeforeLink="false"
					:showAskForEmailDM="false"
					:showPrivateReplyMessageTrailing="false"
				/>
				<QuickFlowElement show-content :node-uuid="sendMessageNode?.uuid" v-if="2 <= step">
					<slot name="title">
						<h2 class="font-semibold">{{ $t('components.flow.quick.turnCommentsIntoSales.andThenTheyWillGet') }}</h2>
					</slot>
					<template #content>
						<TextMessage :node="sendMessageNode" :content="sendMessageNodeConfig.contents[0]" :button-count="1" />
					</template>
				</QuickFlowElement>

				<QuickFlowElement
					:node-uuid="finalMessageNode?.uuid"
					:title="$t('components.flow.quick.turnCommentsIntoSales.customerControlTitle')"
					:is-selected="isDelayActive"
					v-if="3 <= step"
				>
					<template #content v-if="finalMessageNode">
						<div>
							<CustomDropdown class="inline-block mb-4" placement="top-start" :arrow-padding="35">
								<i18n-t tag="span" keypath="components.flow.quick.turnCommentsIntoSales.sendMessageAfter">
									<template #hours>
										<a href="javascript:" class="underline hover:text-simpliers">
											{{
												$t('components.flow.quick.turnCommentsIntoSales.hours', { count: delayNode.config.delayTime })
											}}
										</a>
									</template>
								</i18n-t>
								<template #popper>
									<div class="p-2">
										<input
											v-model="delayNode.config.delayTime"
											type="number"
											@focus="$event.target.select()"
											max="22"
											min="1"
											class="input"
											@change="changeDelayTime"
										/>
									</div>
								</template>
							</CustomDropdown>
							<TextMessage :node="finalMessageNode" :content="finalMessageNodeConfig.contents[0]" />
						</div>
					</template>
					<template #trailing>
						<input v-model="isDelayActive" :value="isDelayActive" class="toggle" type="checkbox" />
					</template>
				</QuickFlowElement>

				<QuickSignature :flow="flowStore.flow" v-if="3 <= step" />

				<PublishElementGroup v-if="3 <= step" />
			</div>
		</div>
		<button v-if="step < 3" class="btn btn-soft btn-primary m-5" @click="nextStep">
			{{ $t('components.flow.quick.common.nextStep') }}
			<i class="fa fa-chevron-down ml-1" />
		</button>
	</div>
</template>

<script>
import FirstDMActionPanel from '~/components/Flow/Quick/Components/FirstDMActionPanel.vue'
import CommentOnPostTrigger from '~/components/Flow/Quick/Components/CommentOnPostTrigger.vue'
import TextMessage from '~/components/Flow/Node/Actions/SendMessagePartials/TextMessage.vue'
import QuickFlowElement from '~/components/Flow/Quick/Components/QuickFlowElement.vue'
import { nodeTypes, triggerTypes } from '~/models/Flow/utils/utils.ts'
import { Trigger } from '~/models/Flow/Trigger.ts'
import QuickSignature from '~/components/Flow/Quick/Components/QuickSignature.vue'
import { Node } from '~/models/Flow/Node.ts'
import PublishElementGroup from '~/components/Flow/Quick/PublishElementGroup.vue'
import CustomDropdown from '~/components/GlobalComponents/CustomDropdown.vue'

export default {
	components: {
		CustomDropdown,
		PublishElementGroup,
		QuickSignature,
		QuickFlowElement,
		TextMessage,
		CommentOnPostTrigger,
		FirstDMActionPanel,
	},
	setup() {
		return {
			flowStore: useFlowStore(),
		}
	},
	inject: ['getContentContainer'],
	computed: {
		nodeTypes() {
			return nodeTypes
		},
		triggerNode() {
			return this.flowStore.flow.nodes?.find((node) => node.type.key === nodeTypes.trigger.key)
		},
		finalMessageNode() {
			return this.flowStore.flow.nodes?.find((node) => node.config.isFollowUp)
		},
		finalMessageNodeConfig() {
			return this.finalMessageNode?.config
		},

		delayNode() {
			return this.flowStore.flow.nodes?.find((node) => node.type.key === nodeTypes.actions.delay.key)
		},
		isDelayActive: {
			get() {
				return !!(this.finalMessageNode && this.delayNode)
			},
			set(val) {
				if (val) {
					this.addFinalMessageNodeAndDelayNode()
				} else {
					this.removeFinalMessageNodeAndDelayNode()
				}
			},
		},

		sendMessageNode() {
			return this.flowStore.flow.nodes?.find(
				(node) => node.type.key === nodeTypes.actions.sendMessage.key && !node.config.isFollowUp,
			)
		},
		sendMessageNodeConfig() {
			return this.sendMessageNode?.config
		},
	},
	data() {
		return {
			step: 0,
		}
	},
	mounted() {
		if (this.flowStore.flow.id) {
			this.step = 3
		}
	},
	methods: {
		addTrigger({ action: newNode, guard }) {
			this.flowStore.flow.addNode(newNode, this.node, guard)
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
		changeDelayTime() {
			if (this.delayNode.config.delayTime < 1) {
				this.delayNode.config.delayTime = 1
			}
			if (this.delayNode.config.delayTime > 22) {
				this.delayNode.config.delayTime = 22
			}
		},
		async nextStep() {
			this.step++
			await this.$delay(250)
			const el = this.getContentContainer?.()
			if (el) {
				el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
			}
		},
		removeFinalMessageNodeAndDelayNode() {
			if (this.finalMessageNode) {
				this.flowStore.flow.removeNode(this.finalMessageNode)
			}
			if (this.delayNode) {
				this.flowStore.flow.removeNode(this.delayNode)
			}
		},
		addFinalMessageNodeAndDelayNode() {
			const finalMessageNode = new Node({
				type: nodeTypes.actions.sendMessage,
				config: {
					isFollowUp: true,
					contents: [
						{
							type: 'text',
							text: this.$t('models.flow.utils.quick.turnCommentsIntoSales.followUpMessage'),
							buttons: [],
						},
					],
				},
			})
			const delayNode = new Node({
				type: nodeTypes.actions.delay,
				config: {
					isDelayActive: true,
					delayType: 'duration',
					delayTime: 5,
					delayUnit: 'hours',
				},
			})
			if (!this.delayNode) {
				this.flowStore.flow.addNode(delayNode, this.sendMessageNode)
			}
			if (!this.finalMessageNode) {
				this.flowStore.flow.addNode(finalMessageNode, this.delayNode)
			}
		},
	},
}
</script>
