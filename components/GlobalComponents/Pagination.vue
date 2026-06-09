<template>
	<div class="flex justify-center mt-4 pb-4" v-auto-animate>
		<!-- Infinite Scroll Mode -->
		<loading-element v-if="loading" />
		<div v-else-if="infiniteScroll" class="text-center">
			<div v-if="error || hasFailed" class="text-error text-lg" @click="retry" style="cursor: pointer">
				<i class="fas fa-rotate-right"></i>
			</div>
			<div v-else-if="!hasMore" class="text-success/20 text-lg">
				<i class="fas fa-check-circle"></i>
			</div>
			<div v-else class="text-gray-400 text-lg" @click="loadNextPage" style="cursor: pointer">
				<i class="fas" :class="directionTop ? 'fa-arrow-up' : 'fa-arrow-down'" />
			</div>
		</div>

		<!-- Normal Pagination Mode -->
		<div v-else>
			<div v-if="hasMore" class="btn-group">
				<!-- Önceki sayfa -->
				<button
					class="btn btn-sm"
					:class="{ 'btn-disabled': currentPage === 1 }"
					@click="goToPage(currentPage - 1)"
					:disabled="currentPage === 1"
				>
					<i class="fas fa-chevron-left"></i>
				</button>

				<!-- Sayfa numaraları -->
				<button
					v-for="page in visiblePages"
					:key="page"
					class="btn btn-sm"
					:class="{ 'btn-active': page === currentPage }"
					@click="goToPage(page)"
				>
					{{ page }}
				</button>

				<!-- Sonraki sayfa -->
				<button
					class="btn btn-sm"
					:class="{ 'btn-disabled': !hasMore }"
					@click="goToPage(currentPage + 1)"
					:disabled="!hasMore"
				>
					<i class="fas fa-chevron-right"></i>
				</button>
			</div>
		</div>
	</div>
</template>

<script>
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'

export default {
	components: { LoadingElement },
	props: {
		infiniteScroll: {
			type: Boolean,
			default: false,
		},
		directionTop: {
			type: Boolean,
			default: false,
		},
		loading: {
			type: Boolean,
			default: false,
		},
		// Mevcut sayfa
		currentPage: {
			type: Number,
			default: 1,
		},
		hasMore: {
			type: Boolean,
			default: false,
		},
		error: {
			type: Boolean,
			default: false,
		},
	},
	computed: {
		// hasPages() {
		// 	return this.totalPages > 1 || this.totalPages === null
		// },
		visiblePages() {
			const pages = []
			const maxVisible = 5
			// SimplePaginate: toplam sayfa bilinmiyor, bilinen en yüksek sayfa currentPage (+1 if hasMore)
			const knownLastPage = this.hasMore ? this.currentPage + 1 : this.currentPage

			if (knownLastPage <= maxVisible) {
				for (let i = 1; i <= knownLastPage; i++) {
					pages.push(i)
				}
			} else {
				let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2))
				let end = Math.min(knownLastPage, start + maxVisible - 1)

				if (end - start + 1 < maxVisible) {
					start = Math.max(1, end - maxVisible + 1)
				}

				for (let i = start; i <= end; i++) {
					pages.push(i)
				}
			}

			return pages
		},
	},
	data() {
		return {
			isCurrentlyVisible: false, // Şu anda görünür mü?
			autoLoadInterval: null, // Otomatik yükleme interval'i
			awaitingPage: null, // Emit edilip cevap bekleyen sayfa
			hasFailed: false, // Önceki istek başarısız mı
		}
	},
	mounted() {
		if (this.infiniteScroll) {
			this.setupIntersectionObserver()
		}
	},
	unmounted() {
		// Observer'ı temizle
		if (this.observer) {
			this.observer.disconnect()
		}
		// Interval'i temizle
		if (this.autoLoadInterval) {
			clearInterval(this.autoLoadInterval)
		}
	},
	emits: ['page-change'],
	methods: {
		goToPage(page) {
			if (page >= 1 && page !== this.currentPage) {
				if (page > this.currentPage && !this.hasMore) return
				this.$emit('page-change', page)
			}
		},
		setupIntersectionObserver() {
			// Intersection Observer ile component'in görünürlüğünü takip et
			const observer = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						if (entry.isIntersecting) {
							this.isCurrentlyVisible = true
							this.startAutoLoadInterval()
							consoleLog('Pagination component visible - checking and loading')
							this.checkAndLoadNext()
						} else {
							this.isCurrentlyVisible = false
							// Görünür değilse interval'i durdur
							this.stopAutoLoadInterval()
						}
					})
				},
				{
					root: null,
					rootMargin: '100px', // 100px önceden tetikle
					threshold: 0.1,
				},
			)

			// Component'i observe et
			observer.observe(this.$el)

			// Observer'ı instance'a kaydet ki unmounted'da temizleyebilelim
			this.observer = observer
		},
		checkAndLoadNext() {
			consoleLog('Checking if next page should be loaded...', {
				isCurrentlyVisible: this.isCurrentlyVisible,
				loading: this.loading,
				currentPage: this.currentPage,
			})
			// Bekleyen istek var ve loading bittiyse sonucu değerlendir
			if (this.awaitingPage !== null && !this.loading) {
				if (this.currentPage >= this.awaitingPage) {
					// Başarılı
					this.awaitingPage = null
				} else {
					// currentPage ilerlemedi → başarısız
					this.hasFailed = true
					this.awaitingPage = null
					this.stopAutoLoadInterval()
					return
				}
			}
			// Hata varsa otomatik yükleme dur, kullanıcı retry'a basmalı
			if (this.error || this.hasFailed) {
				this.stopAutoLoadInterval()
				return
			}
			// Component görünür mü ve loading değil mi kontrol et
			if (this.isCurrentlyVisible && !this.loading) {
				// Son sayfaya gelmediyse yükle
				if (this.hasMore) {
					console.log('Auto-loading next page')
					this.loadNextPage()
				} else {
					// Son sayfaya geldiyse interval'i durdur
					console.log('Reached last page, stopping auto-load interval')
					this.stopAutoLoadInterval()
				}
			}
		},
		loadNextPage() {
			// Hata varsa otomatik ilerleme dur
			if (this.error || this.hasFailed) {
				console.log('Error state, skipping auto-load')
				return
			}
			// Cevap beklenen istek varsa tekrar emit etme
			if (this.awaitingPage !== null) {
				return
			}
			// Son sayfaya geldiyse dur
			if (
				!this.hasMore
				// this.totalPages && this.currentPage >= this.totalPages
			) {
				console.log('No more pages to load')
				return
			}

			// Loading durumunu tekrar kontrol et
			if (this.loading) {
				console.log('Still loading, skipping next page load')
				return
			}

			console.log('Loading next page...')
			// Sonraki sayfayı yükle
			const nextPage = this.currentPage + 1
			this.awaitingPage = nextPage
			this.$emit('page-change', nextPage)
		},
		startAutoLoadInterval() {
			// Eğer zaten bir interval varsa temizle
			if (this.autoLoadInterval) {
				clearInterval(this.autoLoadInterval)
			}

			// 2 saniyede bir kontrol et
			this.autoLoadInterval = setInterval(() => {
				this.checkAndLoadNext()
			}, 2000) // 2 saniye
		},
		retry() {
			// Hata sonrası kullanıcı manuel tetikledi; aynı sayfayı tekrar iste
			this.hasFailed = false
			this.awaitingPage = null
			this.loadNextPage()
			// Görünüyorsa interval'i tekrar başlat
			if (this.isCurrentlyVisible) {
				this.startAutoLoadInterval()
			}
		},
		stopAutoLoadInterval() {
			if (this.autoLoadInterval) {
				clearInterval(this.autoLoadInterval)
				this.autoLoadInterval = null
				consoleLog('Auto-load interval stopped')
			}
		},
	},
}
</script>
