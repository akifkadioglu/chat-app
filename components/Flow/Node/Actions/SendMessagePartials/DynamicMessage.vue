<template>
	<div class="bg-base-300 rounded-lg p-2">
		<RequestBuilder v-model="content.dynamic" :show-response-settings="true" />
	</div>
</template>

<script>
import RequestBuilder from '~/components/Flow/Node/Actions/ExternalRequestPartials/RequestBuilder.vue'

export default {
	components: {
		RequestBuilder,
	},
	props: {
		content: {
			type: Object,
			required: true,
		},
	},
	data() {
		// Initialize content.dynamic if it doesn't exist
		this.content.dynamic = this.content.dynamic ?? {
			method: 'GET',
			url: '',
			headers: [],
			body: {
				type: 'form',
				fields: [],
				json: '',
				raw: '',
			},
			response: {
				messagePath: 'data.message',
				fallbackMessage: "Sorry, we couldn't load the dynamic content.",
				responseVariable: '',
				extractPath: '',
			},
			settings: {
				timeout: 10,
				retryAttempts: 1,
				cacheResponse: false,
				cacheDuration: 5,
				continueOnError: false,
			},
		}

		return {}
	},
}
</script>
