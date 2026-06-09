<template>
	<div class="card border border-subtle shadow-sm">
		<div class="card-body p-4">
			<div class="flex flex-wrap md:flex-nowrap gap-4">
				<div class="grid grid-cols-2 max-w-md gap-2">
					<div class="md:col-span-2 text-xs text-muted flex items-center gap-2">
						<i class="fa fa-calendar" />
						<span>{{ $formatDate(subscription.startedAt, $i18n.locale) }}</span>
					</div>

					<div class="md:col-span-2 text-end md:text-start">
						<h4 class="text-base font-medium leading-tight text-wrap">{{ subscription.plan?.name }}</h4>
					</div>

					<div class="col-span-2 text-end md:text-start mt-auto truncate">
						<div class="text-xs text-muted truncate">
							<i class="fa fa-user" />
							<span class="text-subtle"># {{ subscription.user.id }}</span>
						</div>
						<div class="text-sm">{{ subscription.user.name }}</div>
						<div class="text-xs text-muted truncate">
							<span>{{ subscription.user.email }}</span>
						</div>
					</div>
				</div>
				<div>
					<PlanElement
						:plan="subscription.plan"
						class="gap-3 p-0!"
						viewOnly
						hideFeatureDescriptions
						:showCancelFeature="false"
						:showAllFeature="false"
					>
						<template #price><span /></template>
					</PlanElement>
				</div>
			</div>

			<!-- Bottom: Action -->
			<div class="pt-3">
				<button
					class="btn btn-primary btn-soft btn-transition w-full"
					@click="linkSubscription"
					:disabled="linkLoading"
				>
					<LoadingElement :isLoading="linkLoading" class="mr-2" size="16">
						<i class="fa fa-link"></i>
					</LoadingElement>
					{{ $t('components.accounts.billingTab.unlinkedSubscriptionCard.linkButton') }}
				</button>

				<!--				<div class="pt-1 flex justify-center">-->
				<!--					<AccountProfile-->
				<!--						class="w-auto inline-flex"-->
				<!--						size="20"-->
				<!--						:profilePicture="chatAccount.postAccount.profilePicture"-->
				<!--						:name="chatAccount.postAccount.name"-->
				<!--						:username="chatAccount.postAccount.username"-->
				<!--					/>-->
				<!--				</div>-->
			</div>
		</div>
	</div>
</template>

<script>
import { Subscription } from '~/models/Pricing/Subscription.ts'
import PlanElement from '~/components/Pricing/PlanElement.vue'
import AccountProfile from '~/components/GlobalComponents/AccountProfile.vue'
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import apiList from '~/apis/ApiList.js'

export default {
	name: 'UnlinkedSubscriptionCard',
	components: { LoadingElement, AccountProfile, PlanElement },
	props: {
		subscription: {
			type: Subscription,
			required: true,
		},
	},
	emits: ['linked'],
	data() {
		return {
			linkLoading: false,
		}
	},
	setup() {
		return {
			chatAccountsStore: useChatAccountsStore(),
		}
	},
	computed: {
		chatAccount() {
			return this.chatAccountsStore.active
		},
	},
	methods: {
		linkSubscription() {
			this.linkLoading = true
			this.$requestAdapter
				.post(
					apiList.chat.instagram.chatAccountId.subscribeExist,
					{
						subscriptionId: this.subscription.id,
					},
					{
						chatAccountId: this.chatAccount.id,
					},
				)
				.then((response) => {
					this.chatAccountsStore.upsertAccount(response.data.chat_account)
					this.$toast.success(this.$t('components.accounts.billingTab.unlinkedSubscriptionCard.successMessage'))
					this.$emit('linked')
				})
				.finally(() => {
					this.linkLoading = false
				})
		},
	},
}
</script>

<style scoped></style>
