import { defineStore } from 'pinia'
import apiList from '~/apis/ApiList'
import { Flow } from '~/models/Flow/Flow'

const createDefaultSlice = () => ({
	ids: [] as number[],
	currentPage: 0,
	hasMore: true,
	loading: false,
	lastFetchedAt: null as number | null,
	error: false,
})

export const usePostsStore = defineStore('posts', {
	state: () => ({
		entities: {} as Record<number, any>,
		scopeKey: 'all',
		slices: {} as Record<
			string,
			{
				ids: number[]
				currentPage: number
				hasMore: boolean
				loading: boolean
				lastFetchedAt: number | null
				error: boolean
			}
		>,
	}),

	getters: {
		scopeKey(): string {
			const chatAccountsStore = useChatAccountsStore()
			const activeChatAccount = chatAccountsStore.active
			return activeChatAccount?.id ? `chatAccount-${activeChatAccount.id}` : 'all'
		},

		currentSlice() {
			const key = this.scopeKey
			if (!this.slices[key]) {
				this.slices[key] = createDefaultSlice()
			}
			return this.slices[key]
		},

		posts() {
			const slice = this.currentSlice
			return slice.ids.map((id) => this.entities[id]).filter(Boolean)
		},

		loading(): boolean {
			return this.currentSlice.loading
		},

		currentPage(): number {
			return this.currentSlice.currentPage
		},

		hasMore(): boolean {
			return this.currentSlice.hasMore
		},

		postById: (state) => (id: number) => {
			return state.entities[id] ?? null
		},
	},

	actions: {
		upsertPost(postData: any) {
			const post = {
				...postData,
				flows: (postData.flows || []).map((flow: any) => {
					return new Flow(flow)
				}),
			}
			this.entities[post.id] = post
		},
		async fetchPosts(page = 1) {
			const scopeKey = this.scopeKey
			if (!this.slices[scopeKey]) {
				this.slices[scopeKey] = createDefaultSlice()
			}

			const slice = this.slices[scopeKey]

			slice.loading = true
			slice.error = false

			const chatAccountsStore = useChatAccountsStore()
			const requestAdapter = useRequestAdapter()

			await requestAdapter
				.get(apiList.chat.posts.get, {
					query: {
						chatAccountId: chatAccountsStore.active?.id,
						page,
					},
				})
				.then((response: any) => {
					response.data.data.forEach((postData: any) => {
						this.upsertPost(postData)
						if (!slice.ids.includes(postData.id)) {
							slice.ids.push(postData.id)
						}
					})

					slice.currentPage = response.data.current_page
					slice.hasMore = !!response.data.next_page_url
					slice.lastFetchedAt = Date.now()
				})
				.catch((error: any) => {
					console.error('Posts fetch error:', error)
					slice.error = true
					throw error
				})
				.finally(() => {
					slice.loading = false
				})
		},
		resetCurrentSlice() {
			this.slices[this.scopeKey].ids = []
		},
		reset() {
			this.entities = {}
			this.slices = {}
		},
	},
})
