<template>
	<div>
		<div class="flex items-center justify-between px-2 pt-2">
			<div class="flex items-center gap-2">
				<ProfilePicture :src="profilePicture" size="40" />
				<span>{{ username }}</span>
			</div>
			<div class="flex items-center">
				<i class="fa fa-ellipsis text-lg" />
			</div>
		</div>
		<div>
			<slot name="post" />
			<div class="px-2">
				<div :class="iconsSize" class="flex items-center justify-between gap-2">
					<div class="flex items-center space-x-5">
						<i class="fa-regular fa-heart align-middle"></i>
						<i class="fa-regular fa-comment align-middle"></i>
						<ShareIcon />
					</div>
					<span> <i class="fa-regular fa-bookmark" /> </span>
				</div>
				<div class="line-clamp-2">
					<span>
						{{ username }}
					</span>
					<br />
				</div>
				<slot name="commentCount">
					<span class="opacity-50">{{ $t('components.chat.mobilePreview.postView.viewAllComments') }}</span>
				</slot>
				<br />
				<div class="my-1"></div>
				<!--				<span class="opacity-50">{{ $formatDate(postedAt ?? new Date(), $i18n.locale) }}</span>-->
			</div>
		</div>
	</div>
</template>
<script>
import ReelsIcon from '~/components/MobilePreviewComponents/ReelsIcon.vue'
import ShareIcon from '~/components/MobilePreviewComponents/ShareIcon.vue'
import ProfilePicture from '~/components/GlobalComponents/ProfilePicture.vue'

export default {
	components: { ProfilePicture, ShareIcon, ReelsIcon },
	props: {
		username: {
			type: String,
		},
		profilePicture: {
			type: String,
		},
		country: {
			type: String,
		},
		postedAt: {
			type: String,
		},
		iconsSize: {
			type: String,
			default: 'text-3xl',
		},
	},
}
</script>
