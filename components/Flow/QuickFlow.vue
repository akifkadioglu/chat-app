<template>
	<div v-if="quickTypeKey" class="w-full">
		<!--		Errors -->
		<div v-auto-animate>
			<div v-if="validationErrors.length" class="flex flex-col gap-2 mb-4" v-auto-animate>
				<div v-for="(error, i) in validationErrors" :key="i" class="flex flex-col gap-1">
					<div class="alert alert-error alert-soft">
						<i class="fa-solid fa-circle-exclamation"></i>
						<span>{{ error.message }}</span>
					</div>
				</div>
			</div>
		</div>
		<SendDmFromComment v-if="quickTypeKey.key === QUICK_TYPES.sendDmFromComments.key" />
		<ReplyGiveawayEntries v-if="quickTypeKey.key === QUICK_TYPES.replyGiveawayEntries.key" />
		<StoryMentionReply v-else-if="quickTypeKey.key === QUICK_TYPES.storyMentionReply.key" />
		<GrowFollowersFromComments v-else-if="quickTypeKey.key === QUICK_TYPES.growFollowersFromComments.key" />
		<ReplyToStory v-else-if="quickTypeKey.key === QUICK_TYPES.replyToStory.key" />
		<ReplyToDm v-else-if="quickTypeKey.key === QUICK_TYPES.replyToDm.key" />
		<TurnCommentsIntoSales v-else-if="quickTypeKey.key === QUICK_TYPES.turnCommentsIntoSales.key" />
		<RunGiveaway v-else-if="quickTypeKey.key === QUICK_TYPES.runGiveaway.key" />
		<PositiveCommentReply v-else-if="quickTypeKey.key === QUICK_TYPES.positiveCommentReply.key" />
		<QuestionCommentReply v-else-if="quickTypeKey.key === QUICK_TYPES.questionCommentReply.key" />
		<HideCommentNegative v-else-if="quickTypeKey.key === QUICK_TYPES.hideCommentNegative.key" />
		<Quiz v-else-if="quickTypeKey.key === QUICK_TYPES.quiz.key" />
	</div>
</template>

<script>
import GrowFollowersFromComments from '~/components/Flow/Quick/GrowFollowersFromComments.vue'
import TurnCommentsIntoSales from '~/components/Flow/Quick/TurnCommentsIntoSales.vue'
import StoryMentionReply from '~/components/Flow/Quick/StoryMentionReply.vue'
import ReplyToStory from '~/components/Flow/Quick/ReplyToStory.vue'
import SendDmFromComment from '~/components/Flow/Quick/SendDMFromComment.vue'
import { QUICK_TYPES } from '~/models/Flow/utils/quick.ts'
import LazyLoadComponent from '~/components/GlobalComponents/LazyLoadComponent.vue'
import RunGiveaway from '~/components/Flow/Quick/RunGiveaway.vue'
import PositiveCommentReply from '~/components/Flow/Quick/PositiveCommentReply.vue'
import HideCommentNegative from '~/components/Flow/Quick/HideCommentNegative.vue'
import QuestionCommentReply from '~/components/Flow/Quick/QuestionCommentReply.vue'
import Quiz from '~/components/Flow/Quick/Quiz.vue'
import ReplyGiveawayEntries from '~/components/Flow/Quick/ReplyGiveawayEntries.vue'
import ReplyToDm from '~/components/Flow/Quick/ReplyToDm.vue'

export default {
	components: {
		ReplyToDm,
		ReplyGiveawayEntries,
		Quiz,
		QuestionCommentReply,
		HideCommentNegative,
		PositiveCommentReply,
		RunGiveaway,
		LazyLoadComponent,
		SendDmFromComment,
		ReplyToStory,
		StoryMentionReply,
		TurnCommentsIntoSales,
		GrowFollowersFromComments,
	},
	setup() {
		return {
			flowStore: useFlowStore(),
			localePath: useLocalePath(),
		}
	},
	computed: {
		validationErrors() {
			return Object.values(this.flowStore.flow?.validationErrors)
				.filter((err) => err?.length > 0)
				.flat()
		},
	},
	data() {
		return {
			QUICK_TYPES,
			quickTypeKey: Object.values(QUICK_TYPES).find((q) => q.key === useFlowStore().flow?.quickTypeKey) ?? {},
		}
	},
	mounted() {
		if (!this.quickTypeKey.key) {
			throw createError({
				statusCode: 404,
				statusMessage: 'Page Not Found',
				fatal: true,
			})
		}
		if (!this.$route.params.type) {
			return
		}
		if (this.$route.params.type !== this.quickTypeKey.path) {
			this.$router.push(
				this.localePath({
					name: 'flow-type-id',
					params: {
						type: this.quickTypeKey.path,
						id: this.$route.params.id,
					},
				}),
			)
		}
	},
}
</script>
