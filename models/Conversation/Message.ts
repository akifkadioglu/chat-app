import { BaseClass } from '~/models/BaseClass'
import { ChatAccount } from '~/models/ChatAccount'
import { Conversation } from '~/models/Conversation/Conversation'

export enum ORIGIN {
	FLOW = 1,
	AGENT = 2,
	SYSTEM = 3,
}
export enum STATUS {
	WAITING = -1,
	QUEUED = 0,
	SENDING = 1,
	SENT = 2,
	FAILED = 3,
	DELIVERED = 4,
	READ = 5,
	RECEIVED = 6,
}
export enum DIRECTION {
	INBOUND = 'inbound',
	OUTBOUND = 'outbound',
}
export enum ATTACHMENT_TYPE {
	AUDIO = 'audio',
	IMAGE = 'image',
	VIDEO = 'video',
	FILE = 'file',
	STICKER = 'sticker',
	IG_REEL = 'ig_reel',
	IG_STORY = 'ig_story',
	MEDIA_SHARE = 'MEDIA_SHARE',
}
export enum REACTION {
	LOVE = 'love',
	LIKE = 'like',
	ANGRY = 'angry',
	SAD = 'sad',
	WOW = 'wow',
	LAUGH = 'laugh',
}

export class Message extends BaseClass {
	id: number
	direction: DIRECTION
	origin: ORIGIN
	content: MessageContent
	status: STATUS
	sentAt: Date | null
	deliveredAt: Date | null
	readAt: Date | null
	failedAt: Date | null
	receivedAt: Date | null
	errorMessage: string | null
	flowRunId: any
	createdAt: Date | null
	conversationId: number | null
	userId: number | null
	userName: string | null

	flowId: number | null
	flowName: string | null

	repliedMessage: Message | null
	raw: any

	constructor(data: any) {
		super(data?.uuid ?? null)
		this._setData(data)
	}

	update(data: any) {
		this._setData(data)
	}

	private _setData(data: any) {
		this.id = data.id ?? this.id
		this.direction = data.direction ?? this.direction
		this.origin = data.origin ?? this.origin
		this.content = data.content ? new MessageContent(data.content) : (this.content ?? null)
		this.status = data.status ?? this.status
		this.conversationId = data.conversation_id ?? this.conversationId
		this.sentAt = data.sent_at ? new Date(data.sent_at) : (this.sentAt ?? null)
		this.deliveredAt = data.delivered_at ? new Date(data.delivered_at) : (this.deliveredAt ?? null)
		this.readAt = data.read_at ? new Date(data.read_at) : (this.readAt ?? null)
		this.failedAt = data.failed_at ? new Date(data.failed_at) : (this.failedAt ?? null)
		this.receivedAt = data.received_at ? new Date(data.received_at) : (this.receivedAt ?? null)
		this.errorMessage = data.error_message ?? this.errorMessage
		this.flowRunId = data.flow_run_id ?? this.flowRunId
		this.createdAt = data.created_at ? new Date(data.created_at) : (this.createdAt ?? null)
		this.userId = data.user_id ?? this.userId
		this.userName = data.user?.name ?? this.userName
		this.flowId = data.flow?.id ?? this.flowId
		this.flowName = data.flow?.name ?? this.flowName
		this.repliedMessage = data.replied_message_id ? new Message(data.replied_message) : (this.repliedMessage ?? null)
		this.raw = data
	}

	get isRead() {
		return !!this.readAt
	}

	get hasAttachments() {
		return this.content.attachments && this.content.attachments.length > 0
	}

	get chatAccount(): ChatAccount | any {
		if (!this.conversationId) return null
		const conversationsStore = useConversationsStore()
		const conversation = conversationsStore.entities[this.conversationId]
		return conversation?.chatAccount || null
	}

	get chatAccountId(): number | null {
		return this.chatAccount ? this.chatAccount.id : null
	}

	get conversation(): Conversation | any {
		if (!this.conversationId) return null
		const conversationsStore = useConversationsStore()
		return conversationsStore.entities[this.conversationId] || null
	}

	get messagePreviewText() {
		if (this.content.text) {
			return this.content.text
		}
		if (this.content.title) {
			return this.content.title
		}
		if (this.hasAttachments) {
			if (this?.content.attachment === 'image') {
				return '🖼️ Image'
			}
			if (this.content.attachment === 'video') {
				return '🎥 Video'
			}
			if (this.content.attachment === 'audio') {
				return '🎵 Audio'
			}
			if (this.content.attachment === 'file') {
				return '📄 File'
			}
			if (this.content.attachment === 'sticker') {
				return '🧩 sticker'
			}
			if (this.content.attachment === 'ig_reel') {
				return '🌅️ Post'
			}
			if (this.content.attachment === 'story_mention') {
				return '＠ Tagged you in a story'
			}
			return `📎 ${this.content.attachments?.length} attachment(s)`
		}
	}
}

export class MessageContent extends BaseClass {
	title: string | null
	text: string | null
	language: string | null
	attachments: any[] | null
	reaction: any[] | null
	isLiked: boolean
	translatedText: string | null
	translatedLanguage: string | null
	replyTo: object | null
	isUnsupported: boolean | null

	constructor(data: any) {
		super(data?.uuid ?? null)

		this.title = data?.title ?? null
		this.text = data?.text ?? null
		this.language = data?.language ?? null
		this.attachments = data?.attachments
		this.reaction = data?.reaction
		this.isLiked = data?.is_liked ?? false
		this.translatedText = data?.translated_text ?? data?.translatedText ?? null
		this.translatedLanguage = data?.translated_language ?? data?.translatedLanguage ?? null
		this.replyTo = data?.reply_to ?? data?.replyTo ?? null
		this.isUnsupported = data?.is_unsupported ?? data?.isUnsupported ?? null
	}

	get hasText() {
		return (!!this.text && this.text.trim().length > 0) || (!!this.title && this.title.trim().length > 0)
	}

	get preview() {
		if (this.text) {
			return this.text.length > 50 ? this.text.substring(0, 50) + '...' : this.text
		}
		if (this.attachments && this.attachments.length > 0) {
			return `📎 ${this.attachments.length} attachment(s)`
		}
		return 'No content'
	}

	get attachment() {
		return this.attachments && this.attachments.length > 0 ? this.attachments[0] : null
	}
}
