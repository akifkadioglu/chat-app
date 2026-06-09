import { BaseClass } from '~/models/BaseClass'

export class Tag extends BaseClass {
	id: number
	name: string | null
	color: string | null
	constructor(data: any) {
		super(data?.uuid ?? null)

		this.id = data.id
		this.name = data.name
		this.color = data.color
	}
	toJson() {
		return {
			id: this.id,
			name: this.name,
			color: this.color,
		}
	}
}

export class TagPivot extends BaseClass {
	contactId: number
	tagId: number
	constructor(data: any) {
		super(data?.uuid ?? null)

		this.contactId = data.contact_id
		this.tagId = data.tag_id
	}
	toJson() {
		return {
			contactId: this.contactId,
			tagId: this.tagId,
		}
	}
}