<template>
	<div class="space-y-4">
		<!-- Header -->
		<div class="flex justify-between items-center">
			<h2 class="text-lg">{{ $t('components.flow.node.actions.sendMessage.title') }}</h2>
		</div>
		<div class="space-y-12 max-w-116 mx-auto">
			<!-- Edit Mode - Message Content -->
			<div class="space-y-3">
				<div
					v-for="(content, index) in messageContents"
					:key="content.id"
					:class="{ 'border-primary': draggedIndex === index }"
				>
					<!-- Content Header Bar -->
					<div class="flex items-center justify-between mb-1 w-full gap-2">
						<CustomDropdown :ref="`typeDropdown_${index}`" placement="bottom-start" container="#appPage">
							<button
								tabindex="0"
								type="button"
								class="btn btn-xs btn-ghost gap-2"
								:title="$t('components.flow.node.actions.sendMessage.changeContentType')"
							>
								<i :class="contentTypeIcon(content.type)"></i>
								<span class="text-xs font-medium">
									{{ $t(`components.flow.node.actions.sendMessage.contentTypes.${contentTypeLabelKey(content.type)}`) }}
								</span>
								<i class="fa fa-chevron-down text-[10px] opacity-60"></i>
							</button>

							<template #popper>
								<div class="menu bg-base-100 rounded-box p-2">
									<div
										v-for="option in contentTypeOptions"
										:key="option.value"
										tabindex="0"
										role="button"
										@click="changeContentType(index, option.value)"
										class="menu-item flex items-center gap-3 py-2 px-3 w-full text-left rounded"
										:class="{ 'bg-base-200': content.type === option.value }"
									>
										<i :class="option.icon" class="text-base w-5 text-center"></i>
										<div class="font-medium text-sm">
											{{ $t(`components.flow.node.actions.sendMessage.contentTypes.${option.labelKey}`) }}
										</div>
									</div>
								</div>
							</template>
						</CustomDropdown>
						<button
							@click="removeContent(index)"
							:disabled="messageContents.length === 1"
							class="btn btn-xs btn-ghost btn-square text-error/60 disabled:text-error/30 hover:text-error disabled:cursor-not-allowed"
							:class="{ 'btn-disabled': messageContents.length === 1 }"
							:title="$t('components.flow.node.actions.sendMessage.removeContent')"
						>
							<i class="fa fa-times"></i>
						</button>
					</div>
					<!-- Content Component -->
					<div class="w-full mb-3">
						<TextMessage v-if="content.type === 'text'" :content="content" :node="node" />
						<ImageMessage v-else-if="content.type === 'image'" :content="content" />
						<AudioMessage v-else-if="content.type === 'audio'" :content="content" />
						<VideoMessage v-else-if="content.type === 'video'" :content="content" />
						<FileMessage v-else-if="content.type === 'file'" :content="content" />
						<DynamicMessage v-else-if="content.type === 'dynamic'" :content="content" />
						<DelayMessage v-else-if="content.type === 'delay'" :content="content" />
						<GenericMessage v-else-if="content.type === 'generic'" :node="node" :content="content" />
					</div>
				</div>
			</div>

			<!-- Edit Mode - Quick Replies -->
			<div class="space-y-3">
				<button v-if="!hasQuickReplies" @click="addQuickReplies" class="btn btn-sm btn-outline">
					<i class="fa fa-plus mr-1" />
					{{ $t('components.flow.node.actions.sendMessage.addQuickReplies') }}
				</button>

				<div v-if="hasQuickReplies" class="flex items-baseline mt-4 pr-9">
					<QuickReply v-model="quickReplies" :sendMessageNode="node" @remove="removeQuickReplies" />
				</div>
			</div>

			<!-- Modern Add Content Section -->
			<div class="pt-4 mt-6">
				<h4 class="text-sm font-medium mb-3">{{ $t('components.flow.node.actions.sendMessage.addContent') }}</h4>

				<!-- Popular Content Types - Direct Buttons -->
				<div class="space-y-2 flex flex-col items-start">
					<template v-if="isMainNode">
						<button
							@click="addMessageContentDirect('text')"
							class="btn btn-outline btn-sm justify-start border-muted gap-2 h-auto py-3 w-64"
						>
							<i class="fa fa-font text-lg"></i>
							<span class="text-left flex-1">
								<span class="font-medium">{{ $t('components.flow.node.actions.sendMessage.textMessage') }}</span>
								<br />
								<span class="text-xs opacity-70">
									{{ $t('components.flow.node.actions.sendMessage.sendTextMessage') }}
								</span>
							</span>
						</button>

						<button
							@click="addMessageContentDirect('image')"
							class="btn btn-outline btn-sm justify-start border-muted gap-2 h-auto py-3 w-64"
						>
							<i class="fa fa-image text-lg"></i>
							<div class="text-left flex-1">
								<div class="font-medium">{{ $t('components.flow.node.actions.sendMessage.image') }}</div>
								<div class="text-xs opacity-70">{{ $t('components.flow.node.actions.sendMessage.sendImage') }}</div>
							</div>
						</button>

						<button
							@click="addMessageContentDirect('delay')"
							class="btn btn-outline btn-sm justify-start border-muted gap-2 h-auto py-3 w-64"
						>
							<i class="fa fa-clock text-lg"></i>
							<div class="text-left flex-1">
								<div class="font-medium">{{ $t('components.flow.node.actions.sendMessage.delay') }}</div>
								<div class="text-xs opacity-70">{{ $t('components.flow.node.actions.sendMessage.typingDelay') }}</div>
							</div>
						</button>
					</template>
					<!-- Others Dropdown -->
					<CustomDropdown ref="moreContentDropdown" placement="top" container="#appPage">
						<div
							tabindex="0"
							role="button"
							class="btn btn-outline btn-sm justify-start border-muted gap-2 h-auto py-3 w-64"
						>
							<i class="fa fa-ellipsis-h text-lg" />
							<div class="text-left flex-1">
								<div class="font-medium">{{ $t('components.flow.node.actions.sendMessage.moreContentTypes') }}</div>
								<div class="text-xs opacity-70">
									{{ $t('components.flow.node.actions.sendMessage.otherContentTypes') }}
								</div>
							</div>
						</div>

						<template #popper>
							<div class="menu bg-base-100 rounded-box p-2">
								<template v-if="!isMainNode">
									<div
										tabindex="0"
										role="button"
										@click="addMessageContentDirect('text')"
										class="menu-item flex items-center gap-3 py-3 px-4 w-full text-left rounded"
									>
										<i class="fa fa-font text-lg" />
										<div>
											<div class="font-medium">{{ $t('components.flow.node.actions.sendMessage.textMessage') }}</div>
											<div class="text-xs opacity-70">
												{{ $t('components.flow.node.actions.sendMessage.sendTextMessage') }}
											</div>
										</div>
									</div>

									<div
										tabindex="0"
										role="button"
										@click="addMessageContentDirect('image')"
										class="menu-item flex items-center gap-3 py-3 px-4 w-full text-left rounded"
									>
										<i class="fa fa-image text-lg" />
										<div>
											<div class="font-medium">{{ $t('components.flow.node.actions.sendMessage.image') }}</div>
											<div class="text-xs opacity-70">
												{{ $t('components.flow.node.actions.sendMessage.sendImage') }}
											</div>
										</div>
									</div>

									<div
										tabindex="0"
										role="button"
										@click="addMessageContentDirect('delay')"
										class="menu-item flex items-center gap-3 py-3 px-4 w-full text-left rounded"
									>
										<i class="fa fa-clock text-lg" />
										<div>
											<div class="font-medium">{{ $t('components.flow.node.actions.sendMessage.delay') }}</div>
											<div class="text-xs opacity-70">
												{{ $t('components.flow.node.actions.sendMessage.typingDelay') }}
											</div>
										</div>
									</div>
								</template>

								<div
									tabindex="0"
									role="button"
									@click="addMessageContentDirect('audio')"
									class="menu-item flex items-center gap-3 py-3 px-4 w-full text-left rounded"
								>
									<i class="fa fa-music text-lg" />
									<div>
										<div class="font-medium">{{ $t('components.flow.node.actions.sendMessage.audioMessage') }}</div>
										<div class="text-xs opacity-70">
											{{ $t('components.flow.node.actions.sendMessage.sendAudioMessage') }}
										</div>
									</div>
								</div>

								<div
									tabindex="0"
									role="button"
									@click="addMessageContentDirect('video')"
									class="menu-item flex items-center gap-3 py-3 px-4 w-full text-left rounded"
								>
									<i class="fa fa-video text-lg" />
									<div>
										<div class="font-medium">{{ $t('components.flow.node.actions.sendMessage.videoMessage') }}</div>
										<div class="text-xs opacity-70">{{ $t('components.flow.node.actions.sendMessage.sendVideo') }}</div>
									</div>
								</div>

								<div
									tabindex="0"
									role="button"
									@click="addMessageContentDirect('file')"
									class="menu-item flex items-center gap-3 py-3 px-4 w-full text-left rounded"
								>
									<i class="fa fa-file-pdf text-lg" />
									<div>
										<div class="font-medium">{{ $t('components.flow.node.actions.sendMessage.fileMessage') }}</div>
										<div class="text-xs opacity-70">{{ $t('components.flow.node.actions.sendMessage.sendFile') }}</div>
									</div>
								</div>

								<div
									tabindex="0"
									role="button"
									class="menu-item flex items-center gap-3 py-3 px-4 w-full text-left rounded"
									@click="addMessageContentDirect('generic')"
								>
									<!--									disabled-->
									<i class="fa fa-id-card text-lg" />
									<div>
										<div class="font-medium">{{ $t('components.flow.node.actions.sendMessage.cardMessage') }}</div>
										<div class="text-xs opacity-70">
											{{ $t('components.flow.node.actions.sendMessage.cardMessage') }}
										</div>
									</div>
								</div>

								<div
									tabindex="0"
									role="button"
									@click="addMessageContentDirect('dynamic')"
									class="menu-item flex items-center gap-3 py-3 px-4 w-full text-left rounded"
								>
									<i class="fa fa-sync-alt text-lg" />
									<div>
										<div class="font-medium">{{ $t('components.flow.node.actions.sendMessage.dynamicContent') }}</div>
										<div class="text-xs opacity-70">
											{{ $t('components.flow.node.actions.sendMessage.dynamicContentFromServer') }}
										</div>
									</div>
								</div>
							</div>
						</template>
					</CustomDropdown>
				</div>
			</div>
		</div>
		<!-- Preview Panel -->
		<!--		<SendMessagePreview-->
		<!--			v-else-->
		<!--			:message-contents="messageContents"-->
		<!--			:quick-replies="quickReplies"-->
		<!--			:has-quick-replies="hasQuickReplies"-->
		<!--		/>-->
	</div>
</template>

<script>
import TextMessage from './SendMessagePartials/TextMessage.vue'
import ImageMessage from './SendMessagePartials/ImageMessage.vue'
import AudioMessage from './SendMessagePartials/AudioMessage.vue'
import VideoMessage from './SendMessagePartials/VideoMessage.vue'
import FileMessage from './SendMessagePartials/FileMessage.vue'
import DynamicMessage from './SendMessagePartials/DynamicMessage.vue'
import DelayMessage from './SendMessagePartials/DelayMessage.vue'
import QuickReply from './SendMessagePartials/QuickReply.vue'
import GenericMessage from './SendMessagePartials/GenericMessage.vue'
// import SendMessagePreview from './SendMessagePartials/SendMessagePreview.vue'
import { triggerTypes } from '~/models/Flow/utils/utils.js'
import { Trigger } from '~/models/Flow/Trigger.js'
import { Node } from '~/models/Flow/Node.js'
import CustomDropdown from '~/components/GlobalComponents/CustomDropdown.vue'
import { v4 } from 'uuid'

export default {
	components: {
		CustomDropdown,
		GenericMessage,
		TextMessage,
		ImageMessage,
		AudioMessage,
		VideoMessage,
		FileMessage,
		DynamicMessage,
		DelayMessage,
		QuickReply,
		// SendMessagePreview,
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
		return {
			showPreview: false,
			draggedIndex: null,
			dragStartY: 0,
			contentTypeOptions: [
				{ value: 'text', icon: 'fa fa-font', labelKey: 'text' },
				{ value: 'image', icon: 'fa fa-image', labelKey: 'image' },
				{ value: 'audio', icon: 'fa fa-music', labelKey: 'audio' },
				{ value: 'video', icon: 'fa fa-video', labelKey: 'video' },
				{ value: 'file', icon: 'fa fa-file-pdf', labelKey: 'file' },
				{ value: 'generic', icon: 'fa fa-id-card', labelKey: 'card' },
				{ value: 'dynamic', icon: 'fa fa-sync-alt', labelKey: 'dynamic' },
				{ value: 'delay', icon: 'fa fa-clock', labelKey: 'delay' },
			],
		}
	},
	mounted() {
		if (this.messageContents.length === 0) {
			this.messageContents = [
				{
					type: 'text',
				},
			]
		}
	},
	watch: {
		// 'node.config.contents': {
		// 	handler() {
		// 		this.debouncedValidate(this.node, this.$t)
		// 	},
		// 	deep: true,
		// },
	},
	computed: {
		messageContents: {
			get() {
				return this.node.config.contents || []
			},
			set(value) {
				if (!this.node.config) this.node.config = {}
				this.node.config.contents = value
			},
		},
		quickReplies: {
			get() {
				return this.node.config.quickReplies || []
			},
			set(value) {
				if (!this.node.config) this.node.config = {}
				this.node.config.quickReplies = value
			},
		},
		hasQuickReplies() {
			return this.node.config.quickReplies && Object.keys(this.node.config.quickReplies).length > 0
		},
	},
	methods: {
		// debouncedValidate: debounce(function (node, t) {
		// 	this.node.validateNode(node, t)
		// }, 800),
		contentTypeIcon(type) {
			return this.contentTypeOptions.find((option) => option.value === type)?.icon || 'fa fa-font'
		},
		contentTypeLabelKey(type) {
			return this.contentTypeOptions.find((option) => option.value === type)?.labelKey || 'text'
		},
		changeContentType(index, newType) {
			if (!newType) return
			const contents = [...this.messageContents]
			if (contents[index]?.type === newType) {
				this.$refs[`typeDropdown_${index}`]?.[0]?.hide?.() || this.$refs[`typeDropdown_${index}`]?.hide?.()
				return
			}
			contents[index] = { ...contents[index], type: newType }
			this.messageContents = contents
			const ref = this.$refs[`typeDropdown_${index}`]
			if (Array.isArray(ref)) {
				ref[0]?.hide?.()
			} else {
				ref?.hide?.()
			}
		},
		addMessageContentDirect(type) {
			if (!type) return

			const newContent = {
				type: type,
			}

			this.messageContents = [...this.messageContents, newContent]

			// Dropdown'u kapat
			this.$refs.moreContentDropdown?.hide()
		},
		removeContent(index) {
			const contents = [...this.messageContents]
			contents.splice(index, 1)
			this.messageContents = contents
		},
		addQuickReplies() {
			const replies = [
				{
					uuid: v4(),
					content_type: 'text',
					title: this.$t('components.flow.node.actions.sendMessagePartials.quickReply.yes'),
					payload: v4(),
				},
				{
					uuid: v4(),
					content_type: 'text',
					title: this.$t('components.flow.node.actions.sendMessagePartials.quickReply.no'),
					payload: v4(),
				},
				{
					uuid: v4(),
					content_type: 'text',
					title: this.$t('components.flow.node.actions.sendMessagePartials.quickReply.maybe'),
					payload: v4(),
				},
			]

			replies.forEach((reply) => {
				this.node.addTrigger(
					new Trigger({
						type: triggerTypes.quickReply,
						config: {
							postback: reply.payload,
						},
					}),
				)
			})

			this.quickReplies = replies
		},
		removeQuickReplies() {
			this.quickReplies.forEach((reply) => {
				if (reply.payload) {
					this.node.removeTriggerByPostback(reply.payload)
				}
			})
			this.quickReplies = []
		},
		testMessage() {
			// Simulate testing the message
			this.$toast?.success(this.$t('components.flow.node.actions.sendMessage.testMessageSuccess'))
		},
		addTrigger({ action: newNode, guard }) {
			consoleLog('addTrigger({ action: newNode, guard }) 2', guard)
			this.flowStore.flow.addNode(newNode, this.node, guard)
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
	},
}
</script>
