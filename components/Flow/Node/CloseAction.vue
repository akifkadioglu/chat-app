<template>
	<div
		v-if="actionExists"
		class="flex w-full"
		:class="{
			'items-center': !showSummaryBelowActionName,
		}"
	>
		<div :class="wrapperClass">
			<div v-if="actionIsMainNode">
				<small class="cursor-pointer" @click="flowStore.focusNode(action.uuid)">
					<NodeTypeBadge :node-type="action.type" :show-label="!action.name">
						<span>{{ action.name }}</span>
					</NodeTypeBadge>
				</small>
			</div>
			<div v-else class="w-full">
				<div v-if="showSummaryBelowActionName" class="bg-subtle p-2 rounded-lg mt-5 w-full">
					<NodeRenderer :node="action" />
				</div>

				<CustomDropdown
					v-else
					ref="dropdown"
					container="#appPage"
					placement="right"
					:auto-hide-on-mousedown="false"
					eager-mount
					class="z-10"
				>
					<div>
						<button ref="dropdownButton" class="btn btn-info btn-xs" type="button">
							<AddNodeRenderer
								:keyName="action.type?.key || 'unknown'"
								:titleClass="addActionRendererTitleClass"
								:hideDescription="true"
							/>
						</button>
					</div>
					<!--		<div-->
					<!--			v-if="showSummaryBelowActionName"-->
					<!--			:ref="'actionSummary_' + action.uuid"-->
					<!--			:class="{ 'mt-5 p-2 bg-base-300 rounded-lg': actionExists }"-->
					<!--		/>-->

					<template #popper="{ shown, show }">
						<div
							:class="{
								'bg-base-100 rounded-lg shadow-lg mt-1 w-80 p-4': actionExists,
								'w-108': actionExists && ['externalRequest', 'sendMessage', 'dataCollection'].includes(action.type.key),
							}"
						>
							<!--				<div v-if="actionExists && !showSummaryBelowActionName" :ref="'actionSummary_' + action.uuid" />-->
							<!--					<template v-if="actionExists && !hideSummary">-->
							<!--						<NodeSummaryRenderer :node="action" />-->
							<!--						<div class="divider my-4" />-->
							<!--					</template>-->
							<NodeRenderer
								v-if="showSummaryBelowActionName || (shown && actionExists)"
								:node="action"
								:hide-close-action="true"
							/>
						</div>
					</template>
				</CustomDropdown>
			</div>
		</div>
		<a
			v-if="showRemoveButton"
			href="javascript:"
			@click="removeAction"
			type="button"
			class="block flex-none link text-xs"
		>
			<i class="fa fa-times link-icon" />
		</a>
	</div>
	<CustomDropdown ref="placeholderDropdown" />
	<div v-if="showAddAction">
		<AddAction
			ref="addActionRef"
			key="addActionInCloseAction"
			@addNode="addAction"
			:isResultAction="true"
			:simplifiedList="simplifiedList"
		>
			<template #triggerButton>
				<slot name="triggerButton">
					<button class="btn btn-soft btn-xs" type="button">
						<i class="fa fa-cog"></i>
					</button>
				</slot>
			</template>

			<template v-if="$slots.additionalAction" #additionalAction>
				<slot name="additionalAction" />
			</template>

			<template #trailingAdditionalAction>
				<li class="menu-item my-2">
					<CustomDropdown ref="trailingAdditionalActionDropdown" container="#appPage" placement="right">
						<a class="block">
							<span class="flex items-center gap-2 whitespace-nowrap">
								<i class="fa fa-cogs" />
								{{ $t('components.flow.addNodePartials.addActionRenderer.selfNode.title') }}
							</span>
							<span class="text-base-content text-xs break-words opacity-70">
								{{ $t('components.flow.addNodePartials.addActionRenderer.selfNode.description') }}
							</span>
						</a>
						<template #popper="{ shown }">
							<div class="menu bg-base-100 rounded-lg shadow-lg mt-1">
								<div class="menu-title">
									{{ $t('components.flow.addNodePartials.addActionRenderer.selfNode.description') }}
								</div>
								<ul class="w-auto min-w-max">
									<li
										v-for="(node, i) in flowStore.flow.orderedNodes.filter((n) => n.type.key !== 'trigger')"
										:key="node.uuid"
										class="menu-item my-2"
									>
										<button type="button" @click.prevent="addEdge(node.uuid)" class="block py-3">
											<span class="flex items-center gap-2 whitespace-nowrap">
												#{{ node.number }}
												<NodeTypeBadge :nodeType="node.type" show-label />
												{{ node.name }}
											</span>
										</button>
									</li>
								</ul>
							</div>
						</template>
					</CustomDropdown>
				</li>
			</template>
		</AddAction>
	</div>
</template>
<script>
import AddNodeRenderer from '~/components/Flow/AddNodePartials/AddNodeRenderer.vue'
import { Node } from '~/models/Flow/Node.js'
import NodeSummaryRenderer from '~/components/Flow/Node/NodeSummaryRenderer.vue'
import NodeTypeBadge from '~/components/Flow/NodeTypeBadge.vue'
import CustomDropdown from '~/components/GlobalComponents/CustomDropdown.vue'

export default {
	props: {
		action: {
			type: Node,
			default: null,
		},
		showSummaryBelowActionName: {
			type: Boolean,
			default: false,
		},
		showRemoveButton: {
			type: Boolean,
			default: true,
		},
		wrapperClass: {
			type: String,
			default: 'ml-auto w-full',
		},
		addActionRendererTitleClass: {
			type: String,
			default: '',
		},
		simplifiedList: {
			type: Boolean,
			default: false,
		},
	},
	components: {
		CustomDropdown,
		NodeTypeBadge,
		NodeSummaryRenderer,
		AddNodeRenderer,
		AddAction: defineAsyncComponent(() => import('~/components/Flow/AddNodePartials/AddAction.vue')),
		NodeRenderer: defineAsyncComponent(() => import('~/components/Flow/Node/NodeRenderer.vue')),
	},
	setup() {
		return {
			flowStore: useFlowStore(),
		}
	},
	data() {
		return {
			actionUuid: this.action?.uuid ?? null, // provide'daki summaryRef reactivity için
			showAddAction: true,
		}
	},
	watch: {
		action: {
			handler(newVal) {
				this.$nextTick(() => {
					this.actionUuid = newVal?.uuid ?? null
				})
			},
			deep: true,
		},
	},
	computed: {
		actionExists() {
			const actionExists = !!(this.action && this.action.type && this.action.type.key)
			if (actionExists) {
				setTimeout(() => {
					this.showAddAction = false
				}, 300)
			} else {
				this.showAddAction = true
			}
			return actionExists
		},
		actionIsMainNode() {
			const mainNodesUuid = this.flowStore.flow.orderedNodes.map((n) => n.uuid)
			// const toNodesUuid = this.action.toNodes.map((n) => n.uuid)
			return mainNodesUuid.includes(this.action.uuid)
			// return toNodesUuid.some((uuid) => mainNodesUuid.includes(uuid))
		},
		// hideSummary() {
		// 	return ['sendMessage', 'addTag', 'removeTag'].includes(this.action?.type?.key)
		// },
	},
	emits: ['create:action', 'delete:action', 'add:edge'],
	methods: {
		test() {
			const toNodesUuid = this.action.toNodes.map((n) => n.uuid)
			const fromNodesUuid = this.action.fromNodes.map((n) => n.uuid)
			consoleLog('CloseAction - test method called', toNodesUuid, fromNodesUuid, toNodesUuid.includes(fromNodesUuid[0]))
		},
		hideDropdown() {
			this.$refs.dropdown?.hide()
			this.$refs.trailingAdditionalActionDropdown?.hide()
			this.$refs.addActionRef?.hideDropdown()
		},
		showDropdown() {
			this.$refs.dropdown?.show()
			this.$refs.placeholderDropdown?.show()
		},
		focus() {
			this.$nextTick(() => {
				consoleLog('Focusing dropdown button')
				setTimeout(() => {
					this.$refs.dropdown?.show()
					this.$refs.dropdownButton?.focus()
				}, 100)
			})
		},
		addAction(newNode) {
			consoleLog('CloseAction - addAction called with newNode:', newNode)
			this.$emit('create:action', newNode)
			this.$nextTick(() => {
				setTimeout(() => {
					this.focus()
				}, 100)
			})
		},
		removeAction() {
			if (this.actionIsMainNode) {
				this.action.fromEdges
					.filter((e) => e.guard !== null)
					.forEach((e) => {
						this.flowStore.flow.removeEdge(e)
					})

				return
			}
			if (this.action?.isSingle) {
				this.$emit('delete:action')
			} else {
				this.flowStore.flow.removeNode(this.action)
			}
		},
		addEdge(targetNodeUuid) {
			this.$refs.placeholderDropdown.show()
			this.$emit('add:edge', targetNodeUuid)
		},
	},
}
</script>
