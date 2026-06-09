import { User } from '~/models/User'
import { TeamRole } from '~/models/Team/TeamRole'

export class TeamUser {
	id: number
	teamId: number
	userId: number
	invitedEmail: string | null
	invitedAt: string | null
	joinedAt: string | null
	invitedByUserId: number | null
	isOwner: boolean
	createdAt: string
	updatedAt: string
	user: User
	teamRoles: TeamRole[]
	migrationStatus: number

	constructor(data?: any) {
		this.id = data?.id
		this.teamId = data?.team_id
		this.userId = data?.user_id
		this.invitedEmail = data?.invited_email
		this.invitedAt = data?.invited_at
		this.joinedAt = data?.joined_at
		this.invitedByUserId = data?.invited_by_user_id
		this.isOwner = data?.is_owner
		this.createdAt = data?.created_at
		this.updatedAt = data?.updated_at
		this.user = new User(data?.user)
		this.teamRoles = data?.team_roles?.map((r: any) => new TeamRole(r)) ?? []
		this.migrationStatus = data?.migration_status
	}
}