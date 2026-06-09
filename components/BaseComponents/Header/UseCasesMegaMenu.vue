<template>
	<MegaMenu content-width="md:w-[min(90vw,560px)]" align="center">
		<template #title>
			<i class="fa fa-rocket fa-md" />
			{{ $t('components.baseComponents.defaultLayoutHeader.navigation.useCases') }}
		</template>
		<div class="md:flex md:gap-4">
			<div
				class="hidden md:flex flex-col justify-center items-center rounded-lg bg-linear-to-br from-primary/10 to-primary/5 p-5 w-52 shrink-0"
			>
				<i class="fa-brands fa-instagram text-4xl text-primary mb-2" />
				<p class="text-xs font-semibold text-center leading-tight">
					{{ $t('components.baseComponents.defaultLayoutHeader.megaMenu.heroTitle') }}
				</p>
				<p class="text-[11px] text-muted text-center mt-1 leading-tight">
					{{ $t('components.baseComponents.defaultLayoutHeader.megaMenu.heroDescription') }}
				</p>
			</div>
			<UseCasesLinks />
		</div>
	</MegaMenu>
</template>

<script>
import MegaMenu from '~/components/BaseComponents/Header/MegaMenu.vue'
import UseCasesLinks from '~/components/BaseComponents/Header/UseCasesLinks.vue'

export default {
	components: {
		MegaMenu,
		UseCasesLinks,
	},
}
</script>
