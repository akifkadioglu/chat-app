import { v4 } from 'uuid'

export class BaseClass {
	uuid: string

	constructor(uuid: string | null = null) {
		this.uuid = uuid ?? v4()
	}
}
