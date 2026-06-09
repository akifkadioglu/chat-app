<template>
	<div class="fixed top-0 left-0 z-9999">
		<!-- Kapalı durum: Sol tarafta küçük buton -->
		<button
			v-if="!isOpen"
			class="absolute top-2.5 left-0 w-8 h-8 bg-warning border-none rounded-r cursor-pointer flex items-center justify-center shadow-md transition-all duration-200 ease-in-out hover:w-10 hover:bg-warning/80"
			title="Admin Panel"
			@click="isOpen = true"
		>
			<i class="fas fa-cog"></i>
		</button>

		<!-- Açık durum: Full width panel -->
		<div v-else class="fixed top-0 left-0 w-full bg-warning shadow-md animate-slide-in">
			<div class="bs container flex gap-2 items-center justify-center flex-wrap py-2">
				<button class="btn btn-info btn-xs" @click="loginTeam">Team</button>

				<LocaleSwitcher btnClass="btn rounded-md btn-xs" />

				<CurrencySwitcher btnClass="btn-xs" />

				<CountrySwitcher btnClass="btn-xs" />

				<ScenarioVisibleSwitcher />

				<!--      <button class="btn btn-soft-info btn-sm" @click="localizeRoutes">Routes</button>-->

				<ThemeToggler />

				<button class="btn btn-xs ml-auto" title="Kapat" @click="isOpen = false">
					<i class="fas fa-times"></i>
				</button>
			</div>
		</div>
	</div>
</template>

<script>
import LocaleSwitcher from '~/components/BaseComponents/LocaleSwitcher.vue'
import CurrencySwitcher from '~/components/BaseComponents/CurrencySwitcher.vue'
import CountrySwitcher from '~/components/BaseComponents/CountrySwitcher.vue'
import { consoleLog } from '#imports'
import { generateLocalizedRoutes } from '~/helpers/localizeRoutes.js'
import ThemeToggler from '~/components/BaseComponents/ThemeToggler.vue'
import ScenarioVisibleSwitcher from '~/components/GlobalComponents/ScenarioVisibleSwitcher.vue'

export default {
	components: {
		CountrySwitcher,
		LocaleSwitcher,
		CurrencySwitcher,
		ThemeToggler,
		ScenarioVisibleSwitcher,
	},
	data() {
		return {
			isOpen: false,
		}
	},
	methods: {
		loginTeam() {
			this.$requestAdapter.get('api/team').then((response) => {
				const targetUrl = response.data.team_url
				window.open(targetUrl, '_blank')
			})
		},
		localizeRoutes() {
			consoleLog(generateLocalizedRoutes())
		},
	},
}
</script>

<style scoped>
@keyframes slide-in {
	from {
		transform: translateX(-100%);
		opacity: 0;
	}
	to {
		transform: translateX(0);
		opacity: 1;
	}
}

.animate-slide-in {
	animation: slide-in 0.2s ease;
}
</style>
