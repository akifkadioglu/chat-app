<template>
	<div class="flex flex-col h-full">
		<div class="flex-1 overflow-y-auto">
			<!--			<div v-for="comment in comments" class="p-2" v-auto-animate>-->
			<DynamicScroller
				:key="currentScopeKey"
				:items="comments"
				:min-item-size="60"
				class="md:px-0 px-2 relative"
				key-field="id"
				ref="scroller"
			>
				<template #default="{ item, index, active }">
					<DynamicScrollerItem
						:key="item.id"
						:item="item"
						:active="active"
						:data-index="index"
						:size-dependencies="[
							getCommentUi(item.id).repliesOpen,
							getCommentUi(item.id).showReplyForm,
							item.replies?.length,
							item.isHidden,
							item.isConfirmed,
						]"
					>
						<CommentPreview
							:comment="item"
							:ui-state="getCommentUi(item.id)"
							@selectContactId="selectContactId"
							@highlightPostId="highlightPostId"
						/>
					</DynamicScrollerItem>
				</template>
				<template #after>
					<div class="text-center py-2">
						<Pagination
							:current-page="currentScopeSlice.currentPage"
							:has-more="currentScopeSlice.hasMore"
							:infinite-scroll="true"
							:loading="currentScopeSlice.loading"
							direction-top
							@page-change="fetchComments"
						/>
					</div>
				</template>
			</DynamicScroller>

			<!--				<CommentPreview :key="comment.id" :comment="comment" />-->
			<!--			</div>-->
			<!--			<div>-->
			<!--				<Pagination-->
			<!--					:current-page="currentScopeSlice.currentPage"-->
			<!--					:total-pages="currentScopeSlice.lastPage"-->
			<!--					:infinite-scroll="true"-->
			<!--					:loading="currentScopeSlice.loading"-->
			<!--					direction-top-->
			<!--					@page-change="fetchComments"-->
			<!--				/>-->
			<!--			</div>-->
		</div>

		<!-- Footer Actions -->
		<div v-if="comments.length > 0" class="border-t border-muted bg-base-100 p-4">
			<div class="flex flex-wrap items-center justify-between gap-2">
				<div class="flex items-center gap-2">
					<span class="text-sm text-muted"> {{ $t('components.comments.commentList.bulkActions') }}: </span>
				</div>
				<div class="flex items-center gap-2">
					<button
						class="btn btn-soft btn-success btn-sm btn-transition"
						@click="bulkConfirmComments"
						:disabled="bulkLoading || visibleComments.length === 0"
					>
						<loading-element :is-loading="bulkLoading" size="12">
							<i class="fa fa-check-double mr-1"></i>
						</loading-element>
						{{ $t('components.comments.commentList.confirmAll') }}
					</button>
					<button
						class="btn btn-soft btn-warning btn-sm btn-transition"
						@click="bulkUnconfirmComments"
						:disabled="bulkLoading || visibleComments.length === 0"
					>
						<loading-element :isLoading="bulkLoading" size="12">
							<svg width="1rem" height="1rem" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
								<rect x="0.5" y="2.5625" width="9.9375" height="9.9375" rx="2" stroke="currentColor" />
								<circle cx="10.5" cy="2.5" r="2.5" fill="currentColor" />
							</svg>
						</loading-element>

						{{ $t('components.comments.commentList.unconfirmAll') }}
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import CommentPreview from './CommentPreview.vue'
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import apiList from '~/apis/ApiList.js'
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import Pagination from '~/components/GlobalComponents/Pagination.vue'
import FilterMixin from '~/mixins/FilterMixin.js'

export default {
	name: 'CommentList',
	mixins: [FilterMixin],
	components: {
		Pagination,
		DynamicScrollerItem,
		DynamicScroller,
		CommentPreview,
		LoadingElement,
	},
	props: {},
	setup() {
		return {
			commentsStore: useCommentsStore(),
			chatAccountsStore: useChatAccountsStore(),
		}
	},
	data() {
		return {
			bulkLoading: false,
			commentUi: {},
		}
	},
	computed: {
		activePost() {
			return this.commentsStore.activePost
		},
		currentScopeKey() {
			return this.commentsStore.currentCommentScopeKey
		},
		currentScopeSlice() {
			return this.commentsStore.currentCommentScopeSlice
		},
		quickFilter() {
			return this.$route.query.status || 'all'
		},
		activeFilters() {
			return this.parseFiltersFromQuery(this.$route?.query || {})
		},
		routeFilters() {
			return {
				status: this.quickFilter,
				filters: this.activeFilters,
			}
		},
		comments() {
			let comments = this.commentsStore.commentsForScope(this.currentScopeKey)
			consoleLog('commentsStore.commentsForScope(this.currentScopeKey)', comments)
			return comments
		},
		visibleComments() {
			return this.comments.filter((comment) => !comment.isEcho)
		},
		activeChatAccount() {
			return this.chatAccountsStore.active
		},
	},
	mounted() {},
	watch: {
		routeFilters: {
			handler() {
				this.fetchComments(1)
			},
			deep: true,
		},
	},
	methods: {
		getCommentUi(id) {
			if (!this.commentUi[id]) this.commentUi[id] = { repliesOpen: false, showReplyForm: false }
			return this.commentUi[id]
		},
		selectContactId(id) {
			this.$emit('selectContactId', id)
		},
		highlightPostId(id, contactId) {
			this.$emit('highlightPostId', id, contactId)
		},

		fetchComments(page = 1) {
			this.commentsStore.fetchCommentsForScope(this.currentScopeKey, page, this.routeFilters)
		},
		bulkConfirmComments() {
			if (this.bulkLoading || this.visibleComments.length === 0) return

			// const commentIds = this.visibleComments.map((comment) => comment.id)
			this.bulkLoading = true

			this.$requestAdapter
				.post(apiList.chat.comments.confirm, {
					chatAccountId: this.activeChatAccount?.id,
					postId: this.activePost?.id,
				})
				.then((res) => {
					// Update all comments to confirmed state
					this.visibleComments.forEach((comment) => {
						comment.confirmedAt = Date.now()
						comment.isConfirmed = true
					})
					consoleLog('Bulk confirm successful:', res.data)
				})
				.catch((error) => {
					consoleLog('Bulk confirm failed:', error)
				})
				.finally(() => {
					this.commentsStore.sortComments()
					this.bulkLoading = false
				})
		},
		bulkUnconfirmComments() {
			if (this.bulkLoading || this.visibleComments.length === 0) return

			// const commentIds = this.visibleComments.map((comment) => comment.id)
			this.bulkLoading = true

			return this.$requestAdapter
				.post(apiList.chat.comments.unconfirm, {
					chatAccountId: this.activeChatAccount?.id,
					postId: this.activePost?.id,
				})
				.then((res) => {
					// Update all comments to unconfirmed state
					this.visibleComments.forEach((comment) => {
						comment.confirmedAt = null
						comment.isConfirmed = false
					})
					consoleLog('Bulk unconfirm successful:', res.data)
				})
				.catch((error) => {
					consoleLog('Bulk unconfirm failed:', error)
				})
				.finally(() => {
					this.bulkLoading = false
					this.commentsStore.sortComments()
				})
		},
	},
}
</script>
