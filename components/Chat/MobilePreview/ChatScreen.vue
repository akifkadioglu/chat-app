<template>
	<div class="flex flex-col h-full">
		<div class="flex items-center justify-between p-3 border-b border-subtle">
			<div class="flex-1 flex items-center gap-3 px-1 min-w-0">
				<button class="shrink-0"><i class="fa fa-chevron-left text-lg" /></button>
				<ProfilePicture :src="postAccount?.profilePicture" size="32" />
				<div class="flex-1 flex flex-col text-start min-w-0">
					<div class="font-medium -mb-1 truncate">{{ postAccount?.name }}</div>
					<div class="text-sm font-medium opacity-50 truncate">
						<span v-if="showBusinessAccount">
							{{ $t('components.chat.mobilePreview.chatScreen.businessAccount') }}
						</span>
					</div>
				</div>
			</div>
			<div class="shrink-0 flex items-center gap-2">
				<button><i class="fa fa-phone text-lg" /></button>
				<button><i class="fa fa-video text-lg" /></button>
				<button><i class="fa fa-bars text-lg" /></button>
			</div>
		</div>

		<div class="text-start h-full pb-24" :class="{ 'overflow-y-auto': overflowEnabled }">
			<slot>
				<div class="flex flex-col items-center justify-start p-6 text-center">
					<ProfilePicture :src="postAccount?.profilePicture" size="80" :alt="postAccount?.name" class="mb-4" />
					<span class="text-lg font-medium mb-2">
						<span>{{ postAccount?.name }}</span>
						<IsVerifiedImg v-if="postAccount?.isVerified" class="inline-block ml-1" />
					</span>
					<p class="text-gray-400 text-sm mb-6">{{ postAccount?.username }}</p>
				</div>
			</slot>
		</div>

		<div class="absolute pb-5 bottom-0 px-1 w-full dark:bg-black bg-white border-t border-subtle">
			<div class="py-2">
				<slot name="quickReplies" />
			</div>
			<div class="flex relative">
				<button
					class="absolute top-1/2 -translate-y-1/2 left-1 cursor-pointer my-auto p-1 rounded-full bg-indigo-700 border-0 text-white"
				>
					<CameraIcon />
				</button>
				<input
					disabled
					class="px-12 w-full rounded-full border-0 bg-base-200 p-2 ring-0"
					:placeholder="$t('components.chat.mobilePreview.chatScreen.messagePlaceholder')"
				/>
				<div class="absolute top-1/2 -translate-y-1/2 right-1">
					<button class="btn btn-ghost btn-sm btn-circle border-0">
						<i class="fa fa-microphone text-lg" />
					</button>
					<button class="btn btn-ghost btn-sm btn-circle border-0">
						<ImageIcon />
					</button>
					<button class="btn btn-ghost btn-sm btn-circle border-0">
						<StickersIcon />
					</button>
				</div>
			</div>
		</div>
	</div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import IsVerifiedImg from '~/components/GlobalComponents/isVerifiedImg.vue'
import ImageIcon from '~/components/MobilePreviewComponents/ImageIcon.vue'
import StickersIcon from '~/components/MobilePreviewComponents/StickersIcon.vue'
import CameraIcon from '~/components/MobilePreviewComponents/CameraIcon.vue'
import ProfilePicture from '~/components/GlobalComponents/ProfilePicture.vue'

export default defineComponent({
	name: 'ChatScreen',
	components: { ProfilePicture, CameraIcon, StickersIcon, ImageIcon, IsVerifiedImg },
	props: {
		lowOpacity: {
			type: Boolean,
		},
		postAccount: {
			type: Object,
			default: () => {},
		},
		showBusinessAccount: {
			type: Boolean,
			default: true,
		},
		overflowEnabled: {
			type: Boolean,
			default: true,
		},
	},
})
</script>

<style scoped>
button {
	cursor: default;
}
</style>
