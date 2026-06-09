<template>
	<div
		class="hidden lg:flex flex-col justify-center items-center h-full relative bg-cover"
		style="background-image: url(/images/theme/svg/components/wave-pattern-light.svg)"
	>
		<div class="p-10 w-full my-auto">
			<figure class="text-left">
				<LocalizedLink name="index" class="mb-4 block w-min mx-auto text-nowrap">
					<SimpliersLogo class="dark:text-white text-3xl" :class="simpliersClass" />
					<ChatLogo class="text-4xl" :class="chatClass" />
				</LocalizedLink>

				<blockquote class="relative" :class="quoteClass">
					<i class="fa fa-quote-left opacity-70 absolute top-0 -left-4" />
					The way to be the best is to work only with the best.
					<i class="fa fa-quote-right opacity-70 absolute bottom-0 mx-1" />
				</blockquote>
			</figure>

			<slot />
		</div>
		<div class="mb-5 flex-shrink">
			<base-components-theme-toggler />
		</div>
	</div>
</template>
<script>
import LocalizedLink from '~/components/GlobalComponents/LocalizedLink.vue'
import SimpliersLogo from '~/components/GlobalComponents/Brands/SimpliersLogo.vue'
import ChatLogo from '~/components/GlobalComponents/Brands/ChatLogo.vue'
import ApprovedByMeta from '~/components/Landing/Components/ApprovedByMeta.vue'

export default {
	components: {
		ApprovedByMeta,
		ChatLogo,
		LocalizedLink,
		SimpliersLogo,
	},
	props: {
		simpliersClass: {
			type: String,
			default: 'text-4xl',
		},
		chatClass: {
			type: String,
			default: '',
		},
		quoteClass: {
			type: String,
			default: 'text-white/70  italic text-xl inline px-3',
		},
	},
}
</script>
