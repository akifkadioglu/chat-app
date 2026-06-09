<template>
	<VDropdown ref="dropdown" container="#appPage" placement="bottom-start">
		<button class="btn btn-sm">
			<span class="avatar w-6">
				<img :src="activeAccount?.postAccount?.profilePicture" class="rounded-full" alt="" />
			</span>
			<span class="hidden lg:inline">
				{{ activeAccount?.postAccount?.username || $t('components.flow.selectAccount.placeholder') }}
			</span>
			<i class="fas fa-chevron-down"></i>
		</button>

		<template #popper>
			<ul class="menu bg-base-100 shadow-lg p-2" @click="$refs.dropdown?.hide()">
				<li v-for="chatAccount in allAccounts" :key="chatAccount.id" class="mb-1">
					<a @click="selectAccount(chatAccount.id)" class="p-3">
						<div class="avatar w-8">
							<img :src="chatAccount.postAccount.profilePicture" class="rounded-full" alt="" />
						</div>
						<div>
							<div>{{ chatAccount.postAccount.name }}</div>
							<div class="text-xs opacity-60">@{{ chatAccount.postAccount.username }}</div>
						</div>
					</a>
				</li>
			</ul>
		</template>
	</VDropdown>
</template>
<script>
import { Dropdown } from 'floating-vue'

export default {
	components: {
		VDropdown: Dropdown,
	},
	data() {
		return {
			flowStore: useFlowStore(),
			chatAccountsStore: useChatAccountsStore(),
		}
	},
	watch: {
		// 'chatAccountsStore.active.id'(newVal, oldVal) {
		// 	if (!newVal) {
		// 		this.flowStore.flow.chatAccountId = oldVal ?? this.chatAccountsStore.all[0].id ?? null
		// 		this.chatAccountsStore.setActive(this.flowStore.flow.chatAccountId)
		// 		return
		// 	}
		// 	this.flowStore.flow.chatAccountId = newVal
		// },
		'flowStore.flow.chatAccountId'(newVal, oldVal) {
			consoleLog("flowStore.flow.chatAccountId watcher'ı çalıştı", newVal, oldVal)
			this.chatAccountsStore.setActive(newVal)
		},
	},
	computed: {
		activeAccount() {
			if (!this.flowStore.flow.chatAccountId) return null
			return this.chatAccountsStore.byId(this.flowStore.flow.chatAccountId)
		},
		allAccounts() {
			return this.chatAccountsStore.all
		},
	},
	methods: {
		selectAccount(accountId) {
			if (this.flowStore.flow) {
				this.flowStore.flow.chatAccountId = accountId
			}
			this.$refs.dropdown?.hide()
		},
	},
	mounted() {
		if (!this.chatAccountsStore.active) {
			this.$refs.dropdown?.show()
		}
		// this.chatAccountsStore.setActive(this.flowStore.flow.chatAccountId)
	},
}
</script>
