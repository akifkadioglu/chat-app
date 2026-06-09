<template>
	<li class="w-full sm:!max-w-96">
		<div class="gap-0 p-0 flex w-full relative">
			<input
				v-model="searchQuery"
				type="text"
				:placeholder="$t('components.contacts.header.searchPlaceholder')"
				class="pr-14 input input-sm m-0 flex-1"
				@keyup.enter="applySearch"
			/>
			<button
				v-if="searchQuery"
				class="absolute right-10 flex h-full top-0 items-center z-2 cursor-pointer"
				@click="searchQuery = ''"
			>
				<i class="fa fa-times fa-sm" />
			</button>

			<button class="absolute right-1 flex top-0 translate-y-1 btn btn-xs btn-primary z-2" @click="applySearch">
				<i class="fa fa-search" />
			</button>
		</div>
	</li>
	<CustomDropdown @hide="$refs.filterPanel?.resetSelection()">
		<li>
			<button class="btn btn-sm btn-ghost gap-2 justify-start! w-full">
				<i class="fa fa-filter" />
				<span>{{ $t('components.contacts.filterList.filter') }}</span>
				<span v-if="filterCount" class="badge badge-primary badge-sm">{{ filterCount }}</span>
			</button>
		</li>
		<template #popper>
			<div class="max-w-[95vw]" :class="{ 'w-150': !isEditing, 'w-100': isEditing }">
				<FieldFilterPanel
					ref="filterPanel"
					:customFields="allCustomFields"
					@filtersChange="onFiltersChange"
					@update:filterCount="filterCount = $event"
					@update:isEditing="isEditing = $event"
				>
					<template #tagList>
						<Collapse v-if="availableTags.length" :show-arrow="true" class="w-full">
							<template #title>
								<span>{{ $t('components.contacts.filterList.tagList') }}</span>
							</template>
							<TagBadgeList :tags="availableTags" @toggleTag="$refs.filterPanel.filterValue = $event.name" />
						</Collapse>
					</template>
				</FieldFilterPanel>
			</div>
		</template>
	</CustomDropdown>
</template>
<script>
import CustomDropdown from '~/components/GlobalComponents/CustomDropdown.vue'
import FieldFilterPanel from '~/components/GlobalComponents/FieldFilterPanel.vue'
import { getFieldTypeIcon } from '~/models/Flow/utils/utils.ts'
import { SELECTION_TYPES } from '~/models/Contact/Contact.ts'
import TagBadgeList from '~/components/Chat/ContactInfo/Partials/TagBadgeList.vue'
import Collapse from '~/components/GlobalComponents/Collapse.vue'

export default {
	components: { Collapse, TagBadgeList, CustomDropdown, FieldFilterPanel },
	props: {
		selectedContactLengths: {
			type: Number,
			default: 0,
		},
		selectionType: {
			type: String,
			default: SELECTION_TYPES.INCLUDE,
		},
	},
	emits: ['filterChange', 'deselectAll'],
	setup() {
		return {
			chatAccountsStore: useChatAccountsStore(),
			chatAccountAttributesStore: useChatAccountAttributesStore(),
		}
	},
	data() {
		return {
			searchQuery: '',
			filterCount: 0,
			isEditing: false,
		}
	},
	mounted() {
		this.searchQuery = this.$route?.query?.search || ''
	},
	computed: {
		allCustomFields() {
			let customFields = []
			if (this.chatAccountsStore.active?.id) {
				customFields = this.chatAccountsStore.active.customFields
			} else {
				customFields = this.chatAccountsStore.all.flatMap((a) => a.customFields || [])
			}
			return customFields.map((field) => ({
				key: `custom.${field.key}`,
				name: field.key,
				icon: this.getFieldTypeIcon(field.type || 'string'),
				type: field.type || 'string',
				comparisonType: field.type || 'string',
			}))
		},
		hasSelection() {
			if (this.selectedContactLengths > 0) return true
			if (this.selectionType === SELECTION_TYPES.EXCLUDE) return true
			return false
		},
		availableTags() {
			let tags = []
			if (this.chatAccountsStore.active?.id) {
				tags = this.chatAccountAttributesStore.getTagsByChatAccountId(this.chatAccountsStore.active.id) ?? []
			} else {
				tags = this.chatAccountAttributesStore.allTags
			}
			return tags.filter((tag, i, arr) => arr.findIndex((t) => t.name === tag.name) === i)
		},
	},
	watch: {
		'$route.query.search'(val) {
			this.searchQuery = val || ''
		},
	},
	methods: {
		getFieldTypeIcon,
		async onFiltersChange(filters) {
			if (this.hasSelection) {
				const confirmed = await this.confirmSelectionClear()
				if (!confirmed) return
				this.$emit('deselectAll')
			}
			this.$emit('filterChange', filters)
		},
		async confirmSelectionClear() {
			const result = await this.$swal.fire({
				title: this.$t('components.contacts.table.selectionWarning.title'),
				text: this.$t('components.contacts.table.selectionWarning.description'),
				icon: 'warning',
				showCancelButton: true,
				confirmButtonText: this.$t('components.contacts.table.selectionWarning.confirm'),
				cancelButtonText: this.$t('components.contacts.table.selectionWarning.cancel'),
			})
			return result.isConfirmed
		},
		async applySearch() {
			if (this.hasSelection) {
				const confirmed = await this.confirmSelectionClear()
				if (!confirmed) return
				this.$emit('deselectAll')
			}
			const { search, ...query } = this.$route.query
			this.$router.push({ query: { ...query, search: this.searchQuery } })
		},
	},
}
</script>
