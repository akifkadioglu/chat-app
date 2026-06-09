<template>
	<div>
		<div class="border border-base-300 rounded-lg overflow-hidden max-w-lg">
			<!-- Reply Header -->
			<div class="bg-base-200 px-2 py-1 flex items-center justify-between">
				<span class="text-xs font-medium text-base-content">
					<i class="fa fa-reply mr-1"></i>
					{{ $t('components.moderate.replyComment.header', { username: comment.authorUsername }) }}
				</span>
				<button class="btn btn-ghost btn-xs" @click="$emit('cancel')" :disabled="replyLoading">
					<i class="fa fa-times"></i>
				</button>
			</div>
			<div class="relative pr-16 pb-8">
				<textarea-autosize
					ref="textarea"
					v-model="replyText"
					class="textarea w-full border-0 focus:ring-0 focus:outline-none min-h-0 resize-none"
					rows="1"
					:placeholder="$t('components.moderate.replyComment.placeholder')"
					:disabled="replyLoading"
					@keydown="handleKeydown"
					@focus="isFocused = true"
					@blur="isFocused = false"
				/>
				<!-- Send Button Inside Textarea -->
				<button
					class="btn btn-primary btn-sm absolute bottom-1 right-2"
					@click="sendReply"
					:disabled="!replyText.trim() || replyLoading"
				>
					<loading-element :is-loading="replyLoading" size="12">
						<i class="fa fa-paper-plane"></i>
					</loading-element>
				</button>

				<!-- Avatar in bottom left -->
				<div class="absolute bottom-0 left-0 px-2 pb-1 flex justify-between items-end opacity-50">
					<div class="flex-1 truncate px-1 pb-px" v-if="comment.post?.chatAccount">
						<ProfilePicture :src="comment.post.chatAccount.postAccount?.profilePicture" :size="20" ring="ring-2" />
						<small class="ml-1">
							{{ comment.post.chatAccount.postAccount?.name || comment.post.chatAccount.postAccount?.username }}
						</small>
					</div>
				</div>
			</div>
		</div>
		<div class="text-xs text-muted mt-1">
			<i class="fa fa-info-circle mr-1"></i>
			{{ $t('components.moderate.replyComment.info') }}
		</div>
	</div>
</template>

<script>
import apiList from '~/apis/ApiList.js'
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import ProfilePicture from '~/components/GlobalComponents/ProfilePicture.vue'
import TextareaAutosize from '~/components/GlobalComponents/Elements/TextareaAutosize.vue'

import { PostComment } from '~/models/Post/PostComment.js'

export default {
	name: 'ReplyComment',
	components: { TextareaAutosize, LoadingElement, ProfilePicture },
	props: {
		comment: {
			type: PostComment,
			required: true,
		},
	},
	emits: ['cancel', 'success'],
	data() {
		return {
			replyText: `@${this.comment.authorUsername} `,
			replyLoading: false,
			isFocused: false,
		}
	},
	mounted() {
		this.$nextTick(() => {
			this.$refs.textarea.focus()
			this.isFocused = true
		})
		// Document level ESC listener for when textarea is not focused
		document.addEventListener('keydown', this.handleDocumentKeydown)
	},
	beforeUnmount() {
		document.removeEventListener('keydown', this.handleDocumentKeydown)
	},
	methods: {
		handleKeydown(event) {
			// Cmd+Enter (Mac) or Ctrl+Enter (Windows/Linux)
			if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
				event.preventDefault()
				this.sendReply()
				return
			}

			// ESC logic: First ESC removes focus, Second ESC closes
			if (event.key === 'Escape') {
				if (this.isFocused) {
					// First ESC: Remove focus
					event.preventDefault()
					this.$refs.textarea.blur()

					this.isFocused = false
				} else {
					// Second ESC: Close collapse
					event.preventDefault()
					this.$emit('cancel')
				}
			}
		},
		handleDocumentKeydown(event) {
			// Only handle ESC when textarea is not focused
			if (event.key === 'Escape' && !this.isFocused) {
				event.preventDefault()
				this.$emit('cancel')
			}
		},
		sendReply() {
			if (!this.replyText.trim() || this.replyLoading) return

			this.replyLoading = true
			consoleLog('Sending reply to comment', this.comment.post.chatAccountId, this.comment.id)

			this.$requestAdapter
				.post(
					apiList.chat.comments.chatAccountId.comments.id.reply,
					{
						replyText: this.replyText.trim(),
					},
					{
						id: this.comment.id,
						chatAccountId: this.comment.post.chatAccountId,
					},
				)
				.then((res) => {
					consoleLog('Reply sent successfully', res.data, this.comment.post)
					const replyComment = new PostComment(res.data, this.comment.post)
					this.$emit('success', replyComment)
					setTimeout(() => {
						// Parent comment'ın replies array'ine yeni reply'ı ekle
						this.comment.replies.unshift(replyComment)
					}, 500)

					this.replyText = `@${this.comment.authorUsername} `
				})
				.catch((error) => {
					consoleLog('Reply failed:', error)
				})
				.finally(() => {
					this.replyLoading = false
				})
		},
	},
}
</script>
