export class TeamRole {
	id: number
	key: string
	name: string

	constructor(data?: any) {
		this.id = data?.id
		this.key = data?.key
		this.name = data?.name
	}
}