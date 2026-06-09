<template>
	<div class="flex items-center flex-1 w-full truncate py-1">
		<input
			v-model="button.text"
			:readonly="!allowEdit"
			type="text"
			:placeholder="$t('components.flow.node.actions.sendMessagePartials.textMessageButton.placeholder')"
			maxlength="20"
			class="input input-sm mx-0.5 rounded-lg border-0 bg-transparent focus:bg-base-100 truncate text-base"
			style="flex: 1"
			ref="buttonTextInput"
		/>
		<div
			ref="actionButtons"
			class="flex items-center px-1 py-1 bg-muted rounded-lg my-px mx-px flex-shrink truncate overflow-hidden"
		>
			<div v-if="!!button.websiteLink" class="flex justify-center items-center">
				<CustomDropdown ref="websiteLinkDropdown" placement="left" container="#appPage" @hidden="closeUrlEditing">
					<button
						ref="websiteLinkButton"
						:class="{
							'': !button.url,
							'btn-error': !isButtonUrlValid(button.url) && button.url,
							'btn-success': isButtonUrlValid(button.url) && button.url,
						}"
						class="btn hover:text-base-200 btn-xs"
					>
						<i class="fa fa-link" />
					</button>
					<template #popper="{ hide }">
						<div class="bg-base-100 rounded-lg shadow-lg p-4 w-80">
							<div v-if="button.disableUrlEditing">
								<label class="label">
									<span class="label-text">
										{{ $t('components.flow.node.actions.sendMessagePartials.textMessageButton.url') }}
									</span>
								</label>
								<p class="break-all text-sm text-base-content/80">{{ button.url }}</p>
							</div>
							<div v-else class="form-control">
								<label class="label">
									<span class="label-text">
										{{ $t('components.flow.node.actions.sendMessagePartials.textMessageButton.url') }}
									</span>
								</label>
								<div v-if="!allowUrlEdit && button.url" class="flex items-center justify-between mb-1">
									<div class="truncate pr-1" v-if="button.url">{{ button.url }}</div>
									<button class="btn btn-soft btn-info btn-sm" @click="openUrlEditing">
										<i class="fa fa-edit" />
									</button>
								</div>
								<div v-else>
									<div class="relative flex items-center gap-1">
										<input
											v-model="urlInput"
											@keydown.enter="saveUrl"
											type="url"
											:placeholder="
												$t('components.flow.node.actions.sendMessagePartials.textMessageButton.urlPlaceholder')
											"
											class="input input-bordered w-full pr-12"
										/>
										<!--										@keyup.enter="closeDropdown"-->
										<div
											class="flex absolute top-0 h-full items-center z-10"
											:class="{
												'right-7': button.url,
												'right-1': !button.url,
											}"
										>
											<button
												@click="pasteUrl"
												class="btn btn-ghost btn-sm"
												:title="
													$t('components.flow.node.actions.sendMessagePartials.textMessageButton.pasteFromClipboard')
												"
											>
												<i class="fa fa-paste" />
											</button>
										</div>
										<button v-if="button.url" @click="closeUrlEditing">
											<i class="fa fa-redo" />
										</button>
									</div>
									<div>
										<button
											:disabled="!isButtonUrlValid(urlInput)"
											@click="saveUrl"
											class="mt-2 btn btn-soft btn-primary btn-transition btn-sm w-full"
										>
											<i class="fa fa-save" />
											{{ $t('components.flow.node.actions.sendMessagePartials.textMessageButton.saveButton') }}
										</button>
									</div>
								</div>
							</div>
						</div>
					</template>
				</CustomDropdown>
				<a
					href="javascript:"
					@click="removeWebSiteLink"
					v-if="!button.disableDeleting || (flowStore.flow.typeKey === 'diagram' && allowEdit)"
					type="button"
					class="block flex-none link text-xs"
				>
					<i class="fa fa-times link-icon" />
				</a>
			</div>

			<div v-else-if="button.consentButton" class="bg-info rounded-lg">
				<small class="text-info-content px-2">
					{{ $t('components.flow.node.actions.sendMessagePartials.textMessageButton.consentButtonLabel') }}
				</small>
			</div>
			<CloseAction
				v-if="showCloseAction && !button.consentButton"
				:action="actionNode"
				@create:action="addNodeToButton"
				@add:edge="addEdgeToButton"
				ref="addActionInTextMessageButton"
				:showRemoveButton="button.showRemoveButton"
				:simplifiedList="simplifiedActionList"
			>
				<!--				:showRemoveButton="showCloseActionsButtonsRemoveButton"-->
				<template #triggerButton>
					<button class="btn btn-soft btn-xs">
						<i class="fa fa-cog" />
					</button>
				</template>
				<template #additionalAction v-if="!button.consentButton">
					<li class="my-2">
						<button type="button" class="menu-item block py-3 w-full text-left" @click="addWebsiteLink">
							<i class="fa fa-link text-lg"></i>
							{{ $t('components.flow.node.actions.sendMessagePartials.textMessageButton.websiteUrl') }}
						</button>
					</li>
				</template>
			</CloseAction>
		</div>
		<button
			v-if="!button.disableDeleting || (flowStore.flow.typeKey === 'diagram' && allowEdit)"
			@click.stop="removeButton"
			class="btn btn-xs btn-link text-error/60 hover:text-error"
		>
			<i class="fa fa-trash text-xs" />
		</button>
	</div>
</template>
<script>
import AddAction from '~/components/Flow/AddNodePartials/AddAction.vue'
import CloseAction from '~/components/Flow/Node/CloseAction.vue'

import { Node } from '~/models/Flow/Node.js'
import { Clipboard } from '@capacitor/clipboard'
import CustomDropdown from '~/components/GlobalComponents/CustomDropdown.vue'

export default {
	components: {
		CustomDropdown,
		CloseAction,
		AddAction,
		NodeRenderer: defineAsyncComponent(() => import('~/components/Flow/Node/NodeRenderer.vue')),
	},
	props: {
		button: {
			type: Object,
			required: true,
		},
		actionNode: {
			type: Node,
			default: null,
		},
		allowEdit: {
			type: Boolean,
			default: true,
		},
		simplifiedActionList: {
			type: Boolean,
			default: false,
		},
	},
	emits: ['removeButton', 'addAction', 'addEdge', 'removeTriggerByPostback'],
	data() {
		return {
			urlInput: '',
			showCloseAction: true,
			allowUrlEdit: !this.button.url,
		}
	},
	watch: {
		'button.websiteLink': {
			handler() {
				consoleLog('button.websiteLink changed:', this.button.websiteLink)
				setTimeout(() => {
					this.showCloseAction = !this.button.consentButton && !this.button.websiteLink
				}, 300)
			},
			immediate: true,
		},
		'button.consentButton'() {
			consoleLog('button.consentButton changed:', this.button.consentButton)
			setTimeout(() => {
				this.showCloseAction = !this.button.consentButton && !this.button.websiteLink
			}, 300)
		},
	},
	setup() {
		return {
			flowStore: useFlowStore(),
		}
	},
	computed: {
		actionIsMainNode() {
			const mainNodesUuid = this.flowStore.flow.orderedNodes.map((n) => n.uuid)
			return mainNodesUuid.includes(this.actionNode.uuid)
		},
		isButtonUrlValid() {
			return (input) => {
				if (!input) return false
				const hasProtocol = input.startsWith('http://') || input.startsWith('https://')
				const withProtocol = hasProtocol ? input : `https://${input}`
				if (!URL.canParse(withProtocol)) return false
				const { hostname } = new URL(withProtocol)
				const parts = hostname.split('.')
				if (parts.length < 2) return false
				if (parts.some((p) => !p)) return false
				return parts.at(-1).length >= 2
			}
		},
	},
	mounted() {
		this.urlInput = this.button.url
	},
	methods: {
		addNodeToButton(newNode) {
			this.button.consentButton = false
			// this.button.guard = v4()
			this.button.websiteLink = false
			this.$emit('addAction', { action: newNode, guard: this.button.guard })
			this.$nextTick(() => {
				setTimeout(() => {
					this.$refs.addActionInTextMessageButton?.focus()
				}, 100)
			})
		},
		addEdgeToButton(toNodeUuid) {
			// this.button.guard = v4()
			this.button.websiteLink = false
			this.button.consentButton = false

			this.$refs.addActionInTextMessageButton?.showDropdown()

			this.$emit('addEdge', { toNodeUuid, guard: this.button.guard })

			// const flowStore = useFlowStore()
			// flowStore.flow.addEdge(this.actionNode, flowStore.flow.getNodeByUuid(toNodeUuid), this.button.guard)
		},
		removeButton() {
			if (this.actionNode && !this.actionIsMainNode) {
				this.flowStore.flow.removeEdge(this.actionNode.fromEdges.map((e) => e.guard === this.button.guard))
				this.flowStore.flow.removeNode(this.actionNode)
			}
			this.$emit('removeButton')
		},
		async pasteUrl() {
			consoleLog('Pasting URL from clipboard')
			const clipboard = await Clipboard.read()
			consoleLog('Pasted URL:', clipboard)
			this.button.url = clipboard.value
		},
		addWebsiteLink() {
			this.$refs.addActionInTextMessageButton.hideDropdown()

			if (this.button.guard) {
				//TODO :: remove etmeli miyiz trigger'ı emin değilim. Daha iyi bir gidiş yolu düşün
				//this.$emit('removeTriggerByPostback', this.button)
			}
			this.button.url = ''
			this.button.websiteLink = true
			this.$nextTick(() => {
				this.$refs.websiteLinkDropdown?.show()
			})
		},
		removeWebSiteLink() {
			this.button.url = ''
			this.button.websiteLink = false
			this.button.url = ''
		},
		closeDropdown() {
			// Dropdown otomatik olarak kapanır
			this.$refs.websiteLinkDropdown.hide()
		},
		saveUrl() {
			this.button.url = this.urlInput
			this.button.websiteLink = true
			this.$refs.websiteLinkDropdown.hide()
			this.closeUrlEditing()
		},
		closeUrlEditing() {
			if (!this.button.url) return
			this.$nextTick(() => {
				this.allowUrlEdit = false
			})
		},
		openUrlEditing() {
			this.urlInput = this.button.url
			this.allowUrlEdit = true
		},
	},
}
</script>
