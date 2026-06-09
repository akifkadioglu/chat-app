import apiList from '~/apis/ApiList.js'

// Merkezi dosya boyutu limitleri
export const MAX_IMAGE_SIZE = 8 * 1024 * 1024 // 8MB
export const MAX_AUDIO_SIZE = 25 * 1024 * 1024 // 25MB
export const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25MB
export const MAX_VIDEO_SIZE = 25 * 1024 * 1024 // 25MB

// İzin verilen dosya türleri (Instagram API desteklenen formatlar)
export const ALLOWED_FILE_TYPES = {
	image: {
		mimeTypes: ['image/png', 'image/jpeg', 'image/jpg'],
		extensions: ['.png', '.jpeg', '.jpg'],
		maxSize: MAX_IMAGE_SIZE,
		icon: 'fa fa-image',
		label: 'Resim',
	},
	audio: {
		mimeTypes: ['audio/aac', 'audio/mp4', 'audio/x-m4a', 'audio/wav', 'audio/x-wav', 'video/mp4'],
		extensions: ['.aac', '.m4a', '.wav', '.mp4'],
		maxSize: MAX_AUDIO_SIZE,
		icon: 'fa fa-music',
		label: 'Ses',
	},
	video: {
		mimeTypes: ['video/mp4', 'video/ogg', 'video/avi', 'video/x-msvideo', 'video/quicktime', 'video/webm'],
		extensions: ['.mp4', '.ogg', '.avi', '.mov', '.webm'],
		maxSize: MAX_VIDEO_SIZE,
		icon: 'fa fa-video',
		label: 'Video',
	},
	file: {
		mimeTypes: ['application/pdf'],
		extensions: ['.pdf'],
		maxSize: MAX_FILE_SIZE,
		icon: 'fa fa-file-pdf',
		label: 'Dosya',
	},
}

// Dosya türünü belirle
export function getFileCategory(file) {
	const mimeType = file.type

	if (ALLOWED_FILE_TYPES.image.mimeTypes.includes(mimeType)) return 'image'
	if (ALLOWED_FILE_TYPES.audio.mimeTypes.includes(mimeType)) return 'audio'
	if (ALLOWED_FILE_TYPES.video.mimeTypes.includes(mimeType)) return 'video'
	if (ALLOWED_FILE_TYPES.file.mimeTypes.includes(mimeType)) return 'file'

	// Extension bazlı kontrol
	const ext = '.' + file.name.split('.').pop().toLowerCase()
	if (ALLOWED_FILE_TYPES.image.extensions.includes(ext)) return 'image'
	if (ALLOWED_FILE_TYPES.audio.extensions.includes(ext)) return 'audio'
	if (ALLOWED_FILE_TYPES.video.extensions.includes(ext)) return 'video'
	if (ALLOWED_FILE_TYPES.file.extensions.includes(ext)) return 'file'

	return null
}

// Tüm izin verilen uzantıları döndür (input accept için)
export function getAllAllowedExtensions() {
	return [
		...ALLOWED_FILE_TYPES.image.extensions,
		...ALLOWED_FILE_TYPES.audio.extensions,
		...ALLOWED_FILE_TYPES.video.extensions,
		...ALLOWED_FILE_TYPES.file.extensions,
	].join(',')
}

// Dosya türüne göre ikon döndür
export function getFileIcon(fileType) {
	if (!fileType) return 'fa fa-file'
	if (fileType.includes('pdf')) return 'fa fa-file-pdf'
	if (fileType.includes('word') || fileType.includes('doc')) return 'fa fa-file-word'
	if (fileType.includes('excel') || fileType.includes('sheet') || fileType.includes('xls')) return 'fa fa-file-excel'
	if (fileType.includes('powerpoint') || fileType.includes('presentation') || fileType.includes('ppt')) return 'fa fa-file-powerpoint'
	if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('archive')) return 'fa fa-file-archive'
	if (fileType.includes('text')) return 'fa fa-file-alt'
	return 'fa fa-file'
}

// Ortak dosya validasyon fonksiyonu
export function validateFile(file, fileType, maxSize) {
	// fileType'a göre ALLOWED_FILE_TYPES'dan kontrol et
	const categoryKey = fileType.replace('/', '') // 'image/' -> 'image'
	const allowedCategory = ALLOWED_FILE_TYPES[categoryKey]

	if (allowedCategory) {
		if (!allowedCategory.mimeTypes.includes(file.type)) {
			return false
		}
	} else {
		// Fallback: prefix kontrolü
		if (!file.type.startsWith(fileType)) {
			return false
		}
	}

	// Dosya boyutu kontrolü
	if (file.size > maxSize) {
		return false
	}

	return true
}

// Ortak upload fonksiyonu
export function uploadFile(file, requestAdapter) {
	// 1. Backend'den pre-signed URL al
	return requestAdapter
		.post(apiList.uploadFile, {
			fileName: file.name,
			fileType: file.type,
		})
		.then((response) => {
			if (!response?.success && !response?.data) {
				throw new Error('Upload URL alınamadı')
			}

			const { url: preSignedUrl, cloud_url: cloudUrl } = response.data || response

			// 2. Pre-signed URL'e dosyayı yükle
			return fetch(preSignedUrl, {
				method: 'PUT',
				body: file,
				headers: {
					'Content-Type': file.type,
				},
			}).then((uploadResponse) => {
				if (!uploadResponse.ok) {
					throw new Error('File upload failed')
				}

				// 3. Upload başarılı, cloud URL'i döndür
				return {
					success: true,
					cloudUrl: cloudUrl,
				}
			})
		})
		.catch((error) => {
			consoleLog('Upload error:', error)
			return {
				success: false,
				error: error.message,
			}
		})
}

// Resim preview oluşturma fonksiyonu
export function createImagePreview(file) {
	return new Promise((resolve) => {
		const reader = new FileReader()
		reader.onload = (e) => {
			resolve(e.target.result)
		}
		reader.readAsDataURL(file)
	})
}

// Dosya boyutunu MB cinsinden döndürme
export function formatFileSize(bytes) {
	if (bytes === 0) return '0 Bytes'
	const k = 1024
	const sizes = ['Bytes', 'KB', 'MB', 'GB']
	const i = Math.floor(Math.log(bytes) / Math.log(k))
	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Zaman formatı (ses kayıtları için)
export function formatTime(seconds) {
	const mins = Math.floor(seconds / 60)
	const secs = seconds % 60
	return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Drag & Drop dosya işleme metodu
export async function handleDroppedFiles(files, selectedImages, selectedAudio, selectedFiles, requestAdapter, callback) {
	// Dosyaları kategorilerine göre ayır
	const categorizedFiles = {
		image: [],
		audio: [],
		file: [],
	}

	for (const file of files) {
		const category = getFileCategory(file)
		if (category) {
			categorizedFiles[category].push(file)
		}
	}

	// Sadece bir kategori işlenebilir - öncelik: image > audio > file
	let processedCategory = null

	if (categorizedFiles.image.length > 0) {
		processedCategory = 'image'
		// Diğer kategorileri temizle
		Object.keys(selectedAudio).forEach((key) => delete selectedAudio[key])
		selectedFiles.splice(0)

		for (const file of categorizedFiles.image) {
			const imageData = await processImageFile(file, requestAdapter)
			if (imageData) {
				selectedImages.push(imageData)
			}
		}
	} else if (categorizedFiles.audio.length > 0) {
		processedCategory = 'audio'
		// Diğer kategorileri temizle
		selectedImages.splice(0)
		selectedFiles.splice(0)
		Object.keys(selectedAudio).forEach((key) => delete selectedAudio[key])

		// Sadece ilk audio dosyasını işle
		const audioData = await processAudioFile(categorizedFiles.audio[0], requestAdapter)
		if (audioData) {
			Object.assign(selectedAudio, audioData)
		}
	} else if (categorizedFiles.file.length > 0) {
		processedCategory = 'file'
		// Diğer kategorileri temizle
		selectedImages.splice(0)
		Object.keys(selectedAudio).forEach((key) => delete selectedAudio[key])

		for (const file of categorizedFiles.file) {
			const fileData = await processFile(file, requestAdapter)
			if (fileData) {
				selectedFiles.push(fileData)
			}
		}
	}

	// Callback çağır (eğer varsa)
	if (callback) {
		callback(processedCategory)
	}
}

// Audio dosya işleme fonksiyonu
export async function processAudioFile(file, requestAdapter) {
	// Dosya validasyonu
	const isValid = validateFile(file, 'audio/', MAX_AUDIO_SIZE)
	if (!isValid) {
		return null
	}

	const audioData = {
		file: file,
		fileName: file.name,
		fileSize: file.size,
		uploading: true,
		cloudUrl: null,
		error: null,
		type: 'file',
	}

	// Upload işlemini başlat
	const uploadResult = await uploadFile(file, requestAdapter)

	audioData.uploading = false

	if (uploadResult.success) {
		audioData.cloudUrl = uploadResult.cloudUrl
		audioData.error = null
	}

	if (!uploadResult.success) {
		audioData.error = uploadResult.error
	}

	return audioData
}

// Image dosya işleme fonksiyonu
export async function processImageFile(file, requestAdapter) {
	// Dosya validasyonu
	const isValid = validateFile(file, 'image/', MAX_IMAGE_SIZE)
	if (!isValid) {
		return null
	}

	// Preview oluştur
	const preview = await createImagePreview(file)

	const imageData = {
		file: file,
		preview: preview,
		uploading: true,
		cloudUrl: null,
		error: null,
		type: 'image',
	}

	// Upload işlemini başlat
	const uploadResult = await uploadFile(file, requestAdapter)

	imageData.uploading = false

	if (uploadResult.success) {
		imageData.cloudUrl = uploadResult.cloudUrl
		imageData.error = null
	}

	if (!uploadResult.success) {
		imageData.error = uploadResult.error
	}

	return imageData
}

// Genel dosya işleme fonksiyonu (PDF, DOC, vb.)
export async function processFile(file, requestAdapter) {
	// Dosya boyutu kontrolü
	if (file.size > MAX_FILE_SIZE) {
		return null
	}

	const fileData = {
		file: file,
		fileName: file.name,
		fileSize: file.size,
		fileType: file.type,
		uploading: true,
		cloudUrl: null,
		error: null,
		type: 'file',
	}

	// Upload işlemini başlat
	const uploadResult = await uploadFile(file, requestAdapter)

	fileData.uploading = false

	if (uploadResult.success) {
		fileData.cloudUrl = uploadResult.cloudUrl
		fileData.error = null
	}

	if (!uploadResult.success) {
		fileData.error = uploadResult.error
	}

	return fileData
}
