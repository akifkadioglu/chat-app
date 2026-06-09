import { defineStore } from 'pinia'

import { Conversation } from '~/models/Conversation/Conversation'
import { Message, STATUS } from '~/models/Conversation/Message'
import apiList from '~/apis/ApiList'

const scopeName = (id: number | null): string => {
	return id ? `chatAccount-${id}` : SLICE_KEYS.ALL
}

const chatAccountIdFromScope = (scopeKey: string): number | null => {
	if (scopeKey === SLICE_KEYS.ALL) return null
	const id = scopeKey.replace('chatAccount-', '')
	return parseInt(id, 10)
}
export const SLICE_KEYS = {
	ALL: 'all',
}
const MAX_NEW_CONVERSATIONS_PER_MINUTE = 10
const RATE_WINDOW_MS = 60_000
const createDefaultSlice = () => ({
	ids: [],
	currentPage: 0,
	hasMore: true,
	loading: false,
	lastFetchedAt: undefined,
	lastSearchQuery: undefined,
	lastUnreadOnly: undefined as boolean | undefined,
	lastAssigneeUserId: undefined as number | null | undefined,
})
export const useConversationsStore = defineStore('conversations', {
	state: (): {
		entities: Record<string, Conversation>
		sortedConversationIds: string[]
		activeEntityId: string | null
		slices: Record<
			string,
			{
				ids: string[]
				chatAccountId?: number | null
				currentPage: number
				hasMore: boolean
				loading: boolean
				lastFetchedAt?: number
				lastSearchQuery?: string
				lastUnreadOnly?: boolean
				lastAssigneeUserId?: number | null
			}
		>
		inflight: Record<string, Promise<void>>
		ttlMs: number
		pendingConversations: Record<string, any>
		recentNewConversationTimestamps: number[]
	} => ({
		entities: {},
		sortedConversationIds: [],
		activeEntityId: null,
		slices: {},
		inflight: {},
		ttlMs: 60_000,
		pendingConversations: {},
		recentNewConversationTimestamps: [],
	}),
	getters: {
		currentScopeKey: (s) => {
			const chatAccountsStore = useChatAccountsStore()
			const activeChatAccount = chatAccountsStore.active
			// return activeChatAccount ? `chatAccount-${activeChatAccount.id}` : 'all'
			return scopeName(activeChatAccount?.id ?? null)
		},
		scopeKeys: (s): string[] => Object.keys(s.slices),
		currentScopeSlice: (s) => {
			const key = s.currentScopeKey
			if (!s.slices[key]) {
				s.slices[key] = createDefaultSlice()
			}
			return s.slices[key]
		},
		scopeSlice: (s) => (scopeKey: string) => s.slices[scopeKey] ?? null,
		conversationsForScope:
			(s) =>
			(scopeKey: string, searchQuery: string, assignedUserId: number | null): Conversation[] => {
				const slice = s.slices[scopeKey]
				if (!slice) return []

				const preparedQuery = searchQuery.trim().toLowerCase()

				// Global sorted list'i filtrele
				const conversations = s.sortedConversationIds
					.filter((id) => slice.ids.includes(id))
					.filter(
						(id) =>
							s.entities[id]?.contact?.name.toLowerCase().includes(preparedQuery) ||
							s.entities[id]?.contact?.platformAccountsInstagram?.username.toLowerCase().includes(preparedQuery) ||
							s.entities[id]?.lastMessage?.content?.text?.toLowerCase().includes(preparedQuery) ||
							s.entities[id]?.lastMessage?.content?.title?.toLowerCase().includes(preparedQuery),
					)
					.filter((id) => !assignedUserId || s.entities[id]?.assignedUserId === assignedUserId)
					.map((id) => s.entities[id])
					.filter(Boolean)

				// Pinned sıralama (pinnedAt'e göre)
				return [...conversations].sort((a, b) => {
					const aIsPinned = !!a.pinnedAt
					const bIsPinned = !!b.pinnedAt

					if (aIsPinned && !bIsPinned) return -1
					if (!aIsPinned && bIsPinned) return 1

					return 0
				})
			},

		activeConversation: (s): Conversation | null => {
			const id = s.activeEntityId
			return id ? (s.entities[id] ?? null) : null
		},
		getConversationByContactId:
			(s) =>
			(contactId: string): Conversation | null => {
				return (
					Object.values(s.entities).find((conversation) => {
						return conversation.contact?.id == contactId
					}) || null
				)
			},
		getConversationAssignedUserId:
			(s) =>
			(conversationId: string): number | null => {
				return s.entities[conversationId]?.assignedUserId ?? null
			},
	},
	actions: {
		updateConversationAssignedUserId(conversationId: string, assignedUserId: number | null) {
			this.entities[conversationId].assignedUserId = assignedUserId
		},
		setActive(conversationId: string | null) {
			this.activeEntityId = conversationId
		},
		moveConversationToTop(conversationId: string) {
			const conversationIdStr = conversationId.toString()

			// Global sorted list'den çıkar
			const index = this.sortedConversationIds.indexOf(conversationIdStr)
			if (index > -1) {
				this.sortedConversationIds.splice(index, 1)
			}

			// Başa ekle
			this.sortedConversationIds.unshift(conversationIdStr)
		},
		moveConversationToCorrectPosition(conversationId: string) {
			const conversation = this.entities[conversationId]
			if (!conversation) return

			const conversationIdStr = conversationId.toString()

			// Global sorted list'den çıkar
			const index = this.sortedConversationIds.indexOf(conversationIdStr)
			if (index > -1) {
				this.sortedConversationIds.splice(index, 1)
			}

			// lastMessageAt'e göre doğru pozisyona ekle
			const time = conversation.lastMessageAt ? new Date(conversation.lastMessageAt).getTime() : 0

			let low = 0
			let high = this.sortedConversationIds.length
			while (low < high) {
				const mid = Math.floor((low + high) / 2)
				const midId = this.sortedConversationIds[mid]
				const midTime = this.entities[midId]?.lastMessageAt ? new Date(this.entities[midId].lastMessageAt).getTime() : 0

				if (time > midTime) {
					high = mid
				} else {
					low = mid + 1
				}
			}
			this.sortedConversationIds.splice(low, 0, conversationIdStr)
		},
		async fetchConversations(
			scopeKey: string,
			page: number = 1,
			searchQuery: string = '',
			unreadOnly: boolean = false,
			assigneeUserId: number | null = null,
		) {
			// Slice'ı başlat
			if (!this.slices[scopeKey]) {
				this.slices[scopeKey] = createDefaultSlice()
			}

			const trimmedSearchQuery = searchQuery.trim()
			const isSearchChanged = this.slices[scopeKey].lastSearchQuery !== trimmedSearchQuery
			const isUnreadChanged = this.slices[scopeKey].lastUnreadOnly !== unreadOnly
			const isAssigneeChanged = this.slices[scopeKey].lastAssigneeUserId !== assigneeUserId

			if (isSearchChanged || isUnreadChanged || isAssigneeChanged) {
				this.slices[scopeKey].lastSearchQuery = trimmedSearchQuery
				this.slices[scopeKey].lastUnreadOnly = unreadOnly
				this.slices[scopeKey].lastAssigneeUserId = assigneeUserId
				this.slices[scopeKey].ids = []
				this.slices[scopeKey].currentPage = 0
				this.slices[scopeKey].hasMore = true
			}

			const slice = this.slices[scopeKey]

			slice.loading = true

			const requestAdapter = useRequestAdapter()
			await requestAdapter
				.get(apiList.chat.instagram.conversations.get, {
					params: {
						page,
						chatAccountId: chatAccountIdFromScope(scopeKey),
						query: trimmedSearchQuery,
						unread: unreadOnly ? 1 : undefined,
						assigneeUserId: assigneeUserId,
					},
				})
				.then((response: any) => {
					// const chatAccountsStore = useChatAccountsStore()

					// Global sorted list'e ekle
					// response.data.data.forEach((conv: any) => {
					// 	if (!this.sortedConversationIds.includes(conv.id.toString())) {
					// 		this.sortedConversationIds.push(conv.id.toString())
					// 	}
					// })
					response.data.data.forEach((conv: any) => {
						this.upsert(conv)
					})

					// chatAccountsStore.all.forEach((chatAccount) => {
					// Yeni konuşmaları filtrele ve ekle
					// const newConversations = response.data.data
					// 	.filter((c) => c.chat_account_id === chatAccount.id)
					// 	.filter((c) => !this.entities[c.id])
					// 	.map((conversation) => new Conversation(conversation))

					// Entities'e ekle
					// response.data.data.forEach((conv) => {
					// this.entities[conv.id] = conv
					// Mevcut scopeKey slice'ına ekle
					// if (!slice.ids.includes(conv.id.toString())) {
					// 	slice.ids.push(conv.id.toString())
					// }

					// İlgili chat account slice'ına da ekle
					// const chatAccountScopeKey = scopeName(chatAccount.id)
					// if (chatAccountScopeKey !== scopeKey) {
					// 	if (!this.slices[chatAccountScopeKey]) {
					// 		this.slices[chatAccountScopeKey] = createDefaultSlice()
					// 	}
					// 	const chatAccountSlice = this.slices[chatAccountScopeKey]
					// 	if (!chatAccountSlice.ids.includes(conv.id.toString())) {
					// 		chatAccountSlice.ids.push(conv.id.toString())
					// 	}
					// }

					// 'all' slice'ına da ekle (eğer mevcut scope 'all' değilse)
					// if (scopeKey !== 'all') {
					// 	if (!this.slices['all']) {
					// 		this.slices['all'] = createDefaultSlice()
					// 	}
					// 	const allSlice = this.slices['all']
					// 	if (!allSlice.ids.includes(conv.id.toString())) {
					// 		allSlice.ids.push(conv.id.toString())
					// 	}
					// }
					// })

					// response.data.data.forEach((conversationData: any) => {
					// 	// Conversation'ın last_messages'larını messages store'a ekle
					// 	if (conversationData.last_messages && conversationData.last_messages.length > 0) {
					// 		// Messages'ları Message instance'larına çevir
					// 		const messages = conversationData.last_messages.map((msgData) => new Message(msgData))
					//
					// 		// Messages store'a bulk ekle
					// 		const messagesStore = useConversationMessagesStore()
					// 		messagesStore.addMessagesForConversation(conversationData.id.toString(), messages)
					//
					// 		// İlk sayfa yüklenmiş gibi işaretle
					// 		const messageSlice = messagesStore.getMessageSlice(conversationData.id.toString())
					// 		messageSlice.currentPage = 1
					// 		messageSlice.lastPage = 2
					// 		messageSlice.lastFetchedAt = Date.now()
					// 		// hasMore durumunu API response'una göre ayarlayabiliriz
					// 	}
					// })

					// Echo listener'ı kur
					// this.setupEchoListener(chatAccount.id)
					// })

					// Pagination bilgilerini güncelle
					slice.currentPage = response.data.current_page
					slice.hasMore = !!response.data.next_page_url
					slice.lastFetchedAt = Date.now()
				})
				.catch((error) => {
					console.error('Conversations fetch error:', error)
					throw error
				})
				.finally(() => {
					slice.loading = false
				})
		},
		async fetchSelectedConversations(ids: number[]) {
			const requestAdapter = useRequestAdapter()
			await requestAdapter
				.post(apiList.chat.instagram.conversations.byIds, {
					ids: ids,
				})
				.then((response) => {
					response.data.forEach((conv: any) => {
						this.upsert(conv)
					})
				})
				.catch((error) => {
					console.error('Conversations fetch error:', error)
					throw error
				})
		},
		upsert(data: any): Conversation {
			const id = data?.id
			if (this.entities[id]) {
				this.entities[id].update(data)
			} else {
				this.entities[id] = new Conversation(data)
			}

			const conversation = this.entities[id]
			let scopedName = scopeName(data.chat_account_id)

			if (!this.slices[scopedName]) {
				this.slices[scopedName] = createDefaultSlice()
			}
			if (!this.slices[scopedName].ids.includes(conversation.id.toString())) {
				this.slices[scopedName].ids.unshift(conversation.id.toString())
			}

			if (!this.sortedConversationIds.includes(conversation.id.toString())) {
				const id = conversation.id.toString()
				const time = new Date(conversation.lastMessageAt).getTime()

				let low = 0
				let high = this.sortedConversationIds.length
				while (low < high) {
					const mid = Math.floor((low + high) / 2)
					const midId = this.sortedConversationIds[mid]
					const midTime = new Date(this.entities[midId].lastMessageAt).getTime()

					const isNewer = time > midTime
					if (isNewer) {
						high = mid
						continue
					}
					low = mid + 1
				}
				this.sortedConversationIds.splice(low, 0, id)
			}

			if (!this.slices[SLICE_KEYS.ALL]) {
				this.slices[SLICE_KEYS.ALL] = createDefaultSlice()
			}

			if (!this.slices[SLICE_KEYS.ALL].ids.includes(conversation.id.toString())) {
				this.slices[SLICE_KEYS.ALL].ids.push(conversation.id.toString())
			}

			if (data.last_messages && data.last_messages.length > 0) {
				// Messages'ları Message instance'larına çevir
				const messages = data.last_messages.map((msgData: any) => new Message(msgData))

				// Messages store'a bulk ekle
				const messagesStore = useConversationMessagesStore()
				messagesStore.addMessagesForConversation(data.id.toString(), messages)

				// İlk sayfa yüklenmiş gibi işaretle
				const messageSlice = messagesStore.getMessageSlice(data.id.toString())
				messageSlice.currentPage = 0
				messageSlice.hasMore = true
				messageSlice.lastFetchedAt = Date.now()
				// hasMore durumunu API response'una göre ayarlayabiliriz
			}

			return conversation
		},
		intakeNewConversation(data: any): Conversation {
			const idStr = data?.id?.toString()
			if (!idStr) return null as any

			const isPending = !!this.pendingConversations[idStr]
			const isKnown = !!this.entities[idStr]

			if (isKnown && !isPending) {
				return this.upsert(data)
			}

			const now = Date.now()
			const cutoff = now - RATE_WINDOW_MS
			this.recentNewConversationTimestamps = this.recentNewConversationTimestamps.filter((ts) => ts >= cutoff)

			const hasPending = Object.keys(this.pendingConversations).length > 0
			const reachedLimit = this.recentNewConversationTimestamps.length >= MAX_NEW_CONVERSATIONS_PER_MINUTE
			const rateLimited = hasPending || reachedLimit

			if (rateLimited) {
				if (isKnown) {
					this.entities[idStr].update(data)
				} else {
					this.entities[idStr] = new Conversation(data)
				}
				this.pendingConversations[idStr] = data
				return this.entities[idStr]
			}

			this.recentNewConversationTimestamps.push(now)
			if (isPending) {
				delete this.pendingConversations[idStr]
			}
			return this.upsert(data)
		},
		refreshActiveScope() {
			const scopeKey = this.currentScopeKey
			const slice = this.slices[scopeKey]
			if (slice?.loading) return
			this.pendingConversations = {}
			this.recentNewConversationTimestamps = []
			this.fetchConversations(
				scopeKey,
				1,
				slice?.lastSearchQuery ?? '',
				slice?.lastUnreadOnly ?? false,
				slice?.lastAssigneeUserId ?? null,
			).catch(() => {})
		},
		async flushPendingConversations(chunkSize = 25) {
			const entries = Object.entries(this.pendingConversations) as [string, any][]
			this.pendingConversations = {}
			this.recentNewConversationTimestamps = []
			if (entries.length === 0) return
			for (let i = 0; i < entries.length; i += chunkSize) {
				const chunk = entries.slice(i, i + chunkSize)
				chunk.forEach(([, data]) => this.upsert(data))
				if (i + chunkSize < entries.length) {
					await new Promise((r) => requestAnimationFrame(r))
				}
			}
		},
		setupEchoListener(chatAccountId: number) {
			const { $echo, $emitter } = useNuxtApp()

			$echo.channel('message-chat-account-' + chatAccountId).listen('Chat.Instagram.MessageEvent', (e) => {
				consoleLog('RME', 'data:', e)
				const message = new Message(e.message)
				consoleLog('RME', 'message:', message)

				let conversation = this.entities[e.message.conversation_id]
				consoleLog('RME', 'Found conversation', conversation)

				const messagesStore = useConversationMessagesStore()
				if (conversation) {
					conversation.assignedUserId = e.message.conversation.assigned_user_id
				} else {
					consoleLog('RME', 'creating conversation data:', e.message.conversation)
					conversation = this.intakeNewConversation(e.message.conversation)
				}

				// Messages store'da mesaj var mı kontrol et
				const existingMessage = messagesStore
					.getMessageSlice(conversation.id.toString())
					.messages.find((msg) => msg.id === message.id)

				const waitingMessage = messagesStore
					.getMessageSlice(conversation.id.toString())
					.messages.find((msg) => msg.status === STATUS.WAITING)

				if (waitingMessage && !existingMessage && !messagesStore.confirmedMessageIds[message.id]) {
					// WS önce geldi: optimistic mesajı gerçekle değiştir
					messagesStore.upsertMessage(message, waitingMessage.id)
				} else {
					const isNew = !existingMessage && !messagesStore.confirmedMessageIds[message.id]
					messagesStore.upsertMessage(message)
					messagesStore.clearConfirmed(message.id)
					if (isNew) {
						$emitter.emit('scrollMessagesToBottom', conversation.id)
					}
				}
				const contactsStore = useContactsStore()
				if (e.message.conversation?.contact) {
					contactsStore.upsert(e.message.conversation.contact)
				}
				conversation.contactId = e.message.conversation.contactId

				consoleLog('moveConversationToTop conversation', conversation)
				// Conversation'ı tüm slice'larda üste taşı
				this.moveConversationToTop(conversation.id.toString())

				nextTick(() => {
					$emitter.emit('sendPushNotification', message)
				})
			})
			$echo.channel('conversation-chat-account-' + chatAccountId).listen('Chat.Instagram.ConversationEvent', (e) => {
				consoleLog('RME', 'conversation data:', e)
				if (e.conversation.deleted_at) return
				this.intakeNewConversation(e.conversation)
			})
		},
		async loadConversationByContactId(contactId: string) {
			if (!contactId) return
			const conversation = this.getConversationByContactId(contactId)
			if (conversation) {
				return conversation
			}
			const requestAdapter = useRequestAdapter()
			return await requestAdapter
				.get(apiList.chat.instagram.contact.contactId.conversation, {
					slug: contactId,
				})
				.then((response: any) => {
					return this.upsert(response.data)
				})
				.catch(() => {
					return null
				})
		},
		deleteConversation(conversationId: string) {
			this.sortedConversationIds = this.sortedConversationIds.filter((id) => id !== conversationId)
			this.slices[this.currentScopeKey].ids = this.slices[this.currentScopeKey].ids.filter(
				(id) => id !== conversationId,
			)
			this.slices[SLICE_KEYS.ALL].ids = this.slices[SLICE_KEYS.ALL].ids.filter((id) => id !== conversationId)
			delete this.entities[conversationId]
		},
		deleteConversationByContactId(contactId: number) {
			const conversation = this.getConversationByContactId(contactId.toString())
			if (conversation) {
				this.deleteConversation(conversation.id)
			}
		},
		isConversationPinned(conversationId: string): boolean {
			const conversation = this.entities[conversationId]
			return !!conversation?.pinnedAt
		},
		async pinConversation(conversationId: string) {
			const conversation = this.entities[conversationId]
			if (!conversation || conversation.pinnedAt) return

			const requestAdapter = useRequestAdapter()
			await requestAdapter
				.post(
					apiList.chat.instagram.chatAccountId.conversation.conversationId.pin,
					{},
					{
						chatAccountId: conversation.chatAccountId,
						conversationId: conversation.id,
					},
				)
				.then((response: any) => {
					conversation.pinnedAt = response.data.pinned_at ?? new Date().toISOString()
					this.moveConversationToTop(conversationId)
				})
		},
		async unpinConversation(conversationId: string) {
			const conversation = this.entities[conversationId]
			if (!conversation || !conversation.pinnedAt) return

			const requestAdapter = useRequestAdapter()
			await requestAdapter
				.post(
					apiList.chat.instagram.chatAccountId.conversation.conversationId.unpin,
					{},
					{
						chatAccountId: conversation.chatAccountId,
						conversationId: conversation.id,
					},
				)
				.then(() => {
					conversation.pinnedAt = null
					this.moveConversationToCorrectPosition(conversationId)
				})
		},
	},
})
