export interface DaySchedule {
	enabled: boolean
	customTime: boolean
	start?: string
	end?: string
}

export interface Schedule {
	alwaysAvailable: boolean
	days: {
		monday: DaySchedule
		tuesday: DaySchedule
		wednesday: DaySchedule
		thursday: DaySchedule
		friday: DaySchedule
		saturday: DaySchedule
		sunday: DaySchedule
	}
}

export const DEFAULT_DAY_SCHEDULE: DaySchedule = {
	enabled: false,
	customTime: false,
	start: '09:00',
	end: '18:00',
}

export const DEFAULT_SCHEDULE: Schedule = {
	alwaysAvailable: true,
	days: {
		monday: { ...DEFAULT_DAY_SCHEDULE },
		tuesday: { ...DEFAULT_DAY_SCHEDULE },
		wednesday: { ...DEFAULT_DAY_SCHEDULE },
		thursday: { ...DEFAULT_DAY_SCHEDULE },
		friday: { ...DEFAULT_DAY_SCHEDULE },
		saturday: { ...DEFAULT_DAY_SCHEDULE },
		sunday: { ...DEFAULT_DAY_SCHEDULE },
	},
}

export class TeamAssignmentSetting {
	id: number
	teamId: number
	userId: number
	weight: number
	schedule: Schedule
	createdAt: string
	updatedAt: string

	constructor(data?: any) {
		this.id = data?.id
		this.teamId = data?.team_id
		this.userId = data?.user_id
		this.weight = data?.weight ?? 0
		this.schedule = data?.schedule ?? DEFAULT_SCHEDULE
		this.createdAt = data?.created_at
		this.updatedAt = data?.updated_at
	}
}