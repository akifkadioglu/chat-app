<template>
	<div class="flex items-center gap-1">
		<!-- Quick Filter Dropdown -->
		<CustomDropdown ref="quickDropdown">
			<button class="btn btn-sm btn-ghost gap-2">
				<i :class="activeQuickOption.icon" />
				{{ $t('components.moderate.commentFilterDropdown.' + activeQuickOption.key) }}

				<i class="fa fa-chevron-down" />
			</button>
			<template #popper>
				<ul class="menu menu-sm bg-base-100 w-48 p-1">
					<li v-for="option in quickFilterOptions" :key="option.key">
						<a
							@click="selectQuickFilter(option.key)"
							:class="{ 'bg-base-200': quickFilter === option.key }"
							class="flex items-center gap-2 text-sm"
						>
							<i :class="option.icon" class="w-4 text-center" />
							{{ $t('components.moderate.commentFilterDropdown.' + option.key) }}
						</a>
					</li>
				</ul>
			</template>
		</CustomDropdown>

		<!-- Field Filter Dropdown -->
		<CustomDropdown ref="fieldDropdown" @hide="$refs.panel?.resetSelection()">
			<button class="btn btn-sm btn-ghost btn-square">
				<div class="relative">
					<i class="fa fa-filter text-xs" />
					<span v-if="filterCount" class="badge badge-primary badge-xs absolute -top-2 -right-3">
						{{ filterCount }}
					</span>
				</div>
			</button>
			<template #popper>
				<div class="max-w-[95vw]" :class="{ 'w-100': isEditing, 'w-120': !isEditing }">
					<FieldFilterPanel
						ref="panel"
						showCommentFields
						:customFields="allCustomFields"
						@update:filterCount="filterCount = $event"
						@update:isEditing="isEditing = $event"
					/>
				</div>
			</template>
		</CustomDropdown>
	</div>
</template>

<script>
import CustomDropdown from '~/components/GlobalComponents/CustomDropdown.vue'
import FieldFilterPanel from '~/components/GlobalComponents/FieldFilterPanel.vue'

export default {
	name: 'CommentFilterDropdown',
	components: { CustomDropdown, FieldFilterPanel },
	setup() {
		return {
			chatAccountsStore: useChatAccountsStore(),
		}
	},
	data() {
		return {
			filterCount: 0,
			isEditing: false,
		}
	},
	computed: {
		quickFilterOptions() {
			return [
				{ key: 'all', icon: 'fa fa-comments' },
				{ key: 'unconfirmed', icon: 'fa fa-clock' },
				{ key: 'confirmed', icon: 'fa fa-check-circle' },
				{ key: 'hidden', icon: 'fa fa-eye-slash' },
				{ key: 'has_reply', icon: 'fa fa-reply' },
			]
		},
		quickFilter() {
			return this.$route.query.status || 'all'
		},
		activeQuickOption() {
			return this.quickFilterOptions.find((o) => o.key === this.quickFilter) || this.quickFilterOptions[0]
		},
		allCustomFields() {
			let accounts = this.chatAccountsStore.all
			if (this.chatAccountsStore.active) {
				accounts = [this.chatAccountsStore.active]
			}
			const seen = new Set()
			return accounts
				.flatMap((account) => account.customFields || [])
				.filter((field) => {
					if (seen.has(field.key)) return false
					seen.add(field.key)
					return true
				})
				.map((field) => ({
					key: `custom.${field.key}`,
					name: field.key,
					icon: 'fa fa-tag',
					type: field.type || 'string',
					comparisonType: field.type || 'string',
				}))
		},
	},
	methods: {
		selectQuickFilter(key) {
			const query = { ...this.$route.query }
			if (key === 'all') {
				delete query.status
			} else {
				query.status = key
			}
			this.$router.push({ query })
			this.$refs.quickDropdown.hide()
		},
	},
}
</script>
