<template>
	<div class="space-y-4">
		<div>
			<ApprovedByMeta class="font-normal" />
		</div>
		<div class="text-subtle text-xs">
			<i18n-t keypath="components.app.emptyCase.metaProviderNotice">
				<template #brand>
					<simpliers-logo />
				</template>
				<template #metaTechProvider>
					<a
						href="https://developers.facebook.com/docs/development/release/tech-providers"
						target="_blank"
						class="link link-secondary"
					>
						{{ $t('components.app.emptyCase.metaTechProvider') }}
						<i class="fa fa-external-link link-icon" />
					</a>
				</template>
				<template #metaDevTerms>
					<a href="https://developers.facebook.com/terms" target="_blank" class="link link-secondary">
						{{ $t('components.app.emptyCase.metaDevTerms') }}
						<i class="fa fa-external-link link-icon" />
					</a>
				</template>
			</i18n-t>
		</div>
		<div class="text-subtle text-xs">
			<i class="fa fa-info-circle text-info"></i>
			<i18n-t keypath="components.app.emptyCase.description2">
				<template #brand>
					<simpliers-logo />
				</template>
			</i18n-t>
		</div>
	</div>
</template>
<script>
import SimpliersLogo from '~/components/GlobalComponents/Brands/SimpliersLogo.vue'
import ApprovedByMeta from '~/components/Landing/Components/ApprovedByMeta.vue'

export default {
	components: { ApprovedByMeta, SimpliersLogo },
}
</script>
