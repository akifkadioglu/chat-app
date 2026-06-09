<template>
	<CustomDropdown ref="assigneeDropdown">
		<slot name="triggerButton">
			<button :class="triggerClass">
				<span class="flex flex-1">
					<slot name="triggerIcon" />
					<span v-if="selectedAssignedUser && !onlyPlaceholder">{{ selectedAssignedUser.user.name }}</span>
					<span v-else>{{ placeholder || $t('components.chat.sidebar.conversationList.selectAssignee') }}</span>
				</span>
				<i class="fa fa-chevron-down text-xs" />
			</button>
		</slot>
		<template #popper>
			<ul class="menu menu-sm bg-base-100 w-56 p-1">
				<li v-for="user in teamUsers" :key="user.id">
					<a
						@click="handleSelectAssignee(user.userId)"
						:class="{ 'bg-base-200 pointer-events-none': selectedAssignedUserId == user.userId }"
					>
						<i class="fa fa-user text-muted" />
						{{ user.user.name }}
					</a>
				</li>
			</ul>
		</template>
	</CustomDropdown>
</template>
<script>
import CustomDropdown from '~/components/GlobalComponents/CustomDropdown.vue'
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'

export default {
	name: 'TeamUsersDropdown',
	components: { LoadingElement, CustomDropdown },
	props: {
		triggerClass: {
			type: String,
			default: 'btn btn-sm w-full justify-between',
		},
		showUserIcon: {
			type: Boolean,
			default: false,
		},
		selectedAssignedUserId: {
			type: [String, Number, null],
			default: null,
		},
		placeholder: {
			type: String,
			default: '',
		},
		onlyPlaceholder: {
			type: Boolean,
			default: false,
		},
	},
	emits: ['change'],
	setup() {
		return {
			teamStore: useTeamStore(),
		}
	},
	computed: {
		teamUsers() {
			return this.teamStore.teamMembers
		},
		selectedAssignedUser() {
			return this.teamUsers.find((u) => u.userId == this.selectedAssignedUserId)
		},
	},
	methods: {
		handleSelectAssignee(userId) {
			if (this.selectedAssignedUserId === userId) return
			this.$emit('change', userId)
			this.$refs.assigneeDropdown?.hide()
		},
	},
}
</script>

<style scoped></style>
