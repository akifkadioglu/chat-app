import { BaseClass } from '~/models/BaseClass'
import { ContentAnalysis } from '~/models/Post/ContentAnalysis'
import { computed, type ComputedRef, type Ref, ref } from 'vue'
import { useContactsStore } from '~/stores/contacts'
import { useCommentsStore } from '~/stores/comments'

import { Post } from '~/models/Post/Post'
import { Contact } from '~/models/Contact/Contact'

export class PostComment extends BaseClass {
	id: number | null
	hash: string | null
	postId: number | null
	post: ComputedRef<Post | null>
	idOnApi: string
	parentId: number | null
	parentIdOnApi: string | null
	authorId: string
	authorUsername: string
	text: string
	mediaIdOnApi: string | null
	isHidden: boolean
	isEcho: boolean | null
	hideReason: string | null
	hiddenChangedAt: Date | null
	hiddenChangedByUserId: number | null
	publishedAt: Date | null
	confirmedAt: Date | null
	confirmedByUserId: number | null
	isConfirmed: boolean | null
	status: number
	createdAt: Date | null
	updatedAt: Date | null
	analysis: ContentAnalysis | null
	contact: ComputedRef<Contact | null>
	contactId: string | number | null
	replies: Ref<PostComment[]>

	// Computed properties
	formattedDate: ComputedRef<string>

	constructor(comment: any, postInstance: Post | null = null) {
		super(comment?.uuid ?? null)

		this.id = comment?.id ?? null
		this.hash = comment?.hash ?? null
		this.postId = comment?.postId ?? comment?.post_id ?? null
		this.post = computed(() => {
			const commentsStore = useCommentsStore()
			return commentsStore.postById(this.postId?.toString())
		})
		this.contactId = (comment?.contact?.id || comment?.contact_id) ?? null
		this.idOnApi = comment?.id_on_api ?? ''
		this.parentIdOnApi = comment?.parent_id_on_api ?? null
		this.parentId = comment?.parentId ?? comment?.parent_id ?? null
		this.authorId = comment?.author_id ?? ''
		this.authorUsername = comment?.author_username ?? ''
		this.text = comment?.text ?? ''
		this.mediaIdOnApi = comment?.media_id_on_api ?? null
		this.isHidden = comment?.is_hidden ?? false
		this.isEcho = comment?.is_echo ?? null
		this.hideReason = comment?.hide_reason ?? null
		this.hiddenChangedAt =
			(comment?.hiddenChangedAt ?? comment.hidden_changed_at) ? new Date(comment.hidden_changed_at) : null
		this.hiddenChangedByUserId = comment?.hiddenChangedByUserId ?? comment?.hidden_changed_by_user_id ?? null
		this.publishedAt = comment?.publishedAt ?? new Date(comment?.published_at ?? comment.created_at) ?? null

		this.confirmedAt = comment?.confirmedAt ?? (comment?.confirmed_at ? new Date(comment?.confirmed_at) : null)
		this.confirmedByUserId = comment?.confirmedByUserId ?? comment?.confirmed_by_user_id ?? null
		this.isConfirmed = !!(this.confirmedAt || comment?.confirmedAt || comment?.confirmed_at)

		this.status = comment?.status ?? 0
		this.createdAt = comment?.createdAt ?? new Date(comment.created_at) ?? null
		this.updatedAt = comment?.updatedAt ?? new Date(comment.updated_at) ?? null

		this.analysis = comment?.analysis ? new ContentAnalysis(comment.analysis) : null

		// Computed property for contact
		this.contact = computed(() => (this.contactId ? useContactsStore().getContactById(this.contactId) : null))

		// Eğer gelen veride contact varsa store'a ekle
		if (comment?.contact) {
			useContactsStore().upsert(comment.contact)
		}
		// Ama sadece contact yoksa veya gelen veri 'full' ise (custom_fields/tags varsa)
		// if (comment?.contact?.id) {
		// 	const existingContact = useContactsStore().getContactById(comment.contact.id)
		// 	const isFullData = comment.contact.custom_fields !== undefined || comment.contact.tags !== undefined
		// 	if (!existingContact || isFullData) {
		// 		useContactsStore().upsert(comment.contact)
		// 	}
		// }

		this.replies = ref(comment.replies?.map((reply: any) => new PostComment(reply, postInstance)) ?? [])
	}

	toJSON() {
		return {
			id: this.id,
			post_id: this.postId,
			contact_id: this.contactId,
			id_on_api: this.idOnApi,
			parent_id_on_api: this.parentIdOnApi,
			author_id: this.authorId,
			author_username: this.authorUsername,
			text: this.text,
			media_id_on_api: this.mediaIdOnApi,
			is_hidden: this.isHidden,
			hide_reason: this.hideReason,
			hidden_changed_at: this.hiddenChangedAt?.toISOString(),
			hidden_changed_by_user_id: this.hiddenChangedByUserId,
			published_at: this.publishedAt?.toISOString(),
			status: this.status,
			analysis: this.analysis,
			// sentiment_analyses: this.sentimentAnalyses.value.map((s) => s.toJSON()),
			contact: this.contact?.toJSON(),
		}
	}
}
