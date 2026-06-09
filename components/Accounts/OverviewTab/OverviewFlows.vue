<template>
	<div class="flex flex-col w-full gap-4">
		<FeatureToggleCard
			class="flex-1 bg-primary/10"
			:label="$t('components.accounts.overviewTab.featureToggles.growFollowersFromComments.title')"
			:description="$t('components.accounts.overviewTab.featureToggles.growFollowersFromComments.description')"
			activeButtonClass="btn btn-primary"
			:loading="loadingFlows"
			:active="!!growFollowersFlow"
			@enable="handleEnable(QUICK_TYPES.growFollowersFromComments)"
			@manage="$router.push(localeRoute(growFollowersFlow.route))"
		>
			<template #icon>
				<svg class="size-full text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path
						opacity="0.3"
						d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
						fill="currentColor"
					/>
					<path
						fill-rule="evenodd"
						clip-rule="evenodd"
						d="M4 20.5C4 16.9101 7.58172 14 12 14C13.8628 14 15.577 14.5173 16.9351 15.3847C16.3405 15.7507 16 16.3525 16 17V18H15C14.4477 18 14 18.4477 14 19V20C14 20.3643 14.0974 20.7058 14.2676 21H4.8C4.35817 21 4 20.6418 4 20.5Z"
						fill="currentColor"
					/>
					<path
						d="M19 14C19.5523 14 20 14.4477 20 15V17H22C22.5523 17 23 17.4477 23 18C23 18.5523 22.5523 19 22 19H20V21C20 21.5523 19.5523 22 19 22C18.4477 22 18 21.5523 18 21V19H16C15.4477 19 15 18.5523 15 18C15 17.4477 15.4477 17 16 17H18V15C18 14.4477 18.4477 14 19 14Z"
						fill="currentColor"
					/>
				</svg>
			</template>
		</FeatureToggleCard>
		<FeatureToggleCard
			class="flex-1 bg-success/10"
			:label="$t('components.accounts.overviewTab.featureToggles.replyPositiveComments.title')"
			:description="$t('components.accounts.overviewTab.featureToggles.replyPositiveComments.description')"
			activeButtonClass="btn btn-success"
			:loading="loadingFlows"
			:active="!!positiveReplyFlow"
			@enable="handleEnable(QUICK_TYPES.positiveCommentReply)"
			@manage="$router.push(localeRoute(positiveReplyFlow.route))"
		>
			<template #icon>
				<svg class="size-full text-success" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path
						fill-rule="evenodd"
						clip-rule="evenodd"
						d="M22.1671 18.1421C22.4827 18.4577 23.0222 18.2331 23.0206 17.7868L23.0039 13.1053V5.52632C23.0039 4.13107 21.8729 3 20.4776 3H8.68815C7.2929 3 6.16183 4.13107 6.16183 5.52632V9H13C14.6568 9 16 10.3431 16 12V15.6316H19.6565L22.1671 18.1421Z"
						fill="currentColor"
					/>
					<path
						opacity="0.3"
						fill-rule="evenodd"
						clip-rule="evenodd"
						d="M1.98508 18V13C1.98508 11.8954 2.88051 11 3.98508 11H11.9851C13.0896 11 13.9851 11.8954 13.9851 13V18C13.9851 19.1046 13.0896 20 11.9851 20H4.10081L2.85695 21.1905C2.53895 21.4949 2.01123 21.2695 2.01123 20.8293V18.3243C1.99402 18.2187 1.98508 18.1104 1.98508 18ZM5.99999 14.5C5.99999 14.2239 6.22385 14 6.49999 14H11.5C11.7761 14 12 14.2239 12 14.5C12 14.7761 11.7761 15 11.5 15H6.49999C6.22385 15 5.99999 14.7761 5.99999 14.5ZM9.49999 16C9.22385 16 8.99999 16.2239 8.99999 16.5C8.99999 16.7761 9.22385 17 9.49999 17H11.5C11.7761 17 12 16.7761 12 16.5C12 16.2239 11.7761 16 11.5 16H9.49999Z"
						fill="currentColor"
					/>
				</svg>
			</template>
		</FeatureToggleCard>
		<FeatureToggleCard
			class="flex-1 bg-error/10"
			:label="$t('components.accounts.overviewTab.featureToggles.hideNegativeComments.title')"
			:description="$t('components.accounts.overviewTab.featureToggles.hideNegativeComments.description')"
			activeButtonClass="btn btn-error"
			:loading="loadingFlows"
			:active="!!hideNegativeFlow"
			@enable="handleEnable(QUICK_TYPES.hideCommentNegative)"
			@manage="$router.push(localeRoute(hideNegativeFlow.route))"
		>
			<template #icon>
				<svg class="size-full text-error" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path
						opacity="0.3"
						fill-rule="evenodd"
						clip-rule="evenodd"
						d="M4 4L11.6314 2.56911C11.875 2.52343 12.125 2.52343 12.3686 2.56911L20 4V11.9033C20 15.696 18.0462 19.2211 14.83 21.2313L12.53 22.6687C12.2057 22.8714 11.7943 22.8714 11.47 22.6687L9.17001 21.2313C5.95382 19.2211 4 15.696 4 11.9033L4 4Z"
						fill="currentColor"
					/>
					<path
						fill-rule="evenodd"
						clip-rule="evenodd"
						d="M11.175 14.75C10.9354 14.75 10.6958 14.6542 10.5042 14.4625L8.58749 12.5458C8.20415 12.1625 8.20415 11.5875 8.58749 11.2042C8.97082 10.8208 9.59374 10.8208 9.92915 11.2042L11.175 12.45L14.3375 9.2875C14.7208 8.90417 15.2958 8.90417 15.6792 9.2875C16.0625 9.67083 16.0625 10.2458 15.6792 10.6292L11.8458 14.4625C11.6542 14.6542 11.4146 14.75 11.175 14.75Z"
						fill="currentColor"
					/>
				</svg>
			</template>
		</FeatureToggleCard>
		<div class="text-end">
			<button class="link text-sm" @click="$emitter.emit('showCreateFlowModal', {})">
				{{ $t('components.accounts.overviewTab.featureToggles.otherFlows') }}
				<i class="fa fa-chevron-right link-icon text-sm" />
			</button>
		</div>
	</div>
</template>

<script>
import FeatureToggleCard from '~/components/Accounts/OverviewTab/FeatureToggleCard.vue'
import apiList from '~/apis/ApiList.js'
import { Flow } from '~/models/Flow/Flow.ts'
import { QUICK_TYPES } from '~/models/Flow/utils/quick.ts'

export default {
	components: {
		FeatureToggleCard,
	},
	setup() {
		return {
			chatAccountsStore: useChatAccountsStore(),
			localeRoute: useLocaleRoute(),
		}
	},
	data() {
		return {
			QUICK_TYPES,
			overviewFlows: [],
			loadingFlows: true,
		}
	},
	computed: {
		hideNegativeFlow() {
			return this.overviewFlows.find((f) => f.quickTypeKey === QUICK_TYPES.hideCommentNegative.key)
		},
		positiveReplyFlow() {
			return this.overviewFlows.find((f) => f.quickTypeKey === QUICK_TYPES.positiveCommentReply.key)
		},
		growFollowersFlow() {
			return this.overviewFlows.find((f) => f.quickTypeKey === QUICK_TYPES.growFollowersFromComments.key)
		},
	},
	mounted() {
		this.fetchOverviewFlows()
	},
	methods: {
		handleEnable(quickType) {
			this.$gtag('event', 'overviewFeatureToggled', { quickFlowType: quickType.key })

			// if (quickType.needsPro && !this.chatAccountsStore.active.subscribed) {
			// 	this.$emitter.emit('showUpgradeModal', {
			// 		chatAccount: this.chatAccountsStore.active,
			// 		feature: 'quickFlow',
			// 	})
			// 	return
			// }

			this.$router.push(
				this.localeRoute({
					name: 'flow-type-id',
					params: { id: 'new', type: quickType.path },
					query: { username: this.chatAccountsStore.active?.postAccount?.username },
				}),
			)
		},
		fetchOverviewFlows() {
			this.$requestAdapter
				.post(
					apiList.chat.instagram.chatAccountId.overviewFlows,
					{
						quickTypeKeys: [
							QUICK_TYPES.hideCommentNegative.key,
							QUICK_TYPES.positiveCommentReply.key,
							QUICK_TYPES.growFollowersFromComments.key,
						],
					},
					{ chatAccountId: this.chatAccountsStore.active.id },
				)
				.then((response) => {
					this.overviewFlows = (response.data || []).map((flow) => new Flow(flow))
				})
				.finally(() => {
					this.loadingFlows = false
				})
		},
	},
}
</script>
