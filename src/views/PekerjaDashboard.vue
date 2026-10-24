
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

// ==================================================
// IDENTITAS PEKERJA
// ==================================================

const workerName = computed(() => {
  return props.worker?.name || 'Pekerja'
})

const workerNik = computed(() => {
  return props.worker?.nik || '-'
})

// ==================================================
// INFORMASI SITE DAN GEOFENCING
// ==================================================

const siteName = ref('Memuat lokasi proyek...')
const siteAddress = ref('')

const siteLatitude = ref(null)
const siteLongitude = ref(null)
const siteRadius = ref(500)

const workerLocationStatus = ref('checking')
const gpsMessage = ref('Memeriksa lokasi perangkat...')

const workerLatitude = ref(null)
const workerLongitude = ref(null)
const distanceToSite = ref(null)
const gpsAccuracy = ref(null)

let watchId = null

const isInsideArea = computed(() => {
  return workerLocationStatus.value === 'inside'
})

const locationStatusText = computed(() => {
  if (workerLocationStatus.value === 'inside') {
    return 'DI DALAM AREA PROYEK'
  }

  if (workerLocationStatus.value === 'outside') {
    return 'DI LUAR AREA PROYEK'
  }

  if (workerLocationStatus.value === 'error') {
    return 'LOKASI TIDAK TERSEDIA'
  }

  return 'MEMERIKSA LOKASI'
})

const isAttendanceReady = computed(() => {
  return isInsideArea.value && isPhotoCaptured.value
})

// Membaca angka dari beberapa kemungkinan nama kolom
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

// Mengambil informasi site berdasarkan site_id pekerja
const loadSite = async () => {
  if (!props.worker?.site_id) {
    siteName.value = 'Site belum ditentukan'
    gpsMessage.value =
      'Data site pekerja belum tersedia.'
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

  // Sesuaikan dengan nama kolom yang tersedia
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

  if (
    siteLatitude.value === null ||
    siteLongitude.value === null ||
    Math.abs(siteLatitude.value) > 90 ||
    Math.abs(siteLongitude.value) > 180
  ) {
    siteName.value = siteName.value
    workerLocationStatus.value = 'error'
    gpsMessage.value =
      'Koordinat proyek belum tersedia atau tidak valid. Periksa kolom latitude dan longitude di tabel Sites.'
    return
  }

  startGps()
}

// Menghitung jarak antara posisi pekerja dan titik proyek
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

// Meminta lokasi perangkat dan memperbarui status GPS
const startGps = () => {
  if (!navigator.geolocation) {
    workerLocationStatus.value = 'error'
    gpsMessage.value =
      'Browser ini tidak mendukung GPS.'
    return
  }

  if (
    siteLatitude.value === null ||
    siteLongitude.value === null
  ) {
    workerLocationStatus.value = 'error'
    gpsMessage.value =
      'Koordinat proyek belum valid.'
    return
  }

  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId)
    watchId = null
  }

  workerLocationStatus.value = 'checking'
  gpsMessage.value =
    'Meminta izin lokasi perangkat...'

  watchId = navigator.geolocation.watchPosition(
    position => {
      workerLatitude.value = position.coords.latitude
      workerLongitude.value = position.coords.longitude
      gpsAccuracy.value = position.coords.accuracy

      distanceToSite.value = calculateDistance(
        workerLatitude.value,
        workerLongitude.value,
        siteLatitude.value,
        siteLongitude.value
      )

      // Tolak status di dalam area jika akurasi terlalu buruk
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

// ==================================================
// KAMERA DAN SIMULASI FOTO
// ==================================================

const isCameraModalOpen = ref(false)
const isCapturing = ref(false)
const isAbsenSuccess = ref(false)
const isPhotoCaptured = ref(false)
const lastAbsenTime = ref('')

const videoRef = ref(null)

let streamInstance = null
let captureTimerId = null
let closeCameraTimerId = null

const openCameraModal = async () => {
  isAbsenSuccess.value = false
  isCameraModalOpen.value = true

  await nextTick()

  try {
    if (
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia
    ) {
      streamInstance =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user'
          },
          audio: false
        })

      if (videoRef.value) {
        videoRef.value.srcObject = streamInstance
      }
    } else {
      alert(
        'Browser tidak mendukung akses kamera.'
      )
    }
  } catch (error) {
    console.error('Gagal mengakses kamera:', error)

    alert(
      'Kamera tidak dapat diakses. Periksa izin kamera browser.'
    )
  }
}

const closeCameraModal = () => {
  if (isCapturing.value) return

  isCameraModalOpen.value = false

  if (streamInstance) {
    streamInstance.getTracks().forEach(track => {
      track.stop()
    })

    streamInstance = null
  }

  if (videoRef.value) {
    videoRef.value.srcObject = null
  }
}

// Ini masih simulasi persiapan foto, belum deteksi wajah sungguhan
const triggerCaptureAbsen = () => {
  if (!streamInstance) {
    alert('Aktifkan kamera terlebih dahulu.')
    return
  }

  isCapturing.value = true

  captureTimerId = setTimeout(() => {
    isCapturing.value = false
    isAbsenSuccess.value = true
    isPhotoCaptured.value = true

    lastAbsenTime.value =
      new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }) + ' WIB'

    closeCameraTimerId = setTimeout(() => {
      closeCameraModal()
    }, 1000)
  }, 1200)
}

// Belum menyimpan absensi ke tabel attendances
const handleFinalSubmitAbsen = () => {
  if (!isInsideArea.value) {
    alert(
      'Kamu harus berada di dalam area proyek untuk absen.'
    )
    return
  }

  if (!isPhotoCaptured.value) {
    alert(
      'Aktifkan kamera dan siapkan foto terlebih dahulu.'
    )
    return
  }

  emit('absen-complete')
}

const handleLogoutClick = () => {
  emit('logout-trigger')
}

// ==================================================
// JAM
// ==================================================

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

// ==================================================
// EVENT DAN PEMBERSIHAN
// ==================================================

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
})

onUnmounted(() => {
  window.removeEventListener(
    'keydown',
    handleGlobalKeydown
  )

  if (timerId) clearInterval(timerId)

  if (watchId !== null && navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId)
  }

  if (captureTimerId) {
    clearTimeout(captureTimerId)
  }

  if (closeCameraTimerId) {
    clearTimeout(closeCameraTimerId)
  }

  if (streamInstance) {
    streamInstance.getTracks().forEach(track => {
      track.stop()
    })
  }
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
              ABSEN

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
            Tombol ABSEN hanya aktif jika GPS menunjukkan
            kamu berada di dalam radius proyek dan foto
            sudah disiapkan.
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
            Simulasi Deteksi Wajah
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
                  Memproses simulasi...
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
              <p>Belum disimpan ke attendances.</p>
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
