export class TeamSetting {
	id: number
	teamId: number
	key: string
	value: string
	type: string
	createdAt: string
	updatedAt: string

	constructor(data?: any) {
		this.id = data?.id
		this.teamId = data?.team_id
		this.key = data?.key
		this.value = data?.value
		this.type = data?.type
		this.createdAt = data?.created_at
		this.updatedAt = data?.updated_at
	}

	getParsedValue(): any {
		if (this.type === 'json') {
			return JSON.parse(this.value)
		}
		if (this.type === 'bool') {
			return this.value === '1' || this.value === 'true'
		}
		return this.value
	}
}