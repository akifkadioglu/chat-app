<template>
	<div>
		<div class="flex gap-3 items-center my-4">
			<select v-model="modelValue.method" class="select select-bordered w-32">
				<option value="GET">GET</option>
				<option value="POST">POST</option>
				<option value="PUT">PUT</option>
				<option value="PATCH">PATCH</option>
				<option value="DELETE">DELETE</option>
				<option value="HEAD">HEAD</option>
			</select>
			<div class="relative flex-1">
				<input
					v-model="modelValue.url"
					type="url"
					:placeholder="$t('components.flow.node.actions.externalRequestPartials.requestBuilder.urlPlaceholder')"
					class="input input-bordered w-full pr-12 z-0"
				/>
				<div class="absolute right-2 top-0 h-full flex items-center z-10">
					<button
						type="button"
						class="btn btn-square btn-ghost btn-sm"
						:aria-label="$t('components.flow.node.actions.externalRequestPartials.requestBuilder.pasteFromClipboard')"
						@click="pasteUrl"
					>
						<i class="fa fa-paste"></i>
					</button>
				</div>
			</div>
		</div>

		<!-- Tabs -->
		<div class="tabs tabs-lift">
			<label class="tab">
				<input type="radio" class="tab" aria-label="Headers" v-model="activeTab" value="headers" />
				Headers
			</label>
			<RequestHeaders
				v-show="activeTab === 'headers'"
				v-model="modelValue.headers"
				class="tab-content bg-base-100 border-base-300 p-6"
			/>

			<label class="tab" :class="{ 'opacity-50 cursor-not-allowed': modelValue.method === 'GET' }">
				<input
					type="radio"
					class="tab"
					aria-label="Body"
					v-model="activeTab"
					value="body"
					:disabled="modelValue.method === 'GET'"
				/>
				Body
			</label>
			<RequestBody
				v-show="activeTab === 'body'"
				v-model="modelValue.body"
				:disabled="modelValue.method === 'GET'"
				class="tab-content bg-base-100 border-base-300 p-6"
			/>

			<label class="tab">
				<input
					type="radio"
					class="tab"
					:aria-label="$t('components.flow.node.actions.externalRequestPartials.requestBuilder.tabs.settings')"
					v-model="activeTab"
					value="settings"
				/>
				{{ $t('components.flow.node.actions.externalRequestPartials.requestBuilder.tabs.settings') }}
			</label>
			<div v-show="activeTab === 'settings'" class="tab-content bg-base-100 border-base-300 p-6">
				<div class="grid grid-cols-2 gap-4">
					<div class="col-span-2">
						<RequestResponse
							v-if="showResponseSettings"
							v-model="modelValue.response"
							:show-message-fields="showMessageFields"
							class="border-b border-b-base-300 pb-8 mb-6"
						/>
					</div>
					<div>
						<label class="label label-text text-xs">
							{{ $t('components.flow.node.actions.externalRequestPartials.requestBuilder.settings.timeout') }}
						</label>
						<input
							v-model.number="modelValue.settings.timeout"
							type="number"
							min="1"
							max="30"
							class="input input-bordered input-sm w-full"
						/>
					</div>
					<div>
						<label class="label label-text text-xs">
							{{ $t('components.flow.node.actions.externalRequestPartials.requestBuilder.settings.retryAttempts') }}
						</label>
						<input
							v-model.number="modelValue.settings.retryAttempts"
							type="number"
							min="0"
							max="5"
							class="input input-bordered input-sm w-full"
						/>
					</div>
					<div class="col-span-2">
						<div class="flex items-center gap-2">
							<input
								v-model="modelValue.settings.cacheResponse"
								type="checkbox"
								class="checkbox checkbox-sm"
								id="cache-response"
							/>
							<label for="cache-response" class="label-text text-sm">
								{{ $t('components.flow.node.actions.externalRequestPartials.requestBuilder.settings.cacheResponse') }}
							</label>
						</div>
						<div v-if="modelValue.settings.cacheResponse" class="mt-2">
							<label class="label label-text text-xs">
								{{ $t('components.flow.node.actions.externalRequestPartials.requestBuilder.settings.cacheDuration') }}
							</label>
							<input
								v-model.number="modelValue.settings.cacheDuration"
								type="number"
								min="1"
								max="1440"
								class="input input-bordered input-sm w-32"
							/>
						</div>
					</div>
					<div class="col-span-2">
						<div class="flex items-center gap-2">
							<input
								v-model="modelValue.settings.continueOnError"
								type="checkbox"
								class="checkbox checkbox-sm"
								id="continue-on-error"
							/>
							<label for="continue-on-error" class="label-text text-sm">
								{{ $t('components.flow.node.actions.externalRequestPartials.requestBuilder.settings.continueOnError') }}
							</label>
						</div>
					</div>
				</div>
			</div>

			<label class="tab">
				<input
					type="radio"
					class="tab"
					:aria-label="$t('components.flow.node.actions.externalRequestPartials.requestBuilder.tabs.test')"
					v-model="activeTab"
					value="test"
				/>
				{{ $t('components.flow.node.actions.externalRequestPartials.requestBuilder.tabs.test') }}
			</label>
			<RequestTest
				v-show="activeTab === 'test'"
				:requestConfig="modelValue"
				:showMessageExtraction="showResponseSettings"
				class="tab-content bg-base-100 border-base-300 p-6"
			/>
		</div>
	</div>
</template>

<script>
import RequestHeaders from './RequestHeaders.vue'
import RequestBody from './RequestBody.vue'
import RequestResponse from './RequestResponse.vue'
import RequestTest from '~/components/Flow/Node/Actions/ExternalRequestPartials/RequestTest.vue'

export default {
	components: {
		RequestTest,
		RequestResponse,
		RequestHeaders,
		RequestBody,
	},
	props: {
		modelValue: {
			type: Object,
			default: () => ({
				url: '',
				method: 'GET',
				headers: [],
				body: {
					type: 'form',
					fields: [],
					json: '',
					raw: '',
				},
				settings: {
					messagePath: 'data.message',
					fallbackMessage: "Sorry, we couldn't load the dynamic content.",
					responseVariable: '',
					extractPath: '',
					timeout: 10,
					retryAttempts: 1,
					cacheResponse: false,
					cacheDuration: 5,
					continueOnError: false,
				},
			}),
		},
		summaryRef: {
			type: [Object, null],
		},
		showMessageFields: {
			type: Boolean,
			default: true,
		},
		showResponseSettings: {
			type: Boolean,
			default: false,
		},
	},
	emits: ['update:modelValue'],
	data() {
		return {
			activeTab: 'headers',
			isLoading: false,
			testResult: null,
		}
	},
	computed: {
		hasBodyContent() {
			if (this.modelValue.method === 'GET') return false
			if (this.modelValue.body.type === 'form') {
				return this.modelValue.body.fields && this.modelValue.body.fields.length > 0
			} else if (this.modelValue.body.type === 'json') {
				return this.modelValue.body.json && this.modelValue.body.json.trim().length > 0
			} else if (this.modelValue.body.type === 'raw') {
				return this.modelValue.body.raw && this.modelValue.body.raw.trim().length > 0
			}
			return false
		},
	},
	watch: {
		method(newMethod) {
			// GET method seçildiğinde ve Body tab aktifse, Headers tab'ına geç
			if (newMethod === 'GET' && this.activeTab === 'body') {
				this.activeTab = 'headers'
			}
		},
	},
	methods: {
		async pasteUrl() {
			try {
				const text = await navigator.clipboard.readText()
				if (text) {
					this.modelValue.url = text.trim()
				}
			} catch (e) {
				console.warn('Clipboard read failed', e)
			}
		},
		async testRequest() {
			if (!this.modelValue.url) return

			this.isLoading = true
			this.testResult = null

			try {
				// Simulate API request
				await new Promise((resolve) => setTimeout(resolve, 1000))

				// Mock successful response
				const mockData = {
					message: 'Hello from API!',
					user: {
						id: 123,
						name: 'John Doe',
						email: 'john@example.com',
					},
					data: {
						message: 'This is the extracted message content',
						content: 'Alternative message content',
					},
					timestamp: new Date().toISOString(),
				}

				let extractedMessage = null
				if (this.showMessageFields && this.modelValue.response.messagePath) {
					extractedMessage =
						this.extractFromPath(mockData, this.modelValue.response.messagePath) ||
						this.modelValue.response.fallbackMessage
				}

				this.testResult = {
					success: true,
					message: 'Request completed successfully',
					data: mockData,
					extractedMessage,
					headers: {
						'content-type': 'application/json',
						'content-length': '256',
						server: 'nginx/1.18.0',
					},
					duration: 850,
					size: 256,
				}
			} catch (error) {
				this.testResult = {
					success: false,
					message: error.message || 'Request failed',
					extractedMessage: this.showMessageFields ? this.modelValue.response.fallbackMessage : null,
				}
			} finally {
				this.isLoading = false
			}
		},
		extractFromPath(obj, path) {
			if (!path || !obj) return null

			const keys = path.split('.')
			let current = obj

			for (const key of keys) {
				if (current && typeof current === 'object' && key in current) {
					current = current[key]
				} else {
					return null
				}
			}

			return current
		},
		formatResponseBody(data) {
			if (typeof data === 'string') {
				return data
			}
			return JSON.stringify(data, null, 2)
		},
		formatBytes(bytes) {
			if (bytes === 0) return '0 B'
			const k = 1024
			const sizes = ['B', 'KB', 'MB', 'GB']
			const i = Math.floor(Math.log(bytes) / Math.log(k))
			return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
		},
	},
}
</script>
