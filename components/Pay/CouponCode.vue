<template>
	<div class="dark:bg-warning-content/10 bg-warning-content rounded-lg">
		<div class="card-body relative">
			<!--			<i class="absolute text-9xl text-warning opacity-20 bottom-2 right-0 fa-solid fa-percent" />-->

			<div class="space-y-1">
				<p class="font-semibold">
					{{ $t('components.pay.couponCode.title') }}
				</p>
			</div>

			<div class="space-y-2">
				<div class="flex flex-col gap-3 sm:flex-row sm:items-center">
					<input
						v-model="couponCode"
						class="input input-lg w-full border text-base-content flex-1"
						:class="{
							'input-error': couponCodeResult === false,
							'input-success': couponCodeResult === true,
						}"
						:type="'text'"
						:placeholder="$t('components.pay.couponCode.inputPlaceholder')"
						autocomplete="off"
						@input="couponCode = $event.target.value.toUpperCase()"
						@change="applyCouponCode"
					/>

					<button class="btn btn-lg btn-success z-1" :disabled="isCouponLoading" @click="applyCouponCode">
						<LoadingElement v-if="isCouponLoading" />
						{{ $t('components.pay.couponCode.applyButton') }}
					</button>
				</div>

				<div
					class="text-sm"
					:class="{
						'text-error': couponCodeResult === false,
						'text-success': couponCodeResult === true,
						'text-muted': couponCodeResult === null,
					}"
				>
					{{ couponCodeResultMessage }}
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'

export default {
	components: { LoadingElement },
	props: {
		couponCodeResult: {
			type: Boolean,
			default: null,
		},
		couponCodeResultMessage: {
			type: String,
			default: '',
		},
		isCouponLoading: {
			type: Boolean,
			default: false,
		},
		applyOnMounted: {
			type: Boolean,
			default: true,
		},
	},
	emits: ['applyCouponCode'],
	data() {
		return {
			couponCode: '',
		}
	},
	mounted() {
		const queries = { ...this.$route.query }
		this.couponCode = queries.coupon?.toString().toUpperCase() || ''

		if (this.couponCode && this.applyOnMounted) {
			this.applyCouponCode()
		}
	},
	methods: {
		async applyCouponCode() {
			const queries = { ...this.$route.query }
			queries.coupon = this.couponCode

			if (this.$route.query?.coupon !== this.couponCode) {
				await this.$router.push({
					query: queries,
				})
			}
			this.$emit('applyCouponCode', this.couponCode)
		},
	},
}
</script>
