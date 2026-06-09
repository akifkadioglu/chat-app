import { BaseClass } from '~/models/BaseClass'

export class PlatformAccountInstagram extends BaseClass {
	id: number | null
	platformId: number | null
	postAccountId: number | null
	idOnApi: string
	username: string
	name: string
	profileImageUrl: string
	profileUrl: string
	isVerified: boolean
	isPrivate: boolean | null
	followersCount: number
	followsAccount: boolean | null
	contactId: number
	createdAt: Date | null
	updatedAt: Date | null

	constructor(platformAccount: any) {
		super(platformAccount?.uuid ?? null)

		this.id = platformAccount?.id ?? null
		this.platformId = platformAccount?.platform_id ?? null
		this.postAccountId = platformAccount?.post_account_id ?? null
		this.idOnApi = platformAccount?.id_on_api ?? ''
		this.username = platformAccount?.username ?? ''
		this.name = platformAccount?.name ?? ''
		this.profileImageUrl = platformAccount?.profile_image_url ?? ''
		this.profileUrl = platformAccount?.profile_url ?? ''
		this.isVerified = platformAccount?.is_verified ?? false
		this.isPrivate = platformAccount?.is_private ?? null
		this.followersCount = platformAccount?.followers_count ?? 0
		this.followsAccount = platformAccount?.follows_account ?? null
		this.contactId = platformAccount?.contact_id ?? 0
		this.createdAt = platformAccount?.createdAt ?? new Date(platformAccount.created_at) ?? null
		this.updatedAt = platformAccount?.updatedAt ?? new Date(platformAccount.updated_at) ?? null
	}

	toJSON() {
		return {
			id: this.id,
			platform_id: this.platformId,
			post_account_id: this.postAccountId,
			id_on_api: this.idOnApi,
			username: this.username,
			name: this.name,
			profile_image_url: this.profileImageUrl,
			profile_url: this.profileUrl,
			is_verified: this.isVerified,
			is_private: this.isPrivate,
			followers_count: this.followersCount,
			follows_account: this.followsAccount,
			contact_id: this.contactId,
		}
	}
}
