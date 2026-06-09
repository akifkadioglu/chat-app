import { BaseClass } from '~/models/BaseClass'
import { fieldTypes } from '~/models/Flow/utils/utils'

export class CustomField extends BaseClass {
	id: number
	key: string | null
	type: keyof typeof fieldTypes
	isTemporary: boolean
	chatAccountId: number

	constructor(data: any) {
		super(data?.uuid ?? null)
		this.id = data.id
		this.chatAccountId = data.chat_account_id
		this.key = data.key
		this.type = data.type
		this.isTemporary = data.isTemporary ?? false
	}
}

export class CustomFieldPivot extends BaseClass {
	contactId: number
	customFieldId: number
	value: string

	constructor(data: any) {
		super(data?.uuid ?? null)

		this.contactId = data.contact_id
		this.customFieldId = data.custom_field_id
		this.value = data.value
	}
}
