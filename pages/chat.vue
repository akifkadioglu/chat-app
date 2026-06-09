<template>
	<AppLayout
		ref="appLayout"
		contentHeaderHeight="h-16!"
		sidebarTrailingWidthClasses="border-r border-base-300 w-4/5 max-w-96 lg:min-w-96"
		:hideFooter="!!activeConversation?.id"
	>
		<template #sidebarTrailing>
			<!-- Sidebar -->
			<ConversationList ref="conversationList" />
		</template>

		<template #contentHeader v-if="activeConversation?.id">
			<ContentHeader
				:conversation="activeConversation"
				:target-language="activeConversation?.chatAccount?.targetLanguage"
				:contact="activeConversation?.contact"
				:showTranslatedMessages="activeConversation?.showTranslatedMessages"
				@update:showTranslatedMessages="activeConversation.showTranslatedMessages = $event"
				:isLoading="!activeConversation?.id"
			/>
		</template>

		<div class="h-full w-full">
			<!-- Main Content -->
			<ChatContent
				:key="activeConversation ? activeConversation.id : 'no-conversation'"
				:conversation="activeConversation"
			/>
		</div>

		<template #trailingContent v-if="activeConversation?.id">
			<ContactInfoContent
				:key="activeConversation?.contact?.id"
				:contactId="activeConversation?.contact?.id"
				:chatAccountId="activeConversation?.chatAccountId"
				:showGoToConversationLink="false"
			/>
		</template>
	</AppLayout>
	<MediaPreviewLightbox />
	<DmAccessDisabledModal />
</template>

<script>
import ChatContent from '~/components/Chat/Content.vue'
import ContentHeader from '~/components/Chat/Content/ContentHeader.vue'
import ContactInfoContent from '~/components/Chat/ContactInfo/ContactInfoContent.vue'
import ConversationList from '~/components/Chat/Sidebar/ConversationList.vue'
import MediaPreviewLightbox from '~/components/Chat/MediaPreviewLightbox.vue'
import DmAccessDisabledModal from '~/components/Chat/DmAccessDisabledModal.vue'
import { DIRECTION } from '~/models/Conversation/Message.js'

export default {
	setup() {
		definePageMeta({
			layout: 'app',
			middleware: ['auth-custom'],
		})

		return {
			chatAccountsStore: useChatAccountsStore(),
			conversationsStore: useConversationsStore(),
			localeRoute: useLocaleRoute(),
		}
	},
	components: {
		DmAccessDisabledModal,
		MediaPreviewLightbox,
		ConversationList,
		ContactInfoContent,
		ContentHeader,
		ChatContent,
	},
	computed: {
		activeConversation() {
			return this.conversationsStore.activeConversation
		},
	},
	data() {
		return {}
	},
	mounted() {
		if (!this.activeConversation) {
			this.$refs.appLayout.openLeading()
		}

		this.requestNotificationPermission()
		this.$emitter.on('sendPushNotification', this.sendNotification)
		window.addEventListener('keydown', this.handleEscape)
	},
	beforeUnmount() {
		window.removeEventListener('keydown', this.handleEscape)
	},
	watch: {
		'$route.query.c': {
			immediate: true,
			handler(newContactId) {
				this.setActiveConversationFromContactId(newContactId)
			},
		},
	},
	methods: {
		handleEscape(event) {
			if (event.key === 'Escape') {
				this.$router.push(this.localeRoute({ name: 'chat' }))
				// this.conversationsStore.setActive(null)
			}
		},
		async setActiveConversationFromContactId(contactId) {
			consoleLog('consoleLog(conversation 1', contactId)
			const conversation = await this.conversationsStore.loadConversationByContactId(contactId)
			consoleLog('consoleLog(conversation 2', conversation)
			this.conversationsStore.setActive(conversation?.id)
		},
		requestNotificationPermission() {
			if ('Notification' in window) {
				if (Notification.permission === 'default') {
					Notification.requestPermission().then((permission) => {
						if (permission === 'granted') {
							console.log(this.$t('pages.app.chat.notifications.permissionGranted'))
						} else {
							console.log(this.$t('pages.app.chat.notifications.permissionDenied'))
						}
					})
				} else if (Notification.permission === 'granted') {
					console.log(this.$t('pages.app.chat.notifications.permissionAlreadyGranted'))
				}
			} else {
				console.log(this.$t('pages.app.chat.notifications.browserNotSupported'))
			}
		},
		sendNotification(message) {
			if ('Notification' in window && Notification.permission === 'granted') {
				// Sadece gelen mesajlar için bildirim gönder (kendi mesajlarımız değil)
				if (message.direction === DIRECTION.INBOUND) {
					const senderName =
						message.conversation.contact.name || message.conversation.contact?.platformAccountsInstagram.username

					const chatAccountUsername = message.chatAccount.postAccount.username
					const notification = new Notification(
						this.$t('pages.app.chat.notifications.newMessageFrom', { username: chatAccountUsername, senderName }),
						{
							body: message.messagePreviewText,
							icon: message.chatAccount.postAccount.profilePicture || '/favicon.ico',
							tag: `message-${message.id}`, // Aynı mesaj için tekrar bildirim gösterme
							renotify: false,
							requireInteraction: false,
						},
					)

					// Bildirime tıklandığında pencereyi odakla
					notification.onclick = () => {
						window.focus()
						notification.close()
					}

					// 5 saniye sonra bildirimi otomatik kapat
					setTimeout(() => {
						notification.close()
					}, 25000)
				}
			}
		},
	},
}
</script>
<style scoped></style>
