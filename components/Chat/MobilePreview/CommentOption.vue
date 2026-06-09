<template>
	<div class="border-t rounded-t-4xl rounded-b-0 w-full border-zinc-700 bg-zinc-900 space-y-2 h-150">
		<div class="border-b border-muted mb-5">
			<div class="py-5 relative flex items-center justify-end w-full gap-3">
				<div class="absolute flex flex-col items-center justify-center w-full pointer-events-none">
					<div class="text-xl text-white">{{ $t('components.chat.mobilePreview.commentOption.comments') }}</div>
				</div>
				<button class="text-white px-5">
					<ShareIcon size="30" />
				</button>
			</div>
		</div>
		<div class="space-y-7 w-max max-h-96 text-white overflow-y-auto">
			<slot name="comments">
				<div class="flex text-sm w-full px-2 gap-2">
					<ProfilePicture size="35" />
					<div class="flex items-center justify-between w-full">
						<div class="flex flex-col">
							<span>
								{{ $t('components.chat.mobilePreview.commentOption.username') }}
								<span class="text-gray-400">{{ $t('components.chat.mobilePreview.commentOption.now') }}</span>
							</span>
							<span class="pb-2 wrap-break-word whitespace-normal w-65">
								{{ contactComment ?? $t('components.chat.mobilePreview.commentOption.leaveComment') }}
							</span>
							<span class="opacity-50">{{ $t('components.chat.mobilePreview.commentOption.reply') }}</span>
						</div>
						<div class="px-5 text-lg opacity-75">
							<i class="fa-regular fa-heart" />
						</div>
					</div>
				</div>
				<div v-if="showAccountComment" class="ps-10 flex text-sm">
					<ProfilePicture size="35" class="px-2 gap-2" />
					<div class="flex items-center justify-between w-full">
						<div class="flex flex-col">
							<span class="flex items-center gap-2">
								<span class="truncate max-w-45 overflow-hidden whitespace-nowrap">
									{{ postAccount?.username }}
								</span>
								<span class="text-gray-400 shrink-0">
									{{ $t('components.chat.mobilePreview.commentOption.now') }}
								</span>
							</span>
							<span class="pb-2 wrap-break-word whitespace-pre-line w-55">
								{{ accountComment?.trim() || $t('components.chat.mobilePreview.commentOption.leaveComment') }}
							</span>
							<span class="opacity-50">{{ $t('components.chat.mobilePreview.commentOption.reply') }}</span>
						</div>
						<div class="px-5 text-lg opacity-75">
							<i class="fa-regular fa-heart" />
						</div>
					</div>
				</div>
			</slot>
			<slot />
		</div>
		<div class="absolute bottom-0 w-full p-4 space-y-5">
			<div class="flex items-center justify-around text-3xl">
				<span>❤️</span>
				<span>🙌</span>
				<span>🔥</span>
				<span>👏</span>
				<span>😢</span>
				<span>😍</span>
				<span>😮</span>
				<span>😂</span>
			</div>
			<div class="flex items-center gap-3">
				<ProfilePicture size="50" :src="postAccount?.profilePicture" />
				<div class="flex-1 relative">
					<input
						type="text"
						:placeholder="$t('components.chat.mobilePreview.commentOption.addCommentPlaceholder')"
						class="input input-sm w-full bg-zinc-900 border-zinc-700 rounded-full pr-20 py-5"
					/>
				</div>
			</div>
		</div>
	</div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import ShareIcon from '~/components/MobilePreviewComponents/ShareIcon.vue'
import ProfilePicture from '~/components//GlobalComponents/ProfilePicture.vue'

export default defineComponent({
	components: { ShareIcon, ProfilePicture },
	props: {
		config: {},
		postAccount: {},
		contactComment: {},
		accountComment: {
			type: String,
			default: '',
		},
		showAccountComment: {
			type: Boolean,
			default: false,
		},
	},
})
</script>

<style scoped></style>
