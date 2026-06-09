<template>
	<div>
		<div class="relative">
			<i class="fa fa-search absolute left-2.5 top-1/2 transform -translate-y-1/2 text-base-content/50 text-sm" />
			<input
				ref="searchInput"
				type="text"
				v-model="searchQuery"
				:placeholder="$t('components.flow.addNodePartials.advancedNodeActions.searchPlaceholder')"
				class="input input-sm input-bordered w-full pl-8 bg-primary/5 border-primary/20 focus:border-primary text-sm"
			/>
		</div>
		<ul class="w-auto min-w-max">
			<template v-for="action in filteredActions" :key="action.key">
				<li :class="{ 'opacity-50 pointer-events-none': disabledActions.includes(action.key) }">
					<a @click.prevent="selectNodeType(action)" class="menu-item my-2 flex">
						<AddNodeRenderer :keyName="action.key" :showProBadge="action.needsPro" />
					</a>
				</li>
				<li
					v-for="child in actionChildren(action)"
					:key="child.key"
					:class="{ 'opacity-50 pointer-events-none': disabledActions.includes(action.key) }"
					class="ml-6"
				>
					<a
						@click.prevent="selectNodeType(action, child.presetContentType)"
						class="menu-item my-1 flex items-center gap-2 text-sm"
					>
						<i :class="child.icon" class="w-5 text-center text-base-content/70" />
						<span>{{ $t(child.labelKey) }}</span>
					</a>
				</li>
			</template>
			<li
				v-if="isSignatureVisible"
				:class="{ 'opacity-50 pointer-events-none': disabledActions.includes(nodeTypes.signature.key) }"
			>
				<a @click.prevent="selectNodeType(nodeTypes.signature)" class="menu-item my-2 flex">
					<AddNodeRenderer :keyName="nodeTypes.signature.key" />
				</a>
			</li>
		</ul>
		<!-- Add Condition -->
		<template v-if="showAddConditionButton">
			<div class="divider my-0" />
			<FieldSelector
				placement="right"
				@fieldSelected="handleFieldSelected"
				:hideSocialFields="hideConsentRequiredActions"
			>
				<template #triggerButton>
					<ul>
						<li>
							<a class="menu-item my-2 flex">
								<!--							<AddActionElement-->
								<!--								iconClass="fa fa-balance-scale"-->
								<!--								:title="$t('components.flow.addNodePartials.advancedNodeActions.fieldSelector.label')"-->
								<!--								descriptionPath="components.flow.addNodePartials.advancedNodeActions.fieldSelector.description"-->
								<!--							/>-->
								<AddNodeRenderer
									keyName="condition"
									:title="$t('components.flow.addNodePartials.advancedNodeActions.fieldSelector.label')"
									descriptionPath="components.flow.addNodePartials.advancedNodeActions.fieldSelector.description"
								/>
							</a>
						</li>
					</ul>
				</template>
			</FieldSelector>
		</template>

		<!-- Comment Actions -->
		<template v-if="showCommentActions">
			<div class="divider my-0" />
			<div class="menu-title">
				<span class="text-sm">{{ $t('components.flow.addNodePartials.addAction.commentActionsTitle') }}</span>
			</div>
			<ul class="w-auto min-w-max">
				<li
					v-for="action in filteredCommentActions"
					:key="action.key"
					:class="{ 'opacity-50 pointer-events-none': disabledActions.includes(action.key) }"
				>
					<a @click.prevent="selectNodeType(action)" class="menu-item my-2 flex">
						<AddNodeRenderer :keyName="action.key" :showProBadge="action.needsPro" />
					</a>
				</li>
			</ul>
		</template>
		<template v-if="$slots.trailingAdditionalAction">
			<div class="divider my-0"></div>
			<ul class="w-auto min-w-max">
				<slot name="trailingAdditionalAction" />
			</ul>
		</template>
	</div>
</template>
<script>
import AddNodeRenderer from '~/components/Flow/AddNodePartials/AddNodeRenderer.vue'
import { nodeTypes } from '~/models/Flow/utils/utils.ts'
import { Node } from '~/models/Flow/Node.ts'
import CustomDropdown from '~/components/GlobalComponents/CustomDropdown.vue'
import AddCondition from '~/components/Flow/AddNodePartials/AddCondition.vue'
import FieldSelector from '~/components/Flow/Node/Conditions/FieldSelector.vue'

export default {
	components: { FieldSelector, AddCondition, CustomDropdown, AddNodeRenderer },
	props: {
		hideConsentRequiredActions: {
			type: Boolean,
			default: false,
		},
		isResultAction: {
			type: Boolean,
			default: false,
		},
		showAddConditionButton: {
			type: Boolean,
			default: false,
		},
	},
	emits: ['addNode'],
	setup() {
		return {
			flowStore: useFlowStore(),
		}
	},
	data() {
		return {
			nodeTypes,
			searchQuery: '',
		}
	},
	mounted() {
		this.$nextTick(() => {
			this.$refs.searchInput?.focus()
		})
	},
	computed: {
		commentActions() {
			return Object.values(nodeTypes.commentActions)
		},
		showCommentActions() {
			return this.flowStore.flow.hasCommentTrigger
		},
		disabledActions() {
			const disabled = []
			if (this.hideConsentRequiredActions) {
				disabled.push(nodeTypes.actions.sendMessage.key)
			}

			if (this.isResultAction) {
				disabled.push(nodeTypes.actions.delay.key)
			}

			if (this.flowStore.flow.privateReplyUuid) {
				disabled.push(nodeTypes.commentActions.sendPrivateReply.key)
			}

			if (this.flowStore.flow.nodes.some((node) => node.type.key === nodeTypes.signature.key)) {
				disabled.push(nodeTypes.signature.key)
			}
			return disabled
		},
		actions() {
			return Object.values(nodeTypes.actions).filter((action) => {
				if (!this.isResultAction) {
					return action.key !== nodeTypes.actions.triggerFlow.key
				}
				return true
			})
		},
		filteredActions() {
			if (!this.searchQuery.trim()) return this.actions
			const query = this.searchQuery.toLowerCase().trim()
			return this.actions.filter((action) => {
				const title = this.$t(`components.flow.addNodePartials.addActionRenderer.${action.key}.title`).toLowerCase()
				const description = this.$t(
					`components.flow.addNodePartials.addActionRenderer.${action.key}.description`,
				).toLowerCase()
				const childMatches = (action.children || []).some((child) =>
					this.$t(child.labelKey).toLowerCase().includes(query),
				)
				return title.includes(query) || description.includes(query) || childMatches
			})
		},
		filteredCommentActions() {
			if (!this.searchQuery.trim()) return this.commentActions
			const query = this.searchQuery.toLowerCase().trim()
			return this.commentActions.filter((action) => {
				const title = this.$t(`components.flow.addNodePartials.addActionRenderer.${action.key}.title`).toLowerCase()
				const description = this.$t(
					`components.flow.addNodePartials.addActionRenderer.${action.key}.description`,
				).toLowerCase()
				return title.includes(query) || description.includes(query)
			})
		},
		isSignatureVisible() {
			if (!this.searchQuery.trim()) return true
			const query = this.searchQuery.toLowerCase().trim()
			const title = this.$t(
				`components.flow.addNodePartials.addActionRenderer.${nodeTypes.signature.key}.title`,
			).toLowerCase()
			const description = this.$t(
				`components.flow.addNodePartials.addActionRenderer.${nodeTypes.signature.key}.description`,
			).toLowerCase()
			return title.includes(query) || description.includes(query)
		},
	},
	methods: {
		handleFieldSelected(field) {
			this.$emit(
				'addNode',
				new Node({
					type: nodeTypes.conditions.comparison,
					config: {
						field: field,
						operator: null,
						value: null,
					},
				}),
			)
		},
		actionChildren(action) {
			if (!action.children) return []
			if (this.disabledActions.includes(action.key)) return []
			if (!this.searchQuery.trim()) return action.children
			const query = this.searchQuery.toLowerCase().trim()
			const title = this.$t(`components.flow.addNodePartials.addActionRenderer.${action.key}.title`).toLowerCase()
			const description = this.$t(
				`components.flow.addNodePartials.addActionRenderer.${action.key}.description`,
			).toLowerCase()
			if (title.includes(query) || description.includes(query)) return action.children
			return action.children.filter((child) => this.$t(child.labelKey).toLowerCase().includes(query))
		},
		selectNodeType(type, presetContentType = null) {
			if (this.disabledActions.includes(type.key)) {
				return
			}

			if (type.needsPro && !this.flowStore.flow.chatAccount.subscribed) {
				this.$emitter.emit('showUpgradeModal', {
					chatAccount: this.flowStore.flow.chatAccount,
					feature: 'addAction',
				})
				return
			}
			const config = presetContentType ? { contents: [{ type: presetContentType }] } : {}
			this.$emit(
				'addNode',
				new Node(
					{
						type: type,
						config,
					},
					null,
					this.$t,
				),
			)
		},
	},
}
</script>

<style scoped></style>
