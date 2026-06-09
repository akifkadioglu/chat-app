import { BaseClass } from '~/models/BaseClass'
import { computed, ref } from 'vue'
import { getBorderAccountColor, getRingColor } from '~/types/colors'
import { PostAccount } from '~/models/PostAccount'
import { Tag } from '~/models/Contact/Tag'
import { CustomField } from '~/models/Contact/CustomField'
import { ChatAccountSetting } from '~/models/ChatAccountSetting'
import { Contact } from '~/models/Contact/Contact'
import { useContactsStore } from '~/stores/contacts'
import { useChatAccountAttributesStore } from '~/stores/chatAccountAttributes'
import { Flow } from '~/models/Flow/Flow'
import { FREE_ACTIVE_CONTACTS_LIMIT } from '~/models/Pricing/Plan'
import { Subscription } from '~/models/Pricing/Subscription'

export enum STATUS {
	PASSIVE = 0,
	ACTIVE = 1,
}

export enum STATUS_REASON_CODE {
	ACTIVE = 1,
	DM_ACCESS_DISABLED = 2,
}

export const SOURCES = {
	instagram: 'instagram',
	facebook: 'facebook',
}

export class ChatAccount extends BaseClass {
	id: number
	// conversations: Ref<Conversation[]>
	// sortedConversations: ComputedRef<Conversation[]>
	postAccount: PostAccount
	contactsCount: number
	activeContactsCount: number
	publishedFlowsCount: number
	publishedFlows: Ref<Flow[]>
	// public unreadCount: Ref<number> | number
	contacts: ComputedRef<Contact[]>
	settings: Ref<ChatAccountSetting[]>
	customFields: ComputedRef<CustomField[]>
	tags: ComputedRef<Tag[]>
	targetLanguage: ComputedRef<string | null>
	subscription: Subscription | null
	subscribed: ComputedRef<boolean>
	//Henüz çalışmıyor
	reachedContactLimit: ComputedRef<boolean>
	needsUpgrade: ComputedRef<boolean>
	overageLimitFilled: ComputedRef<boolean>
	status: STATUS
	statusReasonCode: STATUS_REASON_CODE
	isStatusActive: ComputedRef<boolean>
	conversationCount: number
	source: string | null = null
	activeContactLimit: ComputedRef<number>
	overageContactsCount: ComputedRef<number>
	effectiveMaxOverageLimit: ComputedRef<number | null>

	//TODO: SHOW UPGRADE BANNER

	constructor(data: any) {
		super(data?.uuid ?? null)
		this.id = data.id
		// this.conversations = ref(data.conversations?.map((conv: any) => new Conversation(conv)) || [])
		// this.sortedConversations = computed(() => {
		// 	return this.conversations.value.sort((a, b) => {
		// 		const aTime = a.lastMessageAt?.getTime() || 0
		// 		const bTime = b.lastMessageAt?.getTime() || 0
		// 		return bTime - aTime
		// 	})
		// })
		this.postAccount = new PostAccount(data.postAccount ?? data.post_account)
		// this.unreadCount = computed(() => {
		// 	return this.conversations.value.reduce((total, conv) => total + (conv.unreadCount > 0 ? 1 : 0), 0)
		// })
		this.conversationCount = data.conversationCount ?? (data.conversation_count || 0)
		this.publishedFlows = ref([])
		this.publishedFlowsCount = data.publishedFlowsCount ?? (data.published_flows_count || 0)
		this.contactsCount = data.contactsCount ?? (data.contacts_count || 0)
		this.activeContactsCount = data.activeContactsCount ?? (data.active_contacts_count || 0)
		this.customFields = computed(() => useChatAccountAttributesStore().getCustomFieldsByChatAccountId(this.id))
		this.tags = computed(() => useChatAccountAttributesStore().getTagsByChatAccountId(this.id))
		this.settings = ref(
			Array.isArray(data.settings) ? data.settings.map((setting: any) => new ChatAccountSetting(setting)) : [],
		)
		this.subscription = data.subscription ? new Subscription(data.subscription) : null
		this.subscribed = computed(() => !!(this.subscription && this.subscription.status === 1))
		this.activeContactLimit = computed(
			() =>
				this.subscription?.effectiveActiveContactLimit ??
				this.subscription?.plan?.activeContactLimit ??
				FREE_ACTIVE_CONTACTS_LIMIT,
		)
		this.reachedContactLimit = computed(() => this.activeContactsCount >= this.activeContactLimit.value)
		this.needsUpgrade = computed(() => {
			if (this.subscribed.value) {
				return this.overageLimitFilled.value
			}
			return this.reachedContactLimit.value
		})
		this.overageLimitFilled = computed(() => {
			const maxContactsCount =
				(this.subscription?.effectiveActiveContactLimit ?? 0) + (this.subscription?.effectiveMaxOverageLimit ?? 0)

			return this.subscribed.value && this.activeContactsCount >= maxContactsCount
		})
		this.status = data.status
		this.statusReasonCode = data.status_reason_code ?? data.statusReasonCode
		this.isStatusActive = computed(() => this.status === STATUS.ACTIVE)
		this.source = data.source ?? null
		this.overageContactsCount = computed(() =>
			this.subscription ? Math.max(0, this.activeContactsCount - this.activeContactLimit.value) : 0,
		)
		this.effectiveMaxOverageLimit = computed(() => this.subscription?.effectiveMaxOverageLimit ?? null)

		this.targetLanguage =
			data.targetLanguage ??
			computed(() => this.settings.value.findLast((setting: any) => setting.key === 'targetLanguage')?.value ?? null)

		// Computed property for contacts
		this.contacts = computed(() => {
			const scopeKey = `chatAccount-${this.id}`
			return useContactsStore().contactsForScope(scopeKey)
		})

		// Eğer gelen veride contacts varsa store'a ekle
		if (data.contacts) {
			consoleLog('Adding contacts to store for ChatAccount', data.contacts)
			data.contacts.forEach((contact: any) => useContactsStore().upsert(contact))
		}

		if (data.customFields || data.custom_fields) {
			;(data.customFields || data.custom_fields).forEach((field: any) => {
				useChatAccountAttributesStore().upsertCustomField(field)
			})
		}
		if (data.tags) {
			data.tags.forEach((field: any) => {
				useChatAccountAttributesStore().upsertTag(field)
			})
		}
	}

	get ringColor() {
		return getRingColor(this.id)
	}

	get borderAccountColor() {
		return getBorderAccountColor(this.id)
	}

	toJSON() {
		return {
			id: this.id,
			uuid: this.uuid,
			// conversations: this.conversations?.value || [],
			postAccount: this.postAccount,
			contactsCount: this.contactsCount,
			activeContactsCount: this.activeContactsCount,
			contacts: this.contacts.value,
			customFields: this.customFields,
			tags: this.tags,
		}
	}
}

export const TABS = {
	overview: {
		iconClass: 'fa-solid fa-chart-pie',
		key: 'overview',
		nameKey: 'pages.app.accounts.tabs.overview',
	},
	billing: {
		iconClass: 'fa-solid fa-credit-card',
		key: 'billing',
		nameKey: 'pages.app.accounts.tabs.billing',
	},
	usage: {
		iconClass: 'fa-solid fa-chart-line',
		key: 'usage',
		nameKey: 'pages.app.accounts.tabs.usage',
	},
	settings: {
		iconClass: 'fa-solid fa-gear',
		key: 'settings',
	},
	notifications: {
		iconClass: 'fa-solid fa-bell',
		key: 'notifications',
	},
	attributes: {
		iconClass: 'fa-solid fa-list-check',
		key: 'attributes',
	},
	messengerProfiles: {
		iconClass: 'fa-brands fa-facebook-messenger',
		key: 'messengerProfiles',
	},
	activities: {
		iconClass: 'fa-solid fa-clock-rotate-left',
		key: 'activities',
	},
}
