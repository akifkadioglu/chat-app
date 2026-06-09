import apiList from '~/apis/ApiList'
import { Team } from '~/models/Team/Team'

export const useTeamStore = defineStore('team', {
	state: () => ({
		team: null as Team | null,
		pendingInvitation: null as any,
		loading: false,
		error: null as Error | null,
		inflight: null as Promise<void> | null,
	}),
	getters: {
		teamMembers: (state) => state.team?.teamUsers.filter((tu) => tu.userId) || [],
	},
	actions: {
		async fetchTeam(force = false) {
			if (this.inflight && !force) return this.inflight

			this.loading = true
			this.error = null
			const requestAdapter = useRequestAdapter()

			this.inflight = requestAdapter
				.get(apiList.account.team.index)
				.then((response: any) => {
					this.team = response.data.team ? new Team(response.data.team) : null
					this.pendingInvitation = response.data.invitation || null
				})
				.catch((err: any) => {
					this.team = null
					this.pendingInvitation = null
					this.error = err
				})
				.finally(() => {
					this.loading = false
					this.inflight = null
				})

			return this.inflight
		},
	},
})
