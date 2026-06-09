<template>
	<State :isLoading="loading">
		<AppLayout ref="appLayout" v-bind="$attrs" :adminPreview>
			<template v-if="!adminPreview" #contentHeader>
				<ContentHeader v-if="flowStore.flow && accountSelected" ref="contentHeader" :saveFunc="saveFlow" />
			</template>

			<template #secondTrailingToggleButtonIcon>
				<slot name="secondTrailingToggleButtonIcon" />
			</template>

			<template #trailingToggleButtonIcon>
				<slot name="trailingToggleButtonIcon" />
			</template>

			<template #contentWarning>
				<ContentWarning :rollbackAvailable="rollbackAvailable" :publishing="publishing" :getFlowFunc="getFlow" />
			</template>
			<div
				v-if="flowStore.flow && accountSelected && isStatusActive"
				class="flex mx-auto flex-1 py-5 px-2 md:px-5 my-auto w-full"
			>
				<slot />
			</div>

			<template #secondTrailingContent v-if="$slots.secondTrailingContent && accountSelected">
				<slot name="secondTrailingContent" />
			</template>
			<template #trailingContent v-if="$slots.trailingContent && accountSelected">
				<slot name="trailingContent" />
			</template>
		</AppLayout>
	</State>
</template>

<script>
import apiList from '~/apis/ApiList.js'
import { Flow as FlowModel, FLOW_STATUS_DRAFT } from '~/models/Flow/Flow.js'
import State from '~/components/GlobalComponents/State.vue'
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import AutoSaveStatus from '~/components/BaseComponents/AutoSaveStatus.vue'
import FollowUpMessage from '~/components/Flow/Quick/Components/FollowUpMessage.vue'
import { createQuickFlowByJSON, QUICK_TYPES, quickFlowCategories } from '~/models/Flow/utils/quick.ts'
import ContentHeader from '~/components/Flow/FlowSetup/ContentHeader.vue'
import ContentWarning from '~/components/Flow/FlowSetup/ContentWarning.vue'
import CopyToClipboard from '~/components/GlobalComponents/Elements/CopyToClipboard.vue'
import debounce from 'lodash/debounce'
import { FLOW_TYPE_KEYS, nodeTypes, triggerTypes } from '~/models/Flow/utils/utils.ts'

export default {
	inheritAttrs: false,
	components: {
		CopyToClipboard,
		ContentWarning,
		ContentHeader,
		FollowUpMessage,
		AutoSaveStatus,
		LoadingElement,
		State,
	},
	props: {
		adminPreview: {
			type: Boolean,
			default: false,
		},
	},
	data() {
		const routeType = Object.values(QUICK_TYPES).find((q) => q.path === this.$route.params.type)
		const isQuickFlow = !!routeType
		return {
			loading: false,
			routeType,
			isQuickFlow,
			firstSaveTracked: false,
		}
	},
	computed: {
		selectedAccount() {
			return this.chatAccountsStore.active
		},
		accountSelected() {
			return !!this.selectedAccount
		},
		isNewFlow() {
			return this.$route.params.id === 'new' || this.$route.params.id === 'create'
		},
		rollbackAvailable() {
			return this.flowStore.flow?.raw?.publishedVersion?.version !== this.flowStore.flow?.version
		},
		isStatusActive() {
			if (this.chatAccountsStore.active && !this.chatAccountsStore.active.isStatusActive) {
				this.$emitter.emit('showRefreshPermissionModal', {
					closeable: false,
					chatAccount: this.selectedAccount,
				})
			}
			return this.chatAccountsStore.active?.isStatusActive
		},
		commentsFlowCategoryKeys() {
			return quickFlowCategories.find((c) => c.key === 'comments')?.flowKeys || []
		},
	},
	setup() {
		const canPublish = ref(false)
		const publishing = ref(false)
		const showAutoSaveStatus = ref(false)
		const flowStopLoading = ref(false)
		const saving = ref(false)

		provide('canPublish', canPublish)
		provide('publishing', publishing)
		provide('showAutoSaveStatus', showAutoSaveStatus)
		provide('flowStopLoading', flowStopLoading)
		provide('saving', saving)

		return {
			flowStore: useFlowStore(),
			chatAccountsStore: useChatAccountsStore(),
			publishing,
			showAutoSaveStatus,
			canPublish,
			flowStopLoading,
			saving,
		}
	},
	// beforeCreate() {
	// 	// if (String(this.flowStore?.flow?.id) !== this.$route.params.id) {
	// 	// 	this.flowStore.$reset()
	// 	// }
	// },
	watch: {
		accountSelected: {
			handler(newVal, oldVal) {
				if (this.flowStore.lockForFlowSetup) return
				if (!oldVal && newVal && this.isNewFlow) {
					if (this.isQuickFlow) {
						this.createNewQuickFlow()
					}
					if (!this.isQuickFlow) {
						this.createNewFlow()
					}
					this.setChatAccountToFlow()
				}
				//selectedAccountModal'da bir account seçildikten sonra burayı kontrol ediyor
				if (newVal) {
					this.$nextTick(() => {
						setTimeout(() => {
							this.showAutoSaveStatus = true
						}, 50)
					})
				}
			},
			immediate: true,
			// deep: true,
		},
		'flowStore.flow.nodes': {
			handler(newVal) {
				if (this.flowStore.flow?.validated) {
					this.debouncedValidate(this.$t)
				}
			},
			deep: true,
		},
	},
	mounted() {
		this.$emitter.on('publishFlow', this.publishFlow)
		this.$emitter.on('stopFlow', this.stopFlow)
		this.$emitter.on('saveFlow', this.saveFlow)
		this.$emitter.on('replacePublishedVersion', this.replacePublishedVersion)
		this.$emitter.on('saveForPreviewDropdown', this.saveForPreviewDropdown)
		if (this.flowStore.lockForFlowSetup) return

		// if (this.isNewFlow) {
		// 	if (this.isQuickFlow) {
		// 		this.createNewQuickFlow()
		// 	}
		// 	this.setChatAccountToFlow()
		// } else {
		// 	this.getFlow()
		// }

		if (!this.isNewFlow) {
			this.getFlow()
		}
	},
	beforeUnmount() {
		this.$emitter.off('publishFlow')
		this.$emitter.off('stopFlow')
		this.$emitter.off('saveFlow')
		this.$emitter.off('replacePublishedVersion')
		this.$emitter.off('saveForPreviewDropdown')

		// consoleLog('FlowPage- Resetting flow store before unmounting.')
		this.flowStore.$reset()
	},
	methods: {
		debouncedValidate: debounce(function (t) {
			this.flowStore.flow.validateNodes(t)
			// this.flowStore.flow.nodes.forEach((node) => {
			// 	node.validateNode(t)
			// })
		}, 800),
		saveForPreviewDropdown(location) {
			this.saveFlow().then(() => {
				this.$emitter.emit('openPreviewDropdown', location)
			})
		},
		async createNewFlow() {
			let type = FLOW_TYPE_KEYS.basic
			if (this.$route.name.includes('diagram')) {
				type = FLOW_TYPE_KEYS.diagram
			}
			this.flowStore.flow = new FlowModel({ typeKey: type }, this.$t)
			await this.$nextTick()
			this.flowStore.focusNode(this.flowStore.flow.nodes[0]?.uuid || null)
		},
		setChatAccountToFlow() {
			this.flowStore.flow.chatAccountId = this.chatAccountsStore.active?.id
			this.loading = false
		},
		async createNewQuickFlow() {
			this.loading = true
			const postId = this.$route.query.postId
			const postImg = this.$route.query.postImg
			const username = this.chatAccountsStore.active?.postAccount?.username
			const flowObj = createQuickFlowByJSON(this.routeType.key, this.$t, this.$te, username)
			if (postId && this.commentsFlowCategoryKeys.includes(this.routeType.key)) {
				const triggerNode = flowObj.nodes.find((node) => (node.typeKey = nodeTypes.trigger.key))
				const triggerNodeTrigger = triggerNode.triggers.find(
					(trigger) => trigger.type.key === triggerTypes.commentOnPost.key,
				)
				triggerNodeTrigger.config.selectedPostIds.push(postId)
				triggerNodeTrigger.config.selectedPostImgs.push(postImg)
			}
			this.flowStore.flow = new FlowModel(flowObj, this.$t)
			await this.$nextTick()
			this.loading = false
			// this.$router.replace({ query: { ...this.$route.query, postId: undefined, postImg: undefined } })
		},
		async getFlow() {
			consoleLog('FlowPage- Fetching flow with ID:', this.$route.params.id)
			if (String(this.flowStore?.flow?.id) === this.$route.params.id) {
				this.chatAccountsStore.setActive(this.flowStore.flow.chatAccountId)
				consoleLog('FlowPage- Flow already loaded, skipping fetch.')
				return
			}

			this.loading = true
			this.flowStore.$reset()
			const flowId = this.$route.params.id
			await this.$requestAdapter
				.get(apiList.chat.flow.id.get, {
					id: flowId,
					params: {
						ap: this.adminPreview ? 1 : 0,
					},
				})
				.then(async (response) => {
					if (this.adminPreview) {
						consoleLog("this.adminPreview'den ötürü setactive ve upsertAccount methodları çağırıldı")
						this.chatAccountsStore.upsertAccount(response.data.chat_account)
						this.chatAccountsStore.setActive(response.data.chat_account.id)
					}

					const flowData = {
						...response.data.flow,
						sharedFlows: {
							link: response.data.link ?? null,
							library: response.data.library ?? null,
						},
					}
					if (this.$route.name.includes('diagram')) {
						flowData.typeKey = FLOW_TYPE_KEYS.diagram
						flowData.quickTypeKey = null
					}

					this.flowStore.flow = new FlowModel(flowData, this.$t)
					this.flowStore.flow.status = response.data.flow_status
					this.flowStore.flow.raw.status = response.data.flow_status
					this.flowStore.flow.raw.publishedVersion = response.data.published_version

					const username = this.chatAccountsStore.byId(this.flowStore.flow.chatAccountId).postAccount.username
					consoleLog('xyzç getFlow username', username)
					await this.$router.replace({
						query: {
							...this.$route.query,
							username: username,
						},
					})

					await this.$nextTick()
					this.flowStore.focusNode(this.flowStore.flow.nodes[0]?.uuid || null)
				})
				.catch((error) => {
					console.error('Error fetching flow:', error)
				})
				.finally(() => {
					this.loading = false
				})
		},
		async replacePublishedVersion() {
			await this.saveFlow()
			await this.publishFlow()
		},
		setRouteType() {
			this.routeType = Object.values(QUICK_TYPES).find((q) => q.path === this.$route.params.type)
			this.isQuickFlow = !!this.routeType
		},
		async publishFlow() {
			if (this.hasNodeError()) {
				return
			}

			if (this.flowStore.flow.hasProFeature && !this.flowStore.flow.chatAccount?.subscribed) {
				const hit = this.flowStore.flow.firstProHit
				if (hit?.nodeUuid) {
					this.flowStore.focusNode(hit.nodeUuid)
					this.scrollToTop()
				}
				this.$emitter.emit('showUpgradeModal', {
					chatAccount: this.flowStore.flow.chatAccount,
					feature: hit?.feature || 'upgrade',
				})
				return
			}

			if (this.publishing) {
				return
			}

			await this.$nextTick()

			if (this.flowStore.flow.chatAccount.needsUpgrade) {
				this.$emitter.emit('showUpgradeModal', { chatAccount: this.flowStore.flow.chatAccount, feature: 'upgrade' })
				return
			}
			if (!this.flowStore.flow.chatAccount.status) {
				this.$emitter.emit('showRefreshPermissionModal', { chatAccount: this.flowStore.flow.chatAccount })
				return
			}

			this.publishing = true

			await this.$nextTick()

			if (!this.canPublish || !this.flowStore.flow.id) {
				await this.saveFlow()
					.then(() => {})
					.catch(() => {
						this.publishing = false
					})

				await this.$nextTick()
			}

			this.$requestAdapter
				.post(
					apiList.chat.flow.id.publish,
					{
						version: this.flowStore.flow.version,
					},
					{
						id: this.flowStore.flow.id,
					},
				)
				.then((res) => {
					consoleLog('publishFlow', res)
					this.flowStore.flow.raw.publishedVersion = res.data
					this.flowStore.flow.status = res.data.status
					this.$toast.success(this.$t('components.flow.flowSetup.publishSuccessMessage'))
					this.flowStore.flow.chatAccount.publishedFlows.push(this.flowStore.flow)
					this.$emitter.emit('flowPublished')

					this.$gtag('event', 'flowPublished', {
						id: this.flowStore.flow.id,
						username: this.flowStore.flow.chatAccount.postAccount.username,
					})
					this.$fbq('trackCustom', 'FlowPublished', {
						id: this.flowStore.flow.id,
						username: this.flowStore.flow.chatAccount.postAccount.username,
					})
				})
				.catch((err) => {
					consoleLog('err', err)
				})
				.finally(() => {
					this.publishing = false
				})
		},
		async stopFlow() {
			this.flowStopLoading = true
			this.$requestAdapter
				.post(
					apiList.chat.flow.id.changeStatus,
					{
						status: FLOW_STATUS_DRAFT,
					},
					{
						chatAccountId: this.flowStore.flow.chatAccountId,
						id: this.flowStore.flow.id,
					},
				)
				.then((res) => {
					this.flowStore.flow.update(res.data)
					this.flowStore.flow.chatAccount.publishedFlows = this.flowStore.flow.chatAccount.publishedFlows.filter(
						(flow) => flow.id !== this.flowStore.flow.id,
					)
				})
				.finally(() => {
					this.flowStopLoading = false
				})
		},
		async saveFlow() {
			this.saving = true
			const flow = this.flowStore.flow.toJSON()
			consoleLog('Saving flow:', flow)
			return this.$requestAdapter
				.post(
					apiList.chat.flow.id.save,
					{ flow },
					{
						id: flow?.id ?? 'new',
					},
				)
				.then(async (res) => {
					const responseFlow = res.data
					this.flowStore.flow.id = responseFlow.id
					this.flowStore.flow.slug = responseFlow.slug
					this.flowStore.flow.version = responseFlow.version
					this.flowStore.flow.previewCode = responseFlow.preview_code ?? this.flowStore.flow.previewCode

					await this.flowSaved()
					return res
				})
				.catch((err) => {
					consoleLog('err', err)
				})
				.finally(() => {
					this.saving = false
				})
		},
		async flowSaved() {
			this.$emitter.emit('flowSaved')
			if (this.isNewFlow && this.flowStore.flow?.id && !this.firstSaveTracked) {
				this.firstSaveTracked = true
				await this.$nextTick()
				// TODO :: neden this.$router.replace kullanılmadığını sor
				const username = this.flowStore.flow.chatAccount.postAccount.username
				consoleLog('xyzç flowSaved username', username)
				// await this.$router.replace({
				// 	params: { id: this.flowStore.flow.id },
				// 	query: {
				// 		username,
				// 	},
				// })

				this.$gtag('event', 'flowSavedAsFirst', {
					id: this.flowStore.flow.id,
					username: this.flowStore.flow.chatAccount.postAccount.username,
				})
				this.$fbq('trackCustom', 'FlowSavedAsFirst', {
					id: this.flowStore.flow.id,
					username: this.flowStore.flow.chatAccount.postAccount.username,
				})
				this.$fbq('track', 'CustomizeProduct', {
					id: this.flowStore.flow.id,
					username: this.flowStore.flow.chatAccount.postAccount.username,
				})

				window.history.replaceState(
					{},
					'',
					this.$router.resolve({
						params: { id: this.flowStore.flow.id },
						query: {
							username: this.flowStore.flow.chatAccount.postAccount.username,
						},
					}).href,
				)
				await this.$nextTick()
				await this.$delay(100)
			}
		},
		hasNodeError() {
			this.flowStore.flow.validateNodes(this.$t)
			this.flowStore.flow.validated = true

			const errors = Object.entries(this.flowStore.flow.validationErrors).filter(
				([_, errorList]) => errorList && errorList.length > 0,
			)

			const firstUuid = errors?.[0]?.[0]
			if (firstUuid) {
				this.$toast.error(this.$t('components.flow.flowSetup.fixErrorsBeforePublish'))
				this.flowStore.focusNode(firstUuid)
				this.scrollToTop()
				return true
			}

			consoleLog('No validation errors found.')
			return false
		},
		scrollToTop() {
			const container = this.$refs.appLayout.$refs.contentContainer
			consoleLog('22Scrolling to top of content container.', container)
			if (container) {
				consoleLog('Scrolling to top of content container.', container)
				container.scrollTo({ top: 0, behavior: 'smooth' })
			}
		},
	},
}
</script>
