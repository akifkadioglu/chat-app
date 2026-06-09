import { defineStore } from 'pinia'
import { ChatAccount } from '@/models/ChatAccount'
import { Flow } from '~/models/Flow/Flow'
import apiList from '@/apis/ApiList.js'

export const useChatAccountsStore = defineStore('chatAccounts', {
	state: () => ({
		entities: {} as Record<string, ChatAccount>, // normalize (id → ChatAccount)
		loading: true,
		loaded: false,
		error: null as string | null,
		activeId: null as string | null, // seçili hesap
		publishedFlowsLoading: {} as Record<string, boolean>,
	}),

	getters: {
		all: (s): ChatAccount[] => Object.values(s.entities) ?? [],
		active: (s): ChatAccount | null => (s.activeId ? (s.entities[s.activeId] ?? null) : null),
		count: (s): number => Object.keys(s.entities).length,
		byId:
			(s) =>
			(id: string): ChatAccount | null =>
				s.entities[id.toString()] ?? null,
		byUsername:
			(s) =>
			(username: string): ChatAccount | null =>
				Object.values(s.entities).find((c) => c.postAccount.username === username) ?? null,
		byPostAccountId:
			(s) =>
			(postAccountId: number): ChatAccount | null =>
				Object.values(s.entities).find((c) => c.postAccount.id === postAccountId) ?? null,
		isChatAccountsPublishedFlowsLoading: (s): boolean =>
			(s.activeId ? s.publishedFlowsLoading[s.activeId] : false) ?? false,
	},

	actions: {
		setActive(id: string | null, withoutHistory = false) {
			consoleLog('trrqu Setting active chat account to ID:', id)
			const router = useRouter()
			const route = useRoute()

			const username = id ? this.byId(id)?.postAccount.username : null

			this.activeId = id
			const flowStore = useFlowStore()
			if (flowStore.flow) {
				flowStore.flow.chatAccountId = id
			}
			// router.push({
			// 	query: {
			// 		...route.query,
			// 		username: username ?? undefined,
			// 	},
			// })
			const resolvedRoute = router.resolve({
				params: {
					...route.params,
				},
				query: {
					...route.query,
					username: username ?? undefined,
				},
			})
			if (withoutHistory) {
				window.history.replaceState({}, '', resolvedRoute.href)
			} else {
				router.replace(resolvedRoute)
			}
		},
		upsertAccount(accountData: any, entitiesObj: Record<string, ChatAccount> | null = null) {
			if (!entitiesObj) {
				entitiesObj = this.entities
			}
			entitiesObj[accountData.id] = new ChatAccount(accountData)

			const conversationStore = useConversationsStore()
			conversationStore.setupEchoListener(accountData.id)

			this.setupStatusEchoListener(accountData.id)
		},

		setupStatusEchoListener(chatAccountId: number | string) {
			const { $echo } = useNuxtApp() as any

			$echo.channel(`chat-account-${chatAccountId}`).listen('.App\\Events\\Chat\\ChatAccountStatusEvent', (e: any) => {
				consoleLog('ChatAccountStatusEvent received', e)
				this.updateStatus(e.chat_account_id, e.status, e.status_reason_code)
			})
		},
		async fetchAll() {
			this.loading = true
			this.error = null

			const requestAdapter = useRequestAdapter()

			return requestAdapter
				.get(apiList.chat.instagram.chatAccounts)
				.then((response: any) => {
					// Entities'i normalize et
					const entities: Record<string, ChatAccount> = {}

					response.data.forEach((acc: any) => {
						// Mevcut hesabı bul
						this.upsertAccount(acc, entities)
					})

					this.entities = entities
					this.loaded = true

					return response.data
				})
				.catch((err: any) => {
					consoleLog('Error in fetchAll chatAccounts:', err, err?.response, err?.response?.status)
					if (err?.response?.status === 403) {
						consoleLog('Unauthorized access - logging out')
						const authStore = useAuthStore()
						authStore.logout()
					}
					this.error = err?.message || 'Unknown error'
				})
				.finally(() => {
					this.loading = false
				})
		},

		async fetchPublishedFlows(chatAccountId: string) {
			const account = this.entities[chatAccountId]
			if (!account) return

			this.publishedFlowsLoading[chatAccountId] = true

			const requestAdapter = useRequestAdapter()
			return requestAdapter
				.get(apiList.chat.instagram.chatAccountId.publishedFlows, {
					chatAccountId,
				})
				.then((response: any) => {
					account.publishedFlows = response.data.map((flow: any) => new Flow(flow))
				})
				.catch((err: any) => {
					consoleLog('Error fetching published flows:', err)
				})
				.finally(() => {
					this.publishedFlowsLoading[chatAccountId] = false
				})
		},

		async addAccount(accountData: any) {
			this.upsertAccount(accountData)

			// await this.fetchAll().then(() => {
			// 	this.setActive(accountData.id.toString())
			// })
		},

		updateStatus(chatAccountId: string, status: any, statusReasonCode: any) {
			const account = this.entities[chatAccountId]
			if (!account) return
			account.status = status
			account.statusReasonCode = statusReasonCode
		},

		removeAccount(accountId: string) {
			delete this.entities[accountId]
			if (this.activeId === accountId) {
				this.activeId = null
			}
		},

		reset() {
			this.entities = {}
			this.loading = false
			this.loaded = false
			this.error = null
			this.activeId = null
			this.setActive(null)

			useFlowStore().flow.reset()
			const flowStore = useFlowStore()
			flowStore.$reset()

			const contactsStore = useContactsStore()
			contactsStore.$reset()

			const messagesStore = useConversationMessagesStore()
			messagesStore.$reset()

			const conversationsStore = useConversationsStore()
			conversationsStore.$reset()

			const chatAccountAttributesStore = useChatAccountAttributesStore()
			chatAccountAttributesStore.$reset()

			const commentsStore = useCommentsStore()
			commentsStore.$reset()

			const platformStore = usePlatformStore()
			platformStore.$reset()

			const teamStore = useTeamStore()
			teamStore.$reset()
		},
	},
})
