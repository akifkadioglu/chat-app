<template>
	<div class="flex flex-col h-full ml-auto w-full max-w-lg">
		<div class="relative rounded-lg h-full shadow-2xl overflow-hidden bg-primary text-primary-content">
			<div class="pointer-events-none absolute -top-32 -right-32 w-80 h-80 rounded-full bg-base-100/20 blur-3xl" />
			<div class="pointer-events-none absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-success/30 blur-3xl" />
			<div
				class="pointer-events-none absolute inset-0 opacity-[0.08]"
				style="background-image: radial-gradient(currentColor 1px, transparent 1px); background-size: 20px 20px"
			/>

			<div class="relative p-8 flex flex-col h-full">
				<i18n-t
					keypath="components.pricing.enterprisePlan.hero.title"
					tag="h4"
					class="text-3xl font-semibold mb-0 leading-tight"
				>
					<template #scaling>
						<span class="font-black tracking-tight underline decoration-warning decoration-4 underline-offset-4">
							{{ $t('components.pricing.enterprisePlan.hero.scaling') }}
						</span>
					</template>
					<template #fits>
						<i class="text-warning">{{ $t('components.pricing.enterprisePlan.hero.fits') }}</i>
					</template>
				</i18n-t>

				<div class="flex items-baseline gap-2 mt-4">
					<span class="text-4xl font-bold">{{ $t('components.pricing.enterprisePlan.priceValue') }}</span>
					<span class="text-sm opacity-70">{{ $t('components.pricing.enterprisePlan.priceSuffix') }}</span>
				</div>
				<p class="text-sm opacity-80 mt-1">
					{{ $t('components.pricing.enterprisePlan.priceNote') }}
				</p>

				<div class="h-px bg-primary-content/20 my-5" />

				<div class="flex flex-col gap-4 flex-1">
					<div class="flex flex-col sm:flex-row gap-2 sm:items-center">
						<i class="fa fa-users mt-1 sm:mt-0" />
						<div>
							<i18n-t
								keypath="components.pricing.enterprisePlan.features.contacts.title"
								tag="div"
								class="font-semibold"
							>
								<template #count>
									<span class="bg-primary-content/15 px-1.5 rounded">{{ formattedContactCount }}</span>
								</template>
							</i18n-t>
							<div class="text-sm opacity-75">
								{{ $t('components.pricing.enterprisePlan.features.contacts.description') }}
							</div>
						</div>
					</div>

					<div class="flex flex-col sm:flex-row gap-2 sm:items-center">
						<i class="fa fa-user-tie mt-1 sm:mt-0" />
						<div>
							<div class="font-semibold">
								{{ $t('components.pricing.enterprisePlan.perks.dedicated.title') }}
							</div>
							<div class="text-sm opacity-75">
								{{ $t('components.pricing.enterprisePlan.perks.dedicated.description') }}
							</div>
						</div>
					</div>

					<div class="flex flex-col sm:flex-row gap-2 sm:items-center">
						<i class="fa fa-plug mt-1 sm:mt-0" />
						<div>
							<div class="font-semibold">
								{{ $t('components.pricing.enterprisePlan.perks.integrations.title') }}
							</div>
							<div class="text-sm opacity-75">
								{{ $t('components.pricing.enterprisePlan.perks.integrations.description') }}
							</div>
						</div>
					</div>

					<div class="flex flex-col sm:flex-row gap-2 sm:items-center">
						<i class="fa fa-shield-halved text-warning mt-1 sm:mt-0" />
						<div>
							<div class="font-semibold">
								{{ $t('components.pricing.enterprisePlan.perks.sla.title') }}
							</div>
							<div class="text-sm opacity-75">
								{{ $t('components.pricing.enterprisePlan.perks.sla.description') }}
							</div>
						</div>
					</div>
				</div>

				<div class="mt-auto pt-8 space-y-2">
					<localized-link
						name="contact"
						class="btn btn-transition rounded-lg w-full bg-base-100 text-primary border-0 hover:bg-base-200 shadow-lg"
					>
						{{ $t('components.pricing.enterprisePlan.primaryCta') }}
						<i class="fa fa-chevron-right link-icon" />
					</localized-link>

					<a
						href="mailto:hello@simpliers.com"
						class="btn btn-ghost btn-transition rounded-lg w-full text-primary-content border border-primary-content/30 hover:bg-primary-content/10"
					>
						<i class="fa fa-envelope mr-2" />
						{{ $t('components.pricing.enterprisePlan.secondaryCta') }}
					</a>

					<p class="text-xs opacity-70 text-center pt-2">
						{{ $t('components.pricing.enterprisePlan.trust') }}
					</p>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import LocalizedLink from '~/components/GlobalComponents/LocalizedLink.vue'

export default {
	components: { LocalizedLink },
	props: {
		contactCount: {
			type: Number,
			default: 0,
		},
	},
	computed: {
		formattedContactCount() {
			return this.$formatNumber(this.contactCount, this.$i18n.locale)
		},
	},
}
</script>
