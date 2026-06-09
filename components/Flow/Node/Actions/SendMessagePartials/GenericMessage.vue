<template>
	<div class="w-full">
		<!--TODO :: 3 tane ekleyince anlamsızca büyüyor nedenini çözemedim-->
		<custom-swiper
			ref="customSwiper"
			showArrows
			showDots
			arrowPlacement="bottom"
			v-model:current="current"
			:options="{
				loop: false,
				align: 'start',
				containScroll: 'trimSnaps',
			}"
			:length="content?.elements?.length"
			class="px-5 w-full"
		>
			<template #addButton>
				<button
					v-if="content?.elements?.length === current + 1"
					:disabled="content?.elements?.length > 9"
					@click="addElement"
					class="btn bg-base-100 btn-circle"
				>
					<i class="fa fa-plus" />
				</button>
				<button v-else @click="$refs.customSwiper.scrollTo(this.current + 1)" class="btn bg-base-100 btn-circle">
					<i class="fa fa-chevron-right" />
				</button>
			</template>
			<template #buttonsNearArrows>
				<button
					@click="removeElement"
					class="btn btn-xs btn-link btn-error text-error hover:text-error"
					:class="{
						'opacity-50': content?.elements?.length === 1,
					}"
					:disabled="content?.elements?.length === 1"
				>
					<i class="fa fa-trash fa-lg" />
				</button>
			</template>
			<div v-for="element in content?.elements" class="px-2 w-full">
				<ImageMessage :content="element" class="rounded-b-none pt-2" />
				<!--				<input-->
				<!--					type="text"-->
				<!--					placeholder="Enter default URL (e.g., https://example.com)"-->
				<!--					class="input rounded-none w-full"-->
				<!--					v-model="element.defaultAction.url"-->
				<!--				/>-->
				<TextMessage
					:placeholder="$t('components.flow.node.actions.sendMessagePartials.genericMessage.titlePlaceholder')"
					:content="element"
					:hideButtons="true"
					minTextareaHeight="50px"
					field="title"
					textareaClasses="rounded-none"
					:max="80"
					:charLimit="80"
				/>
				<TextMessage
					:placeholder="$t('components.flow.node.actions.sendMessagePartials.genericMessage.subtitlePlaceholder')"
					:content="element"
					:node="node"
					minTextareaHeight="50px"
					field="subtitle"
					textareaClasses="rounded-none"
				/>
			</div>
		</custom-swiper>
	</div>
</template>
<script>
import TextMessage from '~/components/Flow/Node/Actions/SendMessagePartials/TextMessage.vue'
import ImageMessage from '~/components/Flow/Node/Actions/SendMessagePartials/ImageMessage.vue'
import CustomSwiper from '~/components/GlobalComponents/CustomSwiper.vue'
import { v4 } from 'uuid'
import { Node } from '~/models/Flow/Node.ts'

export default {
	components: { CustomSwiper, ImageMessage, TextMessage },
	setup() {
		return {
			flowStore: useFlowStore(),
		}
	},
	props: {
		content: {
			type: Object,
			required: true,
		},
		node: {
			type: Node,
			required: true,
		},
	},
	data() {
		return {
			current: 0,
		}
	},
	mounted() {
		if (!this.content.elements) {
			this.content.elements = [this.defaultElement()]
		}
	},
	methods: {
		defaultElement() {
			const uuid = v4()
			return {
				uuid: uuid,
				image: {
					url: '',
					name: '',
					size: 0,
				},
				//TODO :: manychat'te bunun UI'ı yok o yüzden güzel bir UI yapana kadar bunu pas geçtim
				defaultAction: {
					type: 'web_url',
					url: '',
				},
				title: '',
				subtitle: '',
				buttons: [],
			}
		},
		addElement() {
			if (this.content.elements && this.content.elements.length === 10) {
				return
			}
			this.content.elements.push(this.defaultElement())
			this.$nextTick(() => {
				this.$refs.customSwiper.scrollTo(this.content.elements.length - 1)
			})
		},
		removeElement() {
			if (this.content.elements && this.content.elements.length === 1) {
				return
			}
			this.content.elements.splice(this.current, 1)
			this.$nextTick(() => {
				this.$refs.customSwiper.scrollTo(this.current - 1)
			})
		},
	},
}
</script>

<style scoped></style>
