import { BaseClass } from '~/models/BaseClass'
import { ChatAccount } from '~/models/ChatAccount'
import { computed } from 'vue'
import { useContactsStore } from '~/stores/contacts.js'
import { useChatAccountsStore } from '~/stores/chatAccounts'
import { Contact } from '~/models/Contact/Contact'
import { Message } from '~/models/Conversation/Message'
import { User } from '~/models/User'

export class Conversation extends BaseClass {
	id: number
	idOnApi: string | null
	status: number
	assignedUserId: number | null
	assignedUser: User | null
	chatAccountId: number
	chatAccount: ComputedRef<ChatAccount | null>
	lastMessageAt: Date | null
	lastMessage: Message | null
	pinnedAt: Date | null
	// messages: Ref<Message[]>
	contact: ComputedRef<Contact | null>
	contactId: string | number
	lastLoadedPage: number = 1
	totalPage: number | null = null
	public showTranslatedMessages: boolean

	constructor(data: any) {
		super(data?.uuid ?? null)
		this.showTranslatedMessages = true
		this._setData(data)

		this.chatAccount = data.visualChatAccount ?? computed(() => useChatAccountsStore().byId(this.chatAccountId))
		this.contact =
			data.visualContact ?? computed(() => (this.contactId ? useContactsStore().getContactById(this.contactId) : null))

		// Eğer gelen veride contact varsa store'a ekle
		if (data.contact) {
			useContactsStore().upsert(data.contact)
		}
	}
	update(data: any) {
		this._setData(data)
	}

	private _setData(data: any) {
		this.id = data.id ?? this.id
		this.idOnApi = data.id_on_api ?? this.idOnApi
		this.chatAccountId = data.chat_account_id ?? this.chatAccountId
		this.status = data.status ?? this.status
		this.assignedUserId = data.assigned_user_id ?? this.assignedUserId
		if (data.assigned_user) this.assignedUser = new User(data.assigned_user)
		this.contactId = data.contact?.id || data.contact_id || this.contactId
		this.lastMessageAt = data.last_message_at ?? this.lastMessageAt
		this.lastMessage = data.last_message ? new Message(data.last_message) : (this.lastMessage ?? null)
		this.pinnedAt = data.pinned_at ?? this.pinnedAt ?? null
		if (data.contact) useContactsStore().upsert(data.contact)
	}

	// get chatAccount(): ChatAccount | any {
	// 	const chatAccounts = useChatStore().accounts
	// 	return chatAccounts.find((account) => account.conversations.some((conv) => conv.id === this.id)) || null
	// }

	get chatAccountIdGetter(): number | null {
		return this.chatAccountId
	}

	// get unreadCount() {
	// 	return this.messages.value.filter(msg => !msg.readAt && msg.direction === 'incoming').length
	// }

	// get isActive() {
	// 	return this.status === 'active'
	// }
}
