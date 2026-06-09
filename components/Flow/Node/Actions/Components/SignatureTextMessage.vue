<template>
	<TextMessage :showValidation="false" :node="node" :content="content" :buttonCount="1" lockedButton readOnly>
		<template #action>
			<SignatureLanguagePicker
				:modelValue="content?.locale"
				@update:modelValue="changeLanguage"
				dropdownClass="absolute bottom-2 right-2"
			/>
		</template>
	</TextMessage>
</template>
<script>
import TextMessage from '~/components/Flow/Node/Actions/SendMessagePartials/TextMessage.vue'
import SignatureLanguagePicker from '~/components/Flow/Node/Actions/Components/SignatureLanguagePicker.vue'
import { Node } from '~/models/Flow/Node.ts'
import { SIGNATURE_MESSAGES } from '~/models/Flow/utils/signatureMessages'
export default {
	name: 'SignatureTextMessage',
	components: { SignatureLanguagePicker, TextMessage },
	props: {
		node: {
			type: Node,
			required: true,
		},
	},
	computed: {
		content() {
			return this.node.config.contents?.[0] ?? {}
		},
	},
	methods: {
		changeLanguage(locale) {
			this.content.locale = locale
			const messages = SIGNATURE_MESSAGES[locale] || SIGNATURE_MESSAGES.en_US
			this.content.text = messages.text

			if (this.content.buttons) {
				this.content.buttons[0].url = messages.path
				this.content.buttons[0].text = messages.buttonText
			}
		},
	},
}
</script>

<style scoped></style>
