import { BaseClass } from '~/models/BaseClass'
import { computed, type ComputedRef, ref, type Ref } from 'vue'
import { PostComment } from '~/models/Post/PostComment'
import { ChatAccount } from '~/models/ChatAccount'

export class Post extends BaseClass {
	raw: any
	id: number | null
	chatAccountId: number
	chatAccount: ComputedRef<ChatAccount>
	postAccountId: number | null
	idOnApi: string
	mediaType: string
	mediaProductType: string
	mediaUrl: string | null
	caption: string | null
	permalink: string | null
	shortcode: string | null
	altText: string | null
	commentsCount: number
	likeCount: number
	isCommentEnabled: boolean
	isSharedToFeed: boolean | null
	postedAt: Date | null
	createdAt: Date | null
	updatedAt: Date | null
	// comments: Ref<PostComment[]>

	// Computed properties
	// sentimentStats: ComputedRef<{
	// 	total: number
	// 	positive: number
	// 	negative: number
	// 	neutral: number
	// 	needsReview: number
	// }>
	// needsAttentionComments: ComputedRef<PostComment[]>
	// hiddenComments: ComputedRef<PostComment[]>
	// visibleComments: ComputedRef<PostComment[]>
	formattedDate: ComputedRef<string>

	// Methods
	// addComment: (comment: PostComment) => void
	// removeComment: (commentId: number) => void
	// getCommentById: (id: number) => PostComment | null

	constructor(post: any) {
		super(post?.uuid ?? null)
		this.raw = post
		this.id = post?.id ?? null
		this.chatAccountId = post?.chat_account_id ?? null
		this.chatAccount = computed(() => useChatAccountsStore().byId(this.chatAccountId))
		this.postAccountId = post?.post_account_id ?? null
		this.idOnApi = post?.id_on_api ?? ''
		this.mediaType = post?.media_type ?? ''
		this.mediaProductType = post?.media_product_type ?? ''
		this.mediaUrl = post?.thumbnail_url ?? post?.media_url ?? null
		this.caption = post?.caption ?? null
		this.permalink = post?.permalink ?? null
		this.shortcode = post?.shortcode ?? null
		this.altText = post?.alt_text ?? null
		this.commentsCount = post?.comments_count ?? 0
		this.likeCount = post?.like_count ?? 0
		this.isCommentEnabled = post?.is_comment_enabled ?? true
		this.isSharedToFeed = post?.is_shared_to_feed ?? null
		this.postedAt = post?.postedAt ?? new Date(post.posted_at) ?? null
		this.createdAt = post?.createdAt ?? new Date(post.created_at) ?? null
		this.updatedAt = post?.updatedAt ?? new Date(post.updated_at) ?? null

		// this.comments = ref(post?.parent_comments?.map((comment: any) => new PostComment(comment, this)) ?? [])

		// Computed properties
		// this.sentimentStats = computed(() => {
		// 	const stats = {
		// 		total: this.comments.value.length,
		// 		positive: 0,
		// 		negative: 0,
		// 		neutral: 0,
		// 		needsReview: 0,
		// 	}
		//
		// 	this.comments.value.forEach((comment) => {
		// 		const sentiment = comment.sentimentAnalyse
		// 		if (sentiment) {
		// 			stats[sentiment.label]++
		// 			if (sentiment.needsHumanReview) {
		// 				stats.needsReview++
		// 			}
		// 		}
		// 	})
		//
		// 	return stats
		// })

		// this.needsAttentionComments = computed(() => {
		// 	return this.comments.value.filter((comment) => comment.needsAttention)
		// })

		// this.hiddenComments = computed(() => {
		// 	return this.comments.value.filter((comment) => comment.isHidden)
		// })

		// this.visibleComments = computed(() => {
		// 	return this.comments.value.filter((comment) => !comment.isHidden)
		// })

		this.formattedDate = computed(() => {
			if (!this.postedAt) return 'Bilinmiyor'

			const now = new Date()
			const diffInHours = Math.floor((now.getTime() - this.postedAt.getTime()) / (1000 * 60 * 60))

			if (diffInHours < 1) {
				return 'Az önce'
			} else if (diffInHours < 24) {
				return `${diffInHours} saat önce`
			} else {
				const diffInDays = Math.floor(diffInHours / 24)
				return `${diffInDays} gün önce`
			}
		})

		// Methods
		// this.addComment = (comment: PostComment) => {
		// 	comment.post.value = this
		// 	this.comments.value.push(comment)
		// }

		// this.removeComment = (commentId: number) => {
		// 	this.comments.value = this.comments.value.filter((c) => c.id !== commentId)
		// }

		// this.getCommentById = (id: number) => {
		// 	return this.comments.value.find((c) => c.id === id) || null
		// }
	}

	toJSON() {
		return {
			id: this.id,
			chat_account_id: this.chatAccountId,
			post_account_id: this.postAccountId,
			id_on_api: this.idOnApi,
			media_type: this.mediaType,
			media_product_type: this.mediaProductType,
			media_url: this.mediaUrl,
			caption: this.caption,
			permalink: this.permalink,
			shortcode: this.shortcode,
			alt_text: this.altText,
			comments_count: this.commentsCount,
			like_count: this.likeCount,
			is_comment_enabled: this.isCommentEnabled,
			is_shared_to_feed: this.isSharedToFeed,
			posted_at: this.postedAt?.toISOString(),
			// comments: this.comments.value.map((c) => c.toJSON()),
		}
	}
}
