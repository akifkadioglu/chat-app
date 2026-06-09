<template>
	<Html class="bg-simpliers">
		<Body class="overflow-hidden md:overflow-auto">
			<div class="grid grid-cols-12 min-h-screen">
				<!-- Sol taraf -->
				<LeftPanel class="lg:col-span-5 xl:col-span-4 bg-base-100/70" />

				<!-- Sağ taraf -->
				<div class="col-span-12 lg:col-span-7 xl:col-span-8 flex justify-center bg-base-100 items-center min-h-screen">
					<div class="flex flex-col w-full h-full">
						<!-- Geri butonu -->
						<div class="pt-5 px-4">
							<button @click="goBackOrLanding" class="link gap-2 no-underline text-simpliers hover:text-simpliers/80">
								<i class="fa fa-chevron-left" /> BACK
							</button>
						</div>

						<!-- Form slot -->
						<div class="w-full mx-auto my-auto max-w-md px-4">
							<!--							<slot />-->
						</div>

						<!-- Footer logo -->
						<div class="mt-auto pb-4 text-center">
							<localized-link name="index" class="text-lg text-neutral">
								<simpliers-logo />
							</localized-link>
						</div>
					</div>
				</div>
			</div>
		</Body>
	</Html>
</template>

<script>
import SimpliersLogo from '@/components/GlobalComponents/Brands/SimpliersLogo'
import LocalizedLink from '~/components/GlobalComponents/LocalizedLink.vue'
import LeftPanel from '~/components/GlobalComponents/Auth/LeftPanel.vue'

export default {
	components: {
		LeftPanel,
		LocalizedLink,
		SimpliersLogo,
	},
	mounted() {
		this.$domHelpers.loadExternalStyleSheet('/fonts/fontawesome710/css/all.min.css')

		this.$router.push(this.$localeRoute({ name: 'index' }))
	},
	setup() {
		usePageMeta({
			meta: [
				{
					name: 'server',
					content: settingsStore.serverName,
				},
			],
		})

		return {
			localeRoute: useLocaleRoute(),
			colorMode: useColorMode(),
		}
	},
	methods: {
		goBackOrLanding() {
			// app sayfaları artık kök altında (eski /app öneki kalktı); geri dönüşte tekrar app'e düşmemek için index'e gönderiyoruz
			this.$router.push(this.localeRoute('index'))
		},
	},
}
</script>
