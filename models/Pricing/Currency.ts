import { BaseClass } from '~/models/BaseClass'

export class Currency extends BaseClass {
	id: number | null
	code: string | null
	symbol: string | null
	symbolOnLeft: boolean | null
	baseCurrencyId: number | null
	baseCode: string | null
	baseCurrency: Currency | null

	constructor(data: any) {
		super(data?.uuid ?? null)

		this.id = data?.id || null
		this.code = data?.code || null
		this.symbol = data?.symbol || null
		this.symbolOnLeft = data?.symbol_on_left === 1
		this.baseCurrencyId = data?.base_currency_id || null
		this.baseCode = data?.baseCode || null
		this.baseCurrency = data?.base_currency ? new Currency(data.base_currency) : null
	}
}
