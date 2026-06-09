import { BaseClass } from '~/models/BaseClass'
import type { Plan } from '~/models/Pricing/Plan'

export class PlanGroup extends BaseClass {
	plans: Array<Plan>
	groupKey?: string
	contactLimit?: number
	activeContactLimit?: number
	entryLimit?: number

	constructor(plans: Array<Plan> = []) {
		super(null)

		this.plans = plans || []
		this.groupKey = this.plans[0]?.groupKey || undefined
		this.contactLimit = this.plans[0]?.contactLimit || undefined
		this.activeContactLimit = this.plans[0]?.activeContactLimit || undefined
		this.entryLimit = this.plans[0]?.entryLimit || undefined
	}
}
