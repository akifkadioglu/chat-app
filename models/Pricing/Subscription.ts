import { BaseClass } from '~/models/BaseClass'
import { Plan } from './Plan'
import { Price } from '~/models/Pricing/Price'
export const DUE_DATE_ACTION = {
	RENEW: 1,
	CANCEL: 2,
}

export const STATUS_REASON = {
	PENDING: 0,
	ACTIVE: 1,
	WAITING_FOR_PAYMENT_RETRY: 2,
	CANCELLED_FOR_PAYMENT_FAILURES: 3,
	CANCELLED_FOR_USER_REQUEST: 4,
	CANCELLED_BY_REFUND: 5,
	CANCELLED_BY_REMOVE_ACCOUNT: 6,
	UPGRADED: 7,
	PLAN_CHANGED_TO_UNLIMITED: 8,
	CANCELLED_BY_ADMIN: 9,
}

export class Subscription extends BaseClass {
	id: number | null
	teamId: number | null
	userId: number | null
	subscriptionPlanId: number | null
	subscriptionPlanPriceId: number | null
	coupon: any | null
	chatAccountId: number | null
	overrideIncludedAccountsCount: number | null
	country: string | null
	startedAt: Date | null
	validAt: Date | null
	cancelledAt: Date | null
	cancelReason: string | null
	cancelReasonComment: string | null
	status: number | null
	statusReasonCode: number | null
	dueDateAction: number | null
	successfulPaymentsCount: number | null
	comment: string | null
	isFirstOffer: number | null
	retryAt: Date | null
	retryCount: number | null
	createdAt: Date | null
	plan: Plan | null
	user: any | null
	extraActiveContactLimit: number | null
	effectiveActiveContactLimit: number | null
	maxOverageLimit: number | null
	effectiveMaxOverageLimit: number | null;

	[key: string]: any

	constructor(data: any) {
		super(data?.uuid ?? null)

		if (data && typeof data === 'object') {
			Object.assign(this, data)
		}

		this.id = data?.id || null
		this.teamId = data?.team_id || null
		this.userId = data?.user_id || null
		this.subscriptionPlanId = data?.subscription_plan_id || null
		this.subscriptionPlanPriceId = data?.subscription_plan_price_id || null
		this.coupon = data?.subscription_coupon?.coupon || null
		this.chatAccountId = data?.chat_account_id || null
		this.overrideIncludedAccountsCount = data?.override_included_accounts_count || null
		this.country = data?.country || null
		this.startedAt = data?.started_at ? new Date(data.started_at) : null
		this.validAt = data?.valid_at ? new Date(data.valid_at) : null
		this.cancelledAt = data?.cancelled_at ? new Date(data.cancelled_at) : null
		this.cancelReason = data?.cancel_reason || null
		this.cancelReasonComment = data?.cancel_reason_comment || null
		this.status = data?.status || null
		this.statusReasonCode = data?.status_reason_code || null
		this.dueDateAction = data?.due_date_action || null
		this.successfulPaymentsCount = data?.successful_payments_count || null
		this.comment = data?.comment || null
		this.isFirstOffer = data?.is_first_offer || null
		this.retryAt = data?.retry_at ? new Date(data.retry_at) : null
		this.retryCount = data?.retry_count || null
		this.createdAt = data?.created_at ? new Date(data.created_at) : null
		if (!data.plan.price && data.plan_price) {
			data.plan.price = data.plan_price
		}
		this.plan = data?.plan ? new Plan(data.plan) : null

		this.user = data?.user || null
		this.extraActiveContactLimit = data?.extra_active_contact_limit || null
		this.effectiveActiveContactLimit = data?.effective_active_contact_limit || null
		this.maxOverageLimit = data?.max_overage_limit ?? null
		this.effectiveMaxOverageLimit = data?.effective_max_overage_limit ?? null
	}
}
