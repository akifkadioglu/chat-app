<template>
	<div class="max-w-5xl mx-auto px-5 space-y-6">
		<ActivityTable
			:activities="activities"
			:loading="loading"
			:current-page="currentPage"
			:has-more="hasMore"
			@load-more="fetchActivities"
		/>
		<State
			v-if="!loading && activities.length === 0"
			:isEmpty="true"
			:emptyTitle="$t('components.accounts.activitiesTab.emptyTitle')"
			:emptyContent="$t('components.accounts.activitiesTab.emptyContent')"
		/>
	</div>
</template>

<script>
import apiList from '~/apis/ApiList'
import { Activity } from '~/models/Activity'
import ActivityTable from '~/components/Accounts/ActivitiesTab/ActivityTable.vue'
import State from '~/components/GlobalComponents/State.vue'

export default {
	components: { State, ActivityTable },
	data() {
		return {
			activities: [],
			loading: true,
			currentPage: 1,
			nextCursor: null,
			hasMore: true,
		}
	},
	computed: {
		chatAccountId() {
			return useChatAccountsStore().active?.id
		},
	},
	mounted() {
		this.fetchActivities(1)
	},
	methods: {
		fetchActivities(page) {
			this.loading = true
			const query = {}
			if (page > 1 && this.nextCursor) {
				query.cursor = this.nextCursor
			}
			this.$requestAdapter
				.get(apiList.chat.instagram.chatAccountId.activities.get, {
					chatAccountId: this.chatAccountId,
					query,
				})
				.then((response) => {
					const newActivities = response.data.data.map((a) => new Activity(a))
					this.activities = page === 1 ? newActivities : [...this.activities, ...newActivities]
					this.currentPage = page
					this.nextCursor = response.data.next_cursor
					this.hasMore = !!response.data.next_page_url
				})
				.catch((err) => consoleLog(err))
				.finally(() => (this.loading = false))
		},
	},
}
</script>
