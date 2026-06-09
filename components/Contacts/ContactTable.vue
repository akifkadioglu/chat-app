<template>
	<State>
		<VirtualScroller ref="virtualScroller" class="h-full" :list="filteredContacts">
			<template #default="{ list }">
				<table class="table table-sm">
					<thead class="sticky top-0 bg-base-100 z-1 w-full">
						<tr>
							<th class="w-10">
								<input
									type="checkbox"
									class="checkbox checkbox-sm"
									:checked="isAllSelected"
									:indeterminate="isIndeterminate"
									@change="toggleSelectAll"
								/>
							</th>
							<TableHeader
								:name="$t('components.contacts.table.columns.' + DEFAULT_COLUMNS.FIRST_NAME.key)"
								:fieldKey="DEFAULT_COLUMNS.FIRST_NAME.key"
								:sorted-by="sortedByForHeaders"
								@sort-by="sortBy"
							/>
							<TableHeader
								:name="$t('components.contacts.table.columns.' + DEFAULT_COLUMNS.LAST_NAME.key)"
								:fieldKey="DEFAULT_COLUMNS.LAST_NAME.key"
								:sorted-by="sortedByForHeaders"
								@sort-by="sortBy"
							/>
							<TableHeader
								v-if="visibleColumns[DEFAULT_COLUMNS.USERNAME.key]"
								:name="$t('components.contacts.table.columns.' + DEFAULT_COLUMNS.USERNAME.key)"
								:fieldKey="DEFAULT_COLUMNS.USERNAME.key"
								:sorted-by="sortedByForHeaders"
								@sort-by="sortBy"
							/>
							<TableHeader
								v-if="visibleColumns[DEFAULT_COLUMNS.EMAIL.key]"
								:name="$t('components.contacts.table.columns.' + DEFAULT_COLUMNS.EMAIL.key)"
								:fieldKey="DEFAULT_COLUMNS.EMAIL.key"
								:sorted-by="sortedByForHeaders"
								@sort-by="sortBy"
							/>
							<TableHeader
								v-if="visibleColumns[DEFAULT_COLUMNS.NOTES.key]"
								:name="$t('components.contacts.table.columns.' + DEFAULT_COLUMNS.NOTES.key)"
								:fieldKey="DEFAULT_COLUMNS.NOTES.key"
								:sorted-by="sortedByForHeaders"
								@sort-by="sortBy"
							/>
							<TableHeader
								v-if="visibleColumns[DEFAULT_COLUMNS.ADDRESS.key]"
								:name="$t('components.contacts.table.columns.' + DEFAULT_COLUMNS.ADDRESS.key)"
								:fieldKey="DEFAULT_COLUMNS.ADDRESS.key"
								:sorted-by="sortedByForHeaders"
								@sort-by="sortBy"
							/>
							<TableHeader
								v-if="visibleColumns[DEFAULT_COLUMNS.PHONE.key]"
								:name="$t('components.contacts.table.columns.' + DEFAULT_COLUMNS.PHONE.key)"
								:fieldKey="DEFAULT_COLUMNS.PHONE.key"
								:sorted-by="sortedByForHeaders"
								@sort-by="sortBy"
							/>
							<TableHeader
								v-if="visibleColumns[DEFAULT_COLUMNS.TIMEZONE.key]"
								:name="$t('components.contacts.table.columns.' + DEFAULT_COLUMNS.TIMEZONE.key)"
								:fieldKey="DEFAULT_COLUMNS.TIMEZONE.key"
								:sorted-by="sortedByForHeaders"
								@sort-by="sortBy"
							/>
							<template v-for="customField in filteredCustomFields" :key="`custom.${customField.key}`">
								<TableHeader
									v-if="visibleColumns[`custom.${customField.key}`]"
									:name="customField.key"
									:fieldKey="`custom.${customField.key}`"
									:sorted-by="sortedByForHeaders"
									@sort-by="sortBy"
								/>
							</template>
							<th />
						</tr>
					</thead>
					<tbody v-if="list">
						<ContactRow
							v-for="contact in list"
							:key="contact.data.id"
							:class="{ 'bg-subtle': contact.data.index % 2 === 0 }"
							:filteredCustomFields="filteredCustomFields"
							:contact="contact.data"
							:visibleColumns="visibleColumns"
							:isSelected="isContactSelected(contact.data.id)"
							@selectContactId="selectContactId"
							@toggleSelect="toggleSelectContact"
						/>
					</tbody>
				</table>
			</template>
			<template #pagination>
				<Pagination
					:current-page="currentSlice.currentPage"
					:has-more="currentSlice.hasMore"
					:loading="currentSlice.loading"
					:infinite-scroll="true"
					@page-change="debouncedGetAllContacts"
				/>
			</template>
		</VirtualScroller>
	</State>
</template>

<script>
import Pagination from '~/components/GlobalComponents/Pagination.vue'
import ContactRow from '~/components/Contacts/ContactRow.vue'
import TableHeader from '~/components/Contacts/TableHeader.vue'
import debounce from 'lodash/debounce.js'
import { DEFAULT_COLUMNS, SELECTION_TYPES } from '~/models/Contact/Contact.js'
import { useContactsStore } from '~/stores/contacts.js'
import { useChatAccountsStore } from '~/stores/chatAccounts.js'
import { useChatAccountAttributesStore } from '~/stores/chatAccountAttributes'
import State from '~/components/GlobalComponents/State.vue'
import VirtualScroller from '~/components/GlobalComponents/VirtualScroller.vue'
import FilterMixin from '~/mixins/FilterMixin.js'

export default {
	mixins: [FilterMixin],
	components: {
		VirtualScroller,
		State,
		TableHeader,
		ContactRow,
		Pagination,
	},
	props: {
		visibleColumns: {
			type: Object,
			required: true,
		},
		selectedContactIds: {
			type: Array,
			default: () => [],
		},
		selectionType: {
			type: String,
			default: SELECTION_TYPES.INCLUDE,
		},
	},
	emits: ['selectContactId', 'toggleSelect', 'selectAll', 'deselectAll'],
	setup() {
		return {
			chatAccountsStore: useChatAccountsStore(),
			contactsStore: useContactsStore(),
			chatAccountAttributesStore: useChatAccountAttributesStore(),
		}
	},
	data() {
		return {
			DEFAULT_COLUMNS,
			debouncedGetAllContacts: null,
			searchQuery: '',
		}
	},
	mounted() {
		this.searchQuery = this.$route.query.search || ''
		this.getAllContacts()
		this.debouncedGetAllContacts = debounce(($event) => this.getAllContacts($event), 500)
	},
	watch: {
		'$route.query': {
			handler() {
				this.searchQuery = this.$route.query.search || ''
				this.debouncedGetAllContacts()
			},
			deep: true,
		},
		'chatAccountsStore.active.id'() {
			this.$refs.virtualScroller.scrollToTop()
		},
	},
	computed: {
		sortedByForHeaders() {
			const sortBy = this.$route.query.sort_by
			const sortDirection = this.$route.query.sort_direction
			if (!sortBy || !['asc', 'desc'].includes(sortDirection)) return {}
			return { [sortBy]: sortDirection }
		},
		activeFilters() {
			return this.parseFiltersFromQuery(this.$route?.query || {})
		},
		filteredContacts() {
			const scopeKey = this.contactsStore.currentScopeKey
			let contacts = this.contactsStore.contactsForScope(scopeKey)

			const searchQuery = this.searchQuery?.trim()?.toLowerCase()
			const hasSearch = !!searchQuery
			const hasFilters = this.activeFilters.length > 0

			if (hasSearch || hasFilters) {
				contacts = contacts.filter((contact) => {
					// Search match
					let searchMatch = true
					if (hasSearch) {
						const basicMatch =
							contact.firstName?.toLowerCase().includes(searchQuery) ||
							contact.lastName?.toLowerCase().includes(searchQuery) ||
							contact.email?.toLowerCase().includes(searchQuery) ||
							contact.phone?.toLowerCase().includes(searchQuery) ||
							contact.notes?.toLowerCase().includes(searchQuery) ||
							contact.address?.toLowerCase().includes(searchQuery) ||
							contact.timezone?.toLowerCase().includes(searchQuery) ||
							contact.platformAccountsInstagram?.username?.toLowerCase().includes(searchQuery)

						const customFieldMatch = contact.customFieldsValues?.some((cf) =>
							cf.value?.toString().toLowerCase().includes(searchQuery),
						)

						searchMatch = basicMatch || customFieldMatch
					}

					// Filter match
					let filterMatch = true
					if (hasFilters) {
						filterMatch = this.activeFilters.every((filter) => this.matchesFilter(contact, filter))
					}

					return searchMatch && filterMatch
				})
			}

			const sortBy = this.$route.query.sort_by
			const sortDirection = this.$route.query.sort_direction
			if (sortBy && ['asc', 'desc'].includes(sortDirection)) {
				contacts = [...contacts].sort((a, b) => {
					const aVal = this.getContactFieldValue(a, sortBy)?.toString().toLowerCase() || ''
					const bVal = this.getContactFieldValue(b, sortBy)?.toString().toLowerCase() || ''
					const comparison = aVal.localeCompare(bVal, undefined, { numeric: true })
					return sortDirection === 'asc' ? comparison : -comparison
				})
			}

			return contacts.map((contact, i) => ({
				...contact,
				index: i,
			}))
		},
		filteredContactIds() {
			return this.filteredContacts.map((c) => c.id)
		},
		isAllSelected() {
			if (this.filteredContactIds.length === 0) return false
			// exclude modunda: selectedContactIds boşsa tümü seçili
			// include modunda: tüm id'ler selectedContactIds'de ise tümü seçili
			if (this.selectionType === SELECTION_TYPES.EXCLUDE) {
				return this.selectedContactIds.length === 0
			}
			return this.filteredContactIds.every((id) => this.selectedContactIds.includes(id))
		},
		isIndeterminate() {
			if (this.filteredContactIds.length === 0) return false
			if (this.selectionType === SELECTION_TYPES.EXCLUDE) {
				return this.selectedContactIds.length > 0 && this.selectedContactIds.length < this.filteredContactIds.length
			}
			const selectedCount = this.filteredContactIds.filter((id) => this.selectedContactIds.includes(id)).length
			return selectedCount > 0 && selectedCount < this.filteredContactIds.length
		},
		filteredCustomFields() {
			if (this.chatAccountsStore.active) {
				return this.chatAccountsStore.active.customFields || []
			}
			return this.chatAccountsStore.all.flatMap((a) => a.customFields || [])
		},
		currentSlice() {
			const scopeKey = this.contactsStore.currentScopeKey
			return this.contactsStore.slices[scopeKey] || {}
		},
	},
	methods: {
		isContactSelected(contactId) {
			const isInList = this.selectedContactIds.includes(contactId)
			return this.selectionType === SELECTION_TYPES.EXCLUDE ? !isInList : isInList
		},
		getContactTagNames(contact) {
			const contactTagIds = contact.tagValues?.map((tag) => tag.tagId) || []
			const allTags = Object.values(this.chatAccountAttributesStore.tags).flat()
			return allTags.filter((tag) => contactTagIds.includes(tag.id)).map((tag) => tag.name)
		},
		getContactFieldValue(contact, fieldKey) {
			if (fieldKey.startsWith('custom.') || fieldKey.startsWith('custom_')) {
				const customFieldKey = fieldKey.startsWith('custom.')
					? fieldKey.replace('custom.', '')
					: fieldKey.replace('custom_', '')
				const customField = Object.values(this.chatAccountAttributesStore.customFields)
					.flat()
					.find((cf) => cf.key === customFieldKey)

				const customFieldValue = contact.customFieldsValues?.find((cf) => cf.customFieldId === customField?.id)
				return customFieldValue?.value?.toString() || ''
			}

			if (fieldKey === 'tag') {
				return this.getContactTagNames(contact).join(',')
			}

			if (fieldKey === 'ig.opted_in') {
				return contact.isAnswerable !== null ? contact.isAnswerable.toString() : ''
			}

			if (fieldKey.startsWith('ig.')) {
				const igField = fieldKey.replace('ig.', '')
				const ig = contact.platformAccountsInstagram
				if (!ig) return ''

				const fieldMap = {
					username: ig.username,
					followers_count: ig.followersCount,
					is_verified: ig.isVerified,
					is_private: ig.isPrivate,
					follows_account: ig.followsAccount,
				}
				const value = fieldMap[igField]
				return value !== undefined && value !== null ? value.toString() : ''
			}

			if (fieldKey === 'username') {
				return contact.platformAccountsInstagram?.username || ''
			}
			if (fieldKey === 'first_name') {
				return contact.firstName || ''
			}
			if (fieldKey === 'last_name') {
				return contact.lastName || ''
			}
			if (fieldKey === 'email') {
				return contact.email || ''
			}
			if (fieldKey === 'notes') {
				return contact.notes || ''
			}
			if (fieldKey === 'address') {
				return contact.address || ''
			}
			if (fieldKey === 'phone') {
				return contact.phone || ''
			}
			if (fieldKey === 'timezone') {
				return contact.timezone || ''
			}
			return ''
		},
		matchesFilter(contact, filter) {
			if (filter.field === 'tag') {
				const tagNames = this.getContactTagNames(contact)
				if (filter.operator === 'has') {
					return tagNames.some((name) => name.toLowerCase() === filter.value.toLowerCase())
				}
				if (filter.operator === 'not_has') {
					return !tagNames.some((name) => name.toLowerCase() === filter.value.toLowerCase())
				}
			}

			const contactValue = this.getContactFieldValue(contact, filter.field) || ''
			return this.evaluateOperator(contactValue, filter.operator, filter.value)
		},
		selectContactId($event) {
			this.$emit('selectContactId', $event)
		},
		toggleSelectContact(contactId) {
			this.$emit('toggleSelect', contactId)
		},
		toggleSelectAll() {
			if (this.isAllSelected) {
				this.$emit('deselectAll', this.filteredContactIds)
				return
			}
			this.$emit('selectAll', this.filteredContactIds)
		},
		updateSortInRoute(key, type) {
			const query = { ...this.$route.query }
			if (type === 'normal' || !type) {
				delete query.sort_by
				delete query.sort_direction
			} else {
				query.sort_by = key
				query.sort_direction = type
			}
			this.$router.replace({ query })
		},
		sortBy(key) {
			let type
			const currentType = this.sortedByForHeaders[key]
			switch (currentType) {
				case 'asc':
					type = 'desc'
					break
				case 'desc':
					type = 'normal'
					break
				case 'normal':
					type = 'asc'
					break
				default:
					type = 'asc'
			}
			this.updateSortInRoute(key, type)
		},
		async getAllContacts(page = 1) {
			if (page === 1) this.currentSlice.currentPage = 0

			const filters = {}
			if (this.searchQuery.trim()) filters.search = this.searchQuery.trim()

			if (this.activeFilters.length) {
				filters.filters = this.activeFilters.map((f) => ({
					field: f.field,
					operator: f.operator,
					value: f.value,
				}))
			}

			const scopeKey = this.contactsStore.currentScopeKey

			await this.contactsStore.fetchContacts(scopeKey, page, filters).catch((err) => {
				consoleLog('Contacts fetch error:', err)
			})
		},
	},
}
</script>
