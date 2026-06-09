<template>
	<AppLayout
		ref="appLayout"
		trailing-show-size="2xl"
		contentHeaderInnerClasses="!min-h-15"
		:hideFooter="selectedContactIds.length > 0 || selectionType === SELECTION_TYPES.EXCLUDE"
	>
		<!--		trailing-width-classes="w-4/5 max-w-96 xl:w-96 2xl:w-96"-->
		<template #contentHeader>
			<ContactHeader
				:visibleColumns="visibleColumns"
				:selectedContactIds="selectedContactIds"
				:selectionType="selectionType"
				@toggleColumn="toggleColumn"
				@deselectAll="deselectAllContacts(selectedContactIds)"
			/>
		</template>

		<ContactTable
			:visibleColumns="visibleColumns"
			:selectedContactIds="selectedContactIds"
			:selectionType="selectionType"
			@selectContactId="selectContactId"
			@toggleSelect="toggleSelectContact"
			@selectAll="selectAllContacts"
			@deselectAll="deselectAllContacts"
		/>

		<ContactFooter
			v-if="selectionType === SELECTION_TYPES.EXCLUDE || selectedContactIds.length > 0"
			:key="chatAccountsStore.active?.id"
			:selectedContactIds="selectedContactIds"
			:selectionType="selectionType"
			@done="deselectAllContacts"
		/>

		<template #trailingContent>
			<State
				:is-empty="!selectedContact?.id"
				:empty-title="$t('pages.app.contacts.emptyState.title')"
				:empty-content="$t('pages.app.contacts.emptyState.content')"
				empty-img-url="/images/icon.png"
			>
				<ContactInfoContent
					v-if="selectedContact?.id"
					:key="selectedContact?.id"
					@selectContactId="clearContact"
					:contactId="selectedContact?.id"
					:chatAccountId="selectedContact?.chatAccountId"
				/>
			</State>
		</template>
	</AppLayout>
</template>

<script>
import ContactHeader from '~/components/Contacts/ContactHeader.vue'
import ContactTable from '~/components/Contacts/ContactTable.vue'
import ContactInfoContent from '~/components/Chat/ContactInfo/ContactInfoContent.vue'
import State from '~/components/GlobalComponents/State.vue'
import { DEFAULT_COLUMNS, SELECTION_TYPES } from '~/models/Contact/Contact.ts'
import ContactFooter from '~/components/Contacts/ContactFooter.vue'

export default {
	components: {
		ContactFooter,
		State,
		ContactInfoContent,
		ContactHeader,
		ContactTable,
	},
	setup() {
		definePageMeta({
			layout: 'app',
			middleware: ['auth-custom'],
		})
		return {
			contactsStore: useContactsStore(),
			chatAccountsStore: useChatAccountsStore(),
			chatAccountAttributesStore: useChatAccountAttributesStore(),
		}
	},
	watch: {
		'chatAccountsStore.active.id'() {
			this.deselectAllContacts()
		},
	},
	data() {
		return {
			SELECTION_TYPES,
			columnPreferences: {},
			selectedContact: null,
			selectedContactIds: [],
			selectionType: SELECTION_TYPES.INCLUDE,
		}
	},
	// beforeMount() {
	// 	this.contactsStore.clearStore()
	// }
	computed: {
		visibleColumns: {
			get() {
				const defaultColumns = {
					[DEFAULT_COLUMNS.FIRST_NAME.key]: true,
					[DEFAULT_COLUMNS.LAST_NAME.key]: true,
					[DEFAULT_COLUMNS.USERNAME.key]: true,
					[DEFAULT_COLUMNS.EMAIL.key]: true,
					[DEFAULT_COLUMNS.NOTES.key]: true,
					[DEFAULT_COLUMNS.ADDRESS.key]: true,
					[DEFAULT_COLUMNS.PHONE.key]: true,
					[DEFAULT_COLUMNS.TIMEZONE.key]: true,
				}
				let customFields = []
				if (this.chatAccountsStore.active?.id) {
					customFields = this.chatAccountsStore.active.customFields
				} else {
					customFields = Object.values(this.chatAccountAttributesStore.customFields).flat()
				}
				const customFieldColumns = {}
				customFields.forEach((field) => {
					customFieldColumns[`custom.${field.key}`] = this.columnPreferences[`custom.${field.key}`] ?? true
				})

				return {
					...defaultColumns,
					...customFieldColumns,
					...this.columnPreferences,
				}
			},
			set(val) {
				this.columnPreferences = val
			},
		},
	},
	mounted() {
		this.loadColumnPreferences()
	},
	methods: {
		clearContact() {
			this.$emitter.emit('hideTrailingDrawer')
			this.selectedContact = null
		},
		selectContactId(contactId) {
			this.selectedContact = this.contactsStore.getContactById(contactId)
			this.$emitter.emit('openTrailingDrawer')
		},
		toggleColumn(key) {
			this.columnPreferences[key] = !this.visibleColumns[key]
			this.saveColumnPreferences()
		},
		toggleSelectContact(contactId) {
			const index = this.selectedContactIds.indexOf(contactId)
			if (index === -1) {
				this.selectedContactIds.push(contactId)
			} else {
				this.selectedContactIds.splice(index, 1)
			}
		},
		selectAllContacts(contactIds) {
			this.selectionType = SELECTION_TYPES.EXCLUDE
			this.selectedContactIds = []
		},
		deselectAllContacts(contactIds) {
			this.selectionType = SELECTION_TYPES.INCLUDE
			this.selectedContactIds = []
		},
		saveColumnPreferences() {
			localStorage.setItem('contacts-visible-columns', JSON.stringify(this.visibleColumns))
		},
		loadColumnPreferences() {
			try {
				const saved = localStorage.getItem('contacts-visible-columns')
				if (saved) {
					this.columnPreferences = JSON.parse(saved)
				}
			} catch {
				localStorage.removeItem('contacts-visible-columns')
			}
		},
	},
}
</script>
