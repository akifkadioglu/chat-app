<template>
	<div class="flex-1 flex flex-col overflow-hidden">
		<div class="w-full dark:bg-black bg-white pt-5 z-1 p-3 border-b border-subtle">
			<div class="relative flex items-center w-full gap-3">
				<button>
					<i class="fa fa-chevron-left text-lg" />
				</button>
				<div class="absolute flex flex-col items-center justify-center w-full pointer-events-none">
					<div class="font-medium text-muted">{{ postAccount?.name }}</div>
					<div class="text-xl">{{ $t('components.chat.mobilePreview.postsScreen.posts') }}</div>
				</div>
			</div>
		</div>
		<div class="flex-1 overflow-y-auto">
			<!--Next Post-->
			<PostView
				v-if="postType === CommentOnPostType.NEXT_POST"
				:username="postAccount?.username"
				:profilePicture="postAccount?.profilePicture"
				:country="sessionStore.country"
				class=""
			>
				<template #post>
					<div class="flex items-center justify-center h-100 bg-muted my-2">
						<span>{{ $t('components.chat.mobilePreview.postsScreen.nextPost') }}</span>
					</div>
				</template>
			</PostView>
			<!--All Post-->
			<PostView
				v-if="postType === CommentOnPostType.ALL_POSTS"
				:username="postAccount?.username"
				:profilePicture="postAccount?.profilePicture"
				:country="sessionStore.country"
				class=""
			>
				<template #post>
					<div class="flex items-center justify-center h-100 bg-muted my-2">
						<span>{{ $t('components.chat.mobilePreview.postsScreen.allPost') }}</span>
					</div>
				</template>
			</PostView>
			<!--Selected Post-->
			<div v-if="postType === CommentOnPostType.SELECTED_POSTS" class="space-y-5">
				<PostView
					v-if="selectedPostImgs.length > 0"
					v-for="img in selectedPostImgs"
					:username="postAccount?.username"
					:profilePicture="postAccount?.profilePicture"
					:country="sessionStore.country"
				>
					<template #post>
						<img :src="img" class="w-full max-h-100 object-cover my-2" :alt="postAccount?.name" />
					</template>
				</PostView>
				<PostView
					v-else
					:username="postAccount?.username"
					:profilePicture="postAccount?.profilePicture"
					:country="sessionStore.country"
				>
					<template #post>
						<div class="flex items-center justify-center h-100 bg-muted my-2">
							<span>{{ $t('components.chat.mobilePreview.postsScreen.selectPostsError') }}</span>
						</div>
					</template>
				</PostView>
			</div>
			<div v-if="!postType" class="h-full" />
		</div>
		<div
			class="w-full dark:bg-black bg-white border-t border-subtle flex items-center justify-around py-5 text-3xl"
		>
			<HomeIcon />
			<SearchIcon />
			<AddContentIcon />
			<ReelsIcon />
			<ProfileIcon />
		</div>
	</div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import IsVerifiedImg from '~/components/GlobalComponents/isVerifiedImg.vue'
import ReelsIcon from '~/components/MobilePreviewComponents/ReelsIcon.vue'
import ShareIcon from '~/components/MobilePreviewComponents/ShareIcon.vue'
import { CommentOnPostType } from '~/models/Flow/utils/utils'
import PostView from '~/components/Chat/MobilePreview/PostView.vue'
import AddContentIcon from '~/components/MobilePreviewComponents/AddContentIcon.vue'
import HomeIcon from '~/components/MobilePreviewComponents/HomeIcon.vue'
import ProfileIcon from '~/components/MobilePreviewComponents/ProfileIcon.vue'
import SearchIcon from '~/components/MobilePreviewComponents/SearchIcon.vue'

export default defineComponent({
	name: 'PostScreen',
	computed: {
		CommentOnPostType() {
			return CommentOnPostType
		},
	},
	components: { SearchIcon, ProfileIcon, HomeIcon, AddContentIcon, PostView, ShareIcon, ReelsIcon, IsVerifiedImg },
	props: {
		postAccount: {},
		selectedPostImgs: {
			default: () => [],
		},
		postType: {},
	},
	setup() {
		return {
			sessionStore: useSessionStore(),
		}
	},
})
</script>
<style scoped></style>
