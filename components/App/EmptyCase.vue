<template>
	<div class="grid grid-cols-12 h-full">
		<LeftPanel class="md:col-span-4 lg:col-span-5 xl:col-span-4 bg-simpliers/70" />

		<div class="col-span-12 lg:col-span-7 xl:col-span-8 overflow-y-auto">
			<div class="flex flex-col mx-auto w-full h-full overflow-y-auto bs container">
				<div class="flex justify-start items-center py-4">
					<a
						v-if="!isSetupConfigured"
						@click="goBackStep"
						href="javascript:"
						class="link link-secondary"
						:class="{
							'pointer-events-none': step === 0,
							'opacity-50': step === 0,
						}"
					>
						<i class="fa fa-chevron-left" />
						{{ $t('components.app.emptyCase.backButton') }}
					</a>
				</div>

				<transition :name="transitionName" mode="out-in" appear>
					<EmptyCaseQuestion
						v-if="getQuestion && !isSetupConfigured"
						:key="'question-' + step"
						:question="getQuestion"
						:isLoading="isLoading"
						v-model="answers[getQuestion.key]"
						@continue="handleContinue"
					/>
					<EmptyCaseAccount v-else :key="'account' + step" v-model="username" :sendInformation="sendInformation" />
				</transition>
				<AppFooter />
			</div>
		</div>
	</div>
</template>
<script>
import LeftPanel from '~/components/GlobalComponents/Auth/LeftPanel.vue'
import apiList from '~/apis/ApiList.js'
import AppFooter from '~/components/App/AppFooter.vue'
import EmptyCaseQuestion from '~/components/App/EmptyCaseQuestion.vue'
import EmptyCaseAccount from '~/components/App/EmptyCaseAccount.vue'

export default {
	components: {
		AppFooter,
		LeftPanel,
		EmptyCaseQuestion,
		EmptyCaseAccount,
	},
	setup() {
		return {
			authStore: useAuthStore(),
		}
	},
	data() {
		return {
			step: 0,
			previousStep: 0,
			answers: {},
			isLoading: false,
			questions: [
				{
					key: 'describeProfileType',
					options: [
						{ value: 'influencer', icon: 'fa fa-user-tie' },
						{ value: 'brand', icon: 'fa fa-building' },
						{ value: 'agency', icon: 'fa fa-users' },
						{ value: 'other', icon: 'fa fa-ellipsis' },
					],
				},
				{
					key: 'primaryInstagramGoal',
					options: [
						{ value: 'followers', icon: 'fa fa-user-plus' },
						{ value: 'sales', icon: 'fa fa-shopping-cart' },
						{ value: 'engagement', icon: 'fa fa-heart' },
						{ value: 'brand_awareness', icon: 'fa fa-bullhorn' },
					],
				},
			],
			username: '',
			isSetupConfigured: this.authStore.user?.setting?.is_setup_configured ?? this.authStore.user?.is_setup_configured,
		}
	},
	computed: {
		getQuestion() {
			if (this.step >= this.questions.length) return null
			return this.questions[this.step]
		},
		transitionName() {
			if (this.step < this.previousStep) {
				return 'slide-down'
			}
			return 'slide-up'
		},
	},
	methods: {
		handleContinue() {
			this.isLoading = true

			this.sendInformation()
				.then(() => {
					this.previousStep = this.step
					this.step++
				})
				.catch((error) => {})
				.finally(() => {
					this.isLoading = false
				})
		},
		sendInformation() {
			const data = []

			const profileType = this.answers.describeProfileType
			const primaryGoal = this.answers.primaryInstagramGoal
			consoleLog('Profile Type:', profileType)
			consoleLog('Primary Instagram Goal:', primaryGoal)

			const answeredDescribeProfileType = this.authStore.user?.setting.setup?.find(
				(s) => s.question === 'describeProfileType',
			)?.answer
			const answeredPrimaryInstagramGoal = this.authStore.user?.setting.setup?.find(
				(s) => s.question === 'primaryInstagramGoal',
			)?.answer

			if (profileType && !answeredDescribeProfileType) {
				this.$gtag('event', 'answered_describeProfileType', {
					answer: profileType,
				})
				this.$gtag('event', 'answered_describeProfileType' + profileType)
				this.$fbq('trackCustom', 'AnsweredDescribeProfileType', {
					answer: profileType,
				})
			}

			if (primaryGoal && !answeredPrimaryInstagramGoal) {
				this.$gtag('event', 'answered_primaryInstagramGoal', {
					answer: primaryGoal,
				})
				this.$gtag('event', 'answered_primaryInstagramGoal' + primaryGoal)
				this.$fbq('trackCustom', 'AnsweredPrimaryInstagramGoal', {
					answer: primaryGoal,
				})
			}

			this.questions.forEach((question) => {
				const answerValue = this.answers[question.key]
				if (answerValue) {
					data.push({
						questionDesc: this.$t(`components.app.emptyCase.questions.${question.key}.question`, {}, 'en'),
						question: question.key,
						answerDesc: this.$t(`components.app.emptyCase.questions.${question.key}.options.${answerValue}`, {}, 'en'),
						answer: answerValue,
					})
				}
			})

			if (this.username) {
				data.push({
					questionDesc: 'Instagram Username',
					question: 'username',
					answer: this.username,
				})
			}

			return this.$requestAdapter.post(apiList.chat.saveSetup, { data }, {})
		},
		goBackStep() {
			if (this.step === 0) return
			if (this.step < 0) {
				this.step = 0
			}
			this.previousStep = this.step
			this.step--
		},
	},
}
</script>
