<template>
	<div class="space-y-7">
		<div>
			<i18n-t keypath="pages.main.termsOfPayment.text" tag="p" class="text-preline">
				<template #simpliers>
					<simpliers-logo />
				</template>
			</i18n-t>
		</div>
		<div>
			<h4 class="font-medium text-xl mb-1">{{ $t('pages.main.termsOfPayment.content1.title') }}</h4>
			<p
				v-for="(text, i) in $tm('pages.main.termsOfPayment.content1.texts')"
				:key="i"
				class="text-preline"
				v-html="replace($t('pages.main.termsOfPayment.content1.texts.' + i))"
			/>
		</div>
		<div>
			<h4 class="font-medium text-xl mb-1">{{ $t('pages.main.termsOfPayment.content2.title') }}</h4>
			<p
				v-for="(text, i) in $tm('pages.main.termsOfPayment.content2.texts')"
				:key="i"
				class="text-preline"
				v-html="replace($t('pages.main.termsOfPayment.content2.texts.' + i))"
			/>
		</div>
		<div>
			<h4 class="font-medium text-xl mb-1">{{ $t('pages.main.termsOfPayment.content3.title') }}</h4>
			<p
				v-for="(text, i) in $tm('pages.main.termsOfPayment.content3.texts')"
				:key="i"
				class="text-preline"
				v-html="replace($t('pages.main.termsOfPayment.content3.texts.' + i))"
			/>
		</div>
		<div>
			<h4 class="font-medium text-xl mb-1">{{ $t('pages.main.termsOfPayment.content4.title') }}</h4>
			<p
				v-for="(text, i) in $tm('pages.main.termsOfPayment.content4.texts')"
				:key="i"
				class="text-preline"
				v-html="replace($t('pages.main.termsOfPayment.content4.texts.' + i))"
			/>
		</div>
		<div>
			<h4 class="font-medium text-xl mb-1">{{ $t('pages.main.termsOfPayment.content45.title') }}</h4>
			<p
				v-for="(text, i) in $tm('pages.main.termsOfPayment.content45.texts')"
				:key="i"
				class="text-preline"
				v-html="replace($t('pages.main.termsOfPayment.content45.texts.' + i))"
			/>
		</div>
		<div>
			<h4 class="font-medium text-xl mb-1">{{ $t('pages.main.termsOfPayment.content5.title') }}</h4>
			<p
				v-for="(text, i) in $tm('pages.main.termsOfPayment.content5.texts')"
				:key="i"
				class="text-preline"
				v-html="replace($t('pages.main.termsOfPayment.content5.texts.' + i))"
			/>
		</div>
		<div>
			<h4 class="font-medium text-xl mb-1">{{ $t('pages.main.termsOfPayment.content6.title') }}</h4>
			<p
				v-for="(text, i) in $tm('pages.main.termsOfPayment.content6.texts')"
				:key="i"
				class="text-preline"
				v-html="replace($t('pages.main.termsOfPayment.content6.texts.' + i))"
			/>
		</div>
		<div>
			<h4 class="font-medium text-xl mb-1">{{ $t('pages.main.termsOfPayment.content7.title') }}</h4>
			<p
				v-for="(text, i) in $tm('pages.main.termsOfPayment.content7.texts')"
				:key="i"
				class="text-preline"
				v-html="replace($t('pages.main.termsOfPayment.content7.texts.' + i))"
			/>
		</div>
		<div>
			<h4 class="font-medium text-xl mb-1">{{ $t('pages.main.termsOfPayment.content8.title') }}</h4>
			<p
				v-for="(text, i) in $tm('pages.main.termsOfPayment.content8.texts')"
				:key="i"
				class="text-preline"
				v-html="replace($t('pages.main.termsOfPayment.content8.texts.' + i))"
			/>
		</div>
		<div>
			<h4 class="font-medium text-xl mb-1">{{ $t('pages.main.termsOfPayment.content9.title') }}</h4>
			<p
				v-for="(text, i) in $tm('pages.main.termsOfPayment.content9.texts')"
				:key="i"
				class="text-preline"
				v-html="replace($t('pages.main.termsOfPayment.content9.texts.' + i))"
			/>
		</div>
	</div>
</template>
<script>
import SimpliersLogo from '~/components/GlobalComponents/Brands/SimpliersLogo.vue'

export default {
	components: { SimpliersLogo },
	data() {
		return {
			subscriptionPricesUrl: this.localeRoute('pricing')?.fullPath,
			accountSubscriptionUrl: this.localeRoute('account')?.fullPath,
		}
	},
	setup() {
		return {
			localeRoute: useLocaleRoute(),
			localePath: useLocalePath(),
		}
	},
	methods: {
		replace(text) {
			return text
				.replace(
					'subscriptionPricesUrl',
					`<a href="${this.subscriptionPricesUrl}" target="_blank"><u>${this.$t('pages.main.termsOfPayment.subscriptionPricesLinkText')}</u> <i class="fa fa-external-link fa-xs"></i></a>`,
				)
				.replace(
					'accountSubscriptionUrl',
					`<a href="${this.accountSubscriptionUrl}" target="_blank" rel="noopener noreferrer nofollow"><u>${this.$t('pages.main.termsOfPayment.accountSubscriptionLinkText')}</u> <i class="fa fa-external-link fa-xs"></i></a>`,
				)
		},
	},
}
</script>
