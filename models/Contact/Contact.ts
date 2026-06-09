import { BaseClass } from '~/models/BaseClass'
import { TagPivot } from '~/models/Contact/Tag'
import { PlatformAccount } from '~/models/Contact/PlatformAccount'
import { PlatformAccountInstagram } from '~/models/PlatformAccountInstagram'
import { computed, isRef, ref } from 'vue'
import { CustomFieldPivot } from '~/models/Contact/CustomField'

export class Contact extends BaseClass {
	id!: number
	chatAccountId!: number
	firstName: Ref<string | null>
	lastName: Ref<string | null>
	email: string | null = null
	notes: string | null = null
	address: string | null = null
	phone: string | null = null
	timezone: string | null = null
	tagValues = [] as TagPivot[]
	customFieldsValues = [] as CustomFieldPivot[]
	// platformAccounts: PlatformAccount[] = []
	platformAccountsInstagram: PlatformAccountInstagram | null = null
	isAnswerable: boolean | null = null
	lastOptedInAt: Date | null = null
	flowsPauseUntil: Date | null = null

	createdAt: Date | null = null
	updatedAt: Date | null = null
	deletedAt: Date | null = null
	fetchedAt?: number

	name: ComputedRef<string>
	raw: object = {}

	constructor(data: any) {
		if (!data || typeof data !== 'object') {
			data = {}
		}
		super(data?.uuid ?? null)
		this.firstName = ref(data.first_name || data.firstName || '')
		this.lastName = ref(data.last_name || data.lastName || '')
		this._setData(data)
		this.name = computed(() => this.firstName.value + ' ' + this.lastName.value)
	}

	update(data: any) {
		this._setData(data)
	}

	private _setData(data: any) {
		if (data.id !== undefined) this.id = data.id
		if (data.chat_account_id !== undefined || data.chatAccountId !== undefined)
			this.chatAccountId = data.chat_account_id ?? data.chatAccountId

		if (data.first_name !== undefined || data.firstName !== undefined) {
			const val = data.first_name ?? data.firstName ?? ''
			if (isRef(this.firstName)) this.firstName.value = val
			else this.firstName = val
		}
		if (data.last_name !== undefined || data.lastName !== undefined) {
			const val = data.last_name ?? data.lastName ?? ''
			if (isRef(this.lastName)) this.lastName.value = val
			else this.lastName = val
		}

		if (data.email !== undefined) this.email = data.email
		if (data.notes !== undefined) this.notes = data.notes
		if (data.address !== undefined) this.address = data.address
		if (data.phone !== undefined) this.phone = data.phone
		if (data.timezone !== undefined) this.timezone = data.timezone

		if (data.createdAt || data.created_at) {
			this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date(data.created_at)
		}
		if (data.updatedAt || data.updated_at) {
			this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date(data.updated_at)
		}
		if (data.deletedAt || data.deleted_at) {
			this.deletedAt = data.deletedAt ? new Date(data.deletedAt) : new Date(data.deleted_at)
		}
		if (Array.isArray(data.tags)) {
			this.tagValues = data.tags.map((tag: any) => new TagPivot(tag.pivot))
		}

		if (Array.isArray(data.custom_fields)) {
			this.customFieldsValues = data.custom_fields.map((cf: any) => new CustomFieldPivot(cf.pivot))
		}

		// if (Array.isArray(data.platform_accounts) && data.platform_accounts.length > 0)
			// this.platformAccounts = data.platform_accounts.map((acc: any) => new PlatformAccount(acc))

		if (data.platform_accounts_instagram)
			this.platformAccountsInstagram = new PlatformAccountInstagram(data.platform_accounts_instagram)
		if (data.is_answerable !== undefined) this.isAnswerable = data.is_answerable
		if (data.last_opted_in_at !== undefined)
			this.lastOptedInAt = data.last_opted_in_at ? new Date(data.last_opted_in_at) : null
		if (data.flows_pause_until !== undefined)
			this.flowsPauseUntil = data.flows_pause_until ? new Date(data.flows_pause_until) : null

		this.raw = data
	}

	// get platformAccount(): PlatformAccount | null {
	// 	return this.platformAccounts[0] ?? null
	// }

	toJSON() {
		return {
			id: this.id,
			chat_account_id: this.chatAccountId,
			name: this.name,
			email: this.email,
			notes: this.notes,
			address: this.address,
			phone: this.phone,
			timezone: this.timezone,
			is_answerable: this.isAnswerable,
			last_opted_in_at: this.lastOptedInAt?.toISOString(),
			// deleted_at: this.deletedAt?.toISOString(),
			custom_fields_values: this.customFieldsValues?.value,
			platform_accounts_instagram: this.platformAccountsInstagram?.toJSON(),
		}
	}
}
export const SELECTION_TYPES = {
	INCLUDE: 'include',
	EXCLUDE: 'exclude',
}

export const DEFAULT_COLUMNS = {
	FIRST_NAME: { key: 'first_name', required: true },
	LAST_NAME: { key: 'last_name', required: true },
	USERNAME: { key: 'ig.username', required: false },
	EMAIL: { key: 'email', required: false },
	NOTES: { key: 'notes', required: false },
	ADDRESS: { key: 'address', required: false },
	PHONE: { key: 'phone', required: false },
	TIMEZONE: { key: 'timezone', required: false },
	CUSTOM_FIELDS: { key: 'custom_fields', required: false },
}
