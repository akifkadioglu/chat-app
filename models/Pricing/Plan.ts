import { BaseClass } from '~/models/BaseClass'
import { AccountPlan } from './AccountPlan'
import { Price } from './Price'

export const PERIODS = {
	monthly: 'monthly',
	yearly: 'yearly',
}

export const FREE_CONTACTS_LIMIT = 500
export const FREE_ACTIVE_CONTACTS_LIMIT = 200

export class Plan extends BaseClass {
	id: number | null
	slug: string | null
	name: string | null
	entryLimit: number | null
	contactLimit: number | null
	activeContactLimit: number | null
	period: string | null
	listing: number | null
	listingInChat: number | null
	groupKey: string | null
	limitString: string | null
	accountPlan: AccountPlan | null
	price: Price | null

	constructor(data: any) {
		super(data?.uuid ?? null)

		this.id = data?.id || null
		this.slug = data?.slug || null
		this.name = data?.name || null
		this.entryLimit = data?.entry_limit || null
		this.contactLimit = data?.contact_limit || null
		this.activeContactLimit = data?.active_contact_limit || null
		this.period = data?.period || null
		this.listing = data?.listing || null
		this.listingInChat = data?.listing_in_chat || null
		this.groupKey = data?.group_key || null
		this.limitString = data?.limit_string || null
		this.accountPlan = data?.account_plan ? new AccountPlan(data.account_plan) : null
		this.price = data?.price ? new Price(data.price) : null
	}
}
