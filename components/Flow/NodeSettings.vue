<template>
	<div class="flex-1 flex flex-col min-h-full w-full">
		<div class="px-4 border-b border-base-300 sticky top-0 bg-base-100 z-1 h-15 flex items-center">
			<div v-if="focusedNode" class="flex items-center justify-between gap-2 flex-1">
				<button
					class="btn btn-soft btn-sm btn-transition"
					@click="previousNode"
					:disabled="focusedNode.uuid === flowStore.flow.nodes[0].uuid"
				>
					<i class="fa fa-chevron-left" />
				</button>

				<label class="flex-1">
					<!--					<span>Step Name:</span>-->
					<input
						type="text"
						v-model="focusedNode.name"
						:placeholder="$t('components.flow.nodeSettings.namePlaceholder', { number: focusedNode.number })"
						class="input input-ghost input-sm focus:outline-none focus:bg-base-200 transition-colors duration-200 min-w-32"
					/>
				</label>

				<div>
					<button
						class="btn btn-success btn-soft btn-sm btn-transition"
						@click="nextNode"
						:disabled="focusedNode.isLast"
					>
						{{ $t('components.flow.nodeSettings.nextButton') }}
						<i class="fa fa-chevron-right link-icon" />
					</button>
				</div>
			</div>
		</div>
		<div class="flex-1 flex flex-col pt-5 px-3 max-w-md w-full mx-auto">
			<transition
				name="fade"
				mode="out-in"
				enter-active-class="transition-opacity duration-200"
				leave-active-class="transition-opacity duration-200"
			>
				<NodeRenderer v-if="focusedNode" :key="focusedNode.uuid" :node="focusedNode" :isMainNode="true" />
			</transition>
		</div>
		<div class="mt-20 mb-auto"></div>
		<div v-if="focusedNode" class="px-4 border-t border-base-300 bg-base-100 py-2">
			<div class="flex join">
				<button
					class="btn btn-soft-primary join-item"
					@click="previousNode"
					:disabled="focusedNode.uuid === flowStore.flow.nodes[0].uuid"
				>
					<i class="fa fa-chevron-left" />
				</button>
				<button
					v-if="!focusedNode.isLast"
					class="btn btn-success join-item flex-1"
					@click="nextNode"
					:disabled="focusedNode.isLast"
				>
					{{ $t('components.flow.nodeSettings.nextStepButton') }}
					<i class="fa fa-chevron-right link-icon" />
				</button>
				<PublishElement
					v-else
					buttonClass="btn join-item flex-1 w-full"
					buttonVariant="btn-primary"
					class="w-full h-full"
					previewLocation="NodeSettings"
					showPublishChangesButton
				/>
			</div>
			<div class="flex gap-4 justify-center">
				<AddAction
					showAddConditionButton
					:node="focusedNode"
					@addNode="addNode($event, focusedNode.toEdges.at(0)?.fromNode)"
				>
					<template #triggerButton>
						<a href="javascript:" class="link text-xs pt-4" type="button">
							<i class="fa fa-plus"></i>
							{{ $t('components.flow.addNodePartials.addAction.buttonText') }}
						</a>
					</template>
				</AddAction>
				<AddCondition :node="focusedNode" @addNode="addNode($event, focusedNode.toEdges.at(0)?.fromNode)">
					<template #triggerButton>
						<a href="javascript:" class="link text-xs pt-4" type="button">
							<i class="fa fa-plus"></i>
							{{ $t('components.flow.node.conditions.fieldSelector.conditionLabel') }}
						</a>
					</template>
				</AddCondition>
			</div>
		</div>
	</div>
</template>
<script>
import NodeRenderer from '~/components/Flow/Node/NodeRenderer.vue'
import AddCondition from '~/components/Flow/AddNodePartials/AddCondition.vue'
import AddAction from '~/components/Flow/AddNodePartials/AddAction.vue'
import { v4 } from 'uuid'
import PublishElement from '~/components/Flow/FlowSetup/PublishElement.vue'

export default {
	components: {
		PublishElement,
		AddAction,
		AddCondition,
		NodeRenderer,
	},
	setup() {
		return {
			flowStore: useFlowStore(),
		}
	},
	computed: {
		focusedNode() {
			return this.flowStore.focusedNode
		},
	},
	watch: {
		focusedNode(newVal) {
			if (!newVal) {
				this.flowStore.focusFirstNode()
			}
		},
	},
	emits: ['scrollToNode'],
	methods: {
		addNode(node, fromNode, guard) {
			consoleLog('addNode NodeSettinhs', node, fromNode, guard)
			this.addActionKey = v4()
			this.addConditionKey = v4()

			this.flowStore.flow.addNode(node, fromNode, guard)
			this.$nextTick(() => {
				this.flowStore.focusNode(node.uuid)
				this.$emitter.emit('openSecondTrailingDrawer')
			})
		},
		nextNode() {
			this.flowStore.focusNextNode()
			this.$nextTick(() => {
				this.$emit('scrollToNode', this.focusedNode.uuid)
			})
		},
		previousNode() {
			this.flowStore.focusPreviousNode()
			this.$nextTick(() => {
				this.$emit('scrollToNode', this.focusedNode.uuid)
			})
		},
	},
}
</script>
