<template>
	<div class="flex items-center gap-2 w-full">
		<component
			:is="username && isClickable ? 'a' : 'div'"
			class="flex gap-2 min-w-0 flex-1"
			:class="{ 'cursor-pointer': username && isClickable }"
			:target="username && isClickable ? '_blank' : null"
			:href="username && isClickable ? `https://www.instagram.com/${this.username}` : null"
		>
			<ProfilePicture
				:size="size"
				:showSkeleton="isLoading"
				:ring-color="ringColor"
				:ring="ring"
				class="my-auto"
				:src="profilePicture"
				:alt="name || username || 'Profile picture'"
			/>
			<div
				:class="{
					'space-y-2': isLoading,
					'flex flex-col w-full min-w-0': !isLoading,
					'text-xs': size <= 24,
					'text-sm': size <= 32,
					'text-base': size <= 50,
					'justify-center': !name,
				}"
			>
				<div>
					<div v-if="!isLoading" class="truncate">
						{{ name }}
					</div>
					<div v-else class="skeleton h-6 w-36 bg-base-200 rounded-full" />
				</div>
				<div
					class="flex items-center gap-2 text-base-content/70"
					:class="{
						'text-[10px]': size <= 24,
						'text-xs': size <= 32,
						'text-sm': size <= 50,
					}"
				>
					<div v-if="!isLoading" class="font-username flex items-center gap-1">
						{{ username }}
						<i v-if="username && isClickable" class="fas fa-external-link-alt text-xs opacity-80 link-icon"></i>
					</div>
					<div v-else class="skeleton h-4 w-25 bg-base-200 rounded-full"></div>
				</div>
			</div>
		</component>
		<div v-if="(followersCount != null || followingCount != null) && !isLoading" class="flex gap-3 text-sm ml-auto">
			<div v-if="followersCount != null" class="text-center">
				<div class="font-semibold">{{ $formatSocialCount(followersCount) }}</div>
				<div class="text-muted text-xs">{{ $t('components.globalComponents.accountProfile.followers') }}</div>
			</div>
			<div v-if="followingCount != null" class="text-center">
				<div class="font-semibold">{{ $formatSocialCount(followingCount) }}</div>
				<div class="text-muted text-xs">{{ $t('components.globalComponents.accountProfile.following') }}</div>
			</div>
		</div>
	</div>
</template>
<script>
import ProfilePicture from '~/components/GlobalComponents/ProfilePicture.vue'

export default {
	components: { ProfilePicture },
	props: {
		isClickable: {
			type: Boolean,
			default: false,
		},
		profilePicture: {
			type: String,
			default: null,
		},
		name: {
			type: String,
			default: null,
		},
		username: {
			type: String,
			default: null,
		},
		ringColor: {
			type: String,
			default: null,
		},
		ring: {
			type: String,
			default: null,
		},
		isLoading: {
			type: Boolean,
			default: false,
		},
		size: {
			type: Number,
			default: 40,
		},
		followersCount: {
			type: Number,
			default: null,
		},
		followingCount: {
			type: Number,
			default: null,
		},
	},
}
</script>
