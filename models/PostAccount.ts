import { BaseClass } from '~/models/BaseClass'

import { Social } from '~/models/Social'

export class PostAccount extends BaseClass {
	id: number|null
	idOnPlatform: string | null
	username: string | null
	name: string | null
	profilePicture: string | null
	isVerified: number | null
	followersCount: number | null
	followingCount: number | null
	postsCount: number | null
	likesCount: number | null
	viewsCount: number | null
	followersCountString: string | null
	followingCountString: string | null
	social: Social

	constructor(data: any) {
		super(data?.uuid ?? null)

		this.id = data?.id
		this.idOnPlatform = data?.id_on_platform
		this.username = data.username
		this.name = data.name
		this.profilePicture = data.profile_picture
		this.isVerified = data?.is_verified
		this.followersCount = data?.followers_count
		this.followingCount = data?.following_count
		this.postsCount = data?.posts_count
		this.likesCount = data?.likes_count
		this.viewsCount = data?.views_count
		this.followersCountString = data?.followers_count_string
		this.followingCountString = data?.following_count_string
		this.social = new Social(data.social)
	}
}
