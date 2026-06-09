<template>
	<div class="p-8 flex flex-col h-full mt-12">
		<div v-if="viewOnly" class="flex items-end">
			<h3 class="text-4xl font-semibold mb-0 max-w-44">{{ $t('components.pricing.freePlan.title') }}</h3>
		</div>
		<div v-else class="h-34 flex items-end">
			<i18n-t keypath="components.pricing.freePlan.hero.title" tag="h4" class="text-4xl font-semibold mb-0">
				<template #free>
					<span class="text-success font-black tracking-tight">{{ $t('components.pricing.freePlan.hero.free') }}</span>
				</template>
				<template #faster>
					<i class="text-primary">{{ $t('components.pricing.freePlan.hero.faster') }}</i>
				</template>
			</i18n-t>
		</div>
		<div class="divider" />
		<div class="flex flex-col gap-5 flex-1">
			<FeatureSummary iconClass="fa fa-users">
				<template #title>
					<i18n-t keypath="components.pricing.freePlan.features.contacts.title" tag="span">
						<template #limit>
							<span class="bg-primary/10 px-1">{{ $formatNumber(FREE_ACTIVE_CONTACTS_LIMIT, $i18n.locale) }}</span>
						</template>
					</i18n-t>
				</template>
				<template #description>
					<i18n-t
						keypath="components.pricing.freePlan.features.contacts.description"
						tag="div"
						class="text-sm text-muted"
					>
						<template #periodName>
							<span class="text-primary font-bold">{{
								$t('components.pricing.freePlan.features.contacts.monthlyName')
							}}</span>
						</template>
						<template #activePeople>
							<a
								href="#active-contacts-info"
								class="link link-primary underline decoration-dotted underline-offset-2 font-bold hover:brightness-75"
								@click.prevent="openActiveContactsInfoModal"
							>
								<i18n-t keypath="components.pricing.freePlan.features.contacts.activePeople" tag="u">
									<template #limit>
										{{ $formatNumber(FREE_ACTIVE_CONTACTS_LIMIT, $i18n.locale) }}
									</template>
								</i18n-t>
							</a>
						</template>
					</i18n-t>
				</template>
			</FeatureSummary>

			<FeatureSummary
				:description="$t('components.pricing.freePlan.features.essential.description')"
				iconClass="fa fa-seedling text-success"
			>
				<template #title>
					<localized-link name="pricing" hash="#comparison-table" class="font-semibold">
						{{ $t('components.pricing.freePlan.features.essential.title') }}
						<i class="fa fa-chevron-right link-icon"></i>
					</localized-link>
				</template>
			</FeatureSummary>

			<FeatureSummary
				class="mt-auto"
				:title="$t('components.pricing.freePlan.features.noCreditCard.title')"
				:description="$t('components.pricing.freePlan.features.noCreditCard.description')"
				iconClass="fa fa-credit-card text-info"
			>
			</FeatureSummary>

			<FeatureSummary
				:title="$t('components.pricing.freePlan.features.unlock.title')"
				:description="$t('components.pricing.freePlan.features.unlock.description')"
				iconClass="fa fa-unlock"
			>
			</FeatureSummary>
		</div>
		<div class="mt-auto pt-8" :class="{ 'w-full': viewOnly }">
			<localized-link
				v-if="viewOnly"
				class="btn btn-primary btn-transition rounded-lg w-full"
				name="pay-slug"
				:params="{ slug: 'bronze' }"
			>
				<!--			TODO: select first subscription plan slug-->
				{{ $t('components.pricing.freePlan.unlockButton') }}
				<i class="fa fa-chevron-right link-icon" />
			</localized-link>

			<localized-link
				v-else
				class="btn btn-outline btn-primary btn-transition rounded-lg w-full"
				name="index"
				rel="noopener noreferrer nofollow"
			>
				{{ $t('components.pricing.freePlan.startButton') }}
			</localized-link>
		</div>
	</div>
</template>

<script>
import FeatureSummary from '~/components/Pricing/FeatureSummary.vue'
import LocalizedLink from '~/components/GlobalComponents/LocalizedLink.vue'
import { FREE_ACTIVE_CONTACTS_LIMIT } from '~/models/Pricing/Plan.ts'

export default {
	data() {
		return {
			FREE_ACTIVE_CONTACTS_LIMIT,
		}
	},
	components: { LocalizedLink, FeatureSummary },
	props: {
		viewOnly: {
			type: Boolean,
			default: false,
		},
	},
	methods: {
		openActiveContactsInfoModal() {
			this.$emitter.emit('showActiveContactsInfoModal')
		},
	},
}
</script>
