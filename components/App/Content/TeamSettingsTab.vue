<template>
	<div class="bs container py-10">
		<State :isLoading="teamStore.loading">
			<Header :title="$t('components.app.content.teamSettingsTab.title')" />

			<div class="flex items-center gap-3 p-3 rounded-lg bg-base-200/50 mb-5">
				<div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
					<i class="fa fa-users text-primary" />
				</div>
				<div class="min-w-0 flex-1">
					<div class="font-semibold truncate">{{ teamStore.team.name }}</div>
					<div class="text-xs text-muted">{{ teamStore.teamMembers.length }} üye</div>
				</div>
			</div>

			<TeamSettings class="mt-4" />
		</State>
	</div>
</template>
<script>
import Header from '~/components/App/ContentHeader.vue'
import TeamSettings from '~/components/App/TeamSettings.vue'
import State from '~/components/GlobalComponents/State.vue'

export default {
	components: {
		State,
		Header,
		TeamSettings,
	},
	setup() {
		return {
			auth: useAuthStore(),
			teamStore: useTeamStore(),
		}
	},
	emits: ['toggleDrawer'],
	computed: {
		currentTeamUser() {
			if (!this.teamStore.team?.id || !this.auth?.user) return null
			return this.teamStore.team.teamUsers?.find((tu) => tu.userId === this.auth.user.id) || null
		},
	},
}
</script>

<style scoped></style>
