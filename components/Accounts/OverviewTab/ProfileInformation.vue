<template>
	<div class="w-full truncate">
		<div class="flex items-center max-w-lg">
			<div class="relative h-min w-min pt-1 pb-2 px-2">
				<i
					class="pointer-events-none absolute -left-1 top-4 z-1 fa fa-2xl"
					:class="{
						'fa-exclamation-circle text-warning': account.needsUpgrade,
						'fa-exclamation-circle text-error': !account.isStatusActive,
					}"
				/>
				<ProfilePicture size="60" :ringColor="account?.ringColor" :src="postAccount.profilePicture" />
				<span class="absolute flex items-center justify-center bottom-0 right-2 size-9 rounded-full bg-base-100">
					<i :class="`fa-${postAccount.social.name} text-${postAccount.social.name}`" class="fa-brands text-3xl" />
				</span>
			</div>

			<!-- Profile Content -->
			<div :key="postAccount.id" class="flex-1 truncate">
				<div class="px-3 space-y-1">
					<div class="flex items-center gap-2">
						<a
							:href="isLinkedUsername ? `https://www.${postAccount.social.name}.com/${postAccount.username}` : null"
							target="_blank"
							rel="noopener noreferrer nofollow"
							:class="{ link: isLinkedUsername }"
							class="text-xl font-semibold flex gap-1 truncate"
						>
							<div class="truncate">
								{{ postAccount.username }}
								<IsVerifiedImg v-if="postAccount.isVerified" />
							</div>
							<i v-if="isLinkedUsername" class="fa fa-external-link link-icon" />
						</a>
					</div>
					<div class="text-muted">{{ postAccount.name }}</div>
				</div>

				<div class="hidden md:inline-grid stats stats-horizontal">
					<div v-if="!hidePostsCount" class="stat py-2 text-center">
						<div>
							<span class="font-semibold">{{ postAccount.postsCount }}</span>
							<span>{{ $t('components.accounts.overviewTab.profileInformation.post') }}</span>
						</div>
					</div>
					<div v-if="!hideFollowersCount" class="stat py-2 text-center">
						<div>
							<span class="font-semibold">{{ $formatSocialCount(postAccount.followersCount || 0) }}</span>
							<span>{{ $t('components.accounts.overviewTab.profileInformation.followers') }}</span>
						</div>
					</div>
					<div v-if="!hideFollowingCount" class="stat py-2 text-center">
						<div>
							<span class="font-semibold">{{ $formatSocialCount(postAccount.followingCount || 0) }}</span>
							<span>{{ $t('components.accounts.overviewTab.profileInformation.following') }}</span>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="md:hidden stats stats-horizontal w-full max-w-sm px-4 justify-between">
			<div v-if="!hidePostsCount" class="stat py-2 px-0 text-center">
				<span class="font-semibold">{{ postAccount.postsCount }}</span>
				<div>{{ $t('components.accounts.overviewTab.profileInformation.post') }}</div>
			</div>
			<div v-if="!hideFollowersCount" class="stat py-2 px-0 text-center">
				<span class="font-semibold">{{ $formatSocialCount(postAccount.followersCount || 0) }}</span>
				<div>{{ $t('components.accounts.overviewTab.profileInformation.followers') }}</div>
			</div>
			<div v-if="!hideFollowingCount" class="stat py-2 px-0 text-center">
				<span class="font-semibold">{{ $formatSocialCount(postAccount.followingCount || 0) }}</span>
				<div>{{ $t('components.accounts.overviewTab.profileInformation.following') }}</div>
			</div>
		</div>
	</div>
</template>
<script>
import ProfilePicture from '~/components/GlobalComponents/ProfilePicture.vue'
import IsVerifiedImg from '~/components/GlobalComponents/isVerifiedImg.vue'
import { ChatAccount } from '~/models/ChatAccount.ts'

export default {
	components: { IsVerifiedImg, ProfilePicture },
	props: {
		account: {
			type: [ChatAccount, null],
			default: null,
		},
		hidePostsCount: {
			type: Boolean,
			default: false,
		},
		hideFollowingCount: {
			type: Boolean,
			default: false,
		},
		hideFollowersCount: {
			type: Boolean,
			default: false,
		},
		isLinkedUsername: {
			type: Boolean,
			default: true,
		},
	},
	computed: {
		postAccount() {
			return this.account?.postAccount
		},
	},
}
</script>

<style scoped></style>
