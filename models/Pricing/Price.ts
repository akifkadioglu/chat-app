import { BaseClass } from '~/models/BaseClass'
import { Currency } from './Currency'

export class Price extends BaseClass {
	id: number | null
	originalSelfId: number | null
	subscriptionPlanId: number | null
	currencyId: number | null
	oldPrice: number | null
	price: number | null
	firstSubscriptionPrice: string | null
	includedAccountsCount: number | null
	discountRate: number | null
	stripeCommission: number | null
	paypalCommission: number | null
	execPrice: number | null
	execCurrency: Currency | null
	execFirstSubscriptionPrice: number | null
	currency: Currency | null
	extraContactPrice: number | null

	constructor(data: any) {
		super(data?.uuid ?? null)

		this.id = data?.id || null
		this.originalSelfId = data?.original_self_id || null
		this.subscriptionPlanId = data?.subscription_plan_id || null
		this.currencyId = data?.currency_id || null
		this.oldPrice = Number(data?.old_price || null)
		this.price = Number(data.price || null)
		this.firstSubscriptionPrice = data?.first_subscription_price || null
		this.includedAccountsCount = data?.included_accounts_count || null
		this.discountRate = data?.discount_rate || null
		this.stripeCommission = data?.stripe_commission || null
		this.paypalCommission = data?.paypal_commission || null
		this.execPrice = Number(data?.exec_price || null)
		this.execCurrency = data?.exec_currency ? new Currency(data.exec_currency) : null
		this.execFirstSubscriptionPrice = data?.exec_first_subscription_price || null
		this.currency = data?.currency ? new Currency(data.currency) : null
		this.extraContactPrice = data?.extra_contact_price != null ? Number(data.extra_contact_price) : null
	}
}
