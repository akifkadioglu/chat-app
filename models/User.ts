import { BaseClass } from '~/models/BaseClass'

export class User extends BaseClass {
	id: number
	name: string
	email: string
	emailVerifiedAt: string | null
	phone: string | null
	role: string
	subscriptionId: number | null
	createdAt: string
	updatedAt: string
	isAdmin: boolean

	constructor(data?: any) {
		super(data?.uuid ?? null)
		this.id = data?.id
		this.name = data?.name
		this.email = data?.email
		this.emailVerifiedAt = data?.email_verified_at
		this.phone = data?.phone
		this.role = data?.role
		this.subscriptionId = data?.subscription_id
		this.createdAt = data?.created_at
		this.updatedAt = data?.updated_at
		this.isAdmin = data?.is_admin
	}
}