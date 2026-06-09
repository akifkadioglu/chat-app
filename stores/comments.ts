import { defineStore } from 'pinia'

import apiList from '~/apis/ApiList'
import { Post } from '~/models/Post/Post'
import { PostComment } from '~/models/Post/PostComment'

// Scope helper functions
export const createScopeName = (type: 'post' | 'chatAccount' | 'all' = 'all', id?: number | string): string => {
	if (type === 'all') return 'all'
	if (type === 'post') return `post-${id}`
	if (type === 'chatAccount') return `chatAccount-${id}`
	return 'all'
}

const parseScopeKey = (scopeKey: string): { type: 'post' | 'chatAccount' | 'all'; id?: string } => {
	if (scopeKey === 'all') return { type: 'all' }
	if (scopeKey.startsWith('post-')) return { type: 'post', id: scopeKey.replace('post-', '') }
	if (scopeKey.startsWith('chatAccount-')) return { type: 'chatAccount', id: scopeKey.replace('chatAccount-', '') }
	return { type: 'all' }
}

const chatAccountIdFromScope = (scopeKey: string): number | null => {
	if (scopeKey === 'all') return null
	const id = scopeKey.replace('chatAccount-', '')
	return parseInt(id, 10)
}

const createDefaultPostSlice = () => ({
	ids: [] as string[],
	currentPage: 0,
	hasMore: true,
	loading: false,
	lastFetchedAt: null as number | null,
	error: false,
})

const createDefaultCommentSlice = () => ({
	ids: [] as string[],
	currentPage: 0,
	hasMore: true,
	loading: false,
	lastFetchedAt: undefined as number | undefined,
	error: null as string | null,
})

export const useCommentsStore = defineStore('comments', {
	state: (): {
		// Post entities
		postEntities: Record<string, Post>
		sortedPostIds: string[]
		activePostId: string | null
		postSlices: Record<string, ReturnType<typeof createDefaultPostSlice>>
		// Comment entities
		commentEntities: Record<string, PostComment>
		sortedCommentIds: string[]
		commentSlices: Record<string, ReturnType<typeof createDefaultCommentSlice>>
	} => ({
		postEntities: {},
		sortedPostIds: [],
		activePostId: null,
		postSlices: {},
		commentEntities: {},
		sortedCommentIds: [],
		commentSlices: {},
	}),
	getters: {
		// Post getters
		postById:
			(s) =>
			(id: string | number): Post | null => {
				const idStr = id?.toString()
				return s.postEntities[idStr] ?? null
			},
		postScopeKey: (s) => {
			const chatAccountsStore = useChatAccountsStore()
			const activeChatAccount = chatAccountsStore.active
			return activeChatAccount?.id ? `chatAccount-${activeChatAccount.id}` : 'all'
		},
		postScopeKeys: (s): string[] => Object.keys(s.postSlices),
		postScopeSlice: (s) => {
			const key = s.postScopeKey
			if (!s.postSlices[key]) {
				s.postSlices[key] = createDefaultPostSlice()
			}
			return s.postSlices[key]
		},
		postScopeSliceByKey: (s) => (scopeKey: string) => s.postSlices[scopeKey] ?? createDefaultPostSlice(),
		postsForScope:
			(s) =>
			(scopeKey: string): Post[] => {
				const slice = s.postSlices[scopeKey]
				if (!slice) return []

				return s.sortedPostIds
					.filter((id) => slice.ids.includes(id))
					.map((id) => s.postEntities[id])
					.filter(Boolean)
			},
		activePost: (s): Post | null => {
			const id = s.activePostId
			return id ? (s.postEntities[id] ?? null) : null
		},

		// Comment getters
		currentCommentScopeKey: (s) => {
			const activePost = s.activePost

			if (activePost?.id) {
				return createScopeName('post', activePost.id)
			}

			const chatAccountsStore = useChatAccountsStore()
			const activeChatAccount = chatAccountsStore.active

			if (activeChatAccount?.id) {
				return createScopeName('chatAccount', activeChatAccount.id)
			}

			return createScopeName()
		},
		commentScopeKeys: (s): string[] => Object.keys(s.commentSlices),
		currentCommentScopeSlice: (s) => {
			const key = s.currentCommentScopeKey
			if (!s.commentSlices[key]) {
				s.commentSlices[key] = createDefaultCommentSlice()
			}
			return s.commentSlices[key]
		},
		commentScopeSlice: (s) => (scopeKey: string) => {
			if (!s.commentSlices[scopeKey]) {
				s.commentSlices[scopeKey] = createDefaultCommentSlice()
			}
			return s.commentSlices[scopeKey]
		},
		commentById:
			(s) =>
			(id: string | number): PostComment | null => {
				const idStr = id?.toString()
				return s.commentEntities[idStr] ?? null
			},
		commentsForScope:
			(s) =>
			(scopeKey: string): PostComment[] => {
				const slice = s.commentSlices[scopeKey]
				if (!slice) return []

				return s.sortedCommentIds
					.filter((id) => slice.ids.includes(id))
					.map((id) => s.commentEntities[id])
					.filter(Boolean)
			},
	},
	actions: {
		// Post actions
		setActive(postId: string | null) {
			this.activePostId = postId?.toString() ?? null
		},

		movePostToTop(postId: string) {
			const postIdStr = postId.toString()

			const index = this.sortedPostIds.indexOf(postIdStr)
			if (index > -1) {
				this.sortedPostIds.splice(index, 1)
			}

			this.sortedPostIds.unshift(postIdStr)
		},

		insertPostSorted(postId: string, postedAt: string) {
			const postIdStr = postId.toString()
			let left = 0
			let right = this.sortedPostIds.length

			while (left < right) {
				const mid = Math.floor((left + right) / 2)
				const midPostId = this.sortedPostIds[mid]
				const midPost = this.postEntities[midPostId]

				if (midPost && new Date(postedAt) <= new Date(midPost.postedAt)) {
					left = mid + 1
					continue
				}
				right = mid
			}

			this.sortedPostIds.splice(left, 0, postIdStr)
		},

		async fetchPosts(scopeKey: string, page: number = 1) {
			if (!this.postSlices[scopeKey]) {
				this.postSlices[scopeKey] = createDefaultPostSlice()
			}

			const slice = this.postSlices[scopeKey]
			slice.loading = true

			const requestAdapter = useRequestAdapter()
			await requestAdapter
				.get(apiList.chat.posts.get, {
					query: {
						page,
						chatAccountId: chatAccountIdFromScope(scopeKey),
					},
				})
				.then((response: any) => {
					response.data.data.forEach((postData: any) => {
						this.upsertPost(postData)
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

		upsertPost(data: any): Post {
			const id = data?.id

			if (!id) {
				return new Post(data)
			}
			const postId = id.toString()

			if (this.postEntities[postId]) {
				this.postEntities[postId] = new Post(data)
				return this.postEntities[postId]
			}

			const post = new Post(data)
			this.postEntities[postId] = post

			if (!this.sortedPostIds.includes(postId)) {
				this.insertPostSorted(postId, post.postedAt)
			}

			const chatAccountId = post.chatAccountId

			if (chatAccountId) {
				const scopeKey = `chatAccount-${chatAccountId}`
				if (!this.postSlices[scopeKey]) {
					this.postSlices[scopeKey] = createDefaultPostSlice()
				}
				const slice = this.postSlices[scopeKey]
				if (slice && !slice.ids.includes(postId)) {
					slice.ids.push(postId)
				}
			}

			if (!this.postSlices['all']) {
				this.postSlices['all'] = createDefaultPostSlice()
			}
			const allSlice = this.postSlices['all']
			if (allSlice && !allSlice.ids.includes(postId)) {
				allSlice.ids.push(postId)
			}

			return post
		},

		// Alias for backward compatibility
		upsert(data: any): Post {
			return this.upsertPost(data)
		},

		// Comment actions
		addCommentsForScope(scopeKey: string, comments: PostComment[]) {
			const slice = this.commentScopeSlice(scopeKey)

			comments.forEach((comment) => {
				const commentId = comment.id?.toString()
				const postId = comment.postId?.toString()
				const chatAccountId = comment.post?.value?.chatAccountId?.toString()
				if (!commentId) return

				this.commentEntities[commentId] = comment

				if (!this.sortedCommentIds.includes(commentId)) {
					this.sortedCommentIds.push(commentId)
				}

				if (!slice.ids.includes(commentId)) {
					slice.ids.push(commentId)
				}

				if (postId) {
					const postScopeKey = createScopeName('post', postId)
					if (postScopeKey !== scopeKey) {
						const postSlice = this.commentScopeSlice(postScopeKey)
						if (!postSlice.ids.includes(commentId)) {
							postSlice.ids.push(commentId)
						}
					}
				}

				if (chatAccountId) {
					const chatAccountScopeKey = createScopeName('chatAccount', chatAccountId)
					if (chatAccountScopeKey !== scopeKey) {
						const chatAccountSlice = this.commentScopeSlice(chatAccountScopeKey)
						if (!chatAccountSlice.ids.includes(commentId)) {
							chatAccountSlice.ids.push(commentId)
						}
					}
				}

				if (scopeKey !== 'all') {
					const allSlice = this.commentScopeSlice('all')
					if (!allSlice.ids.includes(commentId)) {
						allSlice.ids.push(commentId)
					}
				}
			})

			this.sortComments()
		},

		sortComments() {
			this.sortedCommentIds.sort((aId, bId) => {
				const a = this.commentEntities[aId]
				const b = this.commentEntities[bId]
				if (!a || !b) return 0

				const aConfirmed = !!a.confirmedAt
				const bConfirmed = !!b.confirmedAt

				if (aConfirmed !== bConfirmed) {
					return aConfirmed ? 1 : -1
				}

				const aTime = a.createdAt?.getTime() || 0
				const bTime = b.createdAt?.getTime() || 0
				return bTime - aTime
			})
		},

		async fetchCommentsForScope(scopeKey: string, page: number = 1, filters?: { status?: string; filters?: any[] }) {
			const slice = this.commentScopeSlice(scopeKey)
			slice.loading = true
			slice.error = null

			// Reset scope when fetching page 1 (new filter or fresh load)
			if (page === 1) {
				slice.ids = []
				slice.currentPage = 0
				slice.hasMore = true
			}

			const scope = parseScopeKey(scopeKey)
			const requestAdapter = useRequestAdapter()

			let apiParams: any = { page }

			if (scope.type === 'post') {
				apiParams.postId = scope.id
			} else if (scope.type === 'chatAccount') {
				apiParams.chatAccountId = scope.id
			}

			if (filters?.status && filters.status !== 'all') {
				apiParams.status = filters.status
			}

			if (filters?.filters?.length) {
				apiParams.filters = filters.filters.map((f: any) => ({
					field: f.field,
					operator: f.operator,
					value: f.value,
				}))
			}

			await requestAdapter
				.post(apiList.chat.comments.comments, apiParams)
				.then((response: any) => {
					response.data.data.forEach((comment: any) => {
						this.upsertComment(comment)
					})
					this.sortComments()

					slice.currentPage = response.data.current_page
					slice.hasMore = !!response.data.next_page_url
					slice.lastFetchedAt = Date.now()
				})
				.catch((error: any) => {
					console.error('Error fetching comments:', error)
					slice.error = 'Failed to fetch comments'
					throw error
				})
				.finally(() => {
					slice.loading = false
				})
		},

		upsertComment(data: any): PostComment {
			const id = data?.id

			if (!id) {
				return new PostComment(data)
			}

			const commentId = id.toString()

			// Comment'in post verisi varsa post store'una da ekle
			if (data.post && !this.postEntities[data.post.id]) {
				this.upsertPost(data.post)
			}

			// if (this.commentEntities[commentId]) {
			// 	this.commentEntities[commentId] = new PostComment(data)
			// 	return this.commentEntities[commentId]
			// }

			const comment = new PostComment(data)
			this.commentEntities[commentId] = comment

			if (!this.sortedCommentIds.includes(commentId)) {
				this.sortedCommentIds.push(commentId)
			}

			const postId = comment.postId?.toString()
			const chatAccountId = comment.post?.value?.chatAccountId?.toString()

			if (postId) {
				const postScopeKey = createScopeName('post', postId)
				const postSlice = this.commentScopeSlice(postScopeKey)
				if (!postSlice.ids.includes(commentId)) {
					postSlice.ids.push(commentId)
				}
			}

			if (chatAccountId) {
				const chatAccountScopeKey = createScopeName('chatAccount', chatAccountId)
				const chatAccountSlice = this.commentScopeSlice(chatAccountScopeKey)
				if (!chatAccountSlice.ids.includes(commentId)) {
					chatAccountSlice.ids.push(commentId)
				}
			}

			const allSlice = this.commentScopeSlice('all')
			if (!allSlice.ids.includes(commentId)) {
				allSlice.ids.push(commentId)
			}

			return comment
		},
	},
})
