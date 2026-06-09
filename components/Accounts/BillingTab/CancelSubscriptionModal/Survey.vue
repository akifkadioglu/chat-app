<template>
	<div class="space-y-5">
		<div class="flex flex-col items-center pt-8 px-4">
			<LazyLoadImage src="/images/accounts/plan-billing-tab/survey.png" alt="survey-image" class-name="mb-6 w-36" />
			<h4 id="cancelSubscriptionModalTitle" class="text-xl font-medium mb-2">
				{{ $t('components.accounts.billingTab.cancelSubscriptionModal.surveySection.title') }}
			</h4>
			<p class="text-muted text-sm">
				{{ $t('components.accounts.billingTab.cancelSubscriptionModal.surveySection.description') }}
			</p>
		</div>
		<div class="p-4">
			<div class="text-lg">
				{{ $t('components.accounts.billingTab.cancelSubscriptionModal.surveySection.surveyQuestion') }}
			</div>
			<div class="text-muted text-sm mb-2">
				{{ $t('components.accounts.billingTab.cancelSubscriptionModal.surveySection.surveyQuestionDescription') }}
			</div>
			<div class="flex flex-col gap-2 mb-8">
				<label
					v-for="(option, index) in $tm(
						`components.accounts.billingTab.cancelSubscriptionModal.surveySection.surveyOptions`,
					)"
					:key="index"
					class="flex items-center gap-2 p-3 bg-base-200 rounded-lg cursor-pointer transition-all duration-300 hover:bg-base-300 text-sm"
				>
					<input v-model="reasons" class="checkbox checkbox-sm" type="checkbox" :value="index" />
					{{ $t('components.accounts.billingTab.cancelSubscriptionModal.surveySection.surveyOptions.' + index) }}
				</label>
			</div>

			<div class="text-lg">
				{{ $t('components.accounts.billingTab.cancelSubscriptionModal.surveySection.otherQuestion') }}
			</div>
			<div class="text-muted text-sm mb-2">
				{{ $t('components.accounts.billingTab.cancelSubscriptionModal.surveySection.otherQuestionDescription') }}
			</div>
			<TextareaAutosize
				v-model="comment"
				class="textarea border! border-base-300! w-full my-2"
				:placeholder="$t('components.accounts.billingTab.cancelSubscriptionModal.surveySection.placeholder')"
				rows="2"
				type="text"
				autocomplete="text"
				autofocus
			/>
		</div>
		<div class="flex flex-wrap items-center justify-between gap-2 border-t border-subtle pt-4 px-4">
			<ChatAccountChip :chat-account="chatAccount" />
			<div class="flex flex-wrap items-center gap-2">
				<button type="button" class="btn btn-ghost" @click="$emit('closeModal')">
					{{ $t('components.accounts.billingTab.cancelSubscriptionModal.surveySection.closeButton') }}
				</button>
				<button type="button" class="btn btn-success btn-soft" @click="cancelSurveySubmit">
					{{ $t('components.accounts.billingTab.cancelSubscriptionModal.surveySection.continueButton') }}
				</button>
			</div>
		</div>
	</div>
</template>

<script>
import LazyLoadImage from '~/components/GlobalComponents/LazyLoadImage.vue'
import TextareaAutosize from '~/components/GlobalComponents/Elements/TextareaAutosize.vue'
import ChatAccountChip from '~/components/Accounts/BillingTab/CancelSubscriptionModal/ChatAccountChip.vue'
import { useChatAccountsStore } from '~/stores/chatAccounts'

export default {
	components: { ChatAccountChip, TextareaAutosize, LazyLoadImage },
	setup() {
		return {
			chatAccountsStore: useChatAccountsStore(),
		}
	},
	data() {
		return {
			reasons: [],
			comment: '',
		}
	},
	computed: {
		chatAccount() {
			return this.chatAccountsStore.active
		},
	},
	methods: {
		cancelSurveySubmit() {
			this.$emit('cancelSurveySubmit', this.reasons, this.comment)
		},
	},
}
</script>

<style scoped></style>
