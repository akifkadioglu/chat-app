<template>
	<div class="mt-auto mb-3 px-6 flex pt-3 border-t border-base-300">
		<div class="text-sm text-base-content/50 mt-auto">
			<i18n-t keypath="components.baseComponents.mainFooter.copyright">
				<template #simpliers>
					<SimpliersLogo />
				</template>
				<template #year>
					{{ new Date().getFullYear() }}
				</template>
			</i18n-t>
		</div>
		<LocaleSwitcher class="ml-auto" btnClass="btn rounded-md btn-sm" />
	</div>
</template>
<script>
import SimpliersLogo from '~/components/GlobalComponents/Brands/SimpliersLogo.vue'
import LocaleSwitcher from '~/components/BaseComponents/LocaleSwitcher.vue'
export default {
	components: { LocaleSwitcher, SimpliersLogo },
}
</script>
