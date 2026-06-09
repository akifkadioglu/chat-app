import { BaseClass } from '~/models/BaseClass'

export class TeamSetting extends BaseClass {
	id: number | null
	key: string
	value: any

	constructor(data: any) {
		super(data?.uuid ?? null)

		this.id = data.id
		this.key = data.key
		this.value = data.value
	}
}

export const TeamSettingKeys = {
	AUTO_ASSIGNMENT: 'autoAssignment',
	ASSIGNMENT_MODE: 'assignmentMode',
	WEIGHTED: 'weighted',
	SCHEDULED: 'scheduled',
	TIMEZONE_OFFSET: 'timezoneOffset',
}
