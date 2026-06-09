import { BaseClass } from '~/models/BaseClass'
import { User } from '~/models/User'
import { TeamUser } from '~/models/Team/TeamUser'
import { TeamRole } from '~/models/Team/TeamRole'
import { TeamSetting } from '~/models/Team/TeamSetting'
import { TeamAssignmentSetting } from '~/models/Team/TeamAssignmentSetting'

export class Team extends BaseClass {
	id: number
	name: string
	slug: string
	createdAt: string
	updatedAt: string
	isOwner: boolean
	teamUsers: TeamUser[]
	assignmentSettings: TeamAssignmentSetting[]
	settings: TeamSetting[]
	roles: TeamRole[]
	owner: User | null

	constructor(data?: any) {
		super(data?.uuid ?? null)

		this.id = data?.id
		this.name = data?.name
		this.slug = data?.slug
		this.createdAt = data?.created_at
		this.updatedAt = data?.updated_at
		this.isOwner = data?.is_owner
		this.teamUsers = data?.team_users?.map((tu: any) => new TeamUser(tu)) ?? []
		this.assignmentSettings = data?.assignment_settings?.map((as: any) => new TeamAssignmentSetting(as)) ?? []
		this.settings = data?.settings?.map((s: any) => new TeamSetting(s)) ?? []
		this.roles = data?.roles?.map((r: any) => new TeamRole(r)) ?? []
		this.owner = data?.owner ? new User(data.owner) : null
	}

	getSetting(key: string): TeamSetting | undefined {
		return this.settings.find((s) => s.key === key)
	}

	getSettingValue(key: string): any {
		const setting = this.getSetting(key)
		return setting?.getParsedValue()
	}
}
