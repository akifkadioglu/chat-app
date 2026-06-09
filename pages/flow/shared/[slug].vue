<template>
	<div class="flex items-center justify-center h-full w-full">
		<State :isLoading="isLoading" :isError="!!error">
			<template #error>
				<ErrorState :content="error?.data?.data?.message" @retry="getFlow">
					<template #buttons>
						<button class="btn btn-ghost" @click="goHome">
							{{ $t('pages.app.flow.shared.slug.error.goBackButton') }}
						</button>
					</template>
				</ErrorState>
			</template>
			<AppLayout
				:disableSelectAllAccount="true"
				:disableAccountChange="true"
				@selectedAccountChanged="selectedAccountChanged"
			>
				<div class="flex-1 flex items-center justify-center">
					<LoadingElement />
				</div>
			</AppLayout>
		</State>
	</div>
</template>
<script>
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import { processFlowObject } from '~/models/Flow/utils/quick.ts'
import { Flow } from '~/models/Flow/Flow.ts'
import { SharedFlow } from '~/models/Flow/SharedFlow.ts'
import { applyFlowPlaceholders, extractPlaceholderParams } from '~/helpers/applyFlowPlaceholders'
import apiList from '~/apis/ApiList.js'
import SelectAccountModal from '~/components/Flow/SelectAccountModal.vue'
import State from '~/components/GlobalComponents/State.vue'
import ErrorState from '~/components/GlobalComponents/ErrorState.vue'

export default {
	components: {
		ErrorState,
		State,
		SelectAccountModal,
		LoadingElement,
	},
	setup() {
		definePageMeta({
			layout: 'app',
			middleware: ['auth-custom'],
		})
		return {
			flowStore: useFlowStore(),
			chatAccountsStore: useChatAccountsStore(),
			localeRoute: useLocaleRoute(),
		}
	},
	data() {
		return {
			isLoading: true,
			error: null,
			flowGraph: {},
			sharedFlowData: null,
		}
	},
	computed: {
		slug() {
			return this.$route.params.slug
		},
	},
	mounted() {
		this.flowStore.$reset()
		this.getFlow()
	},
	methods: {
		async selectedAccountChanged(selectedAccount) {
			if (selectedAccount?.id) {
				await this.setFlow(selectedAccount)
			}
		},
		getFlow() {
			this.isLoading = true
			this.error = null
			this.$requestAdapter
				.get(apiList.chat.flow.shared.get, { slug: this.slug })
				.then(async (res) => {
					this.flowGraph = res.data.shared_flow.graph
					this.sharedFlowData = res.data.shared_flow
				})
				.catch((error) => {
					this.error = error
				})
				.finally(() => {
					this.isLoading = false
				})
			return null
		},
		async setFlow(selectedAccount) {
			const username = selectedAccount?.postAccount?.username
			const placeholderParams = extractPlaceholderParams(this.$route.query)
			const graph = applyFlowPlaceholders(JSON.parse(JSON.stringify(this.flowGraph)), placeholderParams)
			this.flowStore.flow = new Flow(processFlowObject(graph, username))
			this.flowStore.flow.sourceSharedFlow = new SharedFlow(this.sharedFlowData)
			this.flowStore.focusNode(this.flowStore.flow.nodes[0]?.uuid || null)
			this.flowStore.lockForFlowSetup = true
			await this.$router.replace({
				...this.localeRoute(this.flowStore.flow.route),
				query: { ...this.$route.query, username },
			})
		},
		goHome() {
			this.$router.replace(this.localeRoute({ name: 'index' }))
		},
	},
}
</script>
