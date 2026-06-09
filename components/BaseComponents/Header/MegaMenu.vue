<template>
  <li :class="liClasses">
    <!-- Trigger Button -->
    <button ref="trigger" type="button" class="menu-link" :class="summaryClasses" @click="toggle">
      <slot name="title">{{ title }}</slot>
      <i class="fa fa-chevron-down text-xs transition-transform ms-auto w-5!" :class="{ 'rotate-180': isOpen }" />
    </button>

    <!-- Dropdown Content -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      leave-active-class="transition-all duration-150 ease-in"
      enter-from-class="opacity-0 max-h-0"
      enter-to-class="opacity-100 max-h-[500px]"
      leave-from-class="opacity-100 max-h-[500px]"
      leave-to-class="opacity-0 max-h-0"
    >
      <div
        ref="panel"
        v-show="isOpen"
        class="rounded-t-none rounded-b-lg p-1 md:p-3 overflow-hidden md:bg-base-100 z-100"
        :class="[dropdownClasses, contentWidth]"
        :style="panelStyle"
        @click="handleContentClick"
      >
        <slot />
      </div>
    </Transition>
  </li>
</template>

<script>
import { useClick } from '~/composables/useClick'

// Tüm MegaMenu instance'larını tutacak Set
const allMenus = new Set()

export default {
  props: {
    title: {
      type: String,
      default: '',
    },
    breakpoint: {
      type: String,
      default: 'md',
    },
    contentWidth: {
      type: String,
      default: 'md:w-[min(75vw,300px)]',
    },
    align: {
      type: String,
      default: 'start',
      validator: (value) => ['start', 'center', 'end'].includes(value),
    },
    // Geniş panellerde (örn. Solutions) paneli tetikleyici butona değil viewport'a göre
    // ortalar. Böylece menü öğesi ekranın solunda kalsa bile panel taşmaz.
    viewportCentered: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isOpen: false,
      panelLeft: 0,
    }
  },
  mounted() {
    allMenus.add(this)
    useClick(this.handleClickOutside)
  },
  beforeUnmount() {
    allMenus.delete(this)
    window.removeEventListener('resize', this.updatePanelPos)
  },
  computed: {
    liClasses() {
      const map = {
        sm: 'sm:relative',
        md: 'md:relative',
        lg: 'lg:relative',
        xl: 'xl:relative',
        '2xl': '2xl:relative',
      }
      return map[this.breakpoint] || map.md
    },
    summaryClasses() {
      const map = {
        sm: 'sm:px-2 sm:py-2',
        md: 'md:px-2 md:py-2',
        lg: 'lg:px-2 lg:py-2',
        xl: 'xl:px-2 xl:py-2',
        '2xl': '2xl:px-2 2xl:py-2',
      }
      return map[this.breakpoint] || map.md
    },
    alignClasses() {
      const alignMap = {
        sm: {
          start: ['sm:left-0'],
          center: ['sm:left-1/2', 'sm:-translate-x-1/2'],
          end: ['sm:right-0'],
        },
        md: {
          start: ['md:left-0'],
          center: ['md:left-1/2', 'md:-translate-x-1/2'],
          end: ['md:right-0'],
        },
        lg: {
          start: ['lg:left-0'],
          center: ['lg:left-1/2', 'lg:-translate-x-1/2'],
          end: ['lg:right-0'],
        },
        xl: {
          start: ['xl:left-0'],
          center: ['xl:left-1/2', 'xl:-translate-x-1/2'],
          end: ['xl:right-0'],
        },
        '2xl': {
          start: ['2xl:left-0'],
          center: ['2xl:left-1/2', '2xl:-translate-x-1/2'],
          end: ['2xl:right-0'],
        },
      }
      return alignMap[this.breakpoint]?.[this.align] || alignMap.md.center
    },
    baseDropdownClasses() {
      const map = {
        sm: [
          'sm:border-t-simpliers',
          'sm:border-t-2',
          'sm:absolute',
          'sm:top-full',
          'sm:mt-1',
          'sm:z-50',
          'sm:shadow-2xl',
        ],
        md: [
          'md:border-t-simpliers',
          'md:border-t-2',
          'md:absolute',
          'md:top-full',
          'md:mt-1',
          'md:z-50',
          'md:shadow-2xl',
        ],
        lg: [
          'lg:border-t-simpliers',
          'lg:border-t-2',
          'lg:absolute',
          'lg:top-full',
          'lg:mt-1',
          'lg:z-50',
          'lg:shadow-2xl',
        ],
        xl: [
          'xl:border-t-simpliers',
          'xl:border-t-2',
          'xl:absolute',
          'xl:top-full',
          'xl:mt-1',
          'xl:z-50',
          'xl:shadow-2xl',
        ],
        '2xl': [
          '2xl:border-t-simpliers',
          '2xl:border-t-2',
          '2xl:absolute',
          '2xl:top-full',
          '2xl:mt-1',
          '2xl:z-50',
          '2xl:shadow-2xl',
        ],
      }
      return map[this.breakpoint] || map.md
    },
    viewportCenteredClasses() {
      // Dikey konum çalışan menülerle aynı (absolute + top-full + mt-1 = header çizgisine yapışık),
      // sadece yatayda paneli butona değil viewport ortasına kaydırıyoruz (dinamik left).
      const map = {
        sm: [...this.baseDropdownClasses, 'sm:left-[var(--mega-left)]'],
        md: [...this.baseDropdownClasses, 'md:left-[var(--mega-left)]'],
        lg: [...this.baseDropdownClasses, 'lg:left-[var(--mega-left)]'],
        xl: [...this.baseDropdownClasses, 'xl:left-[var(--mega-left)]'],
        '2xl': [...this.baseDropdownClasses, '2xl:left-[var(--mega-left)]'],
      }
      return map[this.breakpoint] || map.md
    },
    dropdownClasses() {
      if (this.viewportCentered) return this.viewportCenteredClasses
      return [...this.baseDropdownClasses, ...this.alignClasses]
    },
    panelStyle() {
      if (!this.viewportCentered) return null
      return { '--mega-left': `${this.panelLeft}px` }
    },
  },
  methods: {
    toggle() {
      if (this.isOpen) {
        this.close()
      } else {
        this.open()
      }
    },
    open() {
      // Önce diğer tüm menüleri kapat
      allMenus.forEach((menu) => {
        if (menu !== this && menu.isOpen) {
          menu.isOpen = false
        }
      })
      // Sonra kendini aç
      this.isOpen = true

      // Panel viewport'a göre yatayda ortalanacaksa, gösterildikten sonra konumu hesapla
      if (this.viewportCentered) {
        this.$nextTick(this.updatePanelPos)
        window.addEventListener('resize', this.updatePanelPos)
      }
    },
    close() {
      this.isOpen = false
      if (this.viewportCentered) {
        window.removeEventListener('resize', this.updatePanelPos)
      }
    },
    updatePanelPos() {
      // Paneli viewport'a göre yatayda ortala. left, offset parent (li) referans alındığı için
      // panelin ekran ortasındaki konumu ile li'nin sol kenarı arasındaki fark olarak hesaplanır.
      const panel = this.$refs.panel
      if (!panel) return
      const liLeft = this.$el.getBoundingClientRect().left
      const viewportWidth = document.documentElement.clientWidth
      this.panelLeft = Math.round((viewportWidth - panel.offsetWidth) / 2 - liLeft)
    },
    handleClickOutside(event) {
      if (!this.isOpen) return
      if (this.$el.contains(event.target)) return
      this.close()
    },
    handleContentClick(event) {
      // Link'e tıklandıysa kapat (a, button veya NuxtLink)
      const clickedLink = event.target.closest('a, button:not([type="button"])')
      if (clickedLink) {
        this.close()
      }
    },
  },
}
</script>
