import { defineStore } from 'pinia'
import { useChatAccountsStore } from './chatAccounts'
import { Contact, SELECTION_TYPES } from '~/models/Contact/Contact'
import apiList from '~/apis/ApiList'
import { CustomFieldPivot } from '~/models/Contact/CustomField'
import { TagPivot } from '~/models/Contact/Tag'

const scopeName = (id: number | null): string => {
	return id ? `chatAccount-${id}` : 'all'
}

const createDefaultSlice = () => ({
	ids: [],
	currentPage: 0,
	hasMore: true,
	loading: false,
	lastFetchedAt: undefined,
	total: 0,
})

export const useContactsStore = defineStore('contacts', {
	state: (): {
		entities: Record<string, Contact>
		sortedContactIds: string[]
		activeEntityId: string | null
		slices: Record<
			string,
			{
				ids: string[]
				currentPage: number
				hasMore: boolean
				loading: boolean
				lastFetchedAt?: number
				total: number
			}
		>
		inflight: Record<string, Promise<void>>
		ttlMs: number
	} => ({
		entities: {},
		sortedContactIds: [],
		activeEntityId: null,
		slices: {},
		inflight: {},
		ttlMs: 60_000,
	}),
	getters: {
		currentScopeKey: (s) => {
			const chatAccountsStore = useChatAccountsStore()
			const activeChatAccount = chatAccountsStore.active
			return scopeName(activeChatAccount?.id ?? null)
		},
		scopeKeys: (s): string[] => Object.keys(s.slices),
		currentScopeSlice: (s) => {
			const key = s.currentScopeKey
			if (!s.slices[key]) {
				s.slices[key] = createDefaultSlice()
			}
			return s.slices[key]
		},
		scopeSlice: (s) => (scopeKey: string) => s.slices[scopeKey] ?? null,
		contactsForScope:
			(s) =>
			(scopeKey: string): Contact[] => {
				// Eğer scopeKey "all" ise tüm contact'ları döndür
				if (scopeKey === 'all') {
					return s.sortedContactIds.map((id) => s.entities[id]).filter(Boolean)
				}

				const slice = s.slices[scopeKey]
				if (!slice) return []

				// Belirli scope için filtrelenmiş contact'ları döndür
				return s.sortedContactIds
					.filter((id) => slice.ids.includes(id))
					.map((id) => s.entities[id])
					.filter(Boolean)
			},
		getCustomFields: (s) => (contactId: string) => {
			const contact = s.entities[contactId]
			return contact?.customFields || []
		},
		getContactById: (s) => (contactId: number) => s.entities[contactId] || null,
		getCustomFieldsByContactIdAndCustomFieldId: (s) => (contactId: number, customFieldId: number) =>
			s.entities[contactId].customFieldsValues?.find((cf) => cf.customFieldId === customFieldId) || null,
	},
	actions: {
		async fetchContacts(
			scopeKey: string,
			page: number = 1,
			filters?: { tag?: string; search?: string; sort_by?: string; sort_direction?: string },
		) {
			if (!this.slices[scopeKey]) {
				this.slices[scopeKey] = createDefaultSlice()
			}

			const slice = this.slices[scopeKey]
			slice.loading = true
			const requestAdapter = useRequestAdapter()
			await requestAdapter
				.post(apiList.chat.instagram.contacts.get, {
					page,
					...filters,
					chatAccountId: scopeKey.split('-')[1],
				})
				.then((response: any) => {
					// if (page === 1) {
					// 	this.clearStore()
					// }
					const allContacts = response.data.data.map((contact: any) => {
						this.upsert(contact)
						return this.getContactById(contact.id)
					})

					allContacts.forEach((contact: Contact) => {
						this.entities[contact.id] = contact

						// if (!slice.ids.includes(contact.id.toString())) {
						// 	slice.ids.push(contact.id.toString())
						// }

						if (!this.sortedContactIds.includes(contact.id.toString())) {
							this.sortedContactIds.push(contact.id.toString())
							this.sortedContactIds.sort((a, b) => Number(b) - Number(a))
						}

						const contactScopeKey = scopeName(contact.chatAccountId)
						if (!this.slices[contactScopeKey]) {
							this.slices[contactScopeKey] = createDefaultSlice()
						}
						this.slices[contactScopeKey].ids.push(contact.id.toString())
					})
					if (!this.slices[scopeKey]) {
						this.slices[scopeKey] = createDefaultSlice()
					}
					this.slices[scopeKey].currentPage = response.data.current_page
					this.slices[scopeKey].hasMore = !!response.data.next_page_url
					this.slices[scopeKey].lastFetchedAt = Date.now()
					this.slices[scopeKey].total = response.data.total
				})
				.catch((error) => {
					console.error('Contacts fetch error:', error)
					throw error
				})
				.finally(() => {
					slice.loading = false
				})
		},

		async fetchContact(chatAccountId: number, contactId: number, useInflight = true) {
			const now = Date.now()
			const existing = this.entities[contactId]

			if (useInflight && existing && existing.fetchedAt && now - existing.fetchedAt < this.ttlMs) {
				return Promise.resolve(existing)
			}

			if (useInflight && !!this.inflight[contactId]) {
				return this.inflight[contactId]
			}

			const requestAdapter = useRequestAdapter()
			const request = requestAdapter
				.get(apiList.chat.instagram.chatAccountId.contacts.get, {
					slug: contactId,
					chatAccountId: chatAccountId,
				})
				.then((response: any) => {
					const contact = this.upsert(response.data)
					contact.fetchedAt = now
					return contact
				})
				.catch((err) => {
					consoleLog(err)
					throw err
				})
				.finally(() => {
					delete this.inflight[contactId]
				})

			if (useInflight) {
				this.inflight[contactId] = request
			}
			return request
		},

		async updateContact(contactId: string, contactData: any, chatAccountId: number) {
			const requestAdapter = useRequestAdapter()
			return requestAdapter
				.post(apiList.chat.instagram.chatAccountId.contacts.contactId.updateContact, contactData, {
					chatAccountId,
					slug: contactId,
				})
				.then((response: any) => {
					consoleLog('updateContact response.data', response.data)
					this.upsert(response.data)
				})
				.catch((err) => {
					consoleLog(err)
				})
		},

		clearStore() {
			this.slices = {}
			this.entities = {}
			this.sortedContactIds = []
			return
		},

		upsert(data: any): Contact {
			const id = data?.id

			if (!id) {
				return new Contact(data)
			}
			if (this.entities[id]) {
				const contact = this.entities[id]
				contact.update(data)
				return contact
			}
			this.entities[id] = new Contact(data)
			if (!this.sortedContactIds.includes(id.toString())) {
				this.sortedContactIds.push(id.toString())
				this.sortedContactIds.sort((a, b) => Number(b) - Number(a))
			}
			return this.entities[id]
		},

		deleteContacts(contactId: number) {
			delete this.entities[contactId]
		},

		upsertCustomFieldValues(data: any) {
			const contact = this.getContactById(data.contact_id)
			if (!contact) {
				return
			}
			contact.customFieldsValues = contact.customFieldsValues || []
			const index = contact.customFieldsValues.findIndex(
				(cf) => cf.customFieldId === data.custom_field_id && cf.contactId === data.contact_id,
			)
			if (index > -1) {
				contact.customFieldsValues[index] = new CustomFieldPivot(data)
				return
			}
			contact.customFieldsValues.push(new CustomFieldPivot(data))
		},

		saveCustomFields(contactId: number, chatAccountId: number, fields: any) {
			const requestAdapter = useRequestAdapter()
			const chatAccountAttributesStore = useChatAccountAttributesStore()
			return requestAdapter
				.post(
					apiList.chat.instagram.chatAccountId.contacts.contactId.upsertField,
					{ customFields: fields },
					{
						chatAccountId,
						slug: contactId,
					},
				)
				.then((response: any) => {
					response.data.map((fieldData: any) => {
						this.upsertCustomFieldValues(fieldData.pivot)
						chatAccountAttributesStore.upsertCustomField(fieldData)
					})
					return response
				})
		},

		removeCustomField(contactId: number, chatAccountId: number, fieldId: number) {
			const requestAdapter = useRequestAdapter()
			return requestAdapter
				.post(
					apiList.chat.instagram.chatAccountId.contacts.contactId.removeField,
					{ fieldId },
					{
						chatAccountId,
						slug: contactId,
					},
				)
				.then(() => {
					this.getContactById(contactId).customFieldsValues = this.getContactById(contactId).customFieldsValues.filter(
						(cf) => !(cf.customFieldId === fieldId && cf.contactId === contactId),
					)
				})
		},

		createCustomFieldBulkRequest(
			contactIds: number[],
			selectionType = SELECTION_TYPES.INCLUDE,
			chatAccountId: number,
			key: string,
			type: string,
			value: any,
		) {
			const requestAdapter = useRequestAdapter()
			const chatAccountAttributesStore = useChatAccountAttributesStore()

			return requestAdapter
				.post(apiList.chat.instagram.contacts.attributes.customFields.create, {
					contactIds: contactIds,
					selectionType: selectionType,
					chatAccountId: chatAccountId,
					key: key,
					type: type,
					value: value,
				})
				.then((response: any) => {
					response.data.created_custom_fields?.forEach((cfData: any) => {
						chatAccountAttributesStore.upsertCustomField(cfData)
					})
					response.data.contact_custom_fields?.forEach((pivotData: any) => {
						this.upsertCustomFieldValues(pivotData)
					})
					return response
				})
		},

		updateCustomFieldBulkRequest(
			contactIds: number[],
			selectionType = SELECTION_TYPES.INCLUDE,
			chatAccountId: number,
			fieldId: number,
			value: any,
		) {
			const requestAdapter = useRequestAdapter()

			return requestAdapter
				.post(apiList.chat.instagram.contacts.attributes.customFields.update, {
					contactIds,
					selectionType,
					chatAccountId,
					fieldId,
					value,
				})
				.then((response: any) => {
					response.data.contact_custom_fields?.forEach((pivotData: any) => {
						this.upsertCustomFieldValues(pivotData)
					})
					return response
				})
		},

		async removeCustomFieldBulkRequest(
			contactIds: number[],
			selectionType = SELECTION_TYPES.INCLUDE,
			chatAccountId: number,
			fieldIds: number[],
		) {
			const requestAdapter = useRequestAdapter()
			return await requestAdapter
				.post(apiList.chat.instagram.contacts.attributes.customFields.delete, {
					contactIds,
					selectionType,
					chatAccountId,
					fieldIds,
				})
				.then((response: any) => {
					const scopeKey = scopeName(chatAccountId)
					const scopeContacts = this.contactsForScope(scopeKey)

					if (selectionType === SELECTION_TYPES.EXCLUDE) {
						scopeContacts
							.filter((contact) => !contactIds.includes(contact.id))
							.forEach((contact: any) => {
								contact.customFieldsValues = contact.customFieldsValues.filter(
									(fieldValue: CustomFieldPivot) => !fieldIds.includes(fieldValue.customFieldId),
								)
							})
						return response
					}
					contactIds.forEach((contactId) => {
						const contact = this.entities[contactId]
						if (contact?.customFieldsValues) {
							contact.customFieldsValues = contact.customFieldsValues.filter(
								(fieldValue) => !fieldIds.includes(fieldValue.customFieldId),
							)
						}
					})
					return response
				})
		},

		upsertTagPivot(contactId: number, tagPivot: TagPivot) {
			const index = this.getContactById(contactId).tagValues.findIndex((t) => t.tagId === tagPivot.tagId)
			if (index > -1) {
				this.getContactById(contactId).tagValues[index] = tagPivot
				return
			}
			this.getContactById(contactId).tagValues.push(tagPivot)
		},

		async addTagRequest(contactId: number, tagPivot: TagPivot, chatAccountId: number) {
			const requestAdapter = useRequestAdapter()
			return requestAdapter
				.post(
					apiList.chat.instagram.chatAccountId.contacts.contactId.addTag,
					{ tagId: tagPivot.tagId },
					{
						chatAccountId,
						slug: contactId,
					},
				)
				.then(() => {
					this.upsertTagPivot(contactId, tagPivot)
				})
				.catch((err) => {
					consoleLog(err)
				})
		},

		createTagBulkRequest(
			contactIds: number[],
			selectionType = SELECTION_TYPES.INCLUDE,
			chatAccountId: number,
			existingTagIds: number[] = [],
			newTags: { name: string; color: string }[] = [],
		) {
			const requestAdapter = useRequestAdapter()
			const chatAccountAttributesStore = useChatAccountAttributesStore()

			return requestAdapter
				.post(apiList.chat.instagram.contacts.attributes.tags.create, {
					contactIds,
					selectionType,
					chatAccountId,
					existingTagIds,
					newTags,
				})
				.then((response: any) => {
					response.data.created_tags?.forEach((tagData: any) => {
						chatAccountAttributesStore.upsertTag(tagData)
					})
					response.data.contact_tags?.forEach((pivotData: any) => {
						this.upsertTagPivot(pivotData.contact_id, new TagPivot(pivotData))
					})
					return response
				})
		},

		async removeTagRequest(contactId: number, chatAccountId: number, tagId: number) {
			const requestAdapter = useRequestAdapter()
			return requestAdapter
				.post(
					apiList.chat.instagram.chatAccountId.contacts.contactId.removeTag,
					{ tagId },
					{
						chatAccountId,
						slug: contactId,
					},
				)
				.then(() => {
					this.getContactById(contactId).tagValues = this.getContactById(contactId).tagValues.filter(
						(tag) => tag.tagId !== tagId,
					)
				})
				.catch((err) => {
					consoleLog(err)
				})
		},

		removeTagBulkRequest(
			contactIds: number[],
			selectionType = SELECTION_TYPES.INCLUDE,
			chatAccountId: number,
			tagIds: number[],
		) {
			const requestAdapter = useRequestAdapter()

			return requestAdapter
				.post(apiList.chat.instagram.contacts.attributes.tags.delete, {
					contactIds,
					selectionType,
					chatAccountId,
					tagIds,
				})
				.then((response: any) => {
					const scopeKey = scopeName(chatAccountId)
					const scopeContacts = this.contactsForScope(scopeKey)

					if (selectionType === SELECTION_TYPES.EXCLUDE) {
						scopeContacts
							.filter((contact) => !contactIds.includes(contact.id))
							.forEach((contact: any) => {
								if (!contact?.tagValues) return
								contact.tagValues = contact.tagValues.filter((t: TagPivot) => !tagIds.includes(t.tagId))
							})
						return response
					}
					contactIds.forEach((contactId) => {
						const contact = this.entities[contactId]
						if (contact?.tagValues) {
							contact.tagValues = contact.tagValues.filter((t) => !tagIds.includes(t.tagId))
						}
					})
					return response
				})
		},
	},
})
