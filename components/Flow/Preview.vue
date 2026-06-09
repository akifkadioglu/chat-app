<template>
	<div v-if="flowStore.flow" class="flex flex-col">
		<MobilePreview
			:low-opacity="
				(triggerConfig?.filters?.includes?.length > 0 || triggerConfig?.showReplyComment) &&
				currentPreview === viewTypes.POST
			"
			:scale="scale"
			:width="width"
			class="mx-auto"
		>
			<template #screen>
				<ChatScreen v-if="currentPreview === viewTypes.CHAT" :post-account="flowStore.flow.chatAccount?.postAccount">
					<div class="m-2 space-y-2">
						<!-- Story Mention -->
						<div v-if="selectedTriggerKey === triggerTypes.storyMention.key" class="space-y-2">
							<small>{{ $t('components.flow.preview.storyMention') }}</small>
							<div class="relative border-s border-zinc-700 px-2" :class="{ 'mb-7': triggerConfig?.autoLike }">
								<div class="flex items-center justify-center bg-subtle w-40 rounded-xl h-60">
									<i class="fa fa-image" />
								</div>
								<span
									v-if="triggerConfig?.autoLike"
									class="absolute -bottom-6 left-3 border-3 border-black bg-zinc-700 rounded-full w-9 h-7 flex items-center justify-center pr-0.5 pt-1"
								>
									❤️
								</span>
							</div>
						</div>

						<!-- Reply To Story -->
						<div v-if="selectedTriggerKey === triggerTypes.replyToStory.key" class="space-y-2">
							<div class="relative space-y-1" :class="{ 'mb-7': triggerConfig?.likeReply }">
								<div class="flex items-center justify-center bg-subtle w-30 rounded-xl h-45">
									<i class="fa fa-image" />
								</div>
								<MessageBubble inbound>
									<span>{{ $t('components.flow.preview.anyMessage') }}</span>
								</MessageBubble>
								<span
									v-if="triggerConfig?.likeReply"
									class="absolute -bottom-6 left-1 border-3 border-black bg-zinc-700 rounded-full w-9 h-7 flex items-center justify-center pr-0.5 pt-1"
								>
									❤️
								</span>
							</div>
						</div>

						<!-- Dm Reply -->
						<div v-if="selectedTriggerKey === triggerTypes.receivedDM.key" class="space-y-2">
							<div class="relative space-y-2">
								<MessageBubble inbound>
									<span class="whitespace-break-spaces">
										{{
											triggerConfig.wordFilters
												.filter((filter) => filter.type !== 'doesNotContain')
												.at(-1)
												?.keywords.at(-1) ?? $t('components.flow.preview.anyMessage')
										}}
									</span>
								</MessageBubble>
							</div>
						</div>

						<!-- Answer -->
						<div v-for="i in orderedNodes">
							<!-- Send Message and Signature -->
							<MessageContentList
								v-if="i.type.key === nodeTypes.actions.sendMessage.key || i.type.key === nodeTypes.signature.key"
								:config="i.config"
							/>

							<!-- Data Collection and Private Reply -->
							<div
								v-if="
									i.type.key === nodeTypes.actions.dataCollection.key ||
									i.type.key === nodeTypes.commentActions.sendPrivateReply.key
								"
							>
								<MessageBubble type="text">
									<span class="whitespace-pre-wrap">
										{{ i.config.text || i.config.message?.text || $t('components.flow.preview.writeMessage') }}
									</span>

									<div class="mt-2 space-y-2" v-for="button in i.config.buttons" :key="button.id">
										<div class="bg-base-100/20 p-2 w-full min-w-40 rounded-lg text-center">
											{{ button.text?.trim() || $t('components.flow.preview.buttonText') }}
										</div>
									</div>
								</MessageBubble>
							</div>
						</div>
					</div>
					<template #quickReplies>
						<div
							v-if="
								nodeType?.key === nodeTypes.actions.dataCollection.key && nodeConfig.replyType === 'multiple_choice'
							"
							class="flex space-x-7 overflow-x-scroll"
						>
							<div v-for="option in nodeConfig.options">
								<div class="bg-indigo-500/10 p-2 text-indigo-500 rounded-full">
									{{ option.title || $t('components.flow.preview.optionText') }}
									{{
										(option.title || $t('components.flow.preview.optionText')).slice(0, 20) +
										((option.title?.length || 0) > 20 ? '...' : '')
									}}
								</div>
							</div>
						</div>
						<div v-if="nodeType?.key === nodeTypes.actions.sendMessage.key" class="flex space-x-7 overflow-x-scroll">
							<div v-for="reply in nodeConfig.quickReplies">
								<div class="bg-indigo-500/10 p-2 text-indigo-500 rounded-full">
									{{
										(reply.title || $t('components.flow.preview.optionText')).slice(0, 20) +
										((reply.title?.length || 0) > 20 ? '...' : '')
									}}
								</div>
							</div>
						</div>
					</template>
				</ChatScreen>
				<PostScreen
					class="text-start"
					v-if="currentPreview === viewTypes.POST"
					:post-type="triggerConfig?.postType"
					:selected-post-imgs="triggerConfig?.selectedPostImgs"
					:post-account="flowStore.flow.chatAccount?.postAccount"
				/>
				<div v-if="currentPreview === viewTypes.EMPTY" class="flex h-full">
					<StateElement class="my-auto mx-auto" :title="$t('components.flow.preview.emptyState.title')">
						<template #icon>
							<i class="fa fa-paper-plane font-extrabold text-3xl text-sky-500" />
						</template>
					</StateElement>
				</div>
			</template>
			<template #options>
				<CommentOption
					class="text-start"
					v-if="showComment && currentPreview === viewTypes.POST"
					:accountComment="accountComment"
					:contact-comment="
						triggerConfig.filters?.wordFilters
							?.filter((filter) => filter.type !== 'doesNotContain')
							.at(-1)
							?.keywords.at(-1)
					"
					:post-account="flowStore.flow.chatAccount?.postAccount"
					:show-account-comment="triggerConfig.showReplyComment || focusedNode?.config.showReplyComment"
				/>
			</template>
		</MobilePreview>
		<div class="mt-5 text-start w-min mx-auto">
			<!-- name of each tab group should be unique -->
			<!--			<div role="tablist" class="tabs tabs-box rounded-full w-max">-->
			<!--				<a-->
			<!--					role="tab"-->
			<!--					class="tab"-->
			<!--					style="border-radius: 45%"-->
			<!--					v-tooltip.bottom="$t(`components.flow.preview.triggerType.${trigger.type.key}`)"-->
			<!--					:class="{ 'tab-active': trigger.type.key === selectedTriggerKey }"-->
			<!--					@click="selectTriggerKey(trigger.type.key)"-->
			<!--					v-for="trigger in triggers"-->
			<!--				>-->
			<!--					<i-->
			<!--						class="fas"-->
			<!--						:class="{-->
			<!--							'fa-comment text-pink-500': trigger.type.key === triggerTypes.commentOnPost.key,-->
			<!--							'fa-reply text-green-500': trigger.type.key === triggerTypes.replyToStory.key,-->
			<!--							'fa-envelope text-blue-500 ': trigger.type.key === triggerTypes.receivedDM.key,-->
			<!--							'fa-at text-purple-500': trigger.type.key === triggerTypes.storyMention.key,-->
			<!--						}"-->
			<!--					/>-->
			<!--				</a>-->
			<!--			</div>-->

			<div role="tablist" class="tabs tabs-box rounded-full w-max">
				<a
					role="tab"
					class="tab"
					style="border-radius: 45%"
					:class="{ 'tab-active': view === currentPreview }"
					@click="selectScreen(view)"
					v-for="view in views"
				>
					<i
						class="fas"
						:class="{
							'fa-comment text-pink-500': view === viewTypes.POST,
							'fa-envelope text-blue-500 ': view === viewTypes.CHAT,
						}"
					/>
					<!--					<i class="fa-solid fa-message"></i>-->
					<!--						:class="{-->
					<!--							'fa-comment text-pink-500': trigger.type.key === triggerTypes.commentOnPost.key,-->
					<!--							'fa-reply text-green-500': trigger.type.key === triggerTypes.replyToStory.key,-->
					<!--							'fa-envelope text-blue-500 ': trigger.type.key === triggerTypes.receivedDM.key,-->
					<!--							'fa-at text-purple-500': trigger.type.key === triggerTypes.storyMention.key,-->
					<!--						}"-->
				</a>
			</div>
		</div>
	</div>
	<div v-else />
</template>
<script>
import MobilePreview from '~/components/Chat/MobilePreview/MobilePreview.vue'
import CommentOption from '~/components/Chat/MobilePreview/CommentOption.vue'
import PostScreen from '~/components/Chat/MobilePreview/PostsScreen.vue'
import ChatScreen from '~/components/Chat/MobilePreview/ChatScreen.vue'
import { nodeTypes, triggerTypes, viewTypes } from '~/models/Flow/utils/utils'
import VideoMessage from '~/components/Flow/Node/Actions/SendMessagePartials/VideoMessage.vue'
import MessageBubble from '~/components/Flow/MessageBubble.vue'
import MessageContentList from '~/components/Flow/MessageContentList.vue'
import StateElement from '~/components/GlobalComponents/StateElement.vue'

export default {
	components: {
		StateElement,
		MessageContentList,
		MessageBubble,
		VideoMessage,
		ChatScreen,
		PostScreen,
		CommentOption,
		MobilePreview,
	},
	props: {
		scale: {
			type: Number,
			default: null,
		},
		width: {
			type: Number,
			default: null,
		},
	},
	setup() {
		return {
			chatAccountsStore: useChatAccountsStore(),
			flowStore: useFlowStore(),
		}
	},
	data() {
		return {
			triggerTypes,
			viewTypes,
			nodeTypes,
			currentPreview: viewTypes.EMPTY,

			lastChatViewConfig: null,
			lastPostViewConfig: null,
			triggerType: null,

			nodeConfig: null,
			nodeType: null,

			selectedTriggerKey: '',
		}
	},
	mounted() {
		// this.$emitter.on('focusedNode', this.focusedNode)
		// this.$emitter.on('focusedTrigger', this.focusedTrigger)
		//
		// if (this.triggerConfig === null) {
		// 	this.focusedTrigger(this.triggers[0])
		// }

		this.selectTriggerKey(this.focusedTrigger?.type.key)
	},

	computed: {
		triggerConfig() {
			if (this.currentPreview === viewTypes.POST) {
				return this.lastPostViewConfig
			}
			return this.lastChatViewConfig
		},
		views() {
			const views = []

			views.push(viewTypes.CHAT) // Zaten her flow'un sonunda send message olduğu için chat ekranını her türlü gösteriyorum

			this.triggers.forEach((node) => {
				if (node.type.key === triggerTypes.commentOnPost.key) {
					views.push(viewTypes.POST)
				}
			})
			return views
		},
		triggers() {
			return this.flowStore.flow?.nodes?.filter((node) => node.type.key === nodeTypes.trigger.key)[0].triggers
		},
		orderedNodes() {
			return this.flowStore.flow.orderedNodes
		},
		focusedNode() {
			return this.flowStore.focusedNode
		},
		focusedTrigger() {
			return this.flowStore.focusedTrigger
		},
		accountComment() {
			const text = this.focusedNode?.config.replies?.[0]?.text ?? this.triggerConfig?.replyComments?.[0]
			if (!text) return text
			if (this.triggerConfig?.showSignature && this.triggerConfig?.signatureText) {
				return text + '\n\n' + this.triggerConfig.signatureText
			}
			return text
		},
		showComment() {
			if (this.triggerConfig?.showReplyComment) {
				return true
			}
			if (this.triggerConfig?.filterComments) {
				return true
			}
			if (this.focusedNode?.type.key === nodeTypes.commentActions.replyComment.key) {
				return true
			}
			return false
		},
	},
	watch: {
		focusedNode(newValue) {
			consoleLog('Focused node', newValue)
			if (!newValue) return
			if (newValue.type.key === nodeTypes.trigger.key) {
				consoleLog('Focused trigger newValue?.type.key', newValue?.type.key)
				this.selectTriggerKey(this.focusedTrigger?.type.key)
				return
			}

			// if (
			// 	newValue.type.key === nodeTypes.actions.sendMessage.key ||
			// 	newValue.type.key === nodeTypes.actions.dataCollection.key
			// ) {

			consoleLog('consoleLog(newValue', newValue)
			const POST_SCREEN_KEYS = [nodeTypes.commentActions.replyComment.key, nodeTypes.commentActions.hideComment.key]

			if (POST_SCREEN_KEYS.includes(newValue.type.key)) {
				this.currentPreview = viewTypes.POST
				this.nodeConfig = newValue.config
				this.nodeType = newValue.type
				return
			}
			this.currentPreview = viewTypes.CHAT
			this.nodeConfig = newValue.config
			this.nodeType = newValue.type
			// }
		},
		focusedTrigger(newValue) {
			// this.$delay(50)
			if (this.triggers.length === 0) {
				this.currentPreview = viewTypes.EMPTY
				return
			}
			this.selectTriggerKey(this.focusedTrigger?.type.key)
		},
	},
	methods: {
		// focusedNode(node) {
		// 	if (
		// 		node.type.key === nodeTypes.actions.sendMessage.key ||
		// 		node.type.key === nodeTypes.actions.dataCollection.key
		// 	) {
		// 		this.currentPreview = viewTypes.CHAT
		// 		this.nodeConfig = node.config
		// 		this.nodeType = node.type
		// 	}
		// },
		selectScreen(view) {
			this.currentPreview = view
		},
		selectTriggerKey(key) {
			consoleLog('selectTriggerKey', key)
			this.selectedTriggerKey = key
			const triggerConfig = this.triggers?.find((trigger) => trigger.type.key === key)?.config
			this.triggerType = this.triggers?.find((trigger) => trigger.type.key === key)?.type
			const typeKey = this.triggerType?.key
			if (typeKey === triggerTypes.storyMention.key) {
				this.currentPreview = viewTypes.CHAT
				this.lastChatViewConfig = triggerConfig
			}
			if (typeKey === triggerTypes.commentOnPost.key) {
				this.currentPreview = viewTypes.POST
				this.lastPostViewConfig = triggerConfig
			}
			if (typeKey === triggerTypes.replyToStory.key) {
				this.currentPreview = viewTypes.CHAT
				this.lastChatViewConfig = triggerConfig
			}
			if (typeKey === triggerTypes.receivedDM.key) {
				this.currentPreview = viewTypes.CHAT
				this.lastChatViewConfig = triggerConfig
			}
		},
		// async focusedTrigger(node) {
		// 	await this.$delay(50)
		// 	if (this.triggers?.length === 0) {
		// 		this.currentPreview = viewTypes.EMPTY
		// 		return
		// 	}
		// 	this.selectTriggerKey(node?.type.key ?? '')
		// },
	},
}
</script>
