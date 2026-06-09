<template>
	<i18n-t keypath="components.landing.components.approvedByMeta" tag="span" class="font-medium">
		<template #meta>
			<!-- (Inter fontu kullanılabilir) -->
			<span><MetaIcon class="w-auto align-text-bottom inline mr-1" />Meta</span>
		</template>
	</i18n-t>
</template>

<script>
import MetaIcon from '~/components/GlobalComponents/MetaIcon.vue'

export default {
	name: 'ApprovedByMeta',
	components: { MetaIcon },
	props: {},
}
</script>
