<template>
	<div
		v-show="loadButton"
		@click="handleClick"
		@mousedown="startDrag"
		@touchstart="startDrag"
		:style="{
			bottom: bottomPosition + 'px',
			left: isOnRight ? 'auto' : '24px',
			right: isOnRight ? '24px' : 'auto',
			transform: `translateX(${horizontalOffset}px)`,
			transition: isTransitioning
				? 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), left 0.3s ease, right 0.3s ease, bottom 0.3s ease'
				: dragStarted
					? 'none'
					: 'all 0.3s ease',
		}"
		class="fixed z-3 btn btn-circle btn-success hover:shadow-success cursor-grab select-none"
		:class="{
			shadow: inApp,
			'opacity-50': inApp && !isOpen,
			'hover:opacity-100 hover:delay-300': inApp && !isOpen,
			'btn-xl shadow-xl': !inApp || isOpen,
			'scale-120 shadow-base-content shadow-lg': dragStarted,
		}"
	>
		<span v-auto-animate>
			<i v-if="!isOpen" class="fa fa-comment-dots" />
			<i v-else class="fa fa-chevron-down" />
		</span>
	</div>
</template>

<script>
const defaultBottomPosition = 64 // in px

export default {
	props: {
		inApp: {
			type: Boolean,
			default: false,
		},
		isOpen: {
			type: Boolean,
			default: false,
		},
	},
	emits: ['toggle', 'position-change'],
	data() {
		return {
			loadButton: false,
			previousBottomPosition: null,
			bottomPosition: defaultBottomPosition,
			isOnRight: true,
			isDragging: false,
			dragStarted: false,
			dragStartY: 0,
			dragStartX: 0,
			dragStartBottom: 0,
			horizontalOffset: 0,
			isTransitioning: false,
			dragStartTime: 0,
			lastX: 0,
			dragDirection: null,
		}
	},
	watch: {
		isOpen: {
			handler(newVal) {
				if (newVal) {
					this.previousBottomPosition = this.bottomPosition
					this.bottomPosition = defaultBottomPosition
				} else {
					this.bottomPosition = this.previousBottomPosition || defaultBottomPosition
					this.previousBottomPosition = null
				}
			},
		},
	},
	mounted() {
		// LocalStorage'dan pozisyon bilgilerini yükle (sadece client-side'da)
		const savedPosition = this.loadPositionFromStorage()
		this.loadButton = true
		this.bottomPosition = savedPosition.bottom
		this.isOnRight = savedPosition.isOnRight

		// Sürükleme event listener'ları
		document.addEventListener('mousemove', this.onDrag)
		document.addEventListener('mouseup', this.stopDrag)
		document.addEventListener('touchmove', this.onDrag, { passive: false })
		document.addEventListener('touchend', this.stopDrag)
	},
	beforeUnmount() {
		// Sürükleme event listener'larını temizle
		document.removeEventListener('mousemove', this.onDrag)
		document.removeEventListener('mouseup', this.stopDrag)
		document.removeEventListener('touchmove', this.onDrag, { passive: false })
		document.removeEventListener('touchend', this.stopDrag)
	},
	methods: {
		loadPositionFromStorage() {
			const defaultPosition = { bottom: defaultBottomPosition, isOnRight: true }

			try {
				if (typeof window !== 'undefined' && window.localStorage) {
					const saved = localStorage.getItem('supportLauncherPosition')
					if (saved) {
						const parsed = JSON.parse(saved)
						return {
							bottom: parsed.bottom || defaultBottomPosition,
							isOnRight: parsed.isOnRight ?? true,
						}
					}
				}
			} catch (e) {
				// localStorage erişimi engellenmiş olabilir (iframe, gizli mod vb.)
			}

			return defaultPosition
		},
		savePositionToStorage() {
			try {
				if (typeof window !== 'undefined' && window.localStorage) {
					localStorage.setItem(
						'supportLauncherPosition',
						JSON.stringify({
							bottom: this.bottomPosition,
							isOnRight: this.isOnRight,
						}),
					)
				}
			} catch (e) {
				// localStorage erişimi engellenmiş olabilir (iframe, gizli mod vb.)
			}
		},

		handleClick() {
			// Sadece sürükleme yoksa toggle yap
			if (!this.isDragging) {
				this.$emit('toggle')
			}
		},

		startDrag(e) {
			this.isDragging = false
			this.dragStarted = true
			this.isTransitioning = false
			this.dragStartBottom = this.bottomPosition
			this.dragStartTime = Date.now()
			this.dragDirection = null

			if (e.touches) {
				this.dragStartY = e.touches[0].clientY
				this.dragStartX = e.touches[0].clientX
				this.lastX = e.touches[0].clientX
			} else {
				this.dragStartY = e.clientY
				this.dragStartX = e.clientX
				this.lastX = e.clientX
			}
		},

		onDrag(e) {
			if (this.dragStartY === 0) return

			// Touch ise sayfa scroll'unu engelle
			if (e.touches) {
				e.preventDefault()
			}

			let currentY, currentX
			if (e.touches) {
				currentY = e.touches[0].clientY
				currentX = e.touches[0].clientX
			} else {
				currentY = e.clientY
				currentX = e.clientX
			}

			const deltaY = this.dragStartY - currentY
			const deltaX = currentX - this.dragStartX // Pozitif = sağa, negatif = sola

			// Hareket yönünü belirle (ilk 10px'de)
			if (!this.dragDirection && (Math.abs(deltaY) > 10 || Math.abs(deltaX) > 10)) {
				if (Math.abs(deltaX) > Math.abs(deltaY)) {
					this.dragDirection = 'horizontal'
				} else {
					this.dragDirection = 'vertical'
				}
			}

			// 5px'den fazla hareket varsa sürükleme olarak işaretle
			if (Math.abs(deltaY) > 5 || Math.abs(deltaX) > 5) {
				this.isDragging = true
			}

			// Yatay hareket (sadece yön horizontal ise)
			if (this.dragDirection === 'horizontal') {
				const threshold = 100 // Geçiş için gereken mesafe

				if (this.isOnRight) {
					// Sağdayken
					if (deltaX < 0) {
						// Sola çekiliyor, elastik gerilme
						const elasticFactor = 0.4 // Gerilme katsayısı
						this.horizontalOffset = deltaX * elasticFactor
					} else {
						// Sağa çekiliyor, hafif elastik
						this.horizontalOffset = Math.min(deltaX * 0.2, 20)
					}
				} else {
					// Soldayken
					if (deltaX > 0) {
						// Sağa çekiliyor, elastik gerilme
						const elasticFactor = 0.4
						this.horizontalOffset = deltaX * elasticFactor
					} else {
						// Sola çekiliyor, hafif elastik
						this.horizontalOffset = Math.max(deltaX * 0.2, -20)
					}
				}
			}

			// Dikey hareket (sadece yön vertical ise)
			if (this.dragDirection === 'vertical') {
				// Yeni pozisyonu hesapla
				const newBottom = this.dragStartBottom + deltaY

				// Minimum ve maksimum sınırlar
				const minBottom = 64 // En az 64px (bottom-16)
				const maxBottom = window.innerHeight - 100 // Ekranın üstüne çok yaklaşmasın

				this.bottomPosition = Math.max(minBottom, Math.min(maxBottom, newBottom))
			}

			// Velocity hesabı için son pozisyonu kaydet
			this.lastX = currentX
		},

		stopDrag(e) {
			if (this.dragStartY === 0) return

			// Sadece yatay harekette geçiş kontrolü yap
			if (this.dragDirection === 'horizontal') {
				// Swipe hızı hesapla
				const dragDuration = Date.now() - this.dragStartTime
				let currentX = this.lastX

				if (e.changedTouches) {
					currentX = e.changedTouches[0].clientX
				} else if (e.clientX) {
					currentX = e.clientX
				}

				const deltaX = currentX - this.dragStartX
				const velocity = Math.abs(deltaX) / dragDuration // px/ms

				// Ekranın yarısını geçip geçmediğini kontrol et
				const screenCenter = window.innerWidth / 2
				const isQuickSwipe = velocity > 0.5 && Math.abs(deltaX) > 50

				if (this.isOnRight) {
					// Sağdayken
					if (isQuickSwipe && deltaX < 0) {
						// Hızlı swipe sola
						this.isOnRight = false
					} else if (currentX < screenCenter) {
						// Ekranın sol yarısına geçti
						this.isOnRight = false
					}
					// Yoksa sağda kalır (geri döner)
				} else {
					// Soldayken
					if (isQuickSwipe && deltaX > 0) {
						// Hızlı swipe sağa
						this.isOnRight = true
					} else if (currentX > screenCenter) {
						// Ekranın sağ yarısına geçti
						this.isOnRight = true
					}
					// Yoksa solda kalır (geri döner)
				}
			}

			// Elastik geri dönüş animasyonu
			this.isTransitioning = true
			this.horizontalOffset = 0

			this.dragStartY = 0
			this.dragStartX = 0
			this.dragStartBottom = 0
			this.dragStarted = false
			this.lastX = 0
			this.dragDirection = null

			// Pozisyonu localStorage'a kaydet
			this.savePositionToStorage()

			// Parent'a pozisyon değişikliğini bildir
			this.$emit('position-change', {
				bottom: this.bottomPosition,
				isOnRight: this.isOnRight,
			})

			// Kısa bir süre sonra isDragging'i sıfırla (click event'i için)
			setTimeout(() => {
				this.isDragging = false
				this.isTransitioning = false
			}, 300)
		},
	},
}
</script>
