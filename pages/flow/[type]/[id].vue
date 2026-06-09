<template>
	<FlowSetup
		trailing-show-size="3xl"
		second-trailing-width-classes="md:mx-auto w-4/5 max-w-80 xl:w-96"
		second-trailing-show-size="md"
		second-trailing-container-classes="md:flex md:flex-1 justify-center"
		:disableSelectAllAccount="true"
		:disableAccountChange="true"
		mainContentClasses="max-w-135 md:w-90 lg:w-135 mx-auto"
	>
		<QuickFlow />

		<template #secondTrailingToggleButtonIcon>
			<i class="fa fa-mobile-screen" />
		</template>

		<template #secondTrailingContent>
			<LazyFlowPreview class="mx-auto my-auto py-5 z-3" />
		</template>
	</FlowSetup>
</template>
<script>
import QuickFlow from '~/components/Flow/QuickFlow.vue'
import FlowSetup from '~/components/Flow/FlowSetup.vue'
export default {
	components: {
		QuickFlow,
		FlowSetup,
	},
	setup() {
		definePageMeta({
			layout: 'app',
			middleware: ['auth-custom'],
		})
	},
}
</script>
