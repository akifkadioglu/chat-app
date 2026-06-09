import { BaseClass } from '~/models/BaseClass'

export const INTENT_QUESTION_KEY = 'question'
export const INTENT_COMPLAINT_KEY = 'complaint'
export const INTENT_COMPLIMENT_KEY = 'compliment'
export const INTENT_REQUEST_KEY = 'request'
export const INTENT_SUPPORT_KEY = 'support'
export const INTENT_PURCHASE_KEY = 'purchase'
export const INTENT_INFORMATION_KEY = 'information'
export const INTENT_FEEDBACK_KEY = 'feedback'
export const INTENT_SPAM_KEY = 'spam'
export const INTENT_GIVEAWAY_ENTRY_KEY = 'giveaway_entry'
export const INTENT_COLLABORATION_KEY = 'collaboration'

export class ContentIntent extends BaseClass {
	id: number | null
	name: string
	category: string
	priority: number

	constructor(intent: any) {
		super(intent?.uuid ?? null)

		this.id = intent?.id ?? null
		this.name = intent?.name ?? ''
		this.category = intent?.category ?? ''
		this.priority = intent?.priority ?? 0
	}

	toJSON() {
		return {
			id: this.id,
			name: this.name,
			category: this.category,
			priority: this.priority,
		}
	}
}
