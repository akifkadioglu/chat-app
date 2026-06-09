<template>
	<div
		@click="$emit('highlightPostId', comment.post.id, comment.contactId)"
		v-double-tap="() => $emitter.emit('openLeadingDrawer')"
		class="transition-colors border-l-4 border-subtle comment-preview"
		:class="[
			isReply ? 'px-3' : 'px-4',
			{
				'border-info! bg-info/5': !comment.isConfirmed && !comment.isEcho && comment.status !== 3,
				'border-error! bg-error/5': comment.status === 3,
			},
		]"
	>
		<div class="flex gap-3 py-3" :class="{ 'opacity-50': comment.isHidden }" @mouseleave="handleLeave">
			<!-- Comment İçeriği -->
			<div class="flex-1 min-w-0">
				<!-- Üst: Kullanıcı Bilgileri -->
				<div class="flex items-start justify-between mb-2">
					<div class="flex flex-col">
						<div class="flex items-start gap-2">
							<div class="cursor-pointer" @click.stop="$emit('selectContactId', comment.contact.id)">
								<ProfilePicture
									v-if="comment.isEcho"
									:src="comment.post?.chatAccount?.postAccount?.profilePicture"
									:alt="comment.post?.chatAccount?.postAccount?.username"
									:size="isReply ? 16 : 24"
								/>
								<ProfilePicture
									v-else
									:src="usingContact?.platformAccountsInstagram?.profileImageUrl"
									:alt="comment.authorUsername"
									:size="isReply ? 16 : 24"
								/>
							</div>
							<div>
								<h4
									class="font-username text-base-content text-xs cursor-pointer"
									@click.stop="$emit('selectContactId', comment.contact.id)"
								>
									{{ comment.authorUsername }}
									<IsVerifiedImg v-if="usingContact?.platformAccountsInstagram?.isVerified" />

									<!--									<i-->
									<!--										v-if="usingContact?.platformAccountsInstagram?.isVerified"-->
									<!--										class="fa fa-check-circle text-blue-500 text-xs"-->
									<!--									/>-->
								</h4>
								<div v-if="usingContact?.platformAccountsInstagram" class="flex items-center gap-2 mt-1">
									<span class="text-xs text-subtle">
										{{
											$t('components.comments.postList.followersText', {
												followersCount: $formatSocialCount(usingContact.platformAccountsInstagram.followersCount || 0),
											}).trim()
										}}
									</span>
								</div>
							</div>
							<span class="text-xs text-base-content/50">
								{{ $formatTimeAgo(comment.publishedAt ?? comment.createdAt, $i18n.locale) }}
							</span>
							<span v-if="comment.status === 1" class="text-xs text-info flex items-center gap-1">
								<i class="fa fa-circle-notch fa-spin" />
								{{ $t('components.comments.commentPreview.sending') }}
							</span>
							<span v-else-if="comment.status === 3" class="text-xs text-error flex items-center gap-1">
								<i class="fa fa-circle-exclamation" />
								{{ $t('components.comments.commentPreview.failed') }}
							</span>
						</div>
					</div>
				</div>

				<!-- Comment Metni - Alıntı Stili -->
				<div ref="commentTextArea" class="flex flex-wrap lg:flex-nowrap my-2 gap-2">
					<div class="flex min-w-0 gap-2">
						<!-- Sentiment Score -->
						<div v-if="!comment.isEcho" class="flex-shrink flex flex-col items-center text-center !w-6">
							<template v-if="comment.analysis">
								<div class="text-lg" v-tooltip.left="$t('components.comments.commentPreview.sentimentScore')">
									<i
										:class="{
											'fa fa-smile text-success': comment.analysis.label === 'positive',
											'fa fa-frown text-error': comment.analysis.label === 'negative',
											'fa fa-meh text-subtle': comment.analysis.label === 'neutral',
										}"
									></i>
								</div>
								<div class="text-xs text-muted font-semibold">
									<span>{{ Math.round(comment.analysis.score * 100) }}%</span>
								</div>
							</template>
							<template v-else>
								<a
									href="javascript:"
									class="underline link-info opacity-50 pt-2"
									@click="analyzeComment"
									v-tooltip.left="$t('components.comments.commentPreview.analyzeComment')"
								>
									<loading-element :is-loading="analyzeLoading" size="16">
										<i class="fa fa-magnifying-glass-chart" />
									</loading-element>
								</a>
							</template>
						</div>

						<!-- Comment Balloon + Hide Link -->
						<div class="flex min-w-0" @mouseenter="handleShowActions">
							<div
								class="min-w-2 bg-secondary flex justify-center items-center text-white text-xs"
								:class="{
									'!bg-success': comment.analysis?.label === 'positive',
									'!bg-error': comment.analysis?.label === 'negative',
								}"
							>
								<i v-if="comment.analysis?.hasQuestion" class="fa fa-question" />
							</div>
							<blockquote
								class="pl-2 pr-12 py-2 italic text-sm rounded-r-lg bg-subtle relative min-w-0"
								:class="{
									'!rounded-b-none': comment.analysis?.hasQuestion,
									'!bg-success/10': comment.analysis?.label === 'positive',
									'!bg-error/10': comment.analysis?.label === 'negative',
								}"
							>
								<div v-if="comment.analysis?.intents?.length > 0" class="mb-1 -mt-1">
									<span
										v-for="(intent, index) in comment.analysis.intents"
										:key="index"
										class="badge badge-xs mr-1 opacity-60"
									>
										{{ $t(`models.comments.intents.${intent.name}`) }}
									</span>
								</div>
								<div class="break-words">
									{{ comment.text }}
								</div>

								<span v-if="comment.analysis?.language" class="absolute bottom-1 right-2 text-xs opacity-20">
									<i class="fa fa-language" />
									<span class="font-bold">{{ comment.analysis?.language }}</span>
								</span>
							</blockquote>
						</div>
					</div>
					<!--					Bir satır boşluk olsun-->
					<div class="flex flex-1 lg:hidden"></div>
					<!--					Bir satır boşluk olsun-->
					<!-- Actions -->
					<!-- Actionların size'ı buradaki min-w-36'dan geliyor if ile kayboldukları için w-fit diyemiyorum o yüzden min-w-36 kullanıyorum -->
					<div v-if="comment.hash" class="flex flex-none md:min-w-38">
						<transition
							name="fade"
							enter-active-class="transition-opacity duration-100"
							leave-active-class="transition-opacity duration-300"
						>
							<div
								class="flex items-center gap-4 my-auto"
								v-if="
									showActions ||
									hideLoading ||
									uiState.showReplyForm ||
									confirmLoading ||
									shareDropdownOpen ||
									triggerFlowDropdownOpen ||
									actionJustCompleted
								"
							>
								<a
									href="javascript:"
									class="text-sm link link-secondary"
									@click.prevent.stop="comment.isHidden ? unhideComment() : hideComment()"
									v-tooltip="
										comment.isHidden
											? $t('components.comments.commentPreview.show')
											: $t('components.comments.commentPreview.hide')
									"
								>
									<loading-element :is-loading="hideLoading" size="12">
										<i v-if="comment.isHidden" class="fa fa-eye" />
										<i v-else class="fa fa-eye-slash" />
									</loading-element>
								</a>
								<a
									href="javascript:"
									class="text-sm link link-info"
									@click.prevent.stop="toggleReplyForm"
									v-tooltip="$t('components.comments.commentPreview.reply')"
								>
									<i class="fa fa-reply" />
								</a>
								<a
									v-if="!comment.isEcho"
									href="javascript:"
									class="text-sm link"
									:class="comment.isConfirmed ? 'link-warning' : 'link-success'"
									@click.prevent.stop="comment.isConfirmed ? unconfirmComment() : confirmComment()"
									v-tooltip="
										comment.isConfirmed
											? $t('components.comments.commentPreview.unconfirm')
											: $t('components.comments.commentPreview.confirm')
									"
								>
									<loading-element :is-loading="confirmLoading" size="12">
										<svg
											v-if="comment.isConfirmed"
											width="1rem"
											height="1rem"
											viewBox="0 0 13 13"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
										>
											<rect x="0.5" y="2.5625" width="9.9375" height="9.9375" rx="2" stroke="currentColor" />
											<circle cx="10.5" cy="2.5" r="2.5" fill="currentColor" />
										</svg>
										<i v-else class="fa fa-check-double" />
									</loading-element>
								</a>

								<ShareDropdown
									:url="commentPreviewLink"
									:download-filename="$t('components.comments.commentPreview.shareDropdown.downloadFilename')"
									:title="$t('components.comments.commentPreview.shareDropdown.title')"
									@show="shareDropdownOpen = true"
									@hide="shareDropdownOpen = false"
								>
									<!--									v-tooltip="$t('components.comments.commentPreview.share')"-->
									<a href="javascript:" class="text-sm link link-accent" @click.stop>
										<i class="fa-solid fa-share-from-square cursor-pointer" />
									</a>
								</ShareDropdown>
								<TriggerSingleFlow
									v-if="comment.contactId"
									:contactId="comment.contactId?.toString()"
									:commentId="comment.id?.toString()"
									@show="triggerFlowDropdownOpen = true"
									@hide="triggerFlowDropdownOpen = false"
								>
									<template #triggerButton>
										<a
											href="javascript:"
											class="text-sm link link-primary"
											v-tooltip="$t('components.comments.commentPreview.runFlow')"
											@click.stop
										>
											<i class="fa fa-paper-plane cursor-pointer" />
										</a>
									</template>
								</TriggerSingleFlow>

								<!--							<a href="javascript:" class="text-xs link" @click="share">-->
								<!--								<i class="fa fa-share fa-sm" />-->
								<!--								<span>{{ $t('components.comments.commentPreview.share') }}</span>-->
								<!--							</a>-->
							</div>
						</transition>
					</div>
				</div>
				<!-- Reply Form Collapse -->
				<div v-auto-animate>
					<ReplyComment
						v-if="uiState.showReplyForm"
						class="mt-2"
						:comment="comment"
						@cancel="uiState.showReplyForm = false"
						@success="onReplySuccess"
					/>
				</div>

				<!-- Reply Collapse -->
				<div v-if="comment.replies?.length > 0">
					<Collapse
						@click.stop
						ref="repliesCollapse"
						:open="uiState.repliesOpen"
						:show-arrow="false"
						content-class="!mb-0 !pb-0"
						title-class="px-0 py-0 text-xs link"
						@open="uiState.repliesOpen = true"
						@close="uiState.repliesOpen = false"
					>
						<template #title>
							<i class="fa fa-reply" />
							<span>{{ comment.replies.length }} {{ $t('components.comments.commentPreview.replies') }}</span>
						</template>
						<div class="flex flex-col gap-1 mb-5" v-auto-animate>
							<CommentPreview
								v-for="reply in comment.replies"
								:key="reply.id"
								:comment="reply"
								:isReply="true"
								class="-ml-1 border-l border-base-300"
							/>
						</div>
					</Collapse>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import apiList from '~/apis/ApiList.js'
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import Collapse from '~/components/GlobalComponents/Collapse.vue'
import ReplyComment from '~/components/Moderate/ReplyComment.vue'
import CopyToClipboard from '~/components/GlobalComponents/Elements/CopyToClipboard.vue'
import ShareDropdown from '~/components/GlobalComponents/ShareDropdown.vue'
import { PostComment } from '~/models/Post/PostComment.js'
import { Contact } from '~/models/Contact/Contact.ts'
import IsVerifiedImg from '~/components/GlobalComponents/isVerifiedImg.vue'
import TriggerSingleFlow from '~/components/Flow/TriggerSingleFlow/TriggerSingleFlow.vue'
import ProfilePicture from '~/components/GlobalComponents/ProfilePicture.vue'

export default {
	components: {
		ProfilePicture,
		TriggerSingleFlow,
		IsVerifiedImg,
		CopyToClipboard,
		ShareDropdown,
		LoadingElement,
		Collapse,
		ReplyComment,
	},
	props: {
		comment: {
			required: true,
			type: PostComment,
		},
		contact: {
			required: false,
			type: Contact,
			default: null,
		},
		isReply: {
			type: Boolean,
			default: false,
		},
		uiState: {
			type: Object,
			default: () => ({ repliesOpen: false, showReplyForm: false }),
		},
	},
	emit: ['selectContactId', 'highlightPostId'],
	data() {
		return {
			showActions: false,
			cursorOverActions: false,
			hideLoading: false,
			analyzeLoading: false,
			confirmLoading: false,
			shareDropdownOpen: false,
			triggerFlowDropdownOpen: false,
			actionJustCompleted: false,
		}
	},
	mounted() {
		// İlk yüklemede ekran boyutunu kontrol et
		if (!this.largerThan.lg.value) {
			this.showActions = true
		}
	},
	setup() {
		const { largerThan } = useWindowSize()

		return {
			localeRoute: useLocaleRoute(),
			commentsStore: useCommentsStore(),
			largerThan,
		}
	},
	computed: {
		usingContact() {
			return this.contact ?? this.comment.contact
		},
		commentPreviewLink() {
			const localizedPath = this.localeRoute({
				name: 'preview-comment-hash',
				params: { hash: this.comment.hash },
			}).fullPath
			return `${window.location.origin}${localizedPath}`
		},
	},
	watch: {
		'largerThan.lg.value'(val) {
			if (val) {
				this.showActions = false
				return
			}
			this.showActions = true
		},
	},
	methods: {
		async share() {
			const shareData = {
				title: this.$t('components.comments.commentPreview.shareTitle'),
				// text: this.comment.text,
				url: this.commentPreviewLink,
			}
			if (navigator.share) {
				await navigator.share(shareData)
			}
		},
		hideComment() {
			if (!this.comment.post.chatAccount.subscribed) {
				this.$emitter.emit('showUpgradeModal', {
					chatAccount: this.comment.post.chatAccount,
					feature: 'hideComment',
				})
				return
			}

			if (this.hideLoading) return
			this.hideLoading = true
			consoleLog('Hiding comment', this.comment.post.chatAccountId, this.comment.id)
			this.$requestAdapter
				.post(
					apiList.chat.comments.chatAccountId.comments.id.hide,
					{},
					{
						id: this.comment.id,
						chatAccountId: this.comment.post.chatAccountId,
					},
				)
				.then((res) => {
					this.comment.isHidden = true
				})
				.catch(() => {})
				.finally(() => {
					this.hideLoading = false
					this.actionCompleted()
				})
		},
		unhideComment() {
			if (!this.comment.post.chatAccount.subscribed) {
				this.$emitter.emit('showUpgradeModal', {
					chatAccount: this.comment.post.chatAccount,
					feature: 'unhideComment',
				})
				return
			}

			if (this.hideLoading) return
			this.hideLoading = true
			this.$requestAdapter
				.post(
					apiList.chat.comments.chatAccountId.comments.id.unhide,
					{},
					{
						id: this.comment.id,
						chatAccountId: this.comment.post.chatAccountId,
					},
				)
				.then((res) => {
					this.comment.isHidden = false
				})
				.catch(() => {})
				.finally(() => {
					this.hideLoading = false
					this.actionCompleted()
				})
		},
		analyzeComment() {
			if (!this.comment.post.chatAccount.subscribed) {
				this.$emitter.emit('showUpgradeModal', {
					chatAccount: this.comment.post.chatAccount,
					feature: 'analyzeComment',
				})
				return
			}

			if (this.analyzeLoading) return
			this.analyzeLoading = true
			this.$requestAdapter
				.post(
					apiList.chat.comments.chatAccountId.comments.id.analyze,
					{},
					{
						id: this.comment.id,
						chatAccountId: this.comment.post.chatAccountId,
					},
				)
				.then((res) => {
					consoleLog('Analysis result:', res.data)
					this.comment.analysis = res.data.analysis
				})
				.catch(() => {})
				.finally(() => {
					this.analyzeLoading = false
				})
		},
		confirmComment() {
			if (this.confirmLoading) return
			this.confirmLoading = true
			this.$requestAdapter
				.post(
					apiList.chat.comments.confirm,
					{
						chatAccountId: this.comment.post.chatAccountId,
						postId: this.comment.post.id,
						commentId: this.comment.id,
					},
					{
						chatAccountId: this.comment.post.chatAccountId,
					},
				)
				.then((res) => {
					this.comment.confirmedAt = Date.now()
					this.comment.isConfirmed = true
					this.commentsStore.sortComments()
				})
				.catch(() => {})
				.finally(() => {
					this.confirmLoading = false
					this.actionCompleted()
				})
		},
		unconfirmComment() {
			if (this.confirmLoading) return
			this.confirmLoading = true
			this.$requestAdapter
				.post(
					apiList.chat.comments.unconfirm,
					{
						chatAccountId: this.comment.post.chatAccountId,
						postId: this.comment.post.id,
						commentId: this.comment.id,
					},
					{
						chatAccountId: this.comment.post.chatAccountId,
					},
				)
				.then((res) => {
					this.comment.confirmedAt = null
					this.comment.confirmedByUserId = null
					this.comment.isConfirmed = false
					this.commentsStore.sortComments()
				})
				.catch(() => {})
				.finally(() => {
					this.confirmLoading = false
					this.actionCompleted()
				})
		},
		toggleReplyForm() {
			this.uiState.showReplyForm = !this.uiState.showReplyForm
		},
		onReplySuccess(replyData) {
			consoleLog('Reply sent successfully:', replyData)
			this.uiState.showReplyForm = false
			this.$nextTick(() => {
				this.$refs?.repliesCollapse?.showCollapse()
			})
		},
		handleShowActions() {
			this.cursorOverActions = true
			if (this.showActions) return
			this.showActions = true
			this.$nextTick(() => {
				this.$refs.commentTextArea.scrollTo({
					left: this.$refs.commentTextArea.scrollWidth,
					behavior: 'smooth',
				})
			})
		},
		handleLeave() {
			if (!this.largerThan.lg.value) return
			this.cursorOverActions = false
			setTimeout(() => {
				if (!this.cursorOverActions) this.showActions = false
			}, 500)
		},
		actionCompleted() {
			this.actionJustCompleted = true
			setTimeout(() => {
				this.actionJustCompleted = false
			}, 1000)
		},
	},
}
</script>
