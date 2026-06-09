<template>
	<div
		class="flex flex-col h-full relative"
		@dragover.prevent="handleDragOver"
		@dragenter.prevent="handleDragEnter"
		@dragleave.prevent="handleDragLeave"
		@drop.prevent="handleDrop"
	>
		<!-- Messages Area -->
		<div ref="messagesContainer" class="flex-1 relative overflow-y-auto">
			<div v-if="!conversation?.id" @click="$emitter.emit('openLeadingDrawer')" class="absolute w-full h-full z-1" />
			<State :is-error="messageSlice.error" :is-empty="!conversation || messageSlice?.messages.length === 0">
				<template #empty>
					<div class="flex items-center justify-center h-full w-full bg-subtle">
						<StateElement is-empty :content="$t('components.chat.content.chatContent.selectChatToStart')">
							<template #img>
								<img v-img-error src="/images/icon.png" alt="simpliers chat" class="w-48 opacity-10" />
							</template>
							<template #title>
								<div class="text-4xl -mt-10">
									<simpliers-logo />
									<chat-logo />
								</div>
							</template>
						</StateElement>
					</div>
				</template>
				<DynamicScroller
					:key="conversation.id"
					:items="messageSlice?.messages"
					:min-item-size="60"
					class="h-full p-3 relative overflow-x-hidden"
					key-field="uuid"
					ref="scroller"
				>
					<template #before>
						<div class="text-center py-2">
							<Pagination
								v-if="messageSlice.messages.length || messageSlice.currentPage > 0"
								:key="conversation.id"
								:current-page="messageSlice.currentPage"
								:has-more="messageSlice.hasMore"
								:infinite-scroll="true"
								:loading="messageSlice.loading"
								direction-top
								@page-change="fetchMessages"
							/>
						</div>
					</template>

					<template #default="{ item, index, active }">
						<DynamicScrollerItem :key="item.uuid" :item="item" :active="active" :data-index="index">
							<ChatMessage
								:contact="conversation?.contact"
								:message="item"
								:chatAccountSource="conversation?.chatAccount?.source"
								:next-direction="messageSlice?.messages[index + 1]?.direction"
								:next-user-id="messageSlice?.messages[index + 1]?.userId"
								:previousDirection="messageSlice?.messages[index - 1]?.direction"
								:previous-sent-at="messageSlice?.messages[index - 1]?.sentAt"
								:show-translated-messages="conversation?.showTranslatedMessages"
								:selectedMessageIds="selectedMessageIds"
								:isShareMode="isShareMode"
								@manageShareMessage="manageShareMessage"
								@setRepliedMessage="handleReplyToMessage"
							/>
						</DynamicScrollerItem>
					</template>
				</DynamicScroller>

				<!--				<template #skeleton>-->
				<!--					<MessagesContainer :showSkeleton="true" :messages="skeletonMessages" :contact="conversation?.contact" />-->
				<!--				</template>-->
			</State>
		</div>

		<!-- Drag & Drop Overlay -->
		<div
			v-if="isDragOver && conversation?.id"
			class="absolute inset-0 z-50 bg-base-100/50 border-2 border-dashed border-primary flex items-center justify-center backdrop-blur-lg"
		>
			<div class="text-center p-8">
				<div class="text-6xl mb-4">
					<i class="fa fa-cloud-upload-alt"></i>
				</div>
				<h3 class="text-2xl font-bold mb-2">
					{{ $t('components.chat.content.dragDrop.title') }}
				</h3>
			</div>
		</div>

		<!-- Message Input -->
		<div class="shrink-0">
			<MessageInput
				ref="messageInput"
				:isShareMode="isShareMode"
				:selectedMessageIds="selectedMessageIds"
				:conversation="conversation"
				:isUploading="isUploading"
				@exitMessagesShareMode="exitMessageShareMode"
			/>
		</div>
	</div>
</template>

<script>
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import MessagesContainer from '~/components/Chat/Content/MessagesContainer.vue'
import MessageInput from '~/components/Chat/Content/MessageInput.vue'
import apiList from '~/apis/ApiList.js'
import InfiniteLoading from 'v3-infinite-loading'
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import ChatMessage from '~/components/Chat/Content/ChatMessage.vue'
import Pagination from '~/components/GlobalComponents/Pagination.vue'
import Reaction from '~/components/Chat/Content/MessageTypes/Reaction.vue'
import { DIRECTION, STATUS } from '~/models/Conversation/Message.js'
import { Conversation } from '~/models/Conversation/Conversation.js'
import SimpliersLogo from '~/components/GlobalComponents/Brands/SimpliersLogo.vue'
import ChatLogo from '~/components/GlobalComponents/Brands/ChatLogo.vue'
import StateElement from '~/components/GlobalComponents/StateElement.vue'
import State from '~/components/GlobalComponents/State.vue'
import { getFileCategory } from '~/helpers/fileUploadFunctions.js'

export default {
	props: {
		conversation: {
			type: Conversation,
			default: null,
		},
	},
	provide() {
		return {
			scrollerRef: () => {
				return this.$refs.scroller || null
			},
		}
	},
	data() {
		return {
			isShareMode: false,
			selectedMessageIds: [],
			isDragOver: false,
			dragCounter: 0,
			isUploading: false,
		}
	},
	components: {
		StateElement,
		ChatLogo,
		SimpliersLogo,
		Reaction,
		Pagination,
		ChatMessage,
		LoadingElement,
		InfiniteLoading,
		State,
		MessageInput,
		MessagesContainer,
		DynamicScroller,
		DynamicScrollerItem,
	},
	setup() {
		return {
			conversationMessagesStore: useConversationMessagesStore(),
		}
	},
	computed: {
		messageSlice() {
			return this.conversationMessagesStore.getMessageSlice(this.conversation?.id)
		},
		unreadCount() {
			return this.conversationMessagesStore.getUnreadCountForConversation(this.conversation?.id)
		},
	},
	watch: {
		'conversation.lastMessage.id'() {
			this.isShareMode = false
			this.$nextTick(() => {
				this.scrollToBottom()
				this.readLastMessage()
			})
		},
		// unreadCount(newVal) {
		// 	if (newVal > 0) this.readLastMessage()
		// },
	},
	created() {
		this.$emitter.on('chatAccountsError', () => {
			this.isError = true
		})
		this.$emitter.on('chatAccountsLoading', () => {
			this.isError = false
		})
	},
	async mounted() {
		this.$emitter.on('scrollMessagesToBottom', (conversationId = null) => {
			consoleLog('Received scrollMessagesToBottom event for conversationId:', conversationId)
			if (conversationId && this.conversation?.id !== conversationId) return
			this.$nextTick(() => {
				this.scrollToBottom()
			})
		})

		this.scrollToBottom()
		this.readLastMessage()

		this.$emitter.on('manageShareMessage', this.manageShareMessage)
		this.$emitter.on('exitMessagesShareMode', this.exitMessageShareMode)
	},
	methods: {
		async fetchMessages(page = 1) {
			consoleLog('Fetching messages for page:', page)
			const scroller = this.$refs.scroller
			if (!scroller) return

			// DynamicScroller için mevcut scroll pozisyonunu kaydet
			const currentScrollTop = scroller.$el?.scrollTop || 0
			const currentFirstVisibleIndex = Math.floor(currentScrollTop / 60) // min-item-size

			await this.conversationMessagesStore
				.fetchMessagesForConversation(this.conversation?.id, this.conversation.chatAccountId, page)
				.then((messagesLength) => {
					this.$nextTick(() => {
						const newMessageCount = messagesLength
						const newScrollIndex = currentFirstVisibleIndex + newMessageCount

						scroller?.scrollToItem(newScrollIndex)
						consoleLog('Scrolled to maintain position after loading messages', {
							newMessages: newMessageCount,
							scrolledToIndex: newScrollIndex,
						})
					})
				})
			//
			// this.isLoading = true
			// await this.$requestAdapter
			// 	.get(apiList.chat.instagram.chatAccountId.conversation.conversationId.get, {
			// 		chatAccountId: this.conversation?.chatAccountId,
			// 		conversationId: this.conversation?.id,
			// 		params: {
			// 			page,
			// 		},
			// 	})
			// 	.then(async (res) => {
			// 		this.conversation.lastLoadedPage = res.data.messages.current_page
			// 		this.conversation.totalPage = res.data.messages.last_page
			//
			// 		const oldMessageCount = this.conversation.sortedMessages.length
			//
			// 		const messages = res.data.messages.data.map((msg) => new Message(msg))
			// 		if (
			// 			messages[0]?.id < this.conversation.sortedMessages[0]?.id &&
			// 			messages[0].conversation.id === this.conversation.id
			// 		) {
			// 			this.conversation.messages.unshift(...messages)
			// 		}
			// 		await this.$nextTick()
			//
			// 		const newMessageCount = messages.length
			// 		const newScrollIndex = currentFirstVisibleIndex + newMessageCount
			//
			// 		scroller?.scrollToItem(newScrollIndex)
			// 		consoleLog('Scrolled to maintain position after loading messages', {
			// 			oldCount: oldMessageCount,
			// 			newMessages: newMessageCount,
			// 			scrolledToIndex: newScrollIndex,
			// 		})
			// 	})
			// 	.catch((err) => {})
			// 	.finally(() => {
			// 		this.isLoading = false
			// 	})
		},
		scrollToBottom() {
			consoleLog('Scrolling to bottom of messages')
			this.$nextTick(() => {
				const scroller = this.$refs.scroller
				if (scroller && this.messageSlice.messages?.length > 0) {
					try {
						// Method 1: DynamicScroller'ın kendi scroll method'unu kullan
						const lastIndex = this.messageSlice.messages.length - 1
						scroller.scrollToItem(lastIndex)

						// Method 2: Eğer scrollToBottom method'u varsa onu kullan
						if (typeof scroller.scrollToBottom === 'function') {
							scroller.scrollToBottom()
							consoleLog('Used scroller.scrollToBottom()')
						} else {
							consoleLog('Used scroller.scrollToItem()', lastIndex)
						}

						// Method 3: Manuel scroll - son çare
						const scrollEl = scroller.$el
						if (scrollEl) {
							scrollEl.scrollTop = scrollEl.scrollHeight
							consoleLog('Manual scroll fallback')
						}
					} catch (error) {
						consoleLog('Error scrolling to bottom:', error)
					}
				}
			})
		},
		readLastMessage() {
			if (this.conversation && this.unreadCount > 0) {
				this.$requestAdapter
					.post(
						apiList.chat.instagram.chatAccountId.conversation.conversationId.read,
						{
							messageId: this.conversationMessagesStore.getLastMessageForConversation(this.conversation.id).id,
						},
						{
							chatAccountId: this.conversation.chatAccountId,
							conversationId: this.conversation.id,
						},
					)
					.then(() => {
						consoleLog('Marked as read', this.unreadCount)
						// Messages store'daki mesajları güncelle
						this.messageSlice.messages.forEach((msg) => {
							if (msg.direction === DIRECTION.INBOUND) {
								msg.readAt = Date.now()
								msg.status = STATUS.READ
							}
						})
					})
					.catch(() => {
						// Handle error if needed
					})

				consoleLog('Marked as read', this.unreadCount)
			}
		},
		manageShareMessage(messageId) {
			const index = this.selectedMessageIds.indexOf(messageId)
			if (index !== -1) {
				this.selectedMessageIds.splice(index, 1)
				return
			}
			this.selectedMessageIds.push(messageId)
			this.isShareMode = true
		},
		exitMessageShareMode() {
			this.selectedMessageIds = []
			this.isShareMode = false
		},
		handleReplyToMessage(message) {
			this.$refs.messageInput?.setRepliedMessage(message)
		},
		// Drag & Drop Methods
		handleDragOver(event) {
			if (!this.conversation?.id) return
			event.preventDefault()
		},
		handleDragEnter(event) {
			if (!this.conversation?.id) return
			event.preventDefault()
			this.dragCounter++
			this.isDragOver = true
		},
		handleDragLeave(event) {
			if (!this.conversation?.id) return
			event.preventDefault()
			this.dragCounter--
			if (this.dragCounter === 0) {
				this.isDragOver = false
			}
		},
		async handleDrop(event) {
			if (!this.conversation?.id) return
			event.preventDefault()
			this.isDragOver = false
			this.dragCounter = 0

			const files = Array.from(event.dataTransfer.files)
			const supportedFiles = files.filter((file) => getFileCategory(file) !== null)

			if (supportedFiles.length === 0) {
				console.warn('Desteklenmeyen dosya türü')
				return
			}

			// Upload başladığında loading state'i aktif et
			this.isUploading = true

			try {
				// MessageInput component'ine dosyaları gönder
				if (this.$refs.messageInput) {
					await this.$refs.messageInput.handleDroppedFiles(supportedFiles)
				}
			} finally {
				// Upload bittiğinde loading state'i kapat
				this.isUploading = false
			}
		},
	},
}
</script>
<style>
/* DynamicScroller için gerekli CSS */
.vue-recycle-scroller {
	height: 100%;
}
</style>
