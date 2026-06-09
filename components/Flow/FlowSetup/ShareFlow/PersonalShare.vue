<template>
	<div class="space-y-3">
		<div>
			<div class="h4 mb-1">{{ $t('components.flow.flowSetup.shareFlow.personalShare.title') }}</div>
			<p class="text-xs text-muted">
				{{ $t('components.flow.flowSetup.shareFlow.personalShare.description') }}
			</p>
		</div>

		<CopyToClipboard
			:isLoading="loading"
			:copyText="linkWithLocale"
			class="border border-primary/40 bg-primary/10 rounded-lg px-3 py-2 w-full flex items-center gap-2 text-sm"
		>
			<i class="fa fa-link text-primary" />
			<div class="truncate flex-1 text-left">{{ link.replace(/^https?:\/\//, '') }}</div>
		</CopyToClipboard>

		<button
			v-if="hasChanges"
			type="button"
			class="btn btn-link btn-primary btn-sm w-full"
			:disabled="updating"
			@click="update"
		>
			<LoadingElement :isLoading="updating" size="16">
				{{ $t('components.flow.flowSetup.shareFlow.personalShare.updateButton') }}
			</LoadingElement>
		</button>

		<div class="flex items-center justify-center gap-4 pt-1">
			<CopyToClipboard :copyText="linkWithLocale" class="text-xl text-primary" />
			<a
				:href="
					'whatsapp://send?text=' +
					encodeURIComponent($t('components.flow.flowSetup.shareFlow.personalShare.whatsappText')) +
					linkWithLocale
				"
				target="_blank"
				rel="noopener noreferrer nofollow"
			>
				<i class="fa-brands fa-whatsapp text-xl text-success" />
			</a>
			<a
				:href="
					'https://twitter.com/intent/tweet?text=' +
					encodeURIComponent($t('components.flow.flowSetup.shareFlow.personalShare.tweetText')) +
					linkWithLocale
				"
				target="_blank"
				rel="noopener noreferrer nofollow"
			>
				<i class="fa-brands fa-x-twitter text-xl text-twitter" />
			</a>
			<a
				:href="'https://www.facebook.com/sharer/sharer.php?u=' + linkWithLocale"
				target="_blank"
				rel="noopener noreferrer nofollow"
			>
				<i class="fa-brands fa-facebook text-xl text-info" />
			</a>
		</div>
	</div>
</template>

<script>
import CopyToClipboard from '~/components/GlobalComponents/Elements/CopyToClipboard.vue'
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import { SharedFlow } from '~/models/Flow/SharedFlow.ts'
import apiList from '~/apis/ApiList.js'

export default {
	components: { CopyToClipboard, LoadingElement },
	props: {
		link: {
			type: String,
			default: '',
		},
		loading: {
			type: Boolean,
			default: false,
		},
	},
	setup() {
		return {
			flowStore: useFlowStore(),
		}
	},
	data() {
		return {
			updating: false,
		}
	},
	computed: {
		sharedVersion() {
			return this.flowStore.flow?.sharedFlows?.link?.flowVersion?.version ?? null
		},
		currentVersion() {
			return this.flowStore.flow?.version ?? null
		},
		linkWithLocale() {
			if (!this.link) return ''
			const separator = this.link.includes('?') ? '&' : '?'
			return 'https://' + this.link + separator + 'l=' + this.$i18n.locale
		},
		hasChanges() {
			if (!this.sharedVersion || !this.currentVersion) {
				return false
			}
			return this.sharedVersion !== this.currentVersion
		},
	},
	methods: {
		update() {
			this.updating = true
			this.$requestAdapter
				.post(apiList.chat.flow.id.share.update, null, {
					id: this.flowStore.flow.id,
				})
				.then((response) => {
					this.flowStore.flow.sharedFlows.link = new SharedFlow(response.data.link)
				})
				.finally(() => {
					this.updating = false
				})
		},
	},
}
</script>
