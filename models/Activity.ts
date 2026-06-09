import { BaseClass } from '~/models/BaseClass'
import { Contact } from '~/models/Contact/Contact'
import { ORIGIN } from '~/models/Conversation/Message'

export const ACTIVITY_TYPE_KEYS = {
	COMMENT_RECEIVED: 'comment_received',
	MESSAGE_RECEIVED: 'message_received',
	MESSAGE_SENT: 'message_sent',
	REPLY_COMMENT: 'reply_comment',
	HIDE_COMMENT: 'hide_comment',
	UNHIDE_COMMENT: 'unhide_comment',
} as const


export class ActivityType extends BaseClass {
	id: number
	key: (typeof ACTIVITY_TYPE_KEYS)[keyof typeof ACTIVITY_TYPE_KEYS]
	label: string

	constructor(data: any) {
		super(data?.uuid ?? null)
		this.id = data.id
		this.key = data.key || ACTIVITY_TYPE_KEYS.MESSAGE_SENT
		this.label = data.label || ''
	}
}

export class Activity extends BaseClass {
	id: number
	chatAccountId: number
	contactId: number
	activityTypeId: number
	origin: number
	createdAt: Date
	updatedAt: Date
	activityType: ActivityType
	contact: Contact | null

	constructor(data: any) {
		super(data?.uuid ?? null)
		this.id = data.id
		this.chatAccountId = data.chat_account_id || data.chatAccountId
		this.contactId = data.contact_id || data.contactId
		this.activityTypeId = data.activity_type_id || data.activityTypeId
		this.origin = data.origin
		this.createdAt = new Date(data.created_at || data.createdAt)
		this.updatedAt = new Date(data.updated_at || data.updatedAt)
		if (data.activity_type || data.activityType) {
			this.activityType = new ActivityType(data.activity_type || data.activityType)
		} else {
			this.activityType = new ActivityType({ id: this.activityTypeId, key: ACTIVITY_TYPE_KEYS.MESSAGE_SENT, label: '' })
		}
		this.contact = data.contact ? new Contact(data.contact) : null
	}

	get typeKey() {
		return this.activityType?.key || ACTIVITY_TYPE_KEYS.MESSAGE_SENT
	}

	get originKey() {
		return this.origin || ORIGIN.SYSTEM
	}
}
