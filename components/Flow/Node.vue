<template>
	<div @mouseenter="hovered" @mouseleave="blurred" class="w-full">
		<div class="flex items-center gap-1 w-full">
			<NodeSummaryContainer :node="node" />

			<div v-if="node.type.key !== nodeTypes.trigger.key">
				<button
					@click.stop="removeNodeSafely(node)"
					class="btn btn-circle btn-sm ml-2 transition duration-200"
					:class="{
						'btn-warning btn-soft': hovering,
						'btn-outline btn-secondary opacity-10': !hovering,
					}"
					:disabled="disableToRemove(node)"
					v-tooltip="$t('components.flow.node.actions.deleteTooltip')"
				>
					<i class="fa fa-trash"></i>
				</button>
			</div>
		</div>

		<div v-if="!node.isFinal" class="w-full py-2" @click.stop="showActionButtonsAWhile">
			<transition
				name="fade"
				mode="out-in"
				:duration="{ enter: showAddNodes ? 300 : 0, leave: showAddNodes ? 0 : 300 }"
				leave-active-class="transition-opacity duration-300"
			>
				<div v-if="showAddNodes || node.isLast" class="flex gap-2 justify-center">
					<AddAction
						:key="addActionKey"
						:hideConsentRequiredActions="hideConsentRequiredActions(node)"
						@addNode="addNode_($event, node.toEdges.at(0)?.fromNode)"
						@dropdown-opened="onDropdownOpened"
						@dropdown-closed="onDropdownClosed"
						showAddConditionButton
					/>
					<AddCondition
						:key="addConditionKey"
						:hideConsentRequiredActions="hideConsentRequiredActions(node)"
						@addNode="addNode_($event, node.toEdges.at(0)?.fromNode)"
						@dropdown-opened="onDropdownOpened"
						@dropdown-closed="onDropdownClosed"
					/>
				</div>
				<div v-else class="flex justify-center">
					<div class="h-8" @click.stop :class="{ 'w-px bg-base-content/20': !nodeStopsFlow }" />
				</div>
			</transition>
		</div>
	</div>
</template>

<script>
import { nodeTypes } from '~/models/Flow/utils/utils.js'
import AddAction from '~/components/Flow/AddNodePartials/AddAction.vue'
import { Node } from '~/models/Flow/Node.js'
import AddCondition from '~/components/Flow/AddNodePartials/AddCondition.vue'
import NodeSummaryContainer from '~/components/Flow/NodeSummaryContainer.vue'
import FlowNodeMixin from '~/mixins/FlowNodeMixin.js'

export default {
	components: {
		NodeSummaryContainer,
		AddCondition,
		AddAction,
	},
	mixins: [FlowNodeMixin],
	emits: ['continueFlow', 'removeNode'],
	props: {
		node: {
			type: Node,
			required: true,
		},
	},
	setup() {
		return {
			flowStore: useFlowStore(),
		}
	},
	computed: {
		nodeStopsFlow() {
			return [nodeTypes.actions.randomizer.key, nodeTypes.commentActions.sendPrivateReply.key].includes(
				this.node.type.key,
			)
		},
		// disableToRemove() {
		// 	return (
		// 		this.node.type.key === nodeTypes.commentActions.sendPrivateReply.key &&
		// 		this.flowStore.flow.hasCommentTrigger &&
		// 		this.flowStore.flow.hasSendMessageNode
		// 	)
		// },
	},
	data() {
		// const defaultConfig = defaultConfigs(this.$t)
		// this.node.config = {
		// 	...(defaultConfig[this.node.type.key] || {}),
		// 	...this.node.config,
		// }

		return {
			nodeTypes,
			hovering: false,
			showAddNodes: false,
			dropdownOpen: false,
			clickedButtonsArea: false,
			addActionKey: 'addActionKey',
			addConditionKey: 'addConditionKey',
		}
	},
	mounted() {
		setTimeout(() => {
			this.$refs.collapse?.showCollapse()
		}, 100)
	},
	methods: {
		continueFlow() {
			this.$emit('continueFlow')
		},

		hovered() {
			this.hovering = true
			this.showAddNodes = true
		},
		blurred() {
			this.hovering = false
			setTimeout(() => {
				if (!this.hovering && !this.dropdownOpen && !this.clickedButtonsArea) this.showAddNodes = false
			}, 300)
		},
		onDropdownOpened() {
			this.dropdownOpen = true
		},
		onDropdownClosed() {
			this.dropdownOpen = false
			this.blurred()
		},
		showActionButtonsAWhile() {
			this.showAddNodes = true
			this.clickedButtonsArea = true
			setTimeout(() => {
				consoleLog('Hiding action buttons after timeout', this.hovering, this.dropdownOpen)
				this.clickedButtonsArea = false
				if (!this.hovering && !this.dropdownOpen) {
					this.showAddNodes = false
				} else {
					this.showActionButtonsAWhile()
				}
			}, 3000)
		},
	},
}
</script>
