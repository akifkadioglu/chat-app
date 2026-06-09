<template>
	<FlowSetup
		trailing-width-classes="min-w-40 w-4/5 2xl:w-100"
		trailing-show-size="xl"
		second-trailing-width-classes="min-w-72 w-4/5 md:w-96 lg:w-108 xl:w-140"
		second-trailing-show-size="md"
		:disableSelectAllAccount="true"
		:disableAccountChange="true"
		mainContentClasses="flex flex-col flex-1"
	>
		<Flow ref="flow" class="max-w-2xl flex-1 my-auto" />

		<template #secondTrailingToggleButtonIcon>
			<i />
			<!--			<i class="fa fa-cog" />-->
		</template>
		<template #trailingToggleButtonIcon>
			<i class="fa fa-mobile-screen" />
		</template>
		<template #trailingContent>
			<div class="w-full min-h-full py-20 my-auto">
				<LazyFlowPreview :width="210" />
			</div>
		</template>
		<template #secondTrailingContent>
			<NodeSettings />
		</template>
	</FlowSetup>
</template>

<script>
import Flow from '~/components/Flow/Flow.vue'
import NodeSettings from '~/components/Flow/NodeSettings.vue'
import FlowSetup from '~/components/Flow/FlowSetup.vue'
export default {
	components: {
		NodeSettings,
		Flow,
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
