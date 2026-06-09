<template>
	<div class="flex min-h-full w-full overflow-y-auto py-16 relative">
		<!-- Close Button -->
		<button
			@click="close"
			class="absolute top-4 right-4 btn btn-ghost btn-circle btn-sm hover:bg-base-200 transition-colors"
			aria-label="Close"
		>
			<i class="fa fa-times text-xl text-muted"></i>
		</button>

		<div class="bs container flex justify-center my-auto">
			<!-- Success Icon and Message -->
			<div class="space-y-12 text-center">
				<!-- Animated Success Icon -->
				<div class="flex justify-center">
					<Lottie
						:loop="false"
						:autoplay="true"
						:width="250"
						:height="250"
						animationLink="/images/lottie/success.json"
					/>
				</div>


				<!-- Success Title -->
				<div class="space-y-2">
					<h2 class="text-2xl font-bold text-base-content">
						{{ $t('components.pricing.paymentSuccessful.title') }}
					</h2>
					<p class="text-muted text-base">
						{{ $t('components.pricing.paymentSuccessful.description') }}
					</p>
				</div>

				<!-- Action Buttons -->
				<div class="space-y-3">
					<localized-link name="flows" class="btn btn-primary w-full justify-center" @click="$emit('close')">
						{{ $t('components.pricing.paymentSuccessful.getStartedButton') }}
						<i class="fa fa-chevron-right link-icon" />
					</localized-link>

					<localized-link name="account" class="btn btn-ghost w-full justify-center" @click="$emit('close')">
						<i class="fa fa-at link-icon" />
						{{ $t('components.pricing.paymentSuccessful.viewAccountsButton') }}
					</localized-link>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import LocalizedLink from '~/components/GlobalComponents/LocalizedLink.vue'
import Lottie from '~/components/GlobalComponents/Elements/Lottie.vue'

export default {
	name: 'PaymentSuccessful',
	components: { Lottie, LocalizedLink },
	emits: ['close'],
	methods: {
		close() {
			this.$router.push(this.$localeRoute({ name: 'account', query: { ...this.$route.query } }))
			this.$emit('close')
		},
	},
}
</script>
