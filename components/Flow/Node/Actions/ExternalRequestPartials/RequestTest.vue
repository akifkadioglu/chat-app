<template>
	<div class="space-y-4">
		<!-- Test Button -->
		<div class="flex justify-between items-center">
			<h3 class="text-sm font-medium">
				{{ $t('components.flow.node.actions.externalRequestPartials.requestTest.title') }}
			</h3>
			<button @click="testRequest" class="btn btn-sm btn-primary" :disabled="isLoading || !requestConfig.url">
				<i class="fa fa-play mr-1" v-if="!isLoading"></i>
				<span class="loading loading-spinner loading-xs mr-1" v-else></span>
				<span v-if="isLoading">{{
					$t('components.flow.node.actions.externalRequestPartials.requestTest.testing')
				}}</span>
				<span v-else>Test</span>
			</button>
		</div>

		<!-- Test Results -->
		<div v-if="testResult" class="space-y-3">
			<div class="alert" :class="testResult.success ? 'alert-success' : 'alert-error'">
				<i class="fa" :class="testResult.success ? 'fa-check-circle' : 'fa-exclamation-triangle'"></i>
				<div>
					<div class="font-medium">
						<span v-if="testResult.success">{{
							$t('components.flow.node.actions.externalRequestPartials.requestTest.requestSuccessful')
						}}</span>
						<span v-else>{{
							$t('components.flow.node.actions.externalRequestPartials.requestTest.requestFailed')
						}}</span>
					</div>
					<div class="text-sm opacity-75">
						{{ testResult.message }}
					</div>
				</div>
			</div>

			<!-- Extracted Message (only show if showMessageExtraction prop is true) -->
			<div v-if="showMessageExtraction && testResult.extractedMessage" class="bg-base-200 rounded p-3">
				<h4 class="text-xs font-medium text-base-content/60 mb-2">
					{{ $t('components.flow.node.actions.externalRequestPartials.requestTest.extractedMessage') }}
				</h4>
				<div class="text-sm">{{ testResult.extractedMessage }}</div>
			</div>

			<!-- Response Details -->
			<div class="collapse collapse-arrow bg-base-200">
				<input type="checkbox" class="peer" />
				<div class="collapse-title text-sm font-medium">
					{{ $t('components.flow.node.actions.externalRequestPartials.requestTest.responseDetails') }}
				</div>
				<div class="collapse-content">
					<div class="space-y-3">
						<!-- Response Headers -->
						<!--						<div v-if="testResult.headers">-->
						<!--							<h4 class="text-xs font-medium text-base-content/60 mb-2">Headers</h4>-->
						<!--							<div class="bg-base-300 rounded p-3 font-mono text-xs">-->
						<!--								<div v-for="(value, key) in testResult.headers" :key="key" class="flex">-->
						<!--									<span class="text-primary font-medium w-32">{{ key }}:</span>-->
						<!--									<span class="text-base-content/80">{{ value }}</span>-->
						<!--								</div>-->
						<!--							</div>-->
						<!--						</div>-->

						<!-- Response Body -->
						<div v-if="testResult.data">
							<h4 class="text-xs font-medium text-base-content/60 mb-2">Body</h4>
							<div class="bg-base-300 rounded p-3 font-mono text-xs max-h-64 overflow-auto">
								<pre>{{ formatResponseBody(testResult.data) }}</pre>
							</div>
						</div>

						<!-- Timing Info -->
						<div class="flex gap-4 text-xs text-base-content/60">
							<span v-if="testResult.duration">
								{{ $t('components.flow.node.actions.externalRequestPartials.requestTest.duration') }}:
								{{ testResult.duration }}ms
							</span>
							<span v-if="testResult.size">
								{{ $t('components.flow.node.actions.externalRequestPartials.requestTest.size') }}:
								{{ formatBytes(testResult.size) }}
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Request Summary -->
		<div class="bg-base-200 rounded p-3">
			<h4 class="text-xs font-medium text-base-content/60 mb-2">
				{{ $t('components.flow.node.actions.externalRequestPartials.requestTest.requestSummary') }}
			</h4>
			<div class="space-y-1 text-sm">
				<div><span class="font-medium">Method:</span> {{ requestConfig.method || 'GET' }}</div>
				<div>
					<span class="font-medium">URL:</span>
					{{
						requestConfig.url || $t('components.flow.node.actions.externalRequestPartials.requestTest.notConfigured')
					}}
				</div>
				<div><span class="font-medium">Headers:</span> {{ (requestConfig.headers || []).length }} header(s)</div>
				<div v-if="requestConfig.method !== 'GET'"><span class="font-medium">Body:</span> {{ getBodySummary() }}</div>
				<div v-if="showMessageExtraction && extractPath">
					<span class="font-medium">{{
						$t('components.flow.node.actions.externalRequestPartials.requestTest.extract')
					}}</span>
					<code class="text-xs">{{ extractPath }}</code>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import apiList from '~/apis/ApiList.js'

export default {
	props: {
		requestConfig: {
			type: Object,
			default: () => ({
				url: '',
				method: 'GET',
				headers: [],
				body: { type: 'form', fields: [], json: '', raw: '' },
			}),
		},
		extractPath: {
			type: String,
			default: '',
		},
		fallbackMessage: {
			type: String,
			default: 'Request failed',
		},
		showMessageExtraction: {
			type: Boolean,
			default: true,
		},
	},
	data() {
		return {
			isLoading: false,
			testResult: null,
		}
	},
	methods: {
		async testRequest() {
			if (!this.requestConfig.url) return

			this.isLoading = true
			this.testResult = null

			this.$requestAdapter
				.post(apiList.chat.flow.testExternalRequest, {
					requestConfig: this.requestConfig,
				})
				.then((response) => {
					this.testResult = {
						success: response.data.status >= 200 && response.data.status < 300,
						message: 'Request completed successfully',
						data: response.data.body,
						extractedMessage: response.data.message,
						// headers: {
						// 	'content-type': 'application/json',
						// 	'content-length': '256',
						// 	'server': 'nginx/1.18.0'
						// },
						duration: response.data.duration,
						size: response.data.size,
					}
					consoleLog(response)
				})
				.finally(() => {
					this.isLoading = false
				})

			return
		},
		getBodySummary() {
			if (!this.requestConfig.body) return 'No Body'

			if (this.requestConfig.body.type === 'form') {
				const fieldCount = this.requestConfig.body.fields ? this.requestConfig.body.fields.length : 0
				const fieldText =
					fieldCount !== 1
						? this.$t('components.flow.node.actions.externalRequestPartials.requestTest.fields')
						: this.$t('components.flow.node.actions.externalRequestPartials.requestTest.field')
				return `Form Data (${fieldCount} ${fieldText})`
			} else if (this.requestConfig.body.type === 'json') {
				return 'JSON body'
			} else if (this.requestConfig.body.type === 'raw') {
				return 'Raw text body'
			}
			return 'No Body'
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
