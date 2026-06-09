<template>
	<div class="space-y-4">
		<div class="flex justify-between items-center">
			<h3 class="text-sm font-medium">Headers</h3>
			<button @click="addHeader" class="btn btn-sm btn-ghost">
				<i class="fa fa-plus mr-1"></i>
				{{ $t('components.flow.node.actions.externalRequestPartials.requestHeaders.addHeader') }}
			</button>
		</div>

		<div class="min-h-16" v-auto-animate>
			<div v-if="headers.length === 0" class="text-center text-base-content/60">
				<i class="fa fa-code text-2xl mb-2"></i>
				<p class="text-sm">{{ $t('components.flow.node.actions.externalRequestPartials.requestHeaders.noHeadersAdded') }}</p>
			</div>

			<div v-else class="space-y-3" v-auto-animate>
				<div v-for="(header, index) in headers" :key="index" class="flex gap-3 items-center p-3 bg-base-200 rounded-lg">
					<input v-model="header.key" type="text" :placeholder="$t('components.flow.node.actions.externalRequestPartials.requestHeaders.headerNamePlaceholder')" class="input input-sm flex-1" />
					<input v-model="header.value" type="text" :placeholder="$t('components.flow.node.actions.externalRequestPartials.requestHeaders.headerValuePlaceholder')" class="input input-sm flex-1" />
					<button @click="removeHeader(index)" class="btn btn-sm btn-ghost btn-circle text-error">
						<i class="fa fa-trash"></i>
					</button>
				</div>
			</div>
		</div>
		<div class="divider my-4"></div>

		<div class="space-y-2">
			<h4 class="text-sm font-medium text-base-content/80">{{ $t('components.flow.node.actions.externalRequestPartials.requestHeaders.commonHeaders') }}</h4>
			<div class="flex flex-wrap gap-2">
				<button
					v-for="commonHeader in commonHeaders"
					:key="commonHeader.key"
					@click="addCommonHeader(commonHeader)"
					class="btn btn-xs btn-outline"
				>
					{{ commonHeader.key }}
				</button>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	props: {
		modelValue: {
			type: Array,
			default: () => [],
		},
	},
	emits: ['update:modelValue'],
	data() {
		return {
			commonHeaders: [
				{ key: 'Content-Type', value: 'application/json' },
				{ key: 'Authorization', value: 'Bearer ' },
				{ key: 'Accept', value: 'application/json' },
				{ key: 'User-Agent', value: 'Simpliers-Bot/1.0' },
				{ key: 'X-API-Key', value: '' },
			],
		}
	},
	computed: {
		headers: {
			get() {
				return this.modelValue
			},
			set(value) {
				this.$emit('update:modelValue', value)
			},
		},
	},
	methods: {
		addHeader() {
			this.headers.push({
				id: Date.now(),
				key: '',
				value: '',
			})
		},
		removeHeader(index) {
			this.headers.splice(index, 1)
		},
		addCommonHeader(commonHeader) {
			this.headers.push({
				key: commonHeader.key,
				value: commonHeader.value,
			})
		},
	},
}
</script>
