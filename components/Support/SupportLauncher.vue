<template>
	<div>
		<!-- Support Launcher Button -->
		<SupportButton :inApp="inApp" :isOpen="isOpen" @toggle="toggleLauncher" @position-change="onPositionChange" />

		<!-- Support Panel -->
		<div class="fixed bottom-16 z-50" :class="panelPosition" v-auto-animate>
			<div
				v-if="isOpen"
				@click.stop
				class="bg-base-100 rounded-2xl shadow-xl w-72 md:w-96 h-[70vh] max-h-[650px] border border-base-300 flex flex-col overflow-hidden absolute bottom-20"
				:class="panelPosition === 'right-6' ? 'right-0' : 'left-0'"
			>
				<!-- Navigation Header -->
				<div class="bg-success text-base-100 p-3 flex justify-between items-center">
					<div class="flex items-center space-x-2">
						<button v-if="currentPage !== 'home'" @click="goBack" class="btn btn-ghost btn-sm btn-circle">
							<i class="fa fa-chevron-left" />
						</button>
						<h3 class="font-semibold text-sm">
							<span v-if="currentPage === 'create'">
								{{ $t('components.support.supportLauncher.navigation.newConversation') }}
							</span>
							<span v-else-if="currentPage === 'thread'">
								{{ $t('components.support.supportLauncher.navigation.threadDetails') }}
							</span>
						</h3>
					</div>
					<button @click="toggleLauncher" class="btn btn-ghost btn-sm btn-circle">
						<i class="fa fa-times" />
					</button>
				</div>

				<!-- Content Area with Scroll Management -->
				<!-- Home Page - Thread List -->
				<keep-alive>
					<ThreadList
						ref="threadList"
						v-if="currentPage === 'home'"
						@open-thread="openThread"
						@create-thread="goToCreateThread"
					/>
					<!-- Create Thread Page -->
					<CreateThread v-else-if="currentPage === 'create'" @threadCreated="onThreadCreated" />

					<!-- Thread Detail Page -->
					<ThreadMessages v-else-if="currentPage === 'thread'" :threadHash="selectedThread.hash" />
				</keep-alive>
			</div>
		</div>
	</div>
</template>

<script>
import ThreadList from './ThreadList.vue'
import CreateThread from './CreateThread.vue'
import ThreadMessages from './ThreadMessages.vue'
import SupportButton from './SupportButton.vue'
import pkg from 'lodash'

const { debounce } = pkg

export default {
	components: {
		ThreadList,
		CreateThread,
		ThreadMessages,
		SupportButton,
	},
	props: {
		inApp: {
			type: Boolean,
			default: false,
		},
	},
	data() {
		return {
			isOpen: false,
			currentPage: 'home', // 'home', 'create', 'thread'
			selectedThread: null,
			pageHistory: [],
			listeningMessages: false,
			panelPosition: 'right-6', // Panel pozisyonu (right-6 veya left-6)
		}
	},
	setup() {
		return {
			sessionStore: useSessionStore(),
			authStore: useAuthStore(),
		}
	},
	watch: {
		'sessionStore.data.tracker_cookie_id': {
			handler(newVal) {
				if (newVal) {
					this.listenEchoChannelForThread()
				}
			},
			immediate: true,
		},
	},
	mounted() {
		this.$emitter.on('openSupportLauncher', this.openLauncher)
		this.$emitter.on('closeSupportLauncher', this.closeLauncher)
	},
	beforeUnmount() {
		this.$emitter.off('openSupportLauncher', this.openLauncher)
		this.$emitter.off('closeSupportLauncher', this.closeLauncher)
	},
	methods: {
		onPositionChange(position) {
			// Buton pozisyonu değiştiğinde panel pozisyonunu güncelle
			this.panelPosition = position.isOnRight ? 'right-6' : 'left-6'
		},
		listenEchoChannelForThread() {
			if (this.listeningMessages) {
				return
			}
			this.listeningMessages = true

			this.$echo
				.channel('threads-for-user-' + this.authStore.user.id)
				.listen('Threads.PublishRepliedEvent', this.showMessageNotification)

			this.$echo
				.channel('threads-for-tracker-cookie-' + this.sessionStore.data.tracker_cookie_id)
				.listen('Threads.PublishRepliedEvent', this.showMessageNotification)
		},
		showMessageNotification: debounce(function (e) {
			consoleLog('Received Threads.PublishRepliedEvent:', e)

			this.$toast.open({
				message:
					this.$t('components.support.supportLauncher.messageReplied.text') +
					'<br>' +
					'<span class="text-primary">' +
					this.$t('components.support.supportLauncher.messageReplied.action') +
					'</span>',
				position: 'top-right',
				duration: 0,
				onClick: () => {
					this.openLauncher()
					this.openThread({ ...e.message })
				},
			})
		}, 500),

		toggleLauncher() {
			this.isOpen = !this.isOpen
		},
		openLauncher() {
			this.isOpen = true
		},
		closeLauncher() {
			this.isOpen = false
		},

		openThread(thread) {
			console.log('Opening thread:', thread)
			this.selectedThread = thread
			this.navigateToPage('thread')
		},

		goToCreateThread() {
			this.navigateToPage('create')
		},

		navigateToPage(page) {
			this.pageHistory.push(this.currentPage)
			this.currentPage = page
		},

		goBack() {
			if (this.pageHistory.length > 0) {
				this.currentPage = this.pageHistory.pop()
			} else {
				this.currentPage = 'home'
			}
			if (this.currentPage === 'home') {
				this.selectedThread = null
			}
		},

		onThreadCreated(message) {
			this.currentPage = 'home'
			this.pageHistory = []
			this.$nextTick(() => {
				this.$refs.threadList.loadConversations()
			})
		},
	},
}
</script>
