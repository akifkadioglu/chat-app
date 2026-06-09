import { BaseClass } from '~/models/BaseClass'

export const PLATFORMS = {
	INSTAGRAM: 'instagram',
	FACEBOOK: 'facebook',
}

export class Social extends BaseClass {
	id: number | null
	name: string | null

	constructor(data: any) {
		super(data?.uuid ?? null)

		this.id = data?.id || null
		this.name = data?.name || 'instagram'
	}
}
