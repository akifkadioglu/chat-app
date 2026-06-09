import { BaseClass } from '~/models/BaseClass'
import { Social } from '~/models/Social'

export class PlatformAccount extends BaseClass {
	id: number
	username: string | null
	idOnApi: string | null
	name: string | null
	profileImageUrl: string | null
	profileUrl: string | null
	isVerified: boolean | null
	isPrivate: any | null
	followersCount: number | null
	createdAt: Date
	platform: Social

	constructor(data: any) {
		super(data?.uuid ?? null)

		this.id = data.id
		this.username = data.username
		this.idOnApi = data.idOnApi
		this.name = data.name
		this.profileImageUrl = data.profile_image_url
		this.profileUrl = data.profile_url
		this.isVerified = data.is_verified
		this.isPrivate = data.is_private
		this.followersCount = data.followers_count
		this.createdAt = new Date(data.created_at)
		this.platform = new Social(data.platform)
	}
}
