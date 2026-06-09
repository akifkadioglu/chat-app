<template>
	<div class="bs container py-10">
		<Header
			:title="
				isEmpty
					? $t('components.chat.sidebar.accountSelector.addAccountButton')
					: $t('components.app.content.accountsTab.title')
			"
		>
			<template #actions v-if="!isEmpty">
				<button
					tabindex="0"
					class="btn btn-primary btn-transition transition-all duration-100 hover:brightness-90 py-1 flex flex-wrap items-center gap-1 ml-auto"
					@click="$emitter.emit('showAddAccountModal')"
				>
					<i class="fa fa-plus"></i>
					<span>{{ $t('components.chat.sidebar.accountSelector.addAccountButton') }}</span>
				</button>
			</template>
		</Header>
		<State :isEmpty="isEmpty">
			<div class="grid grid-cols-1 gap-4">
				<div
					v-for="account in chatAccountsStore.entities"
					:key="account.id"
					class="border border-subtle rounded-lg py-5 px-3 flex flex-col md:flex-row justify-between items-start md:items-end group"
				>
					<ProfileInformations :account="account" class="flex-1" hidePostsCount :isLinkedUsername="false" />
					<div class="w-full md:w-auto mt-4 md:mt-0">
						<localized-link
							name="account"
							class="btn btn-lg md:btn-md btn-primary btn-soft group-hover:bg-primary group-hover:text-white w-full md:w-auto"
							:query="{ username: account.postAccount.username }"
						>
							{{ $t('pages.app.index.selectAccountButton') }}
							<i class="fa fa-chevron-right link-icon" />
						</localized-link>
					</div>
				</div>
			</div>
			<template #empty>
				<div class="space-y-5">
					<RefreshPermissionButton
						purpose="login"
						iconClass="fa-brands fa-instagram fa-lg"
						:title="$t('components.app.emptyCase.connectWithInstagram')"
						titleClass=""
						class="w-full btn-transition bg-blue-500 hover:bg-blue-600 text-white font-medium text-lg py-7 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
					/>
					<!--									v-if="authStore.user?.id === 2516852"-->
					<RefreshPermissionButton
						purpose="login"
						:title="$t('components.app.emptyCase.connectWithMetaButton')"
						class="w-full btn-transition bg-transparent hover:bg-blue-600 border border-blue-500 hover:text-base-100 text-blue-500 font-medium text-lg py-7 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
						:platform="PLATFORMS.FACEBOOK"
					>
						<template #icon>
							<i class="fa-brands fa-meta" />
						</template>
					</RefreshPermissionButton>

					<div>
						<ApprovedByMeta />
					</div>
				</div>
			</template>
		</State>
	</div>
</template>
<script>
import ProfileInformations from '~/components/Accounts/OverviewTab/ProfileInformation.vue'
import LocalizedLink from '~/components/GlobalComponents/LocalizedLink.vue'
import Header from '~/components/App/ContentHeader.vue'
import State from '~/components/GlobalComponents/State.vue'
import RefreshPermissionButton from '~/components/GlobalComponents/RefreshPermissionButton.vue'
import ApprovedByMeta from '~/components/Landing/Components/ApprovedByMeta.vue'
import { PLATFORMS } from '~/models/Social.ts'

export default {
	name: 'Accounts',
	components: { ApprovedByMeta, RefreshPermissionButton, State, Header, LocalizedLink, ProfileInformations },
	emits: ['toggleDrawer'],
	setup() {
		return {
			chatAccountsStore: useChatAccountsStore(),
		}
	},
	computed: {
		isEmpty() {
			return !(this.chatAccountsStore.all && this.chatAccountsStore.all.length > 0)
		},
	},
	data() {
		return {
			PLATFORMS: PLATFORMS,
		}
	},
}
</script>

<style scoped></style>
