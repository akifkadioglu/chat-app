<template>
	<div class="dark:bg-info-content/10 bg-info-content rounded-lg">
		<div class="card-body relative">
			<div class="space-y-1">
				<p class="font-semibold flex items-center gap-2">
					<i class="fa-solid fa-gift text-info" />
					{{ $t('components.pay.refCode.title') }}
				</p>
				<p class="text-xs text-muted">
					{{ $t('components.pay.refCode.subtitle') }}
				</p>
			</div>

			<div class="space-y-2">
				<div class="flex flex-col gap-3 sm:flex-row sm:items-center">
					<input
						v-model="refCode"
						class="input input-lg w-full border text-base-content flex-1"
						:class="{
							'input-error': result === false,
							'input-success': result === true,
						}"
						type="text"
						:placeholder="$t('components.pay.refCode.inputPlaceholder')"
						autocomplete="off"
						@input="refCode = $event.target.value.toUpperCase()"
						@change="redeem"
					/>

					<button class="btn btn-lg btn-info z-1" :disabled="isLoading || !refCode" @click="redeem">
						<LoadingElement v-if="isLoading" />
						{{ $t('components.pay.refCode.applyButton') }}
					</button>
				</div>

				<div
					v-if="resultMessage"
					class="text-sm"
					:class="{
						'text-error': result === false,
						'text-success': result === true,
					}"
				>
					{{ resultMessage }}
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import apiList from '~/apis/ApiList.js'

export default {
	components: { LoadingElement },
	props: {
		productParameter: {
			type: Object,
			default: null,
		},
		appliedRefCode: {
			type: String,
			default: '',
		},
	},
	emits: ['redeemed'],
	data() {
		return {
			typedRefCode: null,
			isLoading: false,
			result: null,
			resultMessage: '',
		}
	},
	computed: {
		refCode: {
			get() {
				if (this.typedRefCode !== null) {
					return this.typedRefCode
				}
				const fromQuery = this.$route.query?.refCode ?? this.$route.query?.ref
				return (fromQuery ?? this.appliedRefCode)?.toString().toUpperCase() || ''
			},
			set(value) {
				this.typedRefCode = value ?? ''
			},
		},
	},
	mounted() {
		const fromQuery = this.$route.query?.refCode ?? this.$route.query?.ref
		if (fromQuery) {
			this.redeem()
		}
	},
	methods: {
		redeem() {
			if (!this.refCode || this.isLoading) {
				return
			}
			this.isLoading = true
			this.result = null
			this.resultMessage = ''

			this.$requestAdapter
				.post(apiList.prices.refCode.redeem, { code: this.refCode, ...this.productParameter })
				.then((response) => {
					this.result = true
					this.resultMessage = response.data?.message ?? this.$t('components.pay.refCode.successMessage')
					this.$emit('redeemed', response.data)
				})
				.catch((error) => {
					this.result = false
					this.resultMessage = error.response?.data?.message ?? ''
				})
				.finally(() => {
					this.isLoading = false
				})
		},
	},
}
</script>
