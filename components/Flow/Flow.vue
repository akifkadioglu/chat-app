<template>
	<div v-if="flowStore.flow.chatAccountId" v-auto-animate class="flex flex-col w-full">
		<div v-for="(node, i) in orderedNodes" :key="node.uuid" class="space-y-2 w-full">
			<Node :ref="`node-${node.uuid}`" :node="node" @continueFlow="continueFlow(i)" />
		</div>
	</div>
</template>

<script>
import AddAction from '~/components/Flow/AddNodePartials/AddAction.vue'
import Collapse from '~/components/GlobalComponents/Collapse.vue'
import Node from '~/components/Flow/Node.vue'
import AddCondition from '~/components/Flow/AddNodePartials/AddCondition.vue'
import SendMessage from '~/components/Flow/Node/Actions/SendMessage.vue'
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'

export default {
	components: {
		LoadingElement,
		SendMessage,
		Node,
		Collapse,
		AddAction,
		AddCondition,
	},
	setup() {
		return {
			flowStore: useFlowStore(),
			chatAccountsStore: useChatAccountsStore(),
		}
	},
	computed: {
		orderedNodes() {
			return this.flowStore.flow.orderedNodes
		},
	},
	watch: {
		'chatAccountsStore.active'(newVal, oldVal) {
			consoleLog('chatAccountsStore.active değişti watcherda', newVal, oldVal)
			this.flowStore.flow.chatAccountId = newVal?.id ?? null
		},
	},
	data() {
		return {
			saving: false,
		}
	},
	methods: {
		continueFlow() {
			this.orderedNodes.forEach((n) => {
				consoleLog('n', n, this.$refs[`node-${n.uuid}`], n.uuid)
				if (n.isLast) {
					this.$refs[`node-${n.uuid}`][0].$refs?.collapse?.showCollapse()

					setTimeout(() => {
						this.$refs[`node-${n.uuid}`][0].$el.scrollIntoView({
							behavior: 'smooth',
							block: 'start',
							inline: 'nearest',
						})
					}, 300)
					return
				}
				this.$refs[`node-${n.uuid}`][0].$refs?.collapse?.hideCollapse()
			})
		},
	},
}
</script>
