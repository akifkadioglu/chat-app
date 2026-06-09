<template>
	<div
		ref="editable"
		class="editable"
		:contenteditable="allowEdit"
		:data-placeholder="placeholder"
		@input="onInput"
		@compositionstart="isComposing = true"
		@compositionend="onCompositionEnd"
		@paste.prevent="onPaste"
		:style="{ minHeight }"
	/>
</template>

<script>
export default {
	props: {
		modelValue: {
			type: String,
			default: '',
		},
		placeholder: {
			type: String,
		},
		minHeight: {
			type: String,
			default: '80px',
		},
		max: {
			type: Number,
		},
		allowEdit: {
			type: Boolean,
			default: true,
		},
	},
	data() {
		return {
			isComposing: false,
			debounceTimer: null,
		}
	},
	mounted() {
		this.setFromModel(this.modelValue)
		this.transformDOM()
	},
	beforeUnmount() {
		if (this.debounceTimer) {
			clearTimeout(this.debounceTimer)
		}
	},
	watch: {
		modelValue(newVal) {
			// Prop dışarıdan değiştiyse DOM'u güncelle
			if (newVal !== this.serialize()) {
				this.setFromModel(newVal)
				this.transformDOM()
			}
		},
	},
	emits: ['caret-change', 'update:modelValue'],
	methods: {
		// IME klavyesi (Japonca/Çince) yazımı tamamlandığında tetiklenir
		onCompositionEnd() {
			if (!this.allowEdit) return

			this.isComposing = false
			this.transformDOM()
			this.restoreCaret()
			this.emitModel()
			this.emitCaretChange()
		},

		onInput() {
			if (this.isComposing) return
			if (!this.allowEdit) return

			const currentText = this.serialize()

			if (this.max && currentText.length > this.max) {
				// Max aşıldıysa kırp, imleci sona al
				const truncated = currentText.slice(0, this.max)
				this.setFromModel(truncated)
				this.transformDOM()
				this.$nextTick(() => this.restoreCaretToEnd())
				this.emitModel()
				return
			}

			if (this.debounceTimer) clearTimeout(this.debounceTimer)

			// Model hemen güncelle, DOM işlemlerini debounce et (reflow azaltmak için)
			this.emitModel()
			this.debounceTimer = setTimeout(() => {
				this.saveCaret()
				this.transformDOM()
				this.restoreCaret()
				this.emitCaretChange()
			}, 150)
		},

		// Paste'deki HTML'i soyup sadece düz metin ekler
		onPaste(e) {
			if (!this.allowEdit) return
			const text = (e.clipboardData || window.clipboardData).getData('text')
			document.execCommand('insertText', false, text)
		},

		emitModel() {
			this.$emit('update:modelValue', this.serialize())
		},

		// İmleci en sona taşır (max limit kırpmadan sonra kullanılır)
		restoreCaretToEnd() {
			const root = this.$refs.editable
			if (!root) return
			const sel = window.getSelection()
			const range = document.createRange()
			range.selectNodeContents(root)
			range.collapse(false)
			sel.removeAllRanges()
			sel.addRange(range)
		},

		// Düz metni HTML'e çevirir: {{x}} → badge span, \n → <br>
		setFromModel(text) {
			if (!text) return
			let html = text.replace(
				/\{\{(.*?)\}\}/g,
				'<span class="badge badge-soft badge-primary" contenteditable="false">$1</span>',
			)
			// Önce \n\n işlenmeli; yoksa tek \n replace'i çiftleri de yakalar
			html = html.replace(/\n\n/g, '<br><br>')
			html = html.replace(/\n/g, '<br>')
			this.$refs.editable.innerHTML = html || ''
		},

		// contenteditable DOM'unu düz metne çevirir: badge span → {{x}}, <br>/<div>/<p> → \n
		serialize() {
			const clone = this.$refs.editable.cloneNode(true)

			const mark = clone.querySelector('#__caret__')
			if (mark) mark.remove()

			// Chrome Enter'da <div>/<p> sarar; bu blokların içindeki tekil <br> gerçek satır sonu değil, kaldır
			clone.querySelectorAll('div > br:only-child, p > br:only-child').forEach((br) => br.remove())

			// Her <div>/<p> bir satır sonunu temsil eder; önüne \n ekleyip düzleştir
			clone.querySelectorAll('div, p').forEach((el) => {
				if (el.previousSibling) el.before(document.createTextNode('\n'))
				el.replaceWith(...el.childNodes)
			})

			clone.querySelectorAll('br').forEach((br) => br.replaceWith(document.createTextNode('\n')))
			clone.querySelectorAll('span.badge').forEach((el) => el.replaceWith(document.createTextNode(`{{${el.textContent ?? ''}}}`)))

			return (clone.textContent || '').replace(/\r\n/g, '\n')
		},

		// İmleç pozisyonunu DOM'a görünmez bir span (#__caret__) ekleyerek kaydeder
		saveCaret() {
			const sel = window.getSelection()
			if (!sel || sel.rangeCount === 0) return
			const range = sel.getRangeAt(0).cloneRange()
			if (!this.$refs.editable.contains(range.startContainer)) return
			const m = document.createElement('span')
			m.id = '__caret__'
			m.style.display = 'inline-block'
			m.style.width = '0'
			m.style.height = '1em'
			range.collapse(true)
			range.insertNode(m)
		},

		// #__caret__ span'ını bulup imleci oraya getirir, sonra span'ı siler
		restoreCaret() {
			const root = this.$refs.editable
			const mark = root.querySelector('#__caret__')
			if (!mark) return
			const sel = window.getSelection()
			const range = document.createRange()
			range.setStartAfter(mark)
			range.collapse(true)
			sel.removeAllRanges()
			sel.addRange(range)
			mark.remove()
		},

		// DOM'daki {{...}} text'lerini badge span'ına dönüştürür; mevcut badge'lerin içine girmez
		transformDOM() {
			const root = this.$refs.editable

			requestAnimationFrame(() => {
				const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
					acceptNode: (node) =>
						node.parentElement?.closest('span.badge') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
				})
				const targets = []
				let n
				while ((n = walker.nextNode())) if (/\{\{.*?\}\}/.test(n.nodeValue)) targets.push(n)

				if (targets.length === 0) return

				const re = /\{\{(.*?)\}\}/g
				targets.forEach((textNode) => {
					const frag = document.createDocumentFragment()
					const text = textNode.nodeValue
					let last = 0, m
					while ((m = re.exec(text)) !== null) {
						if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)))
						const span = document.createElement('span')
						span.className = 'badge badge-soft badge-primary'
						span.setAttribute('contenteditable', 'false')
						span.textContent = m[1]
						frag.appendChild(span)
						last = re.lastIndex
					}
					if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)))
					textNode.replaceWith(frag)
				})
			})
		},

		// serialize() gibi ama #__caret__ span'ını {{CARET}} olarak bırakır; pozisyon bulmak için
		serializeWithMarker() {
			const clone = this.$refs.editable.cloneNode(true)
			clone.querySelectorAll('div > br:only-child, p > br:only-child').forEach((br) => br.remove())
			clone.querySelectorAll('div, p').forEach((el) => {
				if (el.previousSibling) el.before(document.createTextNode('\n'))
				el.replaceWith(...el.childNodes)
			})
			clone.querySelectorAll('br').forEach((br) => br.replaceWith(document.createTextNode('\n')))
			clone.querySelectorAll('span.badge').forEach((el) => el.replaceWith(document.createTextNode(`{{${el.textContent ?? ''}}}`)))
			const marker = clone.querySelector('#__caret__')
			if (marker) marker.replaceWith('{{CARET}}')
			return (clone.textContent || '').replace(/\r\n/g, '\n')
		},

		// İmlecin metin içindeki karakter pozisyonunu döndürür
		getCaretPosition() {
			this.saveCaret()
			const textWithMarker = this.serializeWithMarker()
			const pos = textWithMarker.indexOf('{{CARET}}')
			this.restoreCaret()
			return pos
		},

		emitCaretChange() {
			const pos = this.getCaretPosition()
			this.$emit('caret-change', pos)
		},

		focusin(charAt = 0) {
			this.$refs.editable.focus()
		},
	},
}
</script>

<style scoped>
.editable {
	padding: 12px 16px;
	white-space: pre-wrap;
	outline: none;
	width: 100%;
	resize: none;
}
.editable:empty:before {
	content: attr(data-placeholder);
	color: #9ca3af;
	pointer-events: none;
	opacity: 0.6;
}
</style>