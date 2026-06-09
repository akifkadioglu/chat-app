<template>
	<div class="rounded-lg space-y-2 w-full">
		<div class="flex justify-between items-center">
			<h3 class="text-sm font-medium text-secondary">
				{{ $t('components.flow.node.actions.sendMessagePartials.quickReply.title') }}
			</h3>
			<button
				v-if="sendMessageNode.config?.quickReplies?.length < 10"
				@click="addEmptyReply"
				class="btn btn-xs btn-soft btn-primary"
			>
				<i class="fa fa-plus" />
			</button>
		</div>

		<!-- Quick Replies List -->
		<div class="space-y-3">
			<QuickReplyItem
				v-for="(reply, index) in sendMessageNode.config.quickReplies"
				:key="reply.uuid"
				:reply="reply"
				:actionNode="getActionNode(reply.payload)"
				@remove="removeReply(index)"
				@addAction="addActionToReply"
				@addEdge="addEdgeToReply"
			/>
		</div>
	</div>
</template>

<script>
import QuickReplyItem from '~/components/Flow/Node/Actions/SendMessagePartials/QuickReplyItem.vue'
import { v4 } from 'uuid'
import { Node } from '~/models/Flow/Node.ts'
import { Trigger } from '~/models/Flow/Trigger.ts'
import { triggerTypes } from '~/models/Flow/utils/utils.js'

export default {
	components: { QuickReplyItem },
	props: {
		sendMessageNode: {
			type: Node,
			required: true,
		},
	},
	emits: ['remove'],
	setup() {
		return {
			flowStore: useFlowStore(),
		}
	},
	computed: {
		toEdges() {
			return this.sendMessageNode.toEdges ?? []
		},
	},
	methods: {
		getActionNode(guard) {
			if (!guard) return null
			const edge = this.toEdges.find((e) => e.guard === guard)
			return edge?.toNode ?? null
		},
		addEmptyReply() {
			const payload = v4()
			this.sendMessageNode.config.quickReplies = [
				...(this.sendMessageNode.config?.quickReplies ?? []),
				{
					uuid: v4(),
					title: '',
					payload,
				},
			]
			this.sendMessageNode.addTrigger(
				new Trigger({
					type: triggerTypes.quickReply,
					config: {
						postback: payload,
					},
				}),
			)
		},
		removeReply(index) {
			const reply = this.sendMessageNode.config?.quickReplies[index]
			if (reply?.payload) {
				this.sendMessageNode.removeTriggerByPostback(reply.payload)
				const actionNode = this.getActionNode(reply.payload)
				if (actionNode) {
					this.flowStore.flow.removeNode(actionNode)
				}
			}
			const quickReplies = [...(this.sendMessageNode.config?.quickReplies ?? [])]
			quickReplies.splice(index, 1)
			this.sendMessageNode.config.quickReplies = quickReplies
		},
		addActionToReply({ action, guard }) {
			action.isSingle = true
			this.flowStore.flow.addNode(action, this.sendMessageNode, guard)
		},
		addEdgeToReply({ toNodeUuid, guard }) {
			const toNode = this.flowStore.flow.getNodeByUuid(toNodeUuid)
			if (toNode) {
				this.flowStore.flow.addEdge(this.sendMessageNode, toNode, guard)
			}
		},
	},
}
</script>
