<template>
	<div class="flex gap-2 py-3 w-full flex-col sm:flex-row truncate">
		<!-- Sol: Post Media -->
		<div class="flex-1 md:flex-none">
			<div class="flex sm:hidden justify-end gap-2 mb-2">
				<span class="text-xs text-muted">
					{{ $formatDateTime(post?.postedAt ?? post?.createdAt, $i18n.locale) }}
				</span>
			</div>
			<div
				v-if="post.mediaUrl"
				class="size-20 md:size-24 bg-base-200 rounded-lg overflow-hidden relative mx-auto sm:ml-0"
			>
				<img v-img-error :src="post.mediaUrl" :alt="post.caption || 'Post image'" class="w-full h-full object-cover" />
				<!-- Media Type Overlay -->
				<div class="absolute top-1 right-1">
					<MediaTypeBadge :mediaType="post.mediaType" :mediaProductType="post.mediaProductType" />
				</div>
			</div>
			<div
				v-else
				class="w-24 h-24 bg-linear-to-br from-base-200 to-base-300 rounded-lg flex items-center justify-center"
			>
				<div class="text-center text-base-content/40">
					<i class="fa fa-image text-lg"></i>
				</div>
			</div>
		</div>

		<!-- Sağ: İçerik -->
		<div class="flex-1 truncate">
			<!-- Üst: Profil Bilgileri -->
			<div class="flex flex-col justify-between mb-2">
				<div class="md:flex justify-end gap-2 hidden mb-2">
					<span class="text-xs text-muted">{{ $formatDateTime(post?.postedAt ?? post?.createdAt, $i18n.locale) }}</span>
				</div>
				<div class="flex items-center gap-2">
					<div class="relative p-[2px]">
						<div
							:class="`ring-2 ${post.chatAccount?.ringColor || 'ring-base-300'} ring-opacity-60`"
							class="rounded-full"
						>
							<ProfilePicture
								:alt="post.chatAccount?.postAccount?.username || 'User'"
								:src="post.chatAccount?.postAccount?.profilePicture"
								:size="26"
							/>
						</div>
					</div>
					<div class="min-w-0">
						<p class="text-xs text-muted font-username truncate">
							{{ post.chatAccount?.postAccount?.username || 'unknown' }}
							<IsVerifiedImg v-if="post.chatAccount?.postAccount?.isVerified" class="text-xs" />
							<!--							<i v-if="post.chatAccount?.postAccount?.isVerified" class="fa fa-check-circle text-blue-500 text-xs"></i>-->
						</p>
					</div>
				</div>
			</div>

			<!-- Orta: Caption -->
			<div class="mb-3 mt-2">
				<p v-if="post.caption" class="text-xs text-base-content text-wrap line-clamp-2">
					{{ post.caption }}
				</p>
				<p v-else class="text-xs text-base-content/40 italic">
					{{ $t('components.comments.postList.noCaption') }}
				</p>
			</div>

			<!-- Alt: İstatistikler ve Durumlar -->
			<div class="flex items-center justify-between">
				<!-- Sol: Post Stats -->
				<div class="flex items-center gap-3 text-sm text-base-content/70">
					<!--					<span class="flex items-center gap-1">-->
					<!--						<i class="fa fa-heart text-red-500"></i>-->
					<!--						<span class="font-medium">{{ formatNumber(post.likeCount || 0) }}</span>-->
					<!--					</span>-->
					<span class="flex items-center gap-1 text-muted text-sm">
						<i class="fa fa-comment"></i>
						<span>{{ $formatSocialCount(post.commentsCount || 0, $i18n.locale) }}</span>
					</span>
				</div>

				<!-- Sağ: Comment Status -->
				<div class="flex items-center gap-2">
					<!--					<span-->
					<!--						v-if="post.needsAttentionComments?.value?.length > 0"-->
					<!--						class="badge badge-error badge-sm"-->
					<!--						:title="$t('components.comments.postList.needsAttention')"-->
					<!--					>-->
					<!--						<i class="fa fa-exclamation-triangle mr-1"></i>-->
					<!--						{{ post.needsAttentionComments.value.length }} {{ $t('components.comments.postList.needsAttention') }}-->
					<!--					</span>-->
					<!--					<span-->
					<!--						v-else-if="post.comments?.value?.length > 0"-->
					<!--						class="badge badge-warning badge-sm"-->
					<!--						:title="$t('components.comments.postList.totalComments')"-->
					<!--					>-->
					<!--						{{ post.comments.value.length }} {{ $t('components.comments.postList.totalComments') }}-->
					<!--					</span>-->
					<!--					<span v-else class="badge badge-ghost badge-sm"> 0 </span>-->
				</div>
			</div>
		</div>
	</div>
</template>
<script>
import ProfilePicture from '~/components/GlobalComponents/ProfilePicture.vue'
import MediaTypeBadge from '~/components/GlobalComponents/MediaTypeBadge.vue'

import { Post } from '~/models/Post/Post.js'
import IsVerifiedImg from '~/components/GlobalComponents/isVerifiedImg.vue'

export default {
	name: 'PostPreview',
	components: { IsVerifiedImg, ProfilePicture, MediaTypeBadge },
	props: {
		post: {
			type: Post,
			required: true,
		},
	},
}
</script>
