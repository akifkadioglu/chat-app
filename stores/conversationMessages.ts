import { defineStore } from 'pinia'
import { Message, STATUS } from '~/models/Conversation/Message'
import apiList from '~/apis/ApiList'

const createDefaultMessageSlice = () => ({
	messages: [] as Message[], // Hep sorted tutulur
	currentPage: 0,
	hasMore: true,
	loading: false,
	lastFetchedAt: undefined,
})

export const useConversationMessagesStore = defineStore('conversationMessages', {
	state: (): {
		messageSlices: Record<
			string,
			{
				messages: Message[] // Hep sorted tutulur
				currentPage: number
				hasMore: boolean
				loading: boolean
				lastFetchedAt?: number
			}
		>
		confirmedMessageIds: Record<number, boolean>
	} => ({
		messageSlices: {},
		confirmedMessageIds: {},
	}),

	getters: {
		// Conversation slice'ını getir (otomatik oluştur)
		getMessageSlice: (s) => (conversationId: string) => {
			if (!s.messageSlices[conversationId]) {
				s.messageSlices[conversationId] = createDefaultMessageSlice()
			}
			return s.messageSlices[conversationId]
		},

		// // Belirli bir conversation'ın mesajlarını getir
		// getMessagesForConversation:
		// 	(s) =>
		// 	(conversationId: string): Message[] => {
		// 		const slice = s.messageSlices[conversationId]
		// 		return slice ? slice.messages : []
		// 	},

		// Son mesajı getir
		getLastMessageForConversation:
			(s) =>
			(conversationId: string): Message | null => {
				const slice = s.messageSlices[conversationId]
				if (!slice || slice.messages.length === 0) return null
				return slice.messages[slice.messages.length - 1]
			},

		// Okunmamış mesaj sayısı
		getUnreadCountForConversation:
			(s) =>
			(conversationId: string): number => {
				const slice = s.messageSlices[conversationId]
				if (!slice) return 0
				return slice.messages.filter(
					(msg) =>
						![STATUS.WAITING, STATUS.QUEUED, STATUS.SENDING, STATUS.FAILED].includes(msg.status) &&
						!msg.readAt &&
						msg.direction === 'inbound',
				).length
			},

		// Son bilinen dilli contact mesajı
		getLastKnownLanguageContactMessage: (s) => (conversationId: string) => {
			const slice = s.messageSlices[conversationId]
			if (!slice) return null
			const inboundMessages = slice.messages.filter(
				(message) => message.direction === 'inbound' && message.content?.language,
			)
			return inboundMessages[inboundMessages.length - 1] || null
		},
	},

	actions: {
		markAsConfirmed(id: number) {
			this.confirmedMessageIds[id] = true
		},

		clearConfirmed(id: number) {
			delete this.confirmedMessageIds[id]
		},

		// Mesaj upsert
		upsertMessage(message: Message, messageId?: string | number) {
			const conversationId = message.conversationId?.toString()
			if (!conversationId) return

			if (!this.messageSlices[conversationId]) {
				this.messageSlices[conversationId] = createDefaultMessageSlice()
			}

			const slice = this.messageSlices[conversationId]
			const existingIndex = slice.messages.findIndex(
				(msg) => msg.id === message.id || (messageId && msg.id.toString() === messageId.toString()),
			)

			if (existingIndex > -1) {
				slice.messages[existingIndex].update(message.raw)
			} else {
				slice.messages.push(message)
			}

			this.sortMessagesForConversation(conversationId)
		},

		// Mesajları sırala
		sortMessagesForConversation(conversationId: string) {
			const slice = this.messageSlices[conversationId]
			if (!slice) return

			// Timestamp'e göre sırala (in-place)
			slice.messages.sort((a, b) => {
				const aTime = a.sentAt?.getTime() || a.receivedAt?.getTime() || a.createdAt?.getTime() || 0
				const bTime = b.sentAt?.getTime() || b.receivedAt?.getTime() || b.createdAt?.getTime() || 0
				return aTime - bTime
			})
		},

		// Mesajları fetch et
		async fetchMessagesForConversation(conversationId: string, chatAccountId: number, page: number = 1) {
			// Slice'ı başlat
			if (!this.messageSlices[conversationId]) {
				this.messageSlices[conversationId] = createDefaultMessageSlice()
			}

			const slice = this.messageSlices[conversationId]
			slice.loading = true

			const requestAdapter = useRequestAdapter()
			return await requestAdapter
				.get(apiList.chat.instagram.chatAccountId.conversation.conversationId.get, {
					chatAccountId,
					conversationId,
					params: {
						page,
					},
				})
				.then((response: any) => {
					slice.currentPage = response.data.messages.current_page
					slice.hasMore = !!response.data.messages.next_page_url
					slice.lastFetchedAt = Date.now()

					const messages = response.data.messages.data.map((msgData: any) => new Message(msgData))
					this.addMessagesForConversation(conversationId, messages)

					return messages.length
				})
				.catch((error: any) => {
					console.error('Error in fetchMessagesForConversation:', error)
					throw error
				})
				.finally(() => {
					slice.loading = false
				})
		},

		// Mesajları bulk ekle (API'dan gelen data için)
		addMessagesForConversation(_conversationId: string, messages: Message[]) {
			messages.forEach((message) => {
				this.upsertMessage(message)
			})
		},
	},
})
