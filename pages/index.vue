<template>
	<div class="flex flex-col h-full">
		<div class="max-w-3xl w-full p-4 mx-auto">
			<div class="flex items-center justify-between border-b border-subtle h-15 px-3 gap-4">
				<!-- User Info -->
				<div class="min-w-0">
					<div class="font-medium text-lg truncate leading-tight">{{ user?.name }}</div>
					<div class="text-muted truncate leading-tight">{{ user?.email }}</div>
				</div>

				<!-- Team Info -->
			</div>
			<div class="tabs tabs-border">
				<label class="tab gap-2">
					<input type="radio" v-model="activeDrawer" :value="MENU_PAGES.ACCOUNTS.key" :name="tabName" />
					<i :class="MENU_PAGES.ACCOUNTS.iconClass" />
					{{ $t('components.app.content.accountsTab.title') }}
				</label>
				<div class="tab-content bg-base-100 border-none p-6">
					<Accounts v-if="activeDrawer === MENU_PAGES.ACCOUNTS.key" />
				</div>

				<label
					class="tab gap-2"
					:class="{
						'tab-disabled': teamStore.loading || !teamStore.team?.id,
					}"
				>
					<input type="radio" v-model="activeDrawer" :value="MENU_PAGES.TEAM_SETTINGS.key" :name="tabName" />
					<LoadingElement :isLoading="teamStore.loading" size="16">
						<i :class="MENU_PAGES.TEAM_SETTINGS.iconClass" />
					</LoadingElement>
					{{ $t('components.app.content.teamSettingsTab.title') }}
				</label>
				<div class="tab-content bg-base-100 border-none p-6">
					<TeamSettingsPage v-if="activeDrawer === MENU_PAGES.TEAM_SETTINGS.key" />
				</div>

				<a
					:href="$mergeDomainNPath(runtimeConfig.public.simpliersUrl, $t('pages.app.teamPath'))"
					target="_blank"
					class="tab gap-2"
				>
					<i class="fa fa-users" />
					Ekip
					<i class="fa fa-external-link link-icon" />
				</a>
			</div>
		</div>
		<AppFooter />
	</div>
</template>
<script>
import ProfileInformations from '~/components/Accounts/OverviewTab/ProfileInformation.vue'
import LocalizedLink from '~/components/GlobalComponents/LocalizedLink.vue'
import SelectAccountModal from '~/components/Flow/SelectAccountModal.vue'
import Accounts from '~/components/App/Content/AccountsTab.vue'
import TeamSettingsPage from '~/components/App/Content/TeamSettingsTab.vue'
import State from '~/components/GlobalComponents/State.vue'
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'

const MENU_PAGES = {
	ACCOUNTS: {
		key: 'accounts',
		iconClass: 'fa fa-at',
	},
	TEAM_SETTINGS: {
		key: 'teamSettings',
		iconClass: 'fa fa-users-gear',
	},
}
export default {
	components: {
		LoadingElement,
		State,
		TeamSettingsPage,
		Accounts,
		SelectAccountModal,
		LocalizedLink,
		ProfileInformations,
	},
	setup() {
		definePageMeta({
			layout: 'app',
			middleware: ['auth-custom'],
		})
		usePageMeta({
			titlePath: 'headers.index.title',
			descPath: 'headers.index.description',
			meta: [
				{
					property: 'og:image',
					content: useNuxtApp().$mergeDomainNPath(useRuntimeConfig().public.baseUrl, '/images/icon.png'),
				},
			],
		})
		return {
			chatAccountsStore: useChatAccountsStore(),
			teamStore: useTeamStore(),
			authStore: useAuthStore(),
			runtimeConfig: useRuntimeConfig(),
		}
	},
	data() {
		return {
			MENU_PAGES,
			activeDrawer: MENU_PAGES.ACCOUNTS.key,
			tabName: `tab-${useId()}`,
		}
	},
	computed: {
		user() {
			return this.authStore.user
		},
	},
	mounted() {
		this.teamStore.fetchTeam()
	},
}
</script>

<style scoped></style>
