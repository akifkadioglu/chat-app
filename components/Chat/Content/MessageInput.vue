<template>
	<footer v-if="conversation?.id" ref="footer" class="relative">
		<DevTestScenario :buttons="messageDisabledDevButtons" />
		<AgentPresenceBar
			v-if="teamStore.team?.id && presenceUsers.length > 0"
			:key="conversation.id"
			:presenceUsers="presenceUsers"
			:whisperMessage="whisperMessage[conversation.id]"
			@update:whisperMessage="whisperMessage[conversation.id] = $event"
			@whisperInput="agentAction = AgentActions.WHISPERING"
			@whisperClear="agentAction = AgentActions.WATCHING"
		/>
		<!--			@whisperBlur="agentAction = AgentActions.WATCHING"-->
		<div
			class="bottom-0 relative w-full border-t border-base-200 bg-base-100 pr-2 pb-2 pt-1 flex-shrink-0 flex items-end gap-px"
		>
			<div v-if="isShareMode" class="w-full mx-auto text-center space-y-5 py-3">
				<div>
					{{
						$t('components.chat.content.messageInput.shareMode.messagesSelected', { count: selectedMessageIds.length })
					}}
				</div>
				<div class="space-x-5 flex justify-center items-center">
					<button @click.prevent="$emit('exitMessagesShareMode')" class="btn btn-soft btn-error btn-sm btn-transition">
						<i class="fa fa-times" />
						{{ $t('components.chat.content.messageInput.shareMode.cancel') }}
					</button>
					<ShareDropdown
						:url="createShareUrl"
						:download-filename="$t('components.chat.content.messageInput.shareDropdown.downloadFilename')"
						:title="$t('components.chat.content.messageInput.shareDropdown.title')"
						@hide="shareDropdownHide"
					>
						<button class="btn btn-primary btn-transition btn-sm" :disabled="!selectedMessageIds.length">
							<loading-element size="12" :is-loading="shareLoading" v-auto-animate>
								<i class="fa-solid fa-share-from-square" />
							</loading-element>
							<span>{{ $t('components.chat.content.messageInput.shareMode.share') }}</span>
						</button>
					</ShareDropdown>
				</div>
			</div>

			<div v-if="!isShareMode" class="flex flex-1 h-full">
				<div>
					<CustomDropdown ref="dropdown">
						<button class="btn btn-ghost btn-sm mb-1" :disabled="messageDisabled">
							<i class="fa fa-plus" />
						</button>
						<template #popper="{ shown, hide }">
							<div class="w-max bg-base-100">
								<div class="z-1 w-max p-2 shadow-lg mx-end">
									<AudioUpload
										ref="audioUpload"
										v-model="selectedAudio"
										:disabled="
											!!localMessage[this.conversation.id] ||
											selectedImages.length > 0 ||
											selectedFiles.length > 0 ||
											isUploading
										"
										@uploaded="$refs.dropdown.hide()"
									/>
									<ImageUpload
										ref="imageUpload"
										v-model="selectedImages"
										:disabled="
											!!localMessage[this.conversation.id] ||
											!!selectedAudio.cloudUrl ||
											selectedFiles.length > 0 ||
											isUploading
										"
										@update:modelValue="$refs.dropdown.hide()"
									/>
									<FileUpload
										ref="fileUpload"
										v-model="selectedFiles"
										:disabled="
											!!localMessage[this.conversation.id] ||
											selectedImages.length > 0 ||
											!!selectedAudio.cloudUrl ||
											isUploading
										"
										@update:modelValue="$refs.dropdown.hide()"
									/>
								</div>
							</div>
						</template>
					</CustomDropdown>
					<TriggerSingleFlow placement="top-start" :contactId="conversation.contact.id?.toString()">
						<template #triggerButton>
							<button class="btn btn-ghost btn-sm mb-1" :disabled="messageDisabled">
								<i class="fa fa-paper-plane" />
							</button>
						</template>
					</TriggerSingleFlow>
				</div>

				<div class="flex-1 rounded-lg border relative border-base-200 h-full pb-9">
					<!-- Reply Preview -->
					<div v-if="repliedMessage" class="flex items-center gap-2 mx-2 mt-2 mb-1">
						<div class="flex-1 flex items-center bg-base-200/80 rounded-lg overflow-hidden">
							<div class="w-1 self-stretch bg-primary rounded-l-lg" />
							<div class="flex-1 px-3 py-2 min-w-0">
								<p class="text-xs font-medium text-primary mb-0.5">
									{{
										repliedMessage.direction === 'outbound'
											? $t('components.chat.content.messageInput.you')
											: conversation?.contact?.name || conversation?.contact?.platformAccountsInstagram?.username
									}}
								</p>
								<p class="text-sm text-muted truncate">
									{{
										repliedMessage.content?.text ||
										repliedMessage.content?.title ||
										$t('components.chat.content.messageInput.replyingToMedia')
									}}
								</p>
							</div>
						</div>
						<button class="btn btn-ghost btn-sm btn-circle text-muted hover:text-base-content" @click="cancelReply">
							<i class="fa fa-times" />
						</button>
					</div>
					<!-- Images Preview from ImageUpload component will be shown here -->
					<!--				<ImageUpload ref="imageUpload" v-model="selectedImages" />-->
					<!--			min-h-32 sm:min-h-40-->
					<!--				<div-->
					<!--					v-if="conversation && !conversation?.contact?.isAnswerable"-->
					<!--					class="absolute top-0 text-xs mb-2 text-base-content/70 z-9 p-2 rounded bg-surface-secondary w-full h-full"-->
					<!--				>-->
					<!--					sus-->
					<!--				</div>-->
					<MessageInputRestriction
						v-if="conversation && messageDisabled"
						:contact="conversation.contact"
						:chat-account="conversation.chatAccount"
						class="absolute top-0 text-xs mb-2 text-muted z-1 p-1 rounded bg-surface-secondary w-full h-full"
					/>
					<div v-else-if="selectedImages.length > 0 || selectedAudio.cloudUrl || selectedFiles.length > 0" class="z-1">
						<FilePreviews
							ref="filePreviews"
							:images="selectedImages"
							:audio="selectedAudio"
							:files="selectedFiles"
							@update:images="selectedImages = $event"
							@update:audio="selectedAudio = $event"
							@update:files="selectedFiles = $event"
						/>
					</div>
					<textarea-autosize
						v-if="selectedImages.length === 0 && !selectedAudio.cloudUrl && selectedFiles.length === 0"
						ref="messageTextarea"
						:disabled="!conversation || !conversation?.contact?.isAnswerable || isUploading"
						v-model="localMessage[this.conversation.id]"
						class="textarea w-full pr-25 focus:outline-none border-0 rounded-0 h-full bg-transparent"
						:placeholder="typingPlaceholder || $t('components.chat.content.messageInput.messagePlaceholder')"
						rows="2"
						:maxHeight="150"
						inputmode="text"
						@keydown="handleKeyDown"
						@input="inputMessage"
					/>
					<!--						@blur="agentAction = AgentActions.WATCHING"-->
					<!--				:style="{ height: textAreaHeight }"-->
					<!--				@input="autoResize"-->
					<div class="absolute bottom-0 left-0 px-2 pb-1 flex justify-between items-end z-1">
						<div class="flex-1 truncate px-1 pb-px" v-if="conversation && conversation.chatAccount">
							<ProfilePicture
								:src="conversation.chatAccount.postAccount.profilePicture"
								:size="20"
								:ring-color="conversation.chatAccount.ringColor"
								ring="ring-2"
							/>
							<small>
								{{ conversation.chatAccount.postAccount.name || conversation.chatAccount.postAccount.username }}
							</small>
						</div>
					</div>
					<div class="absolute bottom-0 right-0 px-2 pb-1">
						<div class="flex flex-col items-end">
							<div v-if="showTargetLanguageDropdown">
								<CustomDropdown container="#appPage" ref="targetLanguageDropdown">
									<slot name="triggerButton">
										<a href="javascript:void(0)" role="button" class="text-xs">
											<span>{{ $t('components.chat.content.messageInput.translateTo') }}</span>
											<span v-if="targetLanguage">
												<LanguageName :code="targetLanguage" class="underline font-black" />
												<LanguageFlag size="15" :code="targetLanguage" />
											</span>
											<span v-else class="underline font-black">
												<i class="fa fa-language"></i>
											</span>
										</a>
									</slot>
									<template #popper="{ shown, hide }">
										<div class="w-max bg-base-100">
											<ul class="menu z-1 w-max p-2 shadow-lg mx-end" tabindex="0">
												<li v-for="language in availableLanguages" :key="language.code" @click="hide">
													<a href="javascript:void(0)" @click="targetLanguage = language.code.split('_')[0]">
														<LanguageFlag :code="language.code" />
														<LanguageName :code="language.code" />
													</a>
												</li>
											</ul>
										</div>
									</template>
								</CustomDropdown>
							</div>
							<div class="flex justify-end items-center">
								<button
									v-if="showTranslateButton"
									:class="translateButtonClass"
									:disabled="isTranslating"
									class="btn transition-all duration-200 rounded-r-none btn-sm pointer-events-auto"
									@click="handleTranslateClick"
								>
									<loading-element :is-loading="isTranslating">
										<i class="fa fa-language" />
									</loading-element>
								</button>
								<button
									:class="sendButtonClass"
									:disabled="!canSendMessage || !conversation.id || isUploading"
									@click="sendMessage"
									class="pointer-events-auto btn transition-all duration-200 btn-sm"
								>
									<i class="fa fa-paper-plane"></i>
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</footer>
</template>
<script>
import apiList from '~/apis/ApiList.js'
import ProfilePicture from '~/components/GlobalComponents/ProfilePicture.vue'
import LanguageFlag from '~/components/GlobalComponents/LanguageFlag.vue'
import LanguageName from '~/components/GlobalComponents/LanguageName.vue'
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import pkg from 'lodash'
import { availableLanguages } from '~/helpers/availableLanguages.js'
import CopyToClipboard from '~/components/GlobalComponents/Elements/CopyToClipboard.vue'
import ShareDropdown from '~/components/GlobalComponents/ShareDropdown.vue'
import { DIRECTION, Message, ORIGIN, STATUS } from '~/models/Conversation/Message.js'
import { Conversation } from '~/models/Conversation/Conversation.js'
import TextareaAutosize from '~/components/GlobalComponents/Elements/TextareaAutosize.vue'
import MessageInputRestriction from '~/components/Chat/Content/MessageInputRestriction.vue'
import CustomDropdown from '~/components/GlobalComponents/CustomDropdown.vue'
import ImageUpload from '~/components/Chat/Content/MessageInput/ImageUpload.vue'
import AudioUpload from '~/components/Chat/Content/MessageInput/AudioUpload.vue'
import FilePreviews from '~/components/Chat/Content/MessageInput/FilePreviews.vue'
import { handleDroppedFiles } from '~/helpers/fileUploadFunctions.js'
import FileUpload from '~/components/Chat/Content/MessageInput/FileUpload.vue'
import TriggerSingleFlow from '~/components/Flow/TriggerSingleFlow/TriggerSingleFlow.vue'
import AgentPresenceBar from '~/components/Chat/Content/AgentPresenceBar.vue'
import { AgentActions } from '~/composables/useAgentPresence.js'
import DevTestScenario from '~/components/GlobalComponents/DevTestScenario.vue'
import { FREE_ACTIVE_CONTACTS_LIMIT } from '~/models/Pricing/Plan.ts'
import { STATUS_REASON_CODE } from '~/models/ChatAccount.ts'
import featureList from '~/types/featureList.ts'

const { debounce } = pkg

export default {
	components: {
		DevTestScenario,
		AgentPresenceBar,
		FileUpload,
		TriggerSingleFlow,
		FilePreviews,
		AudioUpload,
		CustomDropdown,
		MessageInputRestriction,
		TextareaAutosize,
		CopyToClipboard,
		ShareDropdown,
		LoadingElement,
		LanguageName,
		LanguageFlag,
		ProfilePicture,
		ImageUpload,
	},
	setup() {
		const agentPresence = useAgentPresence()
		return {
			conversationMessagesStore: useConversationMessagesStore(),
			authStore: useAuthStore(),
			teamStore: useTeamStore(),
			agentPresence,
			presenceUsers: agentPresence.presenceUsers,
			AgentActions,
		}
	},
	props: {
		conversation: {
			type: Conversation,
			default: null,
		},
		isShareMode: {
			type: Boolean,
			default: false,
		},
		selectedMessageIds: {
			type: Array,
			default: [],
		},
		isUploading: {
			type: Boolean,
			default: false,
		},
		visualTranslateToLanguage: {
			type: String,
			default: null,
		},
	},
	data() {
		return {
			availableLanguages,
			targetLanguage: this.visualTranslateToLanguage,
			textLanguage: '',
			localMessage: {},
			localReplyTo: {},
			originalMessage: {},
			translated: false,
			isTranslating: false,
			shareLoading: false,
			selectedImages: [],
			selectedAudio: {},
			selectedFiles: [],
			repliedMessage: null,
			whisperMessage: {},
			agentAction: AgentActions.WATCHING,
			messageDisabledDevButtons: [
				{
					name: 'Status: Passive',
					action: () => {
						if (this.conversation?.chatAccount) {
							this.conversation.chatAccount.isStatusActive = ref(false)
						}
					},
				},
				{
					name: 'Status: Active',
					action: () => {
						if (this.conversation?.chatAccount) {
							this.conversation.chatAccount.isStatusActive = ref(true)
						}
					},
				},
				{
					name: 'Status Reason Code: DM ACCESS DISABLED',
					action: () => {
						if (this.conversation?.chatAccount) {
							this.conversation.chatAccount.statusReasonCode = ref(STATUS_REASON_CODE.DM_ACCESS_DISABLED)
						}
					},
				},
				{
					name: 'Status Reason Code: ACTIVE',
					action: () => {
						if (this.conversation?.chatAccount) {
							this.conversation.chatAccount.statusReasonCode = ref(STATUS_REASON_CODE.ACTIVE)
						}
					},
				},
				{
					name: 'Limit: Reached (Free)',
					action: () => {
						const ca = this.conversation?.chatAccount
						if (!ca) return
						ca.subscribed = ref(false)
						ca.reachedContactLimit = ref(true)
						ca.needsUpgrade = ref(true)
					},
				},
				{
					name: 'Limit: Reached (Subscribed)',
					action: () => {
						const ca = this.conversation?.chatAccount
						if (!ca) return
						ca.subscribed = ref(true)
						ca.reachedContactLimit = ref(true)
						ca.needsUpgrade = ref(false)
					},
				},
				{
					name: 'Toggle Overage Limit Filled',
					action: () => {
						const ca = this.conversation?.chatAccount
						if (!ca) return
						ca.reachedContactLimit = ref(!ca.overageLimitFilled)
						ca.needsUpgrade = ref(!ca.overageLimitFilled)
						ca.overageLimitFilled = ref(!ca.overageLimitFilled)
					},
				},
				{
					name: 'Limit: Cleared',
					action: () => {
						if (this.conversation?.chatAccount) {
							this.conversation.chatAccount.reachedContactLimit = ref(false)
							this.conversation.chatAccount.needsUpgrade = ref(false)
							this.conversation.chatAccount.overageLimitFilled = ref(false)
						}
					},
				},
				{
					name: 'Contact: Not Answerable',
					action: () => {
						if (this.conversation?.contact) {
							this.conversation.contact.isAnswerable = false
						}
					},
				},
				{
					name: 'Contact: Answerable',
					action: () => {
						if (this.conversation?.contact) {
							this.conversation.contact.isAnswerable = true
						}
					},
				},
			],
		}
	},
	mounted() {
		if (this.conversation?.id) {
			this.localMessage[this.conversation.id] = ''
		}
		this.getLocalMessageFromStorage()
		this.findTargetLanguage(this.lastKnownLanguageContactMessage?.content?.language)

		this._onVisibilityChange = () => {
			if (!this.teamStore.team?.id) return
			if (document.hidden) {
				this.agentPresence.clearPresence({ conversationId: this.conversation?.id, user: this.authStore.user })
			} else {
				this.syncTypingState()
			}
		}
		document.addEventListener('visibilitychange', this._onVisibilityChange)
	},
	beforeUnmount() {
		document.removeEventListener('visibilitychange', this._onVisibilityChange)
		const cid = this.conversation?.id
		const user = this.authStore.user
		if (cid && user?.id) {
			this.agentPresence.clearPresence({ conversationId: cid, user })
		}
	},
	computed: {
		lastKnownLanguageContactMessage() {
			if (!this.conversation) {
				return null
			}
			return this.conversationMessagesStore.getLastKnownLanguageContactMessage(this.conversation.id)
		},
		currentLocalMessage() {
			return this.localMessage[this.conversation?.id]
		},
		messageDisabled() {
			if (!this.conversation.chatAccount.isStatusActive) {
				return true
			}
			if (this.conversation.chatAccount.needsUpgrade) {
				return true
			}
			if (!this.conversation.contact?.isAnswerable) {
				return true
			}
			if (this.conversation.chatAccount.statusReasonCode === STATUS_REASON_CODE.DM_ACCESS_DISABLED) {
				return true
			}
			return false
		},
		canSendMessage() {
			return (
				(this.currentLocalMessage ?? '').trim() ||
				this.selectedImages.some((img) => img.cloudUrl) ||
				!!this.selectedAudio.cloudUrl ||
				this.selectedFiles.some((file) => file.cloudUrl)
			)
		},
		writingUsers() {
			return this.presenceUsers.filter((u) => u.text)
		},
		typingPlaceholder() {
			return this.writingUsers[0]?.text || ''
		},
		translateRequiresUpgrade() {
			return !this.conversation?.chatAccount?.subscribed
		},
		showTranslateButton() {
			return !!this.conversation?.chatAccount?.targetLanguage || this.translateRequiresUpgrade
		},
		showTargetLanguageDropdown() {
			return this.showTranslateButton && !(this.selectedImages.length > 0 || this.selectedAudio.cloudUrl)
		},
		hasMessageText() {
			return !!(this.currentLocalMessage ?? '').trim()
		},
		translateButtonClass() {
			return {
				'btn-success shadow-lg hover:shadow-xl': this.hasMessageText,
				'btn-disabled': !this.hasMessageText,
				'w-7': this.translateRequiresUpgrade || (this.translated && !this.isTranslating),
				'w-15': !this.translateRequiresUpgrade && (!this.translated || this.isTranslating),
			}
		},
		sendButtonClass() {
			const translateCompact = this.showTranslateButton && !this.translateRequiresUpgrade && (!this.translated || this.isTranslating)
			return {
				'btn-primary shadow-lg hover:shadow-xl': this.canSendMessage,
				'btn-disabled': !this.canSendMessage,
				'rounded-l-none': this.showTranslateButton,
				'w-7': translateCompact,
				'w-15': this.showTranslateButton && !translateCompact,
				'w-18': !this.showTranslateButton,
			}
		},
	},
	watch: {
		'conversation.id': {
			immediate: true,
			handler(id, oldId) {
				if (oldId) {
					this.agentPresence.clearPresence({ conversationId: oldId, user: this.authStore.user })
				}
				this.translated = false
				this.findTargetLanguage(this.lastKnownLanguageContactMessage?.content?.language)
				this.$emit('exitMessagesShareMode')
				if (this.teamStore.team?.id) {
					this.agentPresence.listenPresence(id, this.authStore.user?.id)
					this.syncTypingState()
				}
			},
		},
		agentAction() {
			this.syncTypingState()
		},
		whisperMessage: {
			deep: true,
			handler() {
				this.syncTypingState()
			},
		},
		localMessage: {
			deep: true,
			handler() {
				this.saveLocalStorageDebounce()
				this.syncTypingState()
			},
		},
	},
	emits: ['exitMessagesShareMode'],
	methods: {
		syncTypingState() {
			if (!this.teamStore.team?.id) return
			const cid = this.conversation?.id
			const user = this.authStore.user
			const text = this.currentLocalMessage || ''
			const whisperText = this.whisperMessage[cid] || ''
			this.agentPresence.updatePresence({ conversationId: cid, user, text, whisperText, agentAction: this.agentAction })
		},
		createMessageBase(content) {
			return {
				id: Date.now(),
				conversation_id: this.conversation.id,
				direction: DIRECTION.OUTBOUND,
				origin: ORIGIN.AGENT,
				user_id: this.authStore.user.id,
				content,
				status: STATUS.WAITING,
				sent_at: new Date(),
				replied_message_id: this.repliedMessage?.id,
				replied_message: this.repliedMessage,
			}
		},
		async createShareUrl() {
			const response = await this.$requestAdapter.post(
				apiList.chat.instagram.chatAccountId.conversation.conversationId.hashMessages,
				{
					messageIds: this.selectedMessageIds,
				},
				{
					chatAccountId: this.conversation.chatAccountId,
					conversationId: this.conversation.id,
				},
			)
			return window.location.origin + '/preview/chat/' + response.data.message
		},
		shareDropdownHide(shared) {
			consoleLog('shareDropdownHide called with shared:', shared)
			if (shared) {
				this.$emit('exitMessagesShareMode')
			}
		},

		findTargetLanguage(languageCode) {
			if (!languageCode) return
			const language = availableLanguages.find((lang) => lang.code.split('_')[0] === languageCode)
			const targetLanguage = language ?? availableLanguages[0] //fallback to english
			this.targetLanguage = targetLanguage.code.split('_')[0]
		},
		getLocalMessageFromStorage() {
			this.localMessage = JSON.parse(localStorage.getItem('localMessage') || '{}')
			this.localReplyTo = JSON.parse(localStorage.getItem('localReplyTo') || '{}')
			this.restoreReplyFromStorage()
		},
		saveToLocalStorage() {
			localStorage.setItem('localMessage', JSON.stringify(this.localMessage))
			localStorage.setItem('localReplyTo', JSON.stringify(this.localReplyTo))
		},
		restoreReplyFromStorage() {
			if (this.conversation?.id && this.localReplyTo[this.conversation.id]) {
				this.repliedMessage = this.localReplyTo[this.conversation.id]
			}
		},
		setRepliedMessage(message) {
			this.repliedMessage = message
			if (this.conversation?.id) {
				if (message) {
					this.localReplyTo[this.conversation.id] = message
				} else {
					delete this.localReplyTo[this.conversation.id]
				}
				this.saveLocalStorageDebounce()
			}
		},
		cancelReply() {
			this.setRepliedMessage(null)
		},
		saveLocalStorageDebounce: debounce(function () {
			this.saveToLocalStorage()
		}, 100),
		openTranslateUpgrade() {
			this.$emitter.emit('showUpgradeModal', {
				chatAccount: this.conversation.chatAccount,
				feature: featureList.autoTranslate,
			})
		},
		handleTranslateClick() {
			if (this.translateRequiresUpgrade) {
				this.openTranslateUpgrade()
				return
			}
			this.translate()
		},
		translate() {
			if (this.translateRequiresUpgrade) {
				this.openTranslateUpgrade()
				return
			}
			if (!this.targetLanguage) {
				this.$refs.targetLanguageDropdown.show()
				return
			}
			this.isTranslating = true
			this.$requestAdapter
				.post(
					apiList.chat.instagram.chatAccountId.conversation.conversationId.translateText,
					{
						text: this.localMessage[this.conversation.id],
						language: this.targetLanguage,
					},
					{
						chatAccountId: this.conversation.chatAccountId,
						conversationId: this.conversation.id,
					},
				)
				.then((res) => {
					this.originalMessage[this.conversation.id] = this.localMessage[this.conversation.id]
					this.localMessage[this.conversation.id] = res.data.translation

					this.translated = true
				})
				.catch((err) => {
					consoleLog(err)
				})
				.finally(() => {
					this.isTranslating = false
				})
		},
		handleKeyDown(event) {
			if (event.key === 'Enter' && !event.shiftKey) {
				event.preventDefault()

				if (this.targetLanguage && !this.translateRequiresUpgrade) {
					if (!this.translated) {
						this.translate()
						return
					}
				}
				this.sendMessage()
			}
		},
		// autoResize(event) {
		// 	const textarea = event.target
		// 	consoleLog('autoResize', textarea, textarea.scrollHeight, this.$refs.footer.clientHeight)
		// 	textarea.style.height = 'auto'
		// 	textarea.style.height = Math.min(textarea.scrollHeight, this.$refs.footer.clientHeight - 40) + 'px'
		// },

		buildMessages() {
			const messages = []

			if (this.originalMessage[this.conversation.id]) {
				messages.push(
					this.createMessageBase({
						text: this.originalMessage[this.conversation.id],
						translatedText: this.translated ? this.localMessage[this.conversation.id] : null,
						attachments: [],
						reaction: null,
						targetLanguage: this.targetLanguage,
					}),
				)
			}

			if (this.selectedImages.length > 0) {
				messages.push(
					this.createMessageBase({
						attachments: this.selectedImages.map((img) => ({
							type: 'image',
							payload: { url: img.cloudUrl },
						})),
					}),
				)
			}

			if (this.selectedAudio.cloudUrl) {
				messages.push(
					this.createMessageBase({
						attachments: [
							{
								type: 'audio',
								payload: { url: this.selectedAudio.cloudUrl },
							},
						],
					}),
				)
			}

			if (this.selectedFiles.length > 0) {
				messages.push(
					this.createMessageBase({
						attachments: this.selectedFiles.map((file) => ({
							type: 'file',
							payload: {
								url: file.cloudUrl,
								fileName: file.fileName,
								fileSize: file.fileSize,
								fileType: file.fileType,
							},
						})),
					}),
				)
			}

			return messages
		},
		async sendMessage() {
			if (!this.translated) {
				this.originalMessage[this.conversation.id] = this.localMessage[this.conversation.id]
			}
			if (this.translated) {
				const temp = this.originalMessage[this.conversation.id]
				this.originalMessage[this.conversation.id] = this.localMessage[this.conversation.id]
				this.localMessage[this.conversation.id] = temp
			}
			if (this.canSendMessage && this.conversation.id) {
				const messages = this.buildMessages()

				messages.forEach((msg) => {
					this.conversationMessagesStore.upsertMessage(new Message(msg))
					this.$emitter.emit('scrollMessagesToBottom')
					this.$requestAdapter
						.post(
							apiList.chat.instagram.chatAccountId.conversation.conversationId.send,
							{ ...msg },
							{
								chatAccountId: this.conversation.chatAccountId,
								conversationId: this.conversation.id,
							},
						)
						.then((res) => {
							consoleLog('Message added to conversation RES:', res)
							const messageResponse = res.data.message
							this.conversationMessagesStore.markAsConfirmed(messageResponse.id)
							const messageInResponse = new Message({ ...messageResponse, uuid: msg.uuid })

							this.conversationMessagesStore.upsertMessage(messageInResponse, msg.id)
							this.translated = false
						})
						.catch((err) => {})
						.finally()
				})

				this.localMessage[this.conversation.id] = ''
				this.originalMessage[this.conversation.id] = ''
				this.translated = false
				this.selectedImages = []
				this.selectedAudio = {}
				this.selectedFiles = []
				this.cancelReply()
				if (this.teamStore.team?.id)
					this.agentPresence.clearPresence({ conversationId: this.conversation.id, user: this.authStore.user })
				// Clear files in FilePreviews component
				if (this.$refs.filePreviews) {
					this.$refs.filePreviews.removeAllImages()
					this.$refs.filePreviews.removeAudio()
					this.$refs.filePreviews.removeAllFiles()
				}
			}
		},
		/// animation Methods
		simulateWrite(text, seconds = 2) {
			return new Promise((resolve) => {
				this.localMessage[this.conversation.id] = ''
				let index = 0
				const interval = setInterval(
					() => {
						if (index < text.length) {
							this.localMessage[this.conversation.id] += text.charAt(index)
							index++

							// Textarea-autosize için input event'ini tetikle
							this.$nextTick(() => {
								const textarea = this.$refs.messageTextarea?.$refs.textarea
								if (textarea) {
									textarea.dispatchEvent(new Event('input', { bubbles: true }))
								}
							})
						} else {
							clearInterval(interval)
							resolve()
						}
					},
					(seconds / text.length) * 1000,
				)
			})
		},
		async simulateTranslation(text, seconds = 1) {
			this.isTranslating = true
			await this.$delay(seconds * 1000)
			this.originalMessage[this.conversation.id] = this.localMessage[this.conversation.id]
			this.localMessage[this.conversation.id] = text
			this.$nextTick(() => {
				const textarea = this.$refs.messageTextarea?.$refs.textarea
				if (textarea) {
					textarea.dispatchEvent(new Event('input', { bubbles: true }))
				}
			})
			this.isTranslating = false
			this.translated = true
		},
		async simulateSend() {
			consoleLog('simulateSend called', this.conversation.id)
			const message = new Message({
				id: Date.now(), // Geçici ID, backend'den gerçek ID gelecek
				conversation_id: this.conversation.id,
				direction: DIRECTION.OUTBOUND,
				origin: ORIGIN.AGENT,
				content: {
					text: this.localMessage[this.conversation.id],
					translatedText: this.translated ? this.originalMessage[this.conversation.id] : null,
					attachments: null,
					reaction: null,
					targetLanguage: this.targetLanguage,
				},
				status: STATUS.SENT,
				sent_at: new Date(),
			})

			this.localMessage[this.conversation.id] = ''
			this.originalMessage[this.conversation.id] = null
			this.translated = false
			consoleLog('simulateSend localMessage', this.localMessage[this.conversation.id])
			consoleLog('simulateSend originalMessage', this.originalMessage[this.conversation.id])

			return message
		},
		// Drag & Drop için dosya işleme metodu (resim, audio ve file)
		async handleDroppedFiles(files) {
			await handleDroppedFiles(files, this.selectedImages, this.selectedAudio, this.selectedFiles, this.$requestAdapter)
		},
		inputMessage(event) {
			if (event.target.value) {
				this.agentAction = AgentActions.TYPING
				return
			}
			this.agentAction = AgentActions.WATCHING
		},
	},
}
</script>
