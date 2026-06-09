<template>
	<div>
		<!-- Textarea Container with Floating Variables -->
		<div
			class="relative border overflow-hidden rounded-lg break-after-all"
			:class="[
				{
					'rounded-b-none': !hideButtons,
					'border-error bg-error-content/40': showValidation && isTextLengthOverLimit,
					'border-base-300 bg-muted': !showValidation || !isTextLengthOverLimit,
				},
				textareaClasses,
			]"
		>
			<TextareaAutoSize
				ref="textarea"
				v-model="contentField"
				:allowEdit="!readOnly"
				:class="{ 'rounded-b-none': !hideButtons }"
				:max="max"
				:min-height="minTextareaHeight"
				:placeholder="placeholder || $t('components.flow.node.actions.sendMessagePartials.textMessage.placeholder')"
				class="text-sm pr-4 mb-5"
				@caret-change="onCaretChange"
			/>
			<!-- Floating Variables Dropdown - Sağ Alt Köşe -->
			<slot name="action">
				<div v-if="!readOnly" class="absolute bottom-2 right-2 flex items-center gap-2">
					<span
						v-if="showValidation"
						class="text-xs"
						:class="{ 'text-error': isTextLengthOverLimit, 'text-subtle': !isTextLengthOverLimit }"
					>
						{{ actualCharCount }}/{{ charLimit }}
					</span>
					<FieldSelector
						:chat-account="flowStore.flow.chatAccount"
						:exclude-types="[fieldTypes.BOOL, fieldTypes.DATE, fieldTypes.TAG]"
						@fieldSelected="insertVariableAndClose($event.key)"
					>
						<template #triggerButton>
							<button class="btn btn-xs bg-base-100 btn-transition shadow-lg hover:bg-base-100">
								<span class="truncate">{...}</span>
							</button>
						</template>
					</FieldSelector>
				</div>
			</slot>
		</div>

		<!-- Message Buttons -->
		<template v-if="!hideButtons">
			<div
				class="border border-t-0 border-base-300 divide-y divide-base-300"
				:class="{
					'rounded-b-lg': buttonCount === content.buttons.length,
				}"
			>
				<TextMessageButton
					v-if="consentButton"
					:actionNode="(node?.toEdges ?? []).find((edge) => edge.guard === consentButton.guard)?.toNode || null"
					:allowEdit="!readOnly"
					:button="consentButton"
					:simplifiedActionList="simplifiedActionList"
					@addAction="addTrigger"
					@removeButton="removeButton(consentButton)"
					@addEdge="addEdge"
					@removeTriggerByPostback="removeTriggerByPostback"
				/>
				<TextMessageButton
					v-for="(button, index) in nonConsentButtons ?? []"
					:key="index"
					ref="textMessageButtons"
					:actionNode="(node?.toEdges ?? []).find((edge) => edge.guard === button.guard)?.toNode || null"
					:allowEdit="!readOnly"
					:button="button"
					:simplifiedActionList="simplifiedActionList"
					@addAction="addTrigger"
					@addEdge="addEdge"
					@removeButton="removeButton(button)"
					@removeTriggerByPostback="removeTriggerByPostback"
				/>
				<!--					:removable="isButtonRemovable(button)"-->
				<!--					:showCloseActionsButtonsRemoveButton="showCloseActionsButtonsRemoveButton(button)"-->
			</div>
			<!-- $emit('addActionToButton', $event) -->
			<!-- $emit('addEdgeToButton', $event) -->

			<!-- Add Button -->
			<div v-if="nonConsentButtons.length < dynamicButtonLimit">
				<button class="w-full btn btn-outline btn-primary border-dashed rounded-lg rounded-t-none" @click="addButton">
					<i class="fa fa-plus text-sm"></i>
					{{ $t('components.flow.node.actions.sendMessagePartials.textMessage.addButton') }}
				</button>
			</div>
		</template>
	</div>
</template>

<script>
import TextareaAutoSize from '~/components/GlobalComponents/TextareaAutoSize.vue'
import TextMessageButton from '~/components/Flow/Node/Actions/SendMessagePartials/TextMessageButton.vue'
import FieldSelector from '~/components/Flow/Node/Conditions/FieldSelector.vue'
import { fieldTypes, nodeTypes, triggerTypes } from '~/models/Flow/utils/utils.js'
import { v4 } from 'uuid'
import { Trigger } from '~/models/Flow/Trigger.ts'
import { Node } from '~/models/Flow/Node.ts'
import emojiRegex from 'emoji-regex'

export default {
	components: { FieldSelector, TextMessageButton, TextareaAutoSize },
	props: {
		node: {
			type: Node,
			default: null,
		},
		minTextareaHeight: {
			type: String,
			default: '80px',
		},
		field: {
			type: String,
			default: 'text',
		},
		content: {
			type: Object,
			required: true,
		},
		hideButtons: {
			type: Boolean,
			default: false,
		},
		lockedButton: {
			type: Boolean,
			default: false,
		},
		buttonCount: {
			type: Number,
			default: 3,
		},
		placeholder: {
			type: String,
		},
		max: {
			type: Number,
		},
		readOnly: {
			type: Boolean,
			default: false,
		},
		simplifiedActionList: {
			type: Boolean,
			default: false,
		},
		textareaClasses: {
			type: String,
			default: '',
		},
		charLimit: {
			type: Number,
			default: 1000,
		},
		showValidation: {
			type: Boolean,
			default: true,
		},
	},
	setup() {
		return {
			flowStore: useFlowStore(),
		}
	},
	emits: ['update:modelValue', 'removeButton', 'addActionToButton', 'addEdgeToButton'],
	computed: {
		contentField: {
			get() {
				return this.content?.[this.field]
			},
			set(value) {
				this.content[this.field] = value
			},
		},
		dynamicButtonLimit() {
			let maxButtonCount = 3
			if (this.consentButton) {
				return 0
			}
			if (this.node.type.key === nodeTypes.commentActions.sendPrivateReply.key) {
				maxButtonCount = 2
			}
			return Math.min(maxButtonCount, this.buttonCount)
		},
		nonConsentButtons() {
			return this.content.buttons?.filter((b) => !b.consentButton)
		},
		consentButton() {
			return this.content.buttons.find((b) => b.consentButton)
		},
		actualCharCount() {
			if (!this.contentField) {
				return 0
			}
			const igUsernameCount = this.contentField?.split('{{ig.username}}').length - 1
			const regex = emojiRegex()

			const emojis = this.contentField.match(regex) || []
			const emojiCharCount = emojis.reduce((sum, emoji) => sum + emoji.length, 0)

			const textWithoutEmojis = this.contentField.replace(regex, '')

			return textWithoutEmojis.length + emojiCharCount + igUsernameCount * 15
		},
		isTextLengthOverLimit() {
			return this.actualCharCount > this.charLimit
		},
	},
	data() {
		this.content.buttons = this.content?.buttons ?? []
		this.contentField = this.contentField ?? ''

		return {
			fieldTypes,
			// hideButtons: true,
			caretPosition: 0,
			quickVariables: [
				{
					key: 'contact.name',
					label: this.$t('components.flow.node.actions.sendMessagePartials.textMessage.variables.name'),
				},
				{
					key: 'contact.phone',
					label: this.$t('components.flow.node.actions.sendMessagePartials.textMessage.variables.phone'),
				},
				{
					key: 'contact.email',
					label: this.$t('components.flow.node.actions.sendMessagePartials.textMessage.variables.email'),
				},
				{
					key: 'contact.company',
					label: this.$t('components.flow.node.actions.sendMessagePartials.textMessage.variables.company'),
				},
				{
					key: 'flow.step',
					label: this.$t('components.flow.node.actions.sendMessagePartials.textMessage.variables.step'),
				},
				{
					key: 'date.now',
					label: this.$t('components.flow.node.actions.sendMessagePartials.textMessage.variables.date'),
				},
				{
					key: 'time.now',
					label: this.$t('components.flow.node.actions.sendMessagePartials.textMessage.variables.time'),
				},
			],
		}
	},
	methods: {
		onCaretChange(position) {
			this.caretPosition = position
		},
		insertVariable(variableKey) {
			const variable = `{{${variableKey}}}`
			const text = this.contentField ?? ''
			const beforeCaret = text.substring(0, this.caretPosition)
			const afterCaret = text.substring(this.caretPosition)

			// Boş satırları korumak için text'i dikkatli bir şekilde birleştir
			const newText = beforeCaret + variable + afterCaret

			// Vue'nun reactivity sistemini kullanarak text'i güncelle
			this.$nextTick(() => {
				this.contentField = newText
			})
			// focus ve caret pozisyonunu güncelle
			this.$nextTick(() => {
				const contenteditable = this.$refs.textarea
				contenteditable.focusin(this.caretPosition)
				// const newCaretPosition = beforeCaret.length + variable.length
				// this.$refs.textarea.setSelectionRange(newCaretPosition, newCaretPosition)
				// this.caretPosition = newCaretPosition
			})
		},
		insertVariableAndClose(variableKey) {
			this.insertVariable(variableKey)
			// Dropdown'u kapat
			if (document.activeElement) {
				document.activeElement.blur()
			}
		},
		addButton() {
			if (this.content.buttons.length < 3) {
				let guard = v4()
				// if (this.node.type.key === nodeTypes.commentActions.sendPrivateReply.key) {
				// 	guard = privateReplyGuard
				// }
				// let isConsentButton
				// if (this.node.type.key === nodeTypes.commentActions.sendPrivateReply.key && this.content.buttons.length === 0) {
				// isConsentButton = true
				// }

				let newButton
				// if (this.node.type.key === nodeTypes.commentActions.sendPrivateReply.key) {
				// 	newButton = defaultConfigs(this.$t).sendPrivateReply.buttons[0]
				// 	guard = newButton.guard
				// } else {
				newButton = {
					text: '',
					action: {},
					guard: guard,
					// consentButton: isConsentButton,
				}
				// }
				this.content.buttons.push(newButton)
				setTimeout(() => {
					const buttons = this.$refs.textMessageButtons
					const lastButton = buttons?.[buttons.length - 1]
					lastButton?.$refs?.addActionInTextMessageButton?.$refs?.addActionRef?.showDropdown()
				}, 200)
				consoleLog('Adding trigger for button', newButton, this.node)
				this.node.addTrigger(
					new Trigger({
						type: triggerTypes.postback,
						config: {
							postback: guard,
						},
					}),
				)
			}
		},
		removeButton(button) {
			if (button?.guard) {
				consoleLog('Removing edges for button', button, this.node.toEdges)
				this.flowStore.flow.removeEdge(this.node.toEdges.find((e) => e.guard === button.guard))
				this.removeTriggerByPostback(button)
			}
			this.content.buttons = this.content.buttons.filter((b) => b !== button)
		},
		removeTriggerByPostback(button) {
			this.node.removeTriggerByPostback(button.guard)
			delete button.guard
		},
		addTrigger({ action: newNode, guard }) {
			this.flowStore.flow.addNode(newNode, this.node, guard)
		},
		addEdge({ toNodeUuid, guard }) {
			consoleLog('addTrigger', toNodeUuid, guard)

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
	},
}
</script>
