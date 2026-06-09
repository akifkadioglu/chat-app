<template>
	<div>
		<div v-if="node.config?.contents && node.config.contents.length > 0" class="flex flex-col gap-2 text-xs w-full">
			<div v-for="content in node.config.contents.slice(0, 3)" :key="content.id" class="text-sm font-medium">
				<i18n-t keypath="components.flow.node.actions.signature.contentTypeSummary">
					<template #simpliersChat>
						<SimpliersLogo />
						<ChatLogo />
					</template>
				</i18n-t>
			</div>

			<p class="text-xs text-base-content/70">
				<i class="fa fa-info-circle text-info mr-1" />
				{{ $t('components.flow.node.actions.signature.summaryDescription') }}
			</p>
		</div>
	</div>
</template>

<script>
import { Node } from '~/models/Flow/Node.js'
import SimpliersLogo from '~/components/GlobalComponents/Brands/SimpliersLogo.vue'
import ChatLogo from '~/components/GlobalComponents/Brands/ChatLogo.vue'

export default {
	components: { ChatLogo, SimpliersLogo },
	props: {
		node: {
			type: Node,
			required: true,
		},
	},
}
</script>
