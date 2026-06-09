<template>
	<div>
		<RequestBuilder v-model="node.config.requestConfig" :show-message-fields="false" :show-response-settings="false" />
	</div>
</template>

<script>
import RequestBuilder from '~/components/Flow/Node/Actions/ExternalRequestPartials/RequestBuilder.vue'

export default {
	components: {
		RequestBuilder,
	},
	props: {
		node: {
			type: Object,
			required: true,
		},
	},
	data() {
		return {}
	},
	mounted() {},
	computed: {},
}
</script>
