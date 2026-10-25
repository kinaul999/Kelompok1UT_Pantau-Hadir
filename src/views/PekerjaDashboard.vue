<script setup>
import {
  ref,
  computed,
  onMounted,
  onUnmounted,
  nextTick
} from 'vue'

import { supabase } from '../lib/supabase'

import iconLogOut from '../assets/icons/log-out.svg'
import iconScanFace from '../assets/icons/scan-face.svg'
import iconMapPinCheck from '../assets/icons/map-pin-check.svg'
import iconCircleCheck from '../assets/icons/circle-check.svg'
import iconCircleX from '../assets/icons/circle-x.svg'
import logoPantauHadir from '../assets/images/logo-pantau-hadir.svg'

const props = defineProps({
  worker: {
    type: Object,
    default: null
  }
})

const emit = defineEmits([
  'absen-complete',
  'logout-trigger'
])

const handleLogoutClick = () => {
  emit('logout-trigger')
}

// IDENTITAS PEKERJA

const workerName = computed(() => {
  return props.worker?.name || 'Pekerja'
})

const workerNik = computed(() => {
  return props.worker?.nik || '-'
})

// INFORMASI SITE DAN GEOFENCING

const siteName = ref('Memuat lokasi proyek...')
const siteAddress = ref('')

const siteLatitude = ref(null)
const siteLongitude = ref(null)
const siteRadius = ref(500)
const geofenceEnabled = ref(true)

const workerLocationStatus = ref('checking')
const gpsMessage = ref('Memeriksa lokasi perangkat...')

const workerLatitude = ref(null)
const workerLongitude = ref(null)
const distanceToSite = ref(null)
const gpsAccuracy = ref(null)
const isSubmittingAttendance = ref(false)

let watchId = null

const isInsideArea = computed(() => {
  if (!geofenceEnabled.value) {
    return (
      workerLocationStatus.value !== 'error' &&
      workerLatitude.value !== null &&
      workerLongitude.value !== null
    )
  }

  return workerLocationStatus.value === 'inside'
})

const locationStatusText = computed(() => {
  if (workerLocationStatus.value === 'error') {
    return 'LOKASI TIDAK TERSEDIA'
  }

  if (
    !geofenceEnabled.value &&
    workerLatitude.value !== null &&
    workerLongitude.value !== null
  ) {
    return 'MODE DEMO AKTIF'
  }

  if (workerLocationStatus.value === 'inside') {
    return 'DI DALAM AREA PROYEK'
  }

  if (workerLocationStatus.value === 'outside') {
    return 'DI LUAR AREA PROYEK'
  }

  return 'MEMERIKSA LOKASI'
})

const getNumberFromSite = (site, names) => {
  for (const name of names) {
    const value = site?.[name]

    if (
      value !== null &&
      value !== undefined &&
      value !== '' &&
      Number.isFinite(Number(value))
    ) {
      return Number(value)
    }
  }

  return null
}

const loadSite = async () => {
  if (!props.worker?.site_id) {
    siteName.value = 'Site belum ditentukan'
    gpsMessage.value = 'Data site pekerja belum tersedia.'
    workerLocationStatus.value = 'error'
    return
  }

  const { data, error } = await supabase
    .from('Sites')
    .select('*')
    .eq('id', props.worker.site_id)
    .maybeSingle()

  if (error) {
    console.error('Gagal membaca data site:', error)

    siteName.value = 'Site tidak dapat dimuat'
    gpsMessage.value =
      'Gagal membaca data proyek. Periksa izin akses tabel Sites.'
    workerLocationStatus.value = 'error'
    return
  }

  if (!data) {
    siteName.value = 'Site tidak ditemukan'
    gpsMessage.value =
      'Site pekerja tidak ditemukan di tabel Sites.'
    workerLocationStatus.value = 'error'
    return
  }

  // FALSE berarti mode demo tanpa validasi radius.
  // TRUE berarti geofencing tetap diberlakukan.
  geofenceEnabled.value = data.geofence_enabled !== false

  siteName.value =
    data.name ||
    data.site_name ||
    data.nama_site ||
    data.project_name ||
    'Proyek'

  siteAddress.value =
    data.address ||
    data.alamat ||
    data.location ||
    data.lokasi ||
    ''

  siteLatitude.value = getNumberFromSite(data, [
    'latitude',
    'lat',
    'site_latitude',
    'site_lat',
    'gps_latitude'
  ])

  siteLongitude.value = getNumberFromSite(data, [
    'longitude',
    'lng',
    'lon',
    'site_longitude',
    'site_lng',
    'gps_longitude'
  ])

  const radius = getNumberFromSite(data, [
    'radius',
    'radius_meters',
    'radius_meter',
    'geofence_radius'
  ])

  if (radius !== null && radius > 0) {
    siteRadius.value = radius
  }

  // Koordinat proyek wajib valid hanya jika geofencing aktif.
  if (
    geofenceEnabled.value &&
    (
      siteLatitude.value === null ||
      siteLongitude.value === null ||
      Math.abs(siteLatitude.value) > 90 ||
      Math.abs(siteLongitude.value) > 180
    )
  ) {
    workerLocationStatus.value = 'error'
    gpsMessage.value =
      'Koordinat proyek belum tersedia atau tidak valid. Periksa kolom latitude dan longitude di tabel Sites.'
    return
  }

  startGps()
}

const calculateDistance = (
  lat1,
  lon1,
  lat2,
  lon2
) => {
  const earthRadius = 6371000
  const toRadians = value => value * Math.PI / 180

  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
    Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) ** 2

  return earthRadius * 2 * Math.atan2(
    Math.sqrt(a),
    Math.sqrt(1 - a)
  )
}

// GPS PERANGKAT

const startGps = () => {
  if (!navigator.geolocation) {
    workerLocationStatus.value = 'error'
    gpsMessage.value = 'Browser ini tidak mendukung GPS.'
    return
  }

  // Koordinat proyek dibutuhkan hanya jika geofencing aktif.
  if (
    geofenceEnabled.value &&
    (
      siteLatitude.value === null ||
      siteLongitude.value === null
    )
  ) {
    workerLocationStatus.value = 'error'
    gpsMessage.value = 'Koordinat proyek belum valid.'
    return
  }

  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId)
    watchId = null
  }

  workerLocationStatus.value = 'checking'
  gpsMessage.value = 'Meminta izin lokasi perangkat...'

  watchId = navigator.geolocation.watchPosition(
    position => {
      // Tetap mengambil koordinat asli perangkat,
      // termasuk ketika pekerja menggunakan SITE DEMO.
      workerLatitude.value = position.coords.latitude
      workerLongitude.value = position.coords.longitude
      gpsAccuracy.value = position.coords.accuracy

      if (
        geofenceEnabled.value &&
        siteLatitude.value !== null &&
        siteLongitude.value !== null
      ) {
        distanceToSite.value = calculateDistance(
          workerLatitude.value,
          workerLongitude.value,
          siteLatitude.value,
          siteLongitude.value
        )
      } else {
        distanceToSite.value = null
      }

      // MODE DEMO:
      // Tidak membandingkan jarak dengan radius proyek,
      // tetapi koordinat GPS perangkat tetap direkam.
      if (!geofenceEnabled.value) {
        workerLocationStatus.value = 'inside'
        gpsMessage.value =
          'Mode demo aktif. Lokasi GPS asli tetap direkam, tetapi radius proyek tidak divalidasi.'
        return
      }

      // VALIDASI GPS UNTUK SITE BIASA
      if (position.coords.accuracy > 500) {
        workerLocationStatus.value = 'checking'
        gpsMessage.value =
          `Akurasi GPS belum memadai (±${Math.round(position.coords.accuracy)} meter). Coba ke area terbuka.`
        return
      }

      if (distanceToSite.value <= siteRadius.value) {
        workerLocationStatus.value = 'inside'
        gpsMessage.value =
          'Lokasi terdeteksi di dalam radius proyek.'
      } else {
        workerLocationStatus.value = 'outside'
        gpsMessage.value =
          'Lokasi terdeteksi di luar radius proyek.'
      }
    },

    error => {
      workerLocationStatus.value = 'error'

      if (error.code === 1) {
        gpsMessage.value =
          'Izin lokasi ditolak. Aktifkan izin lokasi untuk situs ini.'
      } else if (error.code === 2) {
        gpsMessage.value =
          'Lokasi tidak dapat ditemukan. Periksa GPS perangkat.'
      } else if (error.code === 3) {
        gpsMessage.value =
          'Permintaan GPS habis waktu. Coba periksa lokasi lagi.'
      } else {
        gpsMessage.value =
          'Gagal mendapatkan lokasi perangkat.'
      }
    },

    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 20000
    }
  )
}

const retryGps = () => {
  startGps()
}

// KAMERA DAN FOTO ABSENSI

const isCameraModalOpen = ref(false)
const isCapturing = ref(false)
const isAbsenSuccess = ref(false)
const isPhotoCaptured = ref(false)
const lastAbsenTime = ref('')

const videoRef = ref(null)
const canvasRef = ref(null)

const attendanceRecord = ref(null)
const photoBlob = ref(null)

let streamInstance = null

const attendanceActionType = computed(() => {
  if (!attendanceRecord.value?.check_in) {
    return 'check_in'
  }

  if (!attendanceRecord.value?.check_out) {
    return 'check_out'
  }

  return 'completed'
})

const attendanceActionLabel = computed(() => {
  if (attendanceActionType.value === 'check_in') {
    return 'ABSEN MASUK'
  }

  if (attendanceActionType.value === 'check_out') {
    return 'ABSEN PULANG'
  }

  return 'ABSENSI HARI INI SELESAI'
})

const isAttendanceReady = computed(() => {
  return (
    (!geofenceEnabled.value || isInsideArea.value) &&
    workerLatitude.value !== null &&
    workerLongitude.value !== null &&
    isPhotoCaptured.value &&
    attendanceActionType.value !== 'completed' &&
    !isSubmittingAttendance.value
  )
})

// TANGGAL DAN WAKTU WIB

const getWibDate = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date)

  const part = type =>
    parts.find(item => item.type === type)?.value

  return `${part('year')}-${part('month')}-${part('day')}`
}

const getWibTime = (date = new Date()) => {
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23'
  }).format(date)
}

// MEMERIKSA ABSENSI HARI INI

const loadTodayAttendance = async () => {
  if (!props.worker?.id) return

  const today = getWibDate()

  const { data, error } = await supabase
    .from('attendances')
    .select('*')
    .eq('worker_id', props.worker.id)
    .eq('attendance_date', today)
    .maybeSingle()

  if (error) {
    console.error(
      'Gagal memeriksa absensi hari ini:',
      error
    )
    return
  }

  attendanceRecord.value = data
}

// MENGHENTIKAN KAMERA

const stopCamera = () => {
  if (streamInstance) {
    streamInstance.getTracks().forEach(track => track.stop())
    streamInstance = null
  }

  if (videoRef.value) {
    videoRef.value.srcObject = null
  }
}

// MEMBUKA KAMERA

const openCameraModal = async () => {
  if (attendanceActionType.value === 'completed') {
    alert('Absensi hari ini sudah lengkap.')
    return
  }

  isAbsenSuccess.value = false
  isCameraModalOpen.value = true

  await nextTick()

  try {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error(
        'Browser tidak mendukung kamera. Gunakan HTTPS atau localhost.'
      )
    }

    stopCamera()

    streamInstance =
      await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user'
        },
        audio: false
      })

    if (videoRef.value) {
      videoRef.value.srcObject = streamInstance
      await videoRef.value.play()
    }
  } catch (error) {
    console.error('Gagal mengakses kamera:', error)

    alert(
      `Kamera tidak dapat diakses: ${error.message || 'Periksa izin kamera browser.'}`
    )

    closeCameraModal()
  }
}

const closeCameraModal = () => {
  if (isCapturing.value) return

  isCameraModalOpen.value = false
  stopCamera()
}

// MENGAMBIL FOTO DARI KAMERA

const triggerCaptureAbsen = async () => {
  if (!streamInstance || !videoRef.value) {
    alert('Aktifkan kamera terlebih dahulu.')
    return
  }

  const video = videoRef.value

  if (!video.videoWidth || !video.videoHeight) {
    alert(
      'Kamera belum siap. Tunggu beberapa detik lalu coba lagi.'
    )
    return
  }

  isCapturing.value = true
  isAbsenSuccess.value = false

  try {
    const canvas = canvasRef.value

    if (!canvas) {
      throw new Error(
        'Area pengambilan foto tidak ditemukan.'
      )
    }

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const context = canvas.getContext('2d')

    if (!context) {
      throw new Error('Gagal memproses foto kamera.')
    }

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    )

    photoBlob.value = await new Promise(
      (resolve, reject) => {
        canvas.toBlob(
          blob => {
            if (blob) {
              resolve(blob)
            } else {
              reject(
                new Error('Gagal membuat file foto. Silakan ulangi.')
              )
            }
          },
          'image/jpeg',
          0.85
        )
      }
    )

    isPhotoCaptured.value = true
    isAbsenSuccess.value = true
    lastAbsenTime.value = `${getWibTime()} WIB`
  } catch (error) {
    console.error('Gagal mengambil foto:', error)

    photoBlob.value = null
    isPhotoCaptured.value = false

    alert(error.message || 'Foto gagal diambil.')
  } finally {
    isCapturing.value = false
  }
}

// MENGUNGGAH FOTO KE SUPABASE STORAGE

const uploadAttendancePhoto = async (
  blob,
  actionType,
  attendanceDate
) => {
  const safeWorkerId = String(props.worker.id)

  const path =
    `${safeWorkerId}/${attendanceDate}/${actionType}-${Date.now()}.jpg`

  const { error } = await supabase.storage
    .from('attendance-photos')
    .upload(path, blob, {
      contentType: 'image/jpeg',
      upsert: false
    })

  if (error) {
    throw error
  }

  return path
}

// MENYIMPAN ABSEN MASUK ATAU PULANG

const handleFinalSubmitAbsen = async () => {
  if (isSubmittingAttendance.value) return

  if (!props.worker?.id || !props.worker?.site_id) {
    alert('Data pekerja atau lokasi proyek tidak lengkap.')
    return
  }

  // Site biasa wajib berada di dalam radius proyek.
  // SITE DEMO tidak melakukan pemeriksaan radius.
  if (geofenceEnabled.value && !isInsideArea.value) {
    alert(
      'Kamu harus berada di dalam area proyek untuk absen.'
    )
    return
  }

  if (!isPhotoCaptured.value || !photoBlob.value) {
    alert('Ambil foto langsung dari kamera terlebih dahulu.')
    return
  }

  // GPS asli tetap wajib tersedia, termasuk pada SITE DEMO.
  if (
    workerLatitude.value === null ||
    workerLongitude.value === null
  ) {
    alert(
      'Lokasi GPS belum tersedia. Periksa lokasi terlebih dahulu.'
    )
    return
  }

  isSubmittingAttendance.value = true

  try {
    const now = new Date()
    const attendanceDate = getWibDate(now)
    const actionType = attendanceActionType.value

    if (actionType === 'completed') {
      alert('Absensi masuk dan pulang hari ini sudah lengkap.')
      return
    }

    // Upload foto sesuai jenis absensi.
    const uploadedPhotoPath = await uploadAttendancePhoto(
      photoBlob.value,
      actionType,
      attendanceDate
    )

    if (actionType === 'check_in') {
      const time = getWibTime(now)
      const [hour, minute, second] = time
        .split(':')
        .map(Number)

      const attendanceStatus =
        hour > 8 ||
        (hour === 8 && (minute > 0 || second > 0))
          ? 'Terlambat'
          : 'Hadir'

      const { data, error } = await supabase
        .from('attendances')
        .insert({
          worker_id: props.worker.id,
          site_id: props.worker.site_id,
          attendance_date: attendanceDate,
          check_in: now.toISOString(),
          check_in_photo: uploadedPhotoPath,
          latitude: workerLatitude.value,
          longitude: workerLongitude.value,
          status: attendanceStatus
        })
        .select('*')
        .single()

      if (error) throw error

      attendanceRecord.value = data

      alert(
        `Absensi masuk berhasil disimpan. Status: ${attendanceStatus}`
      )
    } else {
      // Pastikan data absensi masuk tersedia.
      if (
        !attendanceRecord.value?.id ||
        !attendanceRecord.value?.check_in
      ) {
        await loadTodayAttendance()
      }

      const currentRecord = attendanceRecord.value

      if (
        !currentRecord?.id ||
        !currentRecord.check_in
      ) {
        throw new Error(
          'Absensi masuk belum ditemukan. Silakan muat ulang halaman.'
        )
      }

      if (currentRecord.check_out) {
        alert('Absensi pulang hari ini sudah tercatat.')
        return
      }

      const { data, error } = await supabase
        .from('attendances')
        .update({
          check_out: now.toISOString(),
          check_out_photo: uploadedPhotoPath
        })
        .eq('id', currentRecord.id)
        .is('check_out', null)
        .select('*')
        .maybeSingle()

      if (error) throw error

      if (!data) {
        throw new Error(
          'Absensi pulang belum tersimpan. Muat ulang halaman dan periksa status absensi.'
        )
      }

      attendanceRecord.value = data

      alert('Absensi pulang berhasil disimpan.')
    }

    isPhotoCaptured.value = false
    photoBlob.value = null
    isAbsenSuccess.value = false
    isCameraModalOpen.value = false

    stopCamera()

    emit('absen-complete')
  } catch (error) {
    console.error(
      'Kesalahan saat menyimpan absensi:',
      error
    )

    if (error.code === '23505') {
      await loadTodayAttendance()

      alert(
        'Absensi hari ini sudah tercatat. Status absensi diperbarui.'
      )
    } else {
      alert(
        `Absensi gagal disimpan: ${error.message || 'Terjadi kesalahan.'}`
      )
    }
  } finally {
    isSubmittingAttendance.value = false
  }
}

// JAM

const serverTime = ref(new Date())
const serverTimeString = ref('')

let timerId = null

const updateClock = () => {
  serverTime.value = new Date()

  const formatted = serverTime.value.toLocaleString(
    'id-ID',
    {
      timeZone: 'Asia/Jakarta',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }
  )

  serverTimeString.value = `${formatted} WIB`
}

// EVENT DAN PEMBERSIHAN

const handleGlobalKeydown = event => {
  if (
    event.key === 'Escape' &&
    isCameraModalOpen.value
  ) {
    closeCameraModal()
  }
}

onMounted(async () => {
  window.addEventListener(
    'keydown',
    handleGlobalKeydown
  )

  updateClock()
  timerId = setInterval(updateClock, 1000)

  await loadSite()
  await loadTodayAttendance()
})

onUnmounted(() => {
  window.removeEventListener(
    'keydown',
    handleGlobalKeydown
  )

  if (timerId) {
    clearInterval(timerId)
  }

  if (watchId !== null && navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId)
  }

  stopCamera()
})
</script>

<template>
  <div class="mobile-shell">
    <!-- HEADER -->
    <header class="topbar-nav">
      <nav class="topbar-content" aria-label="Navigasi Header">
        <div class="logout-group">
          <button
            type="button"
            class="btn btn-secondary"
            style="padding: 4px 16px; min-height: 36px; font-size: 14px;"
            @click="handleLogoutClick"
          >
            <img
              :src="iconLogOut"
              alt=""
              width="16"
              height="16"
              aria-hidden="true"
            />
            <span>Keluar</span>
          </button>
        </div>
      </nav>
    </header>

    <!-- IDENTITAS PROYEK -->
    <header class="identity-header">
      <figure class="brand-figure">
        <img
          width="100"
          height="100"
          :src="logoPantauHadir"
          alt="Logo Pantau Hadir"
          class="brand-logo"
        />
      </figure>

      <hgroup class="brand-hgroup">
        <h1 class="company-name">
          PT. Jalan Baru
        </h1>

        <p class="site-location">
          {{ siteName }}
          <span v-if="siteAddress">
            - {{ siteAddress }}
          </span>
        </p>
      </hgroup>
    </header>

    <!-- KONTEN DASHBOARD -->
    <main class="main-content">
      <section class="worker-greeting-card">
        <h2 class="worker-name">
          HALO, {{ workerName.toUpperCase() }}!
        </h2>

        <p class="worker-meta">
          NIK: {{ workerNik }}
        </p>

        <p class="project-status">
          <span class="status-label">
            STATUS:
          </span>

          <strong
            :class="{
              'status-value':
                workerLocationStatus === 'inside',
              'status-value-outside':
                workerLocationStatus === 'outside',
              'status-value-checking':
                workerLocationStatus === 'checking',
              'status-value-error':
                workerLocationStatus === 'error'
            }"
          >
            <img
              :src="iconMapPinCheck"
              alt=""
              width="18"
              height="18"
              aria-hidden="true"
            />

            {{ locationStatusText }}
          </strong>
        </p>

        <p
          class="gps-message"
          role="status"
          aria-live="polite"
        >
          {{ gpsMessage }}
        </p>

        <p
          v-if="distanceToSite !== null"
          class="gps-detail"
        >
          Jarak ke titik proyek:
          <strong>
            {{ Math.round(distanceToSite) }} meter
          </strong>
        </p>

        <p
          v-if="gpsAccuracy !== null"
          class="gps-detail"
        >
          Akurasi GPS:
          ±{{ Math.round(gpsAccuracy) }} meter
        </p>

        <p class="gps-detail">
          Radius geofencing: {{ siteRadius }} meter
        </p>

        <button
          v-if="
            workerLocationStatus === 'error' ||
            workerLocationStatus === 'checking'
          "
          type="button"
          class="btn btn-secondary gps-retry-btn"
          @click="retryGps"
        >
          Periksa Lokasi Lagi
        </button>

        <!-- INFORMASI FOTO -->
        <div
          v-if="isPhotoCaptured"
          class="attendance-confirmed-banner"
          role="status"
          aria-live="polite"
        >
          <img
            :src="iconCircleCheck"
            alt=""
            width="20"
            height="20"
            aria-hidden="true"
          />

          <span>
            Foto disiapkan pukul {{ lastAbsenTime }}
          </span>
        </div>
      </section>

      <!-- KAMERA DAN TOMBOL ABSEN -->
      <div class="attendance-action-card">
        <div class="attendance-form">
          <fieldset class="camera-fieldset">
            <legend class="camera-legend">
              Pratinjau Kamera Depan
            </legend>

            <p class="fieldset-content">
              <button
                type="button"
                class="btn btn-secondary btn-block preview-camera-btn"
                @click="openCameraModal"
              >
                {{
                  isPhotoCaptured
                    ? '✓ FOTO WAJAH SIAP (KLIK UNTUK ULANGI)'
                    : 'TEKAN UNTUK AKTIFKAN KAMERA DEPAN'
                }}
              </button>
            </p>
          </fieldset>

          <p class="submit-action-row">
            <button
              type="button"
              class="btn btn-primary btn-block submit-absen-btn"
              :disabled="!isAttendanceReady"
              @click="handleFinalSubmitAbsen"
            >
              {{ attendanceActionLabel }}

              <img
                :src="iconScanFace"
                alt=""
                width="24"
                height="24"
                aria-hidden="true"
              />
            </button>
          </p>

          <p
            v-if="!isAttendanceReady"
            class="attendance-hint"
          >
            {{
              geofenceEnabled
                ? 'Tombol ABSEN aktif jika GPS berada di dalam radius proyek dan foto sudah disiapkan.'
                : 'Mode demo aktif: GPS asli tetap dicatat, radius proyek tidak divalidasi. Ambil foto untuk melanjutkan absensi.'
            }}
          </p>
        </div>
      </div>
    </main>

    <!-- WAKTU -->
    <footer class="mobile-footer">
      <p class="server-time-copy">
        WAKTU:
        <time :datetime="serverTime.toISOString()">
          {{ serverTimeString }}
        </time>
      </p>
    </footer>

    <!-- MODAL KAMERA -->
    <div
      v-if="isCameraModalOpen"
      class="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-camera-title"
    >
      <div
        class="modal-dialog-box"
        @click.stop
      >
        <div class="modal-top">
          <h3
            id="modal-camera-title"
            class="modal-heading"
          >
            Ambil Foto Absensi
          </h3>

          <button
            type="button"
            class="modal-close-icon-btn"
            aria-label="Tutup modal kamera"
            :disabled="isCapturing"
            @click="closeCameraModal"
          >
            <img
              :src="iconCircleX"
              alt=""
              width="26"
              height="26"
              aria-hidden="true"
            />
          </button>
        </div>

        <p class="modal-instruction">
          Pastikan wajah berada di dalam bingkai dan
          terlihat jelas.
        </p>

        <div class="camera-frame-container">
          <div
            class="camera-frame"
            style="position: relative; overflow: hidden; background: #000; width: 100%; height: 320px;"
          >
            <video
              ref="videoRef"
              autoplay
              playsinline
              muted
              style="width: 100%; height: 100%; object-fit: cover; position: absolute; inset: 0; z-index: 1;"
            ></video>

            <canvas
              ref="canvasRef"
              style="display: none;"
            ></canvas>

            <div
              class="camera-viewfinder"
              style="position: absolute; inset: 0; z-index: 2; display: flex; flex-direction: column; justify-content: space-between; height: 100%;"
            >
              <div class="face-guide-wrapper">
                <div
                  class="face-guide-ring"
                  :class="{
                    'is-capturing': isCapturing,
                    'is-success': isAbsenSuccess
                  }"
                >
                  <div class="reticle top-left"></div>
                  <div class="reticle top-right"></div>
                  <div class="reticle bottom-left"></div>
                  <div class="reticle bottom-right"></div>

                  <div
                    v-if="isCapturing"
                    class="scan-beam"
                  ></div>
                </div>
              </div>

              <div class="camera-overlay-info">
                <span
                  v-if="!isCapturing && !isAbsenSuccess"
                  class="camera-status-tag ready"
                >
                  Kamera Siap
                </span>

                <span
                  v-else-if="isCapturing"
                  class="camera-status-tag scanning"
                >
                  Foto...
                </span>

                <span
                  v-else
                  class="camera-status-tag verified"
                >
                  Foto Disiapkan
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-actions-wrapper">
          <div
            v-if="isAbsenSuccess"
            class="success-callout"
            role="status"
          >
            <img
              :src="iconCircleCheck"
              alt=""
              width="24"
              height="24"
              aria-hidden="true"
            />

            <div>
              <strong>Foto berhasil disiapkan</strong>
              <p>Waktu: {{ lastAbsenTime }}</p>
              <p>
                Foto akan disimpan saat kamu menekan tombol absensi.
              </p>
            </div>
          </div>

          <div class="modal-button-group">
            <button
              v-if="!isAbsenSuccess"
              type="button"
              class="btn btn-primary btn-block modal-capture-btn"
              :disabled="isCapturing"
              @click="triggerCaptureAbsen"
            >
              <img
                :src="iconScanFace"
                alt=""
                width="20"
                height="20"
                aria-hidden="true"
              />

              <span>
                {{
                  isCapturing
                    ? 'Memproses...'
                    : 'Ambil Foto & Siapkan Absen'
                }}
              </span>
            </button>

            <button
              v-else
              type="button"
              class="btn btn-primary btn-block modal-finish-btn"
              @click="closeCameraModal"
            >
              Selesai & Tutup Kamera
            </button>

            <button
              type="button"
              class="btn btn-secondary btn-block modal-cancel-btn"
              :disabled="isCapturing"
              @click="closeCameraModal"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* HEADER */
.topbar-nav {
  background-color: var(--color-header, #f58220);
  padding: var(--space-8, 8px) var(--space-16, 16px);
  position: sticky;
  top: 0;
  z-index: 10;
}

.topbar-content {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-height: 44px;
}

.logout-group {
  display: flex;
  align-items: center;
}

/* IDENTITAS */
.identity-header {
  padding: var(--space-24, 24px) var(--space-16, 16px) var(--space-16, 16px);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-8, 8px);
}

.brand-figure {
  margin: 0;
  display: flex;
  justify-content: center;
}

.brand-logo {
  object-fit: contain;
}

.brand-hgroup {
  margin: 0;
}

.company-name {
  font-size: var(--text-h4, 24px);
  font-weight: 800;
  color: var(--color-primary, #080264);
  margin: 0;
  line-height: 1.2;
}

.site-location {
  font-size: var(--text-body, 16px);
  font-weight: 600;
  color: var(--color-muted, #7b637b);
  margin: 4px 0 0;
}

/* KONTEN UTAMA */
.main-content {
  flex: 1;
  padding: var(--space-16, 16px);
  display: flex;
  flex-direction: column;
  gap: var(--space-24, 24px);
}

/* KARTU SALAM */
.worker-greeting-card {
  background: #f7f8fc;
  border: 1.5px solid var(--color-sidebar, #c5c9e8);
  border-radius: var(--radius-lg, 16px);
  padding: var(--space-16, 16px);
  text-align: center;
}

.worker-name {
  font-size: var(--text-h4, 24px);
  font-weight: 800;
  color: var(--color-primary, #080264);
  margin: 0 0 var(--space-8, 8px);
  letter-spacing: 0.02em;
}

.worker-meta {
  margin: 4px 0 10px;
  color: #555;
  font-size: 13px;
}

.project-status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-8, 8px);
  margin: 0;
  flex-wrap: wrap;
  font-size: 14px;
}

.status-label {
  font-weight: 600;
  color: #555;
}

.status-value,
.status-value-outside,
.status-value-checking,
.status-value-error {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
}

.status-value {
  background-color: var(--color-status-hadir-bg, #c8f5d0);
  color: var(--color-status-hadir-text, #0b7a28);
}

.status-value-outside,
.status-value-error {
  background: #fee2e2;
  color: #991b1b;
}

.status-value-checking {
  background: #fef3c7;
  color: #854d0e;
}

.gps-message {
  margin: 12px 0 6px;
  font-size: 13px;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.gps-detail {
  margin: 5px 0;
  font-size: 12px;
  color: #555;
}

.gps-retry-btn {
  margin-top: 8px;
  min-height: 40px;
}

.attendance-confirmed-banner {
  margin-top: var(--space-16, 16px);
  padding: 10px 12px;
  background-color: #eafaf1;
  border: 1px solid var(--color-status-hadir-text, #0b7a28);
  border-radius: var(--radius-md, 12px);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-8, 8px);
  font-size: 13px;
  font-weight: 700;
  color: var(--color-status-hadir-text, #0b7a28);
}

/* KARTU AKSI */
.attendance-action-card {
  background: var(--color-surface, #fff);
  border: 2px solid var(--color-primary, #080264);
  border-radius: var(--radius-xl, 24px);
  padding: var(--space-24, 24px) var(--space-16, 16px);
  box-shadow: var(--shadow-card, 0 8px 24px rgba(8, 12, 100, 0.1));
}

.attendance-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-24, 24px);
}

.camera-fieldset {
  border: 1.5px dashed var(--color-primary, #080264);
  border-radius: var(--radius-md, 12px);
  padding: var(--space-16, 16px);
  margin: 0;
}

.camera-legend {
  font-weight: 700;
  font-size: 14px;
  color: var(--color-primary, #080264);
  padding: 0 var(--space-8, 8px);
}

.fieldset-content {
  margin: 0;
}

.preview-camera-btn {
  font-size: 13px;
  letter-spacing: 0.04em;
  padding: 12px 16px;
  min-height: 48px;
  white-space: normal;
  text-align: center;
  border-width: 2px;
}

.submit-action-row {
  margin: 0;
}

.submit-absen-btn {
  font-size: 18px;
  font-weight: 800;
  min-height: 54px;
  letter-spacing: 0.06em;
  gap: var(--space-16, 16px);
  box-shadow: 0 4px 14px rgba(8, 2, 100, 0.25);
}

.submit-absen-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.attendance-hint {
  margin: 0;
  color: #6b7280;
  font-size: 12px;
  line-height: 1.5;
}

/* FOOTER */
.mobile-footer {
  text-align: center;
  padding: 12px 16px;
}

.server-time-copy {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

/* MODAL KAMERA */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(8, 2, 100, 0.65);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-16, 16px);
  backdrop-filter: blur(4px);
}

.modal-dialog-box {
  background: var(--color-surface, #fff);
  border-radius: var(--radius-xl, 24px);
  width: min(390px, 100%);
  max-height: 90vh;
  overflow-y: auto;
  padding: var(--space-24, 24px) var(--space-16, 16px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  gap: var(--space-16, 16px);
}

.modal-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-heading {
  font-size: 18px;
  font-weight: 800;
  color: var(--color-primary, #080264);
  margin: 0;
}

.modal-close-icon-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 6px;
  min-width: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-pill, 999px);
}

.modal-instruction {
  font-size: 13px;
  color: #555;
  margin: 0;
  text-align: center;
}

.camera-frame-container {
  display: flex;
  justify-content: center;
  margin: var(--space-8, 8px) 0;
}

.camera-viewfinder {
  padding: var(--space-16, 16px);
  overflow: hidden;
  border-radius: inherit;
}

.face-guide-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.face-guide-ring {
  position: relative;
  width: 160px;
  height: 210px;
  border: 2px dashed rgba(255, 255, 255, 0.6);
  border-radius: 50% / 60% 60% 40% 40%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.3s ease;
}

.face-guide-ring.is-capturing {
  border-color: var(--color-accent, #f58220);
  border-style: solid;
}

.face-guide-ring.is-success {
  border-color: var(--color-success, #00e81a);
  border-style: solid;
  border-width: 3px;
}

.reticle {
  position: absolute;
  width: 16px;
  height: 16px;
  border-color: #fff;
  border-style: solid;
}

.reticle.top-left {
  top: -6px;
  left: -6px;
  border-width: 3px 0 0 3px;
}

.reticle.top-right {
  top: -6px;
  right: -6px;
  border-width: 3px 3px 0 0;
}

.reticle.bottom-left {
  bottom: -6px;
  left: -6px;
  border-width: 0 0 3px 3px;
}

.reticle.bottom-right {
  bottom: -6px;
  right: -6px;
  border-width: 0 3px 3px 0;
}

.scan-beam {
  position: absolute;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, #f58220, transparent);
  box-shadow: 0 0 8px #f58220;
  animation: scanMove 1.2s infinite alternate ease-in-out;
}

@keyframes scanMove {
  0% {
    top: 10%;
  }

  100% {
    top: 90%;
  }
}

.camera-overlay-info {
  margin-bottom: 16px;
  text-align: center;
}

.camera-status-tag {
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: var(--radius-pill, 999px);
  background: rgba(0, 0, 0, 0.6);
  letter-spacing: 0.02em;
}

.camera-status-tag.ready {
  color: #fff;
}

.camera-status-tag.scanning {
  color: #f58220;
}

.camera-status-tag.verified {
  color: #00e81a;
}

.modal-actions-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--space-16, 16px);
}

.success-callout {
  display: flex;
  align-items: center;
  gap: var(--space-16, 16px);
  background-color: var(--color-status-hadir-bg, #c8f5d0);
  color: var(--color-status-hadir-text, #0b7a28);
  padding: 12px 16px;
  border-radius: var(--radius-md, 12px);
  font-size: 14px;
}

.success-callout p {
  margin: 2px 0 0;
  font-size: 12px;
}

.modal-button-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-8, 8px);
}

.modal-capture-btn,
.modal-finish-btn {
  min-height: 48px;
  font-size: 15px;
}

.modal-cancel-btn {
  min-height: 44px;
}
</style>