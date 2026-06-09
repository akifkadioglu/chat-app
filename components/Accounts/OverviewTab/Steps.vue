<template>
	<div>
		<!-- Header -->
		<div class="mb-6">
			<h2 class="text-3xl font-medium mb-1 inline-flex items-center gap-3 glow-shine-infinite">
				{{ $t('components.accounts.overviewTab.steps.title') }}
			</h2>
			<p class="text-muted text-sm">
				<i18n-t keypath="components.accounts.overviewTab.steps.setupGuide">
					<template #chatLogo><ChatLogo /></template>
					<template #completed>{{ completedSteps }}</template>
					<template #total>{{ totalSteps }}</template>
				</i18n-t>
			</p>
		</div>

		<!-- Steps Accordion -->
		<!--			<div class="font-bold">{{ completedSteps }} / {{ totalSteps }}</div>-->

		<div class="space-y-3 divide-y-1 pb-3 divide-base-300 relative" :class="{ 'opacity-20': isLoading }">
			<LoadingElement class="absolute inset-0 flex items-center justify-center" :isLoading="isLoading" />
			<!-- Step 1: Connect Instagram Account -->
			<Collapse :collapsible="!connectInstagramCompleted" :open="nextIncompleteStep === 'connectInstagram'">
				<template #title>
					<span>
						<i
							class="fa-xl mr-2"
							:class="{
								'fa fa-check-circle text-success': connectInstagramCompleted,
								'fa-regular fa-circle': !connectInstagramCompleted,
							}"
						/>
						<span :class="{ 'line-through': connectInstagramCompleted }">
							{{ $t('components.accounts.overviewTab.steps.connectInstagram.title') }}
						</span>
					</span>
				</template>
			</Collapse>

			<!-- Step 4: Publish First Flow -->
			<Collapse :open="nextIncompleteStep === 'publishFirstFlow'" showArrow>
				<template #title>
					<span>
						<i
							class="fa-xl mr-2"
							:class="{
								'fa fa-check-circle text-success': publishFirstFlowCompleted,
								'fa-regular fa-circle': !publishFirstFlowCompleted,
							}"
						/>
						<span :class="{ 'line-through': publishFirstFlowCompleted }">
							{{ $t('components.accounts.overviewTab.steps.publishFirstFlow.title') }}
						</span>
					</span>
				</template>
				<p class="mb-3 text-sm text-muted">
					{{ $t('components.accounts.overviewTab.steps.publishFirstFlow.description') }}
				</p>

				<div class="flex gap-2 overflow-x-auto py-4">
					<div v-for="flow in selectedQuickFlows" :key="flow.type.key" class="w-56 shrink-0">
						<CreateFlowModalElement
							:type="flow.type"
							:title="$t(`components.flow.createFlowModal.quickFlows.${flow.type.key}.title`)"
							:description="$t(`components.flow.createFlowModal.quickFlows.${flow.type.key}.description`)"
							:iconClass="flow.iconClass"
							:showPro="flow.type.needsPro"
							class="h-full"
							@click="selectQuickFlow(flow.type)"
						/>
					</div>
				</div>
				<div class="text-center">
					<CreateFlowButton
						class="btn-transition mt-3 btn-soft shadow-xs"
						:title="$t('components.accounts.overviewTab.steps.publishFirstFlow.button')"
					/>
				</div>
			</Collapse>

			<!-- Step 2: Chat with Someone -->
			<Collapse :open="nextIncompleteStep === 'conversation'" showArrow>
				<template #title>
					<span>
						<i
							class="fa-xl mr-2"
							:class="{
								'fa fa-check-circle text-success': conversationCompleted,
								'fa-regular fa-circle': !conversationCompleted,
							}"
						/>
						<span :class="{ 'line-through': conversationCompleted }">
							{{ $t('components.accounts.overviewTab.steps.chatWithContacts.title') }}
						</span>
					</span>
				</template>
				<p class="mb-3 text-sm text-muted">
					<i18n-t keypath="components.accounts.overviewTab.steps.chatWithContacts.description">
						<template #simpliersLogo><simpliers-logo ucword /></template>
					</i18n-t>
				</p>

				<a
					class="btn btn-primary btn-soft btn-transition"
					:href="'https://ig.me/m/' + $instagramUsername() + '?ref=simpliersChat'"
					target="_blank"
				>
					<span>
						{{
							$t('components.accounts.overviewTab.steps.chatWithContacts.button', { simpliers: $instagramUsername() })
						}}
					</span>
					<!--						<ProfilePicture class="pr-2" src="/simpliers-icon.png" size="25" bgColor="bg-white" />-->
					<i class="fa fa-external-link link-icon" />
				</a>
			</Collapse>

			<Collapse :open="nextIncompleteStep === 'getFirstComment'" showArrow>
				<template #title>
					<span>
						<i
							class="fa-xl mr-2"
							:class="{
								'fa fa-check-circle text-success': getFirstCommentCompleted,
								'fa-regular fa-circle': !getFirstCommentCompleted,
							}"
						/>
						<span :class="{ 'line-through': getFirstCommentCompleted }">
							{{ $t('components.accounts.overviewTab.steps.getFirstComment.title') }}
						</span>
					</span>
				</template>
				<p class="mb-3 text-sm text-muted">
					<i18n-t keypath="components.accounts.overviewTab.steps.getFirstComment.description" />
				</p>

				<LocalizedLink
					name="comments"
					target="_blank"
					class="btn btn-primary btn-soft btn-transition gap-2 text-start"
				>
					{{ $t('components.baseComponents.appHeader.navigation.comments') }}
					<i class="fa fa-external-link-alt" />
				</LocalizedLink>
			</Collapse>

			<!-- Step 3: Comment to our post -->
			<Collapse :open="nextIncompleteStep === 'interactFlow'" showArrow>
				<template #title>
					<span>
						<i
							class="fa-xl mr-2"
							:class="{
								'fa fa-check-circle text-success': interactFlowCompleted,
								'fa-regular fa-circle': !interactFlowCompleted,
							}"
						/>
						<span :class="{ 'line-through': interactFlowCompleted }">
							{{ $t('components.accounts.overviewTab.steps.interactAFlow.title') }}
						</span>
					</span>
				</template>
				<p class="mb-3 text-sm text-muted">
					<i18n-t keypath="components.accounts.overviewTab.steps.interactAFlow.description">
						<template #hello>
							<span class="font-semibold">
								“{{ $t('components.accounts.overviewTab.steps.interactAFlow.triggerWord') }}”
							</span>
						</template>
					</i18n-t>
				</p>

				<a
					class="btn btn-primary btn-soft btn-transition gap-2 text-start"
					:href="$t('components.accounts.overviewTab.steps.interactAFlow.postLink')"
					target="_blank"
				>
					<span>
						<i18n-t keypath="components.accounts.overviewTab.steps.interactAFlow.button">
							<template #hello>
								<span class="font-semibold">
									“{{ $t('components.accounts.overviewTab.steps.interactAFlow.triggerWord') }}”
								</span>
							</template>
						</i18n-t>
					</span>
					<i class="fa fa-external-link link-icon"></i>
				</a>
			</Collapse>

			<!-- Step 5: Subscribe -->
			<Collapse :open="nextIncompleteStep === 'subscribed'" showArrow>
				<template #title>
					<span>
						<i
							class="fa-xl mr-2"
							:class="{
								'fa fa-check-circle text-success': subscribedCompleted,
								'fa-regular fa-circle': !subscribedCompleted,
							}"
						/>
						<span :class="{ 'line-through': subscribedCompleted }">
							{{ $t('components.accounts.overviewTab.steps.subscribe.title') }}
						</span>
					</span>
				</template>
				<p class="mb-3 text-sm text-muted">{{ $t('components.accounts.overviewTab.steps.subscribe.description') }}</p>
				<button
					class="btn btn-primary btn-transition"
					@click="$emitter.emit('showUpgradeModal', { feature: 'setupGuide' })"
				>
					<i class="fa fa-layer-group"></i>
					{{ $t('components.accounts.overviewTab.steps.subscribe.button') }}
				</button>
			</Collapse>
		</div>
	</div>
</template>

<script>
import Collapse from '~/components/GlobalComponents/Collapse.vue'
import CreateFlowButton from '~/components/Flow/CreateFlowButton.vue'
import LocalizedLink from '~/components/GlobalComponents/LocalizedLink.vue'
import SimpliersLogo from '~/components/GlobalComponents/Brands/SimpliersLogo.vue'
import ProfilePicture from '~/components/GlobalComponents/ProfilePicture.vue'
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import ChatLogo from '~/components/GlobalComponents/Brands/ChatLogo.vue'
import CreateFlowModalElement from '~/components/Flow/CreateFlowModalElement.vue'
import { QUICK_TYPES, quickFlows } from '~/models/Flow/utils/quick.ts'

export default {
	components: {
		CreateFlowModalElement,
		ChatLogo,
		LoadingElement,
		Avatar: ProfilePicture,
		SimpliersLogo,
		LocalizedLink,
		CreateFlowButton,
		Collapse,
	},
	props: {
		publishFirstFlowCompleted: {
			type: Boolean,
			default: false,
		},
		conversationCompleted: {
			type: Boolean,
			default: false,
		},
		interactFlowCompleted: {
			type: Boolean,
			default: false,
		},
		getFirstCommentCompleted: {
			type: Boolean,
			default: false,
		},
		isLoading: {
			type: Boolean,
			default: false,
		},
	},
	setup() {
		return {
			chatAccountsStore: useChatAccountsStore(),
			sessionStore: useSessionStore(),
			localeRoute: useLocaleRoute(),
		}
	},
	data() {
		return {
			stepsOrder: [
				'connectInstagram',
				'publishFirstFlow',
				'conversation',
				'getFirstComment',
				'interactFlow',
				'subscribed',
			],
		}
	},
	computed: {
		selectedQuickFlows() {
			return quickFlows.filter((flow) =>
				[
					QUICK_TYPES.sendDmFromComments.key,
					QUICK_TYPES.growFollowersFromComments.key,
					QUICK_TYPES.turnCommentsIntoSales.key,
					QUICK_TYPES.hideCommentNegative.key,
					QUICK_TYPES.replyGiveawayEntries.key,
				].includes(flow.type.key),
			)
		},
		selectedChatAccount() {
			return this.chatAccountsStore.active
		},
		// buttonLink() {
		// 	const country = this.sessionStore.data?.country
		// 	const simpliers = 'https://www.instagram.com/direct/t/111141356943281'
		// 	const simpliersTurkiye = 'https://www.instagram.com/direct/t/17845722932658027'
		//
		// 	if (!country) return simpliers
		//
		// 	if (['TR', 'AZ'].includes(country)) {
		// 		return simpliersTurkiye
		// 	}
		//
		// 	return simpliers
		// },
		nextIncompleteStep() {
			const stepCompletions = {
				connectInstagram: this.connectInstagramCompleted,
				conversation: this.conversationCompleted,
				getFirstComment: this.getFirstCommentCompleted,
				interactFlow: this.interactFlowCompleted,
				publishFirstFlow: this.publishFirstFlowCompleted,
				subscribed: this.subscribedCompleted,
			}
			return this.stepsOrder.find((stepKey) => !stepCompletions[stepKey]) || null
		},
		connectInstagramCompleted() {
			return true
		},
		subscribedCompleted() {
			return this.chatAccountsStore.active.subscribed
		},
		completedSteps() {
			const completions = [
				this.connectInstagramCompleted,
				this.conversationCompleted,
				this.interactFlowCompleted,
				this.publishFirstFlowCompleted,
				this.subscribedCompleted,
			]
			return completions.filter(Boolean).length
		},
		totalSteps() {
			return this.stepsOrder.length
		},
	},
	methods: {
		selectQuickFlow(quickType) {
			this.$router.push(
				this.localeRoute({
					name: 'flow-type-id',
					params: { id: 'new', type: quickType.path },
					query: {
						username: this.selectedChatAccount?.postAccount?.username || undefined,
					},
				}),
			)
		},
	},
}
</script>
