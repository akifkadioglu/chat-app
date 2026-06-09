<template>
	<AppLayout
		content-header-height="!h-16"
		sidebarTrailingWidthClasses="w-4/5 md:w-86 lg:w-108 border-r border-subtle"
		hideFooter
	>
		<template #sidebarTrailing>
			<PostList ref="postList" />
		</template>
		<template #contentHeader>
			<PostHeader :post="activePost" />
		</template>

		<div class="h-full w-full">
			<CommentList :key="currentScopeKey" @highlightPostId="highlightPostId" @selectContactId="selectContactId" />
		</div>

		<template #trailingContent>
			<State
				:is-empty="!selectedContactId"
				:empty-title="$t('pages.app.comments.emptyState.title')"
				:empty-content="$t('pages.app.comments.emptyState.content')"
			>
				<ContactInfoContent
					:contactId="selectedContactId"
					:key="selectedContactId"
					:chatAccountId="getChatAccountIdByContactId(selectedContactId)"
					@selectContactId="selectContactId"
				/>
			</State>
		</template>
	</AppLayout>
</template>

<script>
import AppLayout from '~/components/AppLayout.vue'
import PostList from '~/components/Moderate/PostList.vue'
import PostHeader from '~/components/Moderate/PostHeader.vue'
import CommentList from '~/components/Moderate/CommentList.vue'
import State from '~/components/GlobalComponents/State.vue'
import ContactInfoContent from '~/components/Chat/ContactInfo/ContactInfoContent.vue'
import StateElement from '~/components/GlobalComponents/StateElement.vue'

export default {
	setup() {
		definePageMeta({
			layout: 'app',
			middleware: ['auth-custom'],
		})

		return {
			commentsStore: useCommentsStore(),
			contactsStore: useContactsStore(),
		}
	},
	components: {
		StateElement,
		ContactInfoContent,
		State,
		AppLayout,
		PostList,
		PostHeader,
		CommentList,
	},
	computed: {
		activePost() {
			return this.commentsStore.activePost
		},
		currentScopeKey() {
			return this.commentsStore.currentCommentScopeKey
		},
	},
	data() {
		return {
			selectedContactId: null,
		}
	},
	mounted() {
		this.$emitter.on('selectPost', this.selectPost)
	},
	methods: {
		highlightPostId(postId, contactId) {
			this.$refs.postList.scrollToPostAndHighlight(postId)
			this.selectedContactId = contactId

			// debounce((postId) => {
			// }, 50)(postId)
		},
		selectPost(post) {
			this.commentsStore.setActive(post?.id ?? null)
		},
		selectContactId(contactId) {
			this.selectedContactId = contactId
			this.$emitter.emit('openTrailingDrawer', contactId)
		},
		getChatAccountIdByContactId(contactId) {
			return this.contactsStore.getContactById(contactId).chatAccountId
		},
	},
}
</script>
