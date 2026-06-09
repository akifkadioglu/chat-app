<template>
	<div
		v-if="show"
		class="inline-flex items-center px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition border border-subtle bg-base-100"
	>
		<!-- Avatar -->
		<ProfilePicture src="/images/icon.png" bgColor="bg-white" />

		<!-- Username -->
		<div class="ml-3">
			<div class="font-medium leading-none">
				<a
					:href="`https://www.instagram.com/${$instagramUsername()}`"
					target="_blank"
					rel="noopener noreferrer nofollow"
					class="text-sm link"
				>
					{{ $instagramUsername() }}
				</a>
			</div>
		</div>

		<!-- Follow Button -->
		<a
			:href="`https://www.instagram.com/${$instagramUsername()}`"
			target="_blank"
			rel="noopener noreferrer nofollow"
			class="ml-3 btn btn-sm btn-primary btn-soft"
		>
			Follow Us
		</a>

		<!-- Close -->
		<i v-if="showCloseButton" class="fa fa-times text-sm ml-2 cursor-pointer" @click="show = false" />
	</div>
</template>
<script>
import ProfilePicture from '~/components/GlobalComponents/ProfilePicture.vue'

export default {
	name: 'FollowSimpliersComponent',
	components: { ProfilePicture },
	props: {
		showCloseButton: {
			type: Boolean,
			default: false,
		},
	},
	setup() {
		return {
			sessionStore: useSessionStore(),
		}
	},
	data() {
		return {
			show: true,
		}
	},
}
</script>

<style scoped></style>
