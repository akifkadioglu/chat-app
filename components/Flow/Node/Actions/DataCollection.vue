<template>
	<div>
		<div class="space-y-3 max-w-108 mx-auto">
			<!-- Message Content -->
			<div class="pl-8">
				<label class="text-sm font-medium mb-2 block">
					{{ $t('components.flow.node.actions.dataCollection.message') }}
				</label>
				<TextMessage :content="messageContent" :node="node" hideButtons />
			</div>

			<div class="flex justify-between items-center">
				<div class="gap-2">
					<span class="text-sm font-medium">{{ $t('components.flow.node.actions.dataCollection.replyType') }}</span>

					<MessageBubble inbound class="block ml-2 h-auto">
						<CustomDropdown ref="customDropdown" placement="bottom-start" container="#appPage">
							<button class="flex items-center text-info-content">
								<span class="underline text-sm text-nowrap">
									{{ getReplyTypeLabel(node.config.replyType || 'text') }}
								</span>
								<i class="fa fa-chevron-down ml-2 text-xs opacity-80"></i>
							</button>

							<template #popper>
								<div class="rounded-lg shadow-lg p-2 menu w-56">
									<button
										@click="selectReplyType('text')"
										class="menu-item flex items-center px-4 py-2 text-sm w-full text-left rounded"
									>
										{{ $t('components.flow.node.actions.dataCollection.replyTypes.text') }}
									</button>

									<button
										@click="selectReplyType('email')"
										class="menu-item flex items-center px-4 py-2 text-sm w-full text-left rounded"
									>
										{{ $t('components.flow.node.actions.dataCollection.replyTypes.email') }}
									</button>

									<button
										@click="selectReplyType('phone')"
										class="menu-item flex items-center px-4 py-2 text-sm w-full text-left rounded"
									>
										{{ $t('components.flow.node.actions.dataCollection.replyTypes.phone') }}
									</button>

									<button
										@click="selectReplyType('number')"
										class="menu-item flex items-center px-4 py-2 text-sm w-full text-left rounded"
									>
										{{ $t('components.flow.node.actions.dataCollection.replyTypes.number') }}
									</button>

									<button
										@click="selectReplyType('url')"
										class="menu-item flex items-center px-4 py-2 text-sm w-full text-left rounded"
									>
										{{ $t('components.flow.node.actions.dataCollection.replyTypes.url') }}
									</button>

									<button
										@click="selectReplyType('date')"
										class="menu-item flex items-center px-4 py-2 text-sm w-full text-left rounded"
									>
										{{ $t('components.flow.node.actions.dataCollection.replyTypes.date') }}
									</button>

									<button
										@click="selectReplyType('datetime')"
										class="menu-item flex items-center px-4 py-2 text-sm w-full text-left rounded"
									>
										{{ $t('components.flow.node.actions.dataCollection.replyTypes.datetime') }}
									</button>

									<button
										@click="selectReplyType('image')"
										class="menu-item flex items-center px-4 py-2 text-sm w-full text-left rounded"
									>
										{{ $t('components.flow.node.actions.dataCollection.replyTypes.image') }}
									</button>

									<button
										@click="selectReplyType('multiple_choice')"
										class="menu-item flex items-center px-4 py-2 text-sm w-full text-left rounded"
									>
										{{ $t('components.flow.node.actions.dataCollection.replyTypes.multiple_choice') }}
									</button>
								</div>
							</template>
						</CustomDropdown>
					</MessageBubble>
				</div>

				<div class="flex justify-end items-center gap-2">
					<label class="text-sm font-medium block">
						{{ $t('components.flow.node.actions.dataCollection.saveTo') }}
					</label>
					<FieldSelector
						:chat-account="flowStore.flow.chatAccount"
						:exclude-types="[fieldTypes.BOOL, fieldTypes.TAG]"
						@fieldSelected="selectField"
					>
						<template #triggerButton>
							<button class="btn btn-soft btn-sm">
								<i class="fa fa-database mr-2"></i>
								<span class="truncate">
									{{
										node.config?.contactField?.key
											? contactFieldName
											: $t('components.flow.node.actions.dataCollection.selectField')
									}}
								</span>
							</button>
						</template>
					</FieldSelector>
				</div>
			</div>

			<!-- Multiple Choice Options -->
			<div v-if="node.config.replyType === 'multiple_choice'" class="mt-4 space-y-2">
				<div class="flex items-center justify-between">
					<label class="text-xs font-medium text-muted">
						{{ $t('components.flow.node.actions.dataCollection.choiceOptions') }}
					</label>
					<button
						@click="addOption"
						:disabled="node.config.options.length >= 10"
						class="btn btn-xs btn-ghost gap-1"
						:class="{ 'btn-disabled': node.config.options.length >= 10 }"
					>
						<i class="fa fa-plus text-xs"></i>
						{{ $t('components.flow.node.actions.dataCollection.addOption') }}
						<span v-if="node.config.options.length >= 10" class="text-xs opacity-60">
							{{ $t('components.flow.node.actions.dataCollection.maxOptions') }}
						</span>
					</button>
				</div>

				<div v-if="node.config.options && node.config.options.length > 0" class="space-y-2">
					<QuickReplyItem
						v-for="(reply, index) in node.config.options"
						:key="reply.uuid"
						:reply="reply"
						:actionNode="getActionNode(reply.payload)"
						@remove="removeOption(index)"
						@addAction="addActionToOption"
						@addEdge="addEdgeToOption"
					/>

					<!--					<div-->
					<!--						v-for="(option, index) in node.config.options"-->
					<!--						:key="index"-->
					<!--						class="flex items-center gap-2 bg-base-200 rounded-lg p-2"-->
					<!--					>-->
					<!--						<span class="text-xs font-medium text-base-content/50 w-6">{{ index + 1 }}</span>-->
					<!--						<input-->
					<!--							v-model="node.config.options[index].title"-->
					<!--							type="text"-->
					<!--							:placeholder="$t('components.flow.node.actions.dataCollection.buttonTextPlaceholder')"-->
					<!--							maxlength="20"-->
					<!--							class="input input-sm input-bordered flex-1"-->
					<!--						/>-->
					<!--						<button @click="removeOption(index)" class="btn btn-sm btn-ghost btn-square text-error hover:bg-error/10">-->
					<!--							<i class="fa fa-trash text-xs"></i>-->
					<!--						</button>-->
					<!--					</div>-->
				</div>

				<div v-else class="text-center py-3 text-xs text-base-content/50">
					{{ $t('components.flow.node.actions.dataCollection.noOptionsAdded') }}
				</div>
			</div>
		</div>

		<div class="text-xs text-base-content/60 mt-6">
			<span class="font-medium">{{ $t('components.flow.node.actions.dataCollection.note') }}</span>
			{{ $t('components.flow.node.actions.dataCollection.automationPausesNote') }}
		</div>

		<!-- Advanced -->
		<Collapse class="bg-base-200 mt-4" :show-arrow="true">
			<template #title>{{ $t('components.flow.node.actions.dataCollection.advanced') }}</template>

			<div class="space-y-4">
				<!-- Expiration Settings -->
				<div class="form-control">
					<div class="mb-2">
						<div class="label pb-1">
							<span class="label-text text-xs font-medium">
								<i18n-t keypath="components.flow.node.actions.dataCollection.ifUserWontReply">
									<template #minutes>
										<NumberStepper v-model="node.config.expireMinutes" :min="1" :max="1440" size="xs" />
									</template>
								</i18n-t>
							</span>
						</div>
					</div>
					<div class="flex items-center gap-1">
						<label class="label pt-1">
							<span class="label-text text-xs font-medium">
								{{ $t('components.flow.node.actions.dataCollection.nextStepAfterExpiration') }}
							</span>
						</label>
						<CloseAction
							ref="addExpiredNodeInDataCollection"
							:action="node.guardNode('expired')"
							:showSummaryBelowActionName="false"
							@create:action="addExpiredNode"
							@add:edge="addExpiredEdge"
						>
							<template #triggerButton>
								<button class="btn btn-xs btn-ghost btn-outline w-full">
									{{ $t('components.flow.node.actions.dataCollection.chooseNextStep') }}
								</button>
							</template>
						</CloseAction>
					</div>
				</div>

				<div class="divider my-1"></div>

				<!-- Retry Settings -->
				<div class="form-control">
					<div class="label pb-1">
						<span class="label-text text-xs font-medium">
							<i18n-t keypath="components.flow.node.actions.dataCollection.timesOnInvalidReply">
								<template #count>
									<NumberStepper v-model="node.config.retryInvalidAttempts" :min="0" :max="10" size="xs" />
								</template>
							</i18n-t>
						</span>
					</div>
				</div>
			</div>
		</Collapse>

		<div v-if="isMainNode" class="py-4 border-t border-t-base-content/10 mt-4 flex flex-col items-end">
			<div class="italic text-sm mb-2">{{ $t('components.flow.node.actions.dataCollection.ifResponseNotValid') }}</div>
			<CloseAction
				ref="addInvalidReplyNode"
				:action="node.guardNode('invalidReply')"
				:showSummaryBelowActionName="true"
				@create:action="addInvalidReplyNode"
				@add:edge="addInvalidReplyEdge"
			>
				<template #triggerButton>
					<button class="btn btn-soft btn-transition">
						<i class="fa fa-plus" />
						{{ $t('components.flow.node.actions.dataCollection.ifNotValid') }}
					</button>
				</template>
			</CloseAction>
		</div>
	</div>
</template>

<script>
import TextMessage from '~/components/Flow/Node/Actions/SendMessagePartials/TextMessage.vue'
import { useFlowStore } from '~/stores/flow'
import CloseAction from '~/components/Flow/Node/CloseAction.vue'
import Collapse from '~/components/GlobalComponents/Collapse.vue'
import { conditionMetadata, fieldTypes, triggerTypes } from '~/models/Flow/utils/utils.js'
import FieldSelector from '~/components/Flow/Node/Conditions/FieldSelector.vue'
import { v4 } from 'uuid'
import { Node } from '~/models/Flow/Node.js'
import MessageBubble from '~/components/Flow/MessageBubble.vue'
import CustomDropdown from '~/components/GlobalComponents/CustomDropdown.vue'
import NumberStepper from '~/components/GlobalComponents/NumberStepper.vue'
import { Trigger } from '~/models/Flow/Trigger.ts'
import QuickReplyItem from '~/components/Flow/Node/Actions/SendMessagePartials/QuickReplyItem.vue'

export default {
	components: {
		QuickReplyItem,
		CustomDropdown,
		MessageBubble,
		FieldSelector,
		Collapse,
		TextMessage,
		CloseAction,
		NumberStepper,
	},
	props: {
		node: {
			type: Node,
			required: true,
		},
		isMainNode: {
			type: Boolean,
			default: false,
		},
	},
	setup() {
		return {
			flowStore: useFlowStore(),
		}
	},
	data() {
		// Initialize default values
		// this.node.config.replyType = this.node.config.replyType || 'text'
		// this.node.config.contactField = this.node.config.contactField || null
		// this.node.config.message = this.node.config.message || {
		// 	type: 'text',
		// 	text: '',
		// 	buttons: [],
		// }
		// this.node.config.options = this.node.config.options || []
		// this.node.config.expireMinutes = this.node.config.expireMinutes || 30
		// this.node.config.retryInvalidAttempts = this.node.config.retryInvalidAttempts || 3

		return {
			showFieldSelector: true,
		}
	},
	computed: {
		fieldTypes() {
			return fieldTypes
		},
		messageContent() {
			return this.node.config.message
		},
		contactFieldName() {
			const key = this.node.config?.contactField?.key
			if (key?.startsWith('custom.')) {
				return key.slice(key.indexOf('.') + 1)
			}
			return this.$t(`components.flow.node.conditions.fields.${key}.name`)
		},
	},
	mounted() {},
	methods: {
		getReplyTypeLabel(type) {
			const labels = {
				text: this.$t('components.flow.node.actions.dataCollection.replyTypes.text'),
				email: this.$t('components.flow.node.actions.dataCollection.replyTypes.email'),
				phone: this.$t('components.flow.node.actions.dataCollection.replyTypes.phone'),
				number: this.$t('components.flow.node.actions.dataCollection.replyTypes.number'),
				url: this.$t('components.flow.node.actions.dataCollection.replyTypes.url'),
				date: this.$t('components.flow.node.actions.dataCollection.replyTypes.date'),
				datetime: this.$t('components.flow.node.actions.dataCollection.replyTypes.datetime'),
				image: this.$t('components.flow.node.actions.dataCollection.replyTypes.image'),
				multiple_choice: this.$t('components.flow.node.actions.dataCollection.replyTypes.multiple_choice'),
			}
			return labels[type] || type
		},
		selectReplyType(type) {
			this.node.config.replyType = type

			// Otomatik field mapping
			if (type === 'email') {
				this.node.config.contactField = conditionMetadata.email
			} else if (type === 'phone') {
				this.node.config.contactField = conditionMetadata.phone
			} else if (type === 'text') {
				this.node.config.contactField = conditionMetadata.first_name
			} else if (type === 'last_name') {
				this.node.config.contactField = conditionMetadata.last_name
			} else if (type === 'number') {
				this.node.config.contactField = null
			} else if (type === 'custom') {
				this.node.config.contactField = null
			}

			this.$refs.customDropdown.hide()
		},
		addOption() {
			if (this.node.config.options.length >= 10) {
				return
			}
			const guard = v4()
			this.node.config.options.push({ uuid: v4(), title: '', payload: guard })
			this.node.addTrigger(
				new Trigger({
					type: triggerTypes.quickReply,
					config: {
						postback: guard,
					},
				}),
			)
		},
		removeOption(index) {
			this.node.config.options.splice(index, 1)
		},
		addInvalidReplyNode(node, fromNode = this.node) {
			this.flowStore.flow.addNode(node, fromNode, 'invalidReply')
		},
		addExpiredNode(node, fromNode = this.node) {
			this.flowStore.flow.addNode(node, fromNode, 'expired')
		},
		addInvalidReplyEdge(toNodeUuid) {
			this.flowStore.flow.addEdge(this.node, this.flowStore.flow.getNodeByUuid(toNodeUuid), 'invalidReply')
		},
		addExpiredEdge(toNodeUuid) {
			this.flowStore.flow.addEdge(this.node, this.flowStore.flow.getNodeByUuid(toNodeUuid), 'expired')
		},
		selectField(field) {
			this.node.config.contactField = field
			this.$refs.selamiDropdown?.show()
			this.$refs.selamiButton?.focus()

			setTimeout(() => {
				this.showFieldSelector = false
				this.$nextTick(() => {
					this.showFieldSelector = true
				})
			}, 100)
		},
		addActionToOption({ action, guard }) {
			action.isSingle = true
			this.flowStore.flow.addNode(action, this.node, guard)
		},
		addEdgeToOption({ toNodeUuid, guard }) {
			const toNode = this.flowStore.flow.getNodeByUuid(toNodeUuid)
			if (toNode) {
				this.flowStore.flow.addEdge(this.node, toNode, guard)
			}
		},

		getActionNode(guard) {
			if (!guard) return null
			const edge = this.flowStore.flow.edges.find((e) => e.guard === guard)
			return edge?.toNode ?? null
		},
	},
}
</script>
