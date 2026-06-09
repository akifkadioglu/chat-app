import { CustomField } from '~/models/Contact/CustomField'
import { Tag } from '~/models/Contact/Tag'
import apiList from '~/apis/ApiList'

export const DEFAULT_TAG_COLOR = '#3b82f6'

export const useChatAccountAttributesStore = defineStore('chatAccountAttributes', {
	state: () => ({
		customFields: {} as Record<number, CustomField[]>,
		tags: {} as Record<number, Tag[]>,
		tagInflight: {} as Record<string, Promise<any> | undefined>,
		customFieldInflight: {} as Record<string, Promise<any> | undefined>,
		tagLastFetchedAt: {} as Record<number, number>,
		customFieldLastFetchedAt: {} as Record<number, number>,
		ttlMs: 60_000,
	}),

	getters: {
		getCustomFieldsByChatAccountId:
			(s) =>
			(chatAccountId: number): CustomField[] =>
				s.customFields[chatAccountId] ?? [],
		getTagsByChatAccountId:
			(s) =>
			(chatAccountId: number): Tag[] =>
				s.tags[chatAccountId] ?? [],
		allTags(s): Tag[] {
			return Object.values(s.tags).flat()
		},
	},
	actions: {
		// CustomFields
		async fetchCustomFields(chatAccountId: number, useInflight = true) {
			if (!chatAccountId) return
			const now = Date.now()

			const lastFetched = this.customFieldLastFetchedAt[chatAccountId]
			if (useInflight && lastFetched && now - lastFetched < this.ttlMs) {
				return Promise.resolve({ data: this.customFields[chatAccountId] || [] })
			}

			if (useInflight && this.customFieldInflight[chatAccountId]) {
				return this.customFieldInflight[chatAccountId]
			}

			const requestAdapter = useRequestAdapter()

			const request = requestAdapter
				.get(apiList.chat.instagram.chatAccountId.customFields.get, {
					chatAccountId,
				})
				.then((response: any) => {
					this.customFields[chatAccountId] = response.data.map((field: any) => new CustomField(field))
					this.customFieldLastFetchedAt[chatAccountId] = now
					return response
				})
				.catch((error: any) => {
					consoleLog(error)
					throw error
				})
				.finally(() => {
					delete this.customFieldInflight[chatAccountId]
				})

			if (useInflight) {
				this.customFieldInflight[chatAccountId] = request
			}
			return request
		},

		upsertCustomField(data: any) {
			if (!this.customFields[data.chat_account_id]) {
				this.customFields[data.chat_account_id] = []
			}
			const index = this.customFields[data.chat_account_id].findIndex((cf) => cf.id === data.id)
			if (index > -1) {
				this.customFields[data.chat_account_id][index] = new CustomField(data)
				return
			}
			this.customFields[data.chat_account_id].push(new CustomField(data))
		},

		updateCustomFields(chatAccountId: number, customFields: CustomField[]) {
			const requestAdapter = useRequestAdapter()
			return requestAdapter
				.post(
					apiList.chat.instagram.chatAccountId.customFields.upsert,
					{ customFields: customFields },
					{
						chatAccountId,
					},
				)
				.then((response: any) => {
					this.customFields[chatAccountId] = response.data
					return response
				})
				.catch((err: any) => {
					consoleLog(err)
				})
		},

		createCustomFieldRequest(chatAccountId: number, key: string, type: string = '') {
			const inflightKey = `${chatAccountId}-${key}`

			if (this.customFieldInflight[inflightKey]) {
				return this.customFieldInflight[inflightKey]!
			}

			const requestAdapter = useRequestAdapter()
			const promise = requestAdapter
				.post(
					apiList.chat.instagram.chatAccountId.customFields.create,
					{ key, type },
					{
						chatAccountId,
					},
				)
				.then((response: any) => {
					consoleLog('consoleLog(customField', response.data)
					this.upsertCustomField(response.data)
					return response
				})
				.finally(() => {
					// Request tamamlandığında inflight'tan temizle
					delete this.customFieldInflight[inflightKey]
				})

			// Inflight'a ekle
			this.customFieldInflight[inflightKey] = promise
			return promise
		},

		removeCustomFields(chatAccountId: number, fieldIds: number[]) {
			const requestAdapter = useRequestAdapter()
			return requestAdapter
				.post(
					apiList.chat.instagram.chatAccountId.customFields.delete,
					{ ids: fieldIds },
					{
						chatAccountId,
					},
				)
				.then((response: any) => {
					this.customFields[chatAccountId] = this.customFields[chatAccountId].filter(
						(field) => !fieldIds.includes(field.id),
					)
					consoleLog(this.customFields[chatAccountId].filter((field) => !fieldIds.includes(field.id)))
					return response
				})
				.catch((err: any) => {
					consoleLog(err)
				})
		},

		// Tags
		async fetchTags(chatAccountId: number, useInflight = true) {
			if (!chatAccountId) return
			const now = Date.now()

			const lastFetched = this.tagLastFetchedAt[chatAccountId]
			if (useInflight && lastFetched && now - lastFetched < this.ttlMs) {
				return Promise.resolve({ data: this.tags[chatAccountId] || [] })
			}

			if (useInflight && this.tagInflight[chatAccountId]) {
				return this.tagInflight[chatAccountId]
			}

			const requestAdapter = useRequestAdapter()

			const request = requestAdapter
				.get(apiList.chat.instagram.chatAccountId.tags.get, {
					chatAccountId,
				})
				.then((response: any) => {
					response.data.forEach((tagData: any) => {
						this.upsertTag(tagData)
					})
					this.tagLastFetchedAt[chatAccountId] = now
					return response
				})
				.catch((error: any) => {
					consoleLog(error)
					throw error
				})
				.finally(() => {
					if (useInflight) {
						delete this.tagInflight[chatAccountId]
					}
				})

			if (useInflight) {
				this.tagInflight[chatAccountId] = request
			}

			return request
		},

		upsertTag(data: any) {
			if (!this.tags[data.chat_account_id]) {
				this.tags[data.chat_account_id] = []
			}
			const index = this.tags[data.chat_account_id].findIndex((tag) => tag.id === data.id)
			if (index > -1) {
				this.tags[data.chat_account_id][index] = new Tag(data)
				return
			}
			this.tags[data.chat_account_id].push(new Tag(data))
		},

		updateTagsRequest(chatAccountId: number, tags: Tag[]) {
			const requestAdapter = useRequestAdapter()
			return requestAdapter
				.post(
					apiList.chat.instagram.chatAccountId.tags.update,
					{ tags: tags },
					{
						chatAccountId,
					},
				)
				.then((response) => {
					response.data.map((tag: any) => {
						this.upsertTag(tag)
					})
					return response
				})
				.catch((err) => {
					consoleLog(err)
				})
				.finally((res: any) => {
					return res
				})
		},

		createTagRequest(chatAccountId: number, tagData: any) {
			const requestAdapter = useRequestAdapter()
			return requestAdapter
				.post(apiList.chat.instagram.chatAccountId.tags.create, tagData, {
					chatAccountId,
				})
				.then((response) => {
					this.upsertTag(response.data)
					return response
				})
				.catch((err) => {
					consoleLog(err)
				})
		},

		removeTags(chatAccountId: number, tagIds: number[]) {
			const requestAdapter = useRequestAdapter()
			return requestAdapter
				.post(
					apiList.chat.instagram.chatAccountId.tags.delete,
					{ ids: tagIds },
					{
						chatAccountId,
					},
				)
				.then((response: any) => {
					this.tags[chatAccountId] = this.tags[chatAccountId].filter((tag) => !tagIds.includes(tag.id))
					return response
				})
				.catch((err: any) => {
					consoleLog(err)
				})
		},
	},
})
