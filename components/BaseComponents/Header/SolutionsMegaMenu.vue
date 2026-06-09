<template>
	<MegaMenu content-width="md:w-[min(94vw,960px)]" align="center" viewport-centered>
		<template #title>
			<i class="fa fa-bullseye fa-md" />
			{{ $t('components.baseComponents.defaultLayoutHeader.navigation.solutions') }}
		</template>
		<SolutionsLinks />
	</MegaMenu>
</template>

<script>
import MegaMenu from '~/components/BaseComponents/Header/MegaMenu.vue'
import SolutionsLinks from '~/components/BaseComponents/Header/SolutionsLinks.vue'

export default {
	components: {
		MegaMenu,
		SolutionsLinks,
	},
}
</script>
