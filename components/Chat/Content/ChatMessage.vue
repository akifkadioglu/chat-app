<template>
	<div
		class="flex items-center chat-message"
		:class="{ 'cursor-pointer': isShareMode }"
		@click.stop="isShareMode ? openShareMode(message) : null"
		@mouseleave="showActions = false"
		v-auto-animate
	>
		<input
			v-if="isShareMode && message.status !== STATUS.FAILED"
			type="checkbox"
			class="checkbox mr-2 mt-2"
			:checked="isMessageSelected"
		/>
		<div
			class="chat flex-1 group"
			:class="{
				'chat-end': isOwn,
				'chat-start': !isOwn,
				'pt-[0.05rem]': isPreviousDirectionSame,
				'pb-[0.05rem]': isNextDirectionSame,
			}"
		>
			<ProfilePicture
				v-if="!isOwn"
				class="chat-image"
				:class="{ 'opacity-0': isNextDirectionSame }"
				:src="contact?.platformAccountsInstagram?.profileImageUrl"
				:alt="contact?.platformAccountsInstagram?.username"
				:size="30"
			/>

			<div
				class="flex flex-col"
				:class="{
					'items-end': isOwn,
					'items-start': !isOwn,

					'pb-1 mt-4': message.content.replyTo,
				}"
				@mouseenter="showActions = true"
			>
				<div
					v-if="
						(!isPreviousDirectionSame && message.sentAt) ||
						dayjs(message.sentAt).diff(dayjs(previousSentAt), 'minute') > 5
					"
					class="chat-header"
				>
					<time class="text-xs opacity-10">{{ $formatDateTime(message.sentAt, $i18n.locale) }}</time>
				</div>
				<div class="relative" v-if="message.content.replyTo || message.repliedMessage">
					<span
						class="absolute w-0.5 h-full rounded-full -bottom-2 bg-base-200"
						:class="isOwn ? 'right-0' : 'left-0'"
					/>
					<div class="px-2">
						<div
							v-if="message.repliedMessage"
							class="text-xs p-2 bg-base-200 rounded-xl opacity-50 cursor-pointer"
							@click="scrollToID(message.repliedMessage?.id)"
						>
							<span class="line-clamp-3 max-w-64">
								{{ message.repliedMessage?.content.text || message.repliedMessage?.content.title }}
							</span>
						</div>
						<div
							v-if="message.content.replyTo?.story?.url"
							class="w-24 h-43 bg-base-200 rounded-2xl overflow-hidden flex items-center justify-center my-0.5"
						>
							<ImageVideoPreview :src="message.content.replyTo.story.url" :alt="message.content.text" />
						</div>
					</div>
				</div>
				<div class="flex items-center" :chat-message="true">
					<div
						class="relative text-sm max-w-72 break-words"
						:class="[
							{
								'min-w-24': !isOnlyEmoji,
								'bg-primary text-white':
									isOwn && message.status !== STATUS.WAITING && !isOnlyEmoji && !message.content.isUnsupported,
								'bg-primary-content text-primary': message.status === STATUS.WAITING,
								'before:hidden': isNextDirectionSame,
								'rounded-tr-sm rounded-br-sm': isOwn && isPreviousDirectionSame,
								'rounded-tr-xs': isOwn && isPreviousDirectionSame,

								'bg-base-200 text-base-content': !isOwn && !isOnlyEmoji && !message.content.isUnsupported,
								'rounded-tl-sm rounded-bl-sm': !isOwn && isPreviousDirectionSame,
								'rounded-tl-xs': !isOwn && isPreviousDirectionSame,
								'mb-4': message.content?.reaction?.reaction,
								'chat-bubble': !isOnlyEmoji && !message.content.isUnsupported,
							},
							isOwn ? 'order-2' : 'order-1',
						]"
					>
						<div
							v-if="message.content?.reaction?.reaction"
							class="absolute z-1 -bottom-4 border-2 border-base-100 bg-base-200 w-9 rounded-full flex items-center justify-center"
							:class="isOwn ? ' right-0' : 'left-0'"
						>
							<Reaction :icon="message.content?.reaction?.reaction" :emoji="message.content?.reaction?.emoji" />
						</div>
						<!-- Text Content -->
						<div
							class="overflow-hidden"
							v-if="message.content?.hasText"
							:class="{ 'py-2': isOnlyEmoji }"
							v-auto-animate
						>
							<span
								:class="{ 'text-4xl': isOnlyEmoji }"
								class="whitespace-pre-wrap"
								v-html="formatTextWithLinks(message.content?.text || message.content?.title)"
							/>
							<div class="divider my-0" v-if="message.content?.translatedText?.length > 3 && showTranslatedMessages" />
							<span
								v-if="showTranslatedMessages && message.content?.translatedText?.length > 3"
								:class="{ 'text-xs opacity-50 whitespace-pre-wrap': message.content?.translatedText }"
							>
								{{ message.content?.translatedText }}
							</span>
						</div>
						<i class="opacity-55" v-if="message.content.isUnsupported">
							{{ $t('components.chat.content.chatMessage.unsupportedContent') }}
						</i>

						<div v-if="message.hasAttachments" class="my-1 space-y-2 overflow-hidden">
							<template v-for="attachment in message.content.attachments" :key="attachment.id || attachment.url">
								<ImagePreview v-if="attachment.type === 'image'" :attachment="attachment.payload" />
								<VideoPreview v-else-if="attachment.type === 'video'" :attachment="attachment.payload" />
								<AudioPreview v-else-if="attachment.type === 'audio'" :attachment="attachment.payload" />
								<FilePreview v-else-if="attachment.type === 'file'" :attachment="attachment.payload" />
								<!--					<StickerPreview v-else-if="attachment.type === 'sticker'" :attachment="attachment.payload" />-->
								<IgReelPreview v-else-if="attachment.type === 'ig_reel'" :attachment="attachment.payload" />
								<IgStoryPreview v-else-if="attachment.type === 'ig_story'" :attachment="attachment.payload" />
								<StoryMentionPreview v-else-if="attachment.type === 'story_mention'" :attachment="attachment.payload" />
								<SharePreview v-else-if="attachment.type === 'share'" :attachment="attachment.payload" />
								<TemplatePreview v-else-if="attachment.type === 'template'" :attachment="attachment.payload" />
								<i class="opacity-55" v-else-if="attachment.type === 'ephemeral'">
									{{ $t('components.chat.content.chatMessage.unsupportedContent') }}
								</i>
							</template>
						</div>
					</div>
					<div
						class="gap-2 flex z-1 chat-actions"
						v-if="!message.content?.isUnsupported"
						:class="[
							isOwn ? 'order-1 flex-row-reverse' : 'order-2',
							// { hidden: !message.content?.isLiked && !isTranslating },
						]"
					>
						<template v-if="message.status !== STATUS.FAILED">
							<template v-if="contact?.isAnswerable">
								<button
									v-if="!isShareMode"
									class="btn btn-ghost btn-xs btn-circle border-0 p-3 hover:bg-base-100 group-active:flex"
									v-show="(showActions && !isTranslating) || message.content?.isLiked"
									@click="toggleLikeMessage(message)"
								>
									<i class="fa-regular fa-heart text-sm" :class="{ 'text-red fa-solid': message.content?.isLiked, 'heart-pop': heartAnimating }" />
								</button>
								<button
									v-if="chatAccountSource === 'meta' && !isShareMode"
									class="btn btn-ghost btn-xs btn-circle border-0 p-3 hover:bg-base-100 group-active:flex"
									v-show="showActions && !isTranslating"
									@click.stop="setRepliedMessage(message)"
								>
									<i class="fa-solid fa-reply text-sm" />
								</button>
							</template>

							<template v-if="!isShareMode">
								<button
									v-if="showTranslateButton"
									class="btn btn-ghost btn-xs btn-circle border-0 p-3 hover:bg-base-100 group-active:flex"
									v-show="showActions && !isTranslating"
									:class="[isOwn ? 'order-1' : 'order-2']"
									@click="translateMessage(message)"
								>
									<loading-element :is-loading="isTranslating" size="18">
										<i class="fa fa-language text-sm" />
									</loading-element>
								</button>
								<button
									class="btn btn-ghost btn-xs btn-circle border-0 p-3 hover:bg-base-100 group-active:flex"
									v-show="showActions && !isTranslating"
									@click.stop="openShareMode(message)"
								>
									<i class="fa-solid fa-share-from-square text-sm" />
								</button>
							</template>
						</template>

						<button
							v-if="!isShareMode && message.status === STATUS.FAILED && isOwn"
							class="btn btn-ghost btn-xs btn-circle border-0 p-3 hover:bg-base-100 group-active:flex"
							v-show="showActions"
							@click="retryMessage"
						>
							<loading-element :is-loading="isLoading" size="16">
								<i class="fa fa-redo text-sm" />
							</loading-element>
						</button>
					</div>
				</div>
				<div v-if="isOwn" class="chat-footer text-xs opacity-30">
					<Transition name="status-fade" mode="out-in">
						<span v-if="message.status === STATUS.WAITING" key="waiting">
							<i class="fa-solid fa-spinner fa-spin" />
							{{ $t('components.chat.content.chatMessage.messageStatus.waitingToSend') }}
						</span>
						<span v-else-if="message.status === STATUS.QUEUED" key="queued">
							<i class="fa-solid fa-clock" /> {{ $t('components.chat.content.chatMessage.messageStatus.queued') }}
						</span>
						<span v-else-if="message.status === STATUS.SENDING" key="sending">
							<i class="fa-solid fa-paper-plane" /> {{ $t('components.chat.content.chatMessage.messageStatus.sending') }}
						</span>
						<span v-else-if="message.status === STATUS.FAILED" key="failed" class="text-error">
							<i class="fa-solid fa-times" />
							{{
								$t('components.chat.content.chatMessage.messageStatus.failedAt', {
									date: dayjs(message.failedAt).format('HH:mm'),
								})
							}}
						</span>
						<span v-else-if="!isNextDirectionSame && message.status === STATUS.SENT" key="sent">
							<i class="fa fa-check" />
							{{
								$t('components.chat.content.chatMessage.messageStatus.sentAt', {
									date: dayjs(message.sentAt).format('HH:mm'),
								})
							}}
						</span>
						<span v-else-if="!isNextDirectionSame && message.status === STATUS.READ" key="read">
							<i class="fa fa-check-double" />
							{{
								$t('components.chat.content.chatMessage.messageStatus.readAt', {
									date: dayjs(message.readAt).format('HH:mm'),
								})
							}}
						</span>
					</Transition>
				</div>
			</div>
			<div
				v-if="isOwn"
				class="avatar avatar-placeholder hidden sm:block p-px cursor-default"
				:class="{ 'opacity-0': isNextDirectionSame && isNextUserSame }"
			>
				<div
					v-if="message.userId"
					v-tooltip.right="'#' + message.userId + ' ' + message.userName"
					class="w-8 rounded-full ring-primary ring-1"
					:class="{ 'bg-subtle': nameFirstLetters }"
				>
					<span class="text-xs">{{ nameFirstLetters }}</span>
				</div>
				<div
					v-else-if="message.origin === ORIGIN.FLOW"
					class="bg-primary/20 text-primary w-8 rounded-full"
					v-tooltip.right="'#' + message.flowId + ' ' + message.flowName"
				>
					<!-- TODO :: flowId ve flowName gelmiyor -->
					<i class="fa fa-paper-plane fa-xs" />
				</div>
				<div
					v-else-if="message.origin === ORIGIN.SYSTEM"
					class="bg-instagram/20 text-instagram w-8 rounded-full"
					v-tooltip.right="$t('components.chat.content.chatMessage.sentViaExternalApp')"
				>
					<i class="fa fa-mobile-alt fa-xs" />
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import ProfilePicture from '~/components/GlobalComponents/ProfilePicture.vue'
import ImagePreview from '~/components/Chat/Content/MessageTypes/ImagePreview.vue'
import VideoPreview from '~/components/Chat/Content/MessageTypes/VideoPreview.vue'
import AudioPreview from '~/components/Chat/Content/MessageTypes/AudioPreview.vue'
import IgReelPreview from '~/components/Chat/Content/MessageTypes/IgReelPreview.vue'
import IgStoryPreview from '~/components/Chat/Content/MessageTypes/IgStoryPreview.vue'
import StoryMentionPreview from '~/components/Chat/Content/MessageTypes/StoryMentionPreview.vue'
// import FilePreview from '~/components/Chat/MessageTypes/FilePreview.vue'
// import StickerPreview from '~/components/Chat/MessageTypes/StickerPreview.vue'
import dayjs from 'dayjs'
import ReactionButton from '~/components/Chat/Content/MessageTypes/ReactionButton.vue'
import apiList from '~/apis/ApiList'
import Reaction from '~/components/Chat/Content/MessageTypes/Reaction.vue'
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import emojiRegex from 'emoji-regex'
import TemplatePreview from '~/components/Chat/Content/MessageTypes/TemplatePreview.vue'
import { DIRECTION, Message, ORIGIN, REACTION, STATUS } from '~/models/Conversation/Message.js'
import { Contact } from '~/models/Contact/Contact.js'
import SharePreview from '~/components/Chat/Content/MessageTypes/SharePreview.vue'
import ImageVideoPreview from '~/components/Chat/Content/MessageTypes/ImageVideoPreview.vue'
import FilePreview from '~/components/Chat/Content/MessageTypes/FilePreview.vue'

export default {
	name: 'ChatMessage',
	components: {
		FilePreview,
		SharePreview,
		TemplatePreview,
		LoadingElement,
		Reaction,
		ReactionButton,
		ProfilePicture,
		ImagePreview,
		VideoPreview,
		AudioPreview,
		// FilePreview,
		// StickerPreview,
		IgReelPreview,
		IgStoryPreview,
		StoryMentionPreview,
		ImageVideoPreview,
	},
	props: {
		previousDirection: {
			default: null,
		},
		nextDirection: {
			default: null,
		},
		nextUserId: {
			default: null,
		},
		contact: {
			type: Contact,
			default: null,
		},
		message: {
			type: Message,
			default: null,
		},
		showTranslatedMessages: {
			type: Boolean,
			default: false,
		},
		previousSentAt: {
			type: Date,
		},
		selectedMessageIds: {
			type: Array,
			default: () => [],
		},
		isShareMode: {
			type: Boolean,
			default: false,
		},
		chatAccountSource: {
			type: String,
			default: null,
		},
	},
	inject: {
		scrollerRef: {
			default: null,
		},
	},
	data() {
		return {
			REACTION,
			isTranslating: false,
			isOnlyEmoji: false,
			isLoading: false,
			showActions: false,
			heartAnimating: false,
		}
	},
	mounted() {
		this.checkOnlyEmoji(this.message.content?.text)
	},
	methods: {
		dayjs,
		checkOnlyEmoji(text) {
			if (!text) return false
			const regex = emojiRegex()
			const stripped = text.trim().replace(/\s+/g, '')
			const matches = stripped.match(regex) || []
			this.isOnlyEmoji = matches.join('') === stripped
		},
		formatTextWithLinks(text) {
			if (!text) return ''
			const urlRegex = /(https?:\/\/[^\s<]+)/g
			return text.replace(urlRegex, (url) => {
				const escapedUrl = url.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
				return `<a href="${escapedUrl}" target="_blank" rel="noopener noreferrer" class="underline hover:opacity-80">${escapedUrl}<i class="fa fa-external-link text-xs icon-transition"></i></a>`
			})
		},
		toggleLikeMessage(message) {
			this.heartAnimating = true
			setTimeout(() => { this.heartAnimating = false }, 300)

			if (message.content?.isLiked) {
				message.content.isLiked = false
				this.$requestAdapter
					.post(
						apiList.chat.instagram.chatAccountId.conversation.conversationId.like,
						{
							action: 'unlike',
							messageId: message.id,
						},
						{
							chatAccountId: message.chatAccountId,
							conversationId: message.conversationId,
						},
					)
					.then(() => {
						message.content.isLiked = false
					})
					.catch((error) => {
						consoleLog(error)
						message.content.isLiked = true
					})
			} else {
				message.content.isLiked = true
				this.$requestAdapter
					.post(
						apiList.chat.instagram.chatAccountId.conversation.conversationId.like,
						{
							action: 'like',
							messageId: message.id,
						},
						{
							chatAccountId: message.chatAccountId,
							conversationId: message.conversationId,
						},
					)
					.then(() => {
						message.content.isLiked = true
					})
					.catch((error) => {
						consoleLog(error)
						message.content.isLiked = false
					})
			}
		},
		translateMessage(message) {
			this.isTranslating = true
			this.$requestAdapter
				.post(
					apiList.chat.instagram.chatAccountId.conversation.conversationId.translateMessage,
					{
						messageId: message.id,
					},
					{
						chatAccountId: message.chatAccountId,
						conversationId: message.conversationId,
					},
				)
				.then((res) => {
					message.content.translatedText = res.data.content.translated_text
					message.content.targetLanguage = res.data.content.target_language
					message.content.language = res.data.content.language
				})
				.finally(() => {
					this.isTranslating = false
				})
		},
		scrollToID(id) {
			const scroller = this.scrollerRef()
			if (!scroller) {
				return
			}

			// DynamicScroller'ın items array'inde mesajı bul
			const index = scroller.items.findIndex((item) => item.id === id)

			if (index === -1) {
				return
			}

			scroller.scrollToItem(index)

			setTimeout(() => {
				const el = document.querySelector(`[data-index="${index}"] [chat-message=true]`)
				if (el) {
					el.style.transition = 'transform 0.3s ease, filter 0.3s ease'

					// Başlangıç efekti
					el.style.filter = 'drop-shadow(0 0 14px rgba(88, 94, 238, 0.55))' // kendi primary rgb
					el.style.transform = 'scale(1.1)'

					// 1 saniye sonra reset
					setTimeout(() => {
						el.style.transform = 'scale(1)'
						el.style.filter = 'drop-shadow(0 0 0 rgba(0,0,0,0))'
					}, 1000)
				}
			}, 100)
		},
		retryMessage() {
			this.isLoading = true
			this.$requestAdapter
				.post(
					apiList.chat.instagram.chatAccountId.conversation.conversationId.retrySend,
					{
						messageId: this.message.id,
					},
					{
						chatAccountId: this.message.chatAccountId,
						conversationId: this.message.conversationId,
					},
				)
				.then((res) => {
					this.message.status = STATUS.SENT
				})
				.catch((err) => {
					consoleLog(err)
				})
				.finally(() => {
					this.isLoading = false
				})
		},
		openShareMode(message) {
			if (message.status === STATUS.FAILED) return
			this.$emit('manageShareMessage', message.id)
		},
		setRepliedMessage(message) {
			this.$emit('setRepliedMessage', message)
		},
	},
	emits: ['setRepliedMessage', 'manageShareMessage'],
	setup() {
		return {}
	},
	computed: {
		ORIGIN() {
			return ORIGIN
		},
		STATUS() {
			return STATUS
		},
		isOwn() {
			return this.message.direction === DIRECTION.OUTBOUND
		},
		isPreviousDirectionSame() {
			return this.previousDirection === this.message.direction
		},
		isNextDirectionSame() {
			return this.nextDirection === this.message.direction
		},
		isNextUserSame() {
			return this.nextUserId === this.message.userId
		},
		nameFirstLetters() {
			if (!this.message.userName) {
				return ''
			}
			const names = this.message.userName?.split(' ') || []
			if (names.length === 1) {
				return names[0].charAt(0).toUpperCase()
			} else if (names.length > 1) {
				return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase()
			}
			return ''
		},
		showTranslateButton() {
			if (!this.showTranslatedMessages) {
				return false
			}

			if (!this.message.chatAccount?.targetLanguage) {
				return false
			}

			if (!this.message?.content?.text || this.message.content.text.length <= 3) {
				return false
			}

			if (!this.message.content?.translatedText) {
				return true
			}

			if (this.message.content?.translatedLanguage === this.message.chatAccount?.targetLanguage) {
				return false
			}

			return this.message.content?.language !== this.message.chatAccount?.targetLanguage
		},
		isMessageSelected() {
			return this.selectedMessageIds.includes(this.message.id)
		},
	},
}
</script>
