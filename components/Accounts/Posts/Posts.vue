<template>
	<div class="flex gap-5 p-4" :class="$attrs.class">
		<div
			v-for="post in userPosts"
			:key="post.id"
			:class="postWidth"
			class="card rounded-lg bg-base-100 border border-base-300 overflow-hidden group"
		>
			<figure class="relative bg-linear-to-b from-black to-transparent">
				<!-- group-hover:scale-110 transition-all duration-300 -->
				<img
					class="w-full h-64 object-cover mask-b-from-80% mask-t-from-80%"
					:src="post.thumbnail_url ?? post.media_url"
					:alt="post.caption"
				/>
				<div class="absolute top-2 px-2 flex items-center justify-between w-full gap-2">
					<div class="flex items-center">
						<ProfilePicture
							ring="ring-2"
							:ringColor="chatAccountById(post.chat_account_id)?.ringColor"
							:src="chatAccountById(post.chat_account_id)?.postAccount?.profilePicture"
							size="20"
						/>
						<div class="w-1/2 truncate text-white text-xs ml-2 mr-1">
							{{ chatAccountById(post.chat_account_id)?.postAccount?.username }}
						</div>
						<IsVerifiedImg v-if="chatAccountById(post.chat_account_id)?.postAccount?.is_verified" />
					</div>

					<MediaTypeBadge :mediaType="post.media_type" :mediaProductType="post.media_product_type" />
				</div>
			</figure>
			<div
				class="card-body rounded-b-lg pb-3 gap-3 -mt-24 group-hover:-mt-26 group-hover:pt-7 group-hover:pb-4 z-1 bg-base-100/85 backdrop-blur-sm rounded-t-3xl h-fit transition-all duration-300"
			>
				<div class="flex items-center gap-3 text-xs text-muted">
					<span class="flex items-center gap-1">
						<i class="fa fa-heart" />
						{{ post.like_count }}
					</span>
					<span class="flex items-center gap-1">
						<i class="fa fa-comment" />
						{{ post.comments_count }}
					</span>
				</div>
				<div class="flex items-center justify-between text-xs text-muted">
					{{ dayjs(post.posted_at).locale($i18n.locale).format('DD MMM YYYY HH:mm') }}
				</div>
				<CreateFlowButton
					v-if="!post.flows || post.flows.length === 0"
					buttonClass="btn btn-primary mt-auto btn-transition"
					iconClass="fa fa-paper-plane"
					:title="$t('components.accounts.posts.action')"
					:params="{ categoryKey: commentsFlowCategoryKey, postId: post.id_on_api, postImg: post.media_url }"
					:queries="{ username: chatAccountPostAccountById(post.post_account_id)?.postAccount?.username }"
				/>
				<!--				<LocalizedLink-->
				<!--					v-if="!post.flows || post.flows.length === 0"-->
				<!--					name="flow-type-id"-->
				<!--					:params="{ type: QUICK_TYPES.sendDmFromComments.path, id: 'new' }"-->
				<!--					:query="{ postId: post.id_on_api, postImg: post.media_url }"-->
				<!--					class="btn btn-primary mt-auto btn-transition"-->
				<!--				>-->
				<!--					<i class="fa fa-paper-plane" />-->
				<!--					{{ $t('components.accounts.posts.action') }}-->
				<!--				</LocalizedLink>-->
				<div v-else class="space-y-1 mt-auto">
					<div v-for="flow in post.flows.slice(0, 3)" :key="flow.id" class="w-full">
						<LocalizedLink
							class="flex items-baseline"
							v-if="flow.route"
							target="_blank"
							:name="flow.route.name"
							:params="flow.route.params"
						>
							<u class="truncate">
								<span class="text-muted text-xs">#{{ flow.id }}</span>
								{{ flow.name }}
							</u>
							<i class="fa fa-external-link link-icon align-baseline text-xs ml-1 shrink-0" />
						</LocalizedLink>
					</div>
					<LocalizedLink
						v-if="post.flows.length > 3"
						name="flows"
						:query="{ postIds: post.id }"
						class="link link-hover link-primary text-xs"
					>
						{{ $t('components.accounts.posts.viewAllFlows') }}
						<i class="fa fa-chevron-right link-icon" />
					</LocalizedLink>

					<div class="border border-t border-base-200 my-2" />

					<div class="">
						<CreateFlowButton
							buttonClass="btn btn-soft btn-primary btn-xs btn-wide"
							iconClass="fa fa-plus"
							:title="$t('components.accounts.posts.createAFlow')"
							:params="{ categoryKey: commentsFlowCategoryKey, postId: post.id_on_api, postImg: post.media_url }"
							:queries="{ username: post.username }"
						/>
					</div>
				</div>
			</div>
		</div>
		<slot name="last" />
	</div>
</template>
<script>
import Pagination from '~/components/GlobalComponents/Pagination.vue'
import PostPreview from '~/components/Moderate/PostPreview.vue'
import PostView from '~/components/Chat/MobilePreview/PostView.vue'
import { QUICK_TYPES, quickFlowCategories } from '~/models/Flow/utils/quick.ts'
import LocalizedLink from '~/components/GlobalComponents/LocalizedLink.vue'
import dayjs from 'dayjs'
import 'dayjs/locale/tr'
import 'dayjs/locale/en'
import CreateFlowButton from '~/components/Flow/CreateFlowButton.vue'
import ProfilePicture from '~/components/GlobalComponents/ProfilePicture.vue'
import IsVerifiedImg from '~/components/GlobalComponents/isVerifiedImg.vue'
import MediaTypeBadge from '~/components/GlobalComponents/MediaTypeBadge.vue'

export default {
	components: {
		MediaTypeBadge,
		IsVerifiedImg,
		ProfilePicture,
		CreateFlowButton,
		LocalizedLink,
		PostView,
		Pagination,
		PostPreview,
	},
	props: {
		posts: {
			type: Array,
			default: () => [],
		},
		maxPostLength: {
			type: Number,
			default: null,
		},
		postWidth: {
			type: String,
			default: 'w-72',
		},
	},
	data() {
		return {
			QUICK_TYPES,
		}
	},
	setup() {
		return {
			chatAccountsStore: useChatAccountsStore(),
		}
	},
	computed: {
		userPosts() {
			if (this.maxPostLength) {
				return this.posts.slice(0, this.maxPostLength)
			}
			return this.posts
		},
		//TODO :: çok doğru değil ama böyle yapmak bir şekilde referanslı olmam gerekirdi çünkü yarın bu kategoriyi değiştirsek bizi patlatmaması lazımdı
		commentsFlowCategoryKey() {
			return quickFlowCategories.find((c) => c.key === 'comments')?.key
		},
		chatAccountById() {
			return (id) => this.chatAccountsStore.byId(id)
		},
		chatAccountPostAccountById() {
			return (id) => this.chatAccountsStore.byPostAccountId(id)
		},
	},
	methods: {
		dayjs,
	},
}
</script>

<style scoped></style>
