import { BaseClass } from '~/models/BaseClass'

export class AccountPlan extends BaseClass {
	id: number | null
	period: string | null

	constructor(data: any) {
		super(data?.uuid ?? null)

		this.id = data?.id || null
		this.period = data?.period || null
	}
}
