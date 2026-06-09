<template>
	<div class="flex flex-col h-full min-h-0">
		<!-- Messages Area -->
		<div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 min-h-0">
			<!-- Loading State -->
			<div v-if="loading" class="text-center">
				<div class="loading loading-spinner loading-md"></div>
				<div class="text-base-content/70 text-sm mt-2">{{ $t('components.support.threadMessages.loading') }}</div>
			</div>

			<!-- Error State -->
			<div v-else-if="error" class="text-center">
				<div class="text-error text-sm">{{ error }}</div>
				<button @click="loadMessages" class="btn btn-sm btn-outline mt-2">
					{{ $t('components.support.threadMessages.retryButton') }}
				</button>
			</div>

			<!-- Messages List -->
			<div v-else-if="messages.length > 0" class="space-y-4">
				<div
					v-for="message in messages"
					:key="message.id"
					:class="['chat', message.is_answer ? 'chat-start' : 'chat-end']"
				>
					<div class="chat-header">
						{{ message.name }}
						<time class="text-xs opacity-50 ml-1">{{ message.diff_for_humans }}</time>
					</div>
					<div
						class="whitespace-pre-line"
						:class="['chat-bubble', message.is_answer ? 'chat-bubble-secondary' : 'chat-bubble-primary']"
					>
						<span v-html="formatTextWithLinks(message.message)" />
					</div>
				</div>
			</div>

			<!-- Empty State -->
			<div v-else class="text-center">
				<div class="text-base-content/70 text-sm">{{ $t('components.support.threadMessages.emptyState.title') }}</div>
				<div class="text-base-content/50 text-xs mt-2">
					{{ $t('components.support.threadMessages.emptyState.subtitle') }}
				</div>
			</div>
		</div>

		<!-- Message Input Area -->
		<div class="flex-shrink-0 p-4 border-t border-base-300 bg-base-100 mt-auto">
			<div class="flex items-end relative border rounded-lg pr-12" :class="{ 'bg-base-200': sending }">
				<TextareaAutosize
					v-model="newMessage"
					:disabled="sending"
					type="text"
					:placeholder="$t('components.support.threadMessages.inputPlaceholder')"
					class="flex-1 textarea border-none resize-none focus:outline-none"
				/>
				<button
					@click="sendMessage"
					:disabled="!newMessage.trim() || sending"
					class="btn btn-primary btn-sm absolute bottom-1 right-1"
				>
					{{ $t('components.support.threadMessages.sendButton') }}
					<LoadingElement :isLoading="sending">
						<i class="fa fa-paper-plane" />
					</LoadingElement>
				</button>
			</div>
		</div>
	</div>
</template>

<script>
import apiList from '~/apis/ApiList.js'
import TextareaAutosize from '~/components/GlobalComponents/Elements/TextareaAutosize.vue'
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'

export default {
	components: { LoadingElement, TextareaAutosize },
	props: {
		threadHash: {
			type: String,
			required: true,
		},
	},
	data() {
		return {
			newMessage: '',
			messages: [],
			loading: false,
			error: null,
			sending: false,
		}
	},
	watch: {
		threadHash(newVal) {
			if (newVal) {
				this.loadMessages()
			}
		},
	},

	mounted() {
		this.loadMessages().then(() => {
			this.$nextTick(() => {
				this.scrollToBottom()
			})
		})
	},

	methods: {
		formatTextWithLinks(text) {
			if (!text) return ''
			const urlRegex = /(https?:\/\/[^\s<]+)/g
			return text.replace(urlRegex, (url) => {
				const escapedUrl = url.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
				return `<a href="${escapedUrl}" target="_blank" rel="noopener noreferrer" class="link  text-decoration-underline text-white">${escapedUrl}<i class="fa fa-external-link fa-xs ms-1 text-white"></i></a>`
			})
		},

		sendMessage() {
			if (!this.newMessage.trim() || this.sending) return

			const messageText = this.newMessage.trim()
			this.sending = true

			const endpoint = apiList.thread.hash.send.replace('{hash}', this.threadHash)

			this.$requestAdapter
				.post(endpoint, {
					text: messageText,
				})
				.then((response) => {
					this.newMessage = ''
					this.loadMessages().then(() => {
						this.$nextTick(() => {
							this.scrollToBottom()
						})
					})
				})
				.catch((err) => {
					this.error = err.message || 'Failed to send message'
					console.error('Send message error:', err)
					// Hata durumunda mesajı geri koy
					this.newMessage = messageText
				})
				.finally(() => {
					this.sending = false
				})
		},

		async loadMessages() {
			if (!this.threadHash) {
				this.error = 'Thread hash not found'
				return
			}

			this.loading = true
			this.error = null

			const endpoint = apiList.thread.hash.messages.replace('{hash}', this.threadHash)

			await this.$requestAdapter
				.get(endpoint)
				.then((response) => {
					this.messages = response.data.messages

					this.$nextTick(() => {
						this.scrollToBottom()
					})
				})
				.catch((err) => {
					this.error = err.message || 'Failed to load messages'
					console.error('Load messages error:', err)
				})
				.finally(() => {
					this.loading = false
				})
		},

		scrollToBottom() {
			if (this.$refs.messagesContainer) {
				this.$refs.messagesContainer.scrollTop = this.$refs.messagesContainer.scrollHeight
			}
		},
	},
	emits: ['send-message'],
}
</script>
