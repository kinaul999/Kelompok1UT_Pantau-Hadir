<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

import iconLogOut from '../assets/icons/log-out.svg'
import iconScanFace from '../assets/icons/scan-face.svg'
import iconMapPinCheck from '../assets/icons/map-pin-check.svg'
import iconCircleCheck from '../assets/icons/circle-check.svg'
import iconCircleX from '../assets/icons/circle-x.svg'
import logoPantauHadir from '../assets/images/logo-pantau-hadir.svg'

// Status Lokasi Pekerja: 'inside' (di dalam area) atau 'outside' (di luar area)
const workerLocationStatus = ref('inside') 

// State Aksi: Pop-up Modal Kamera Asli
const isCameraModalOpen = ref(false)
const isCapturing = ref(false)
const isAbsenSuccess = ref(false)
const lastAbsenTime = ref('')

// Ref untuk menangkap elemen html video asli laptop/HP
const videoRef = ref(null)
let streamInstance = null

// Daftarkan fungsi pemancar sinyal pindah halaman ke App.vue
const emit = defineEmits(['absen-complete', 'logout-trigger'])

const openCameraModal = async () => {
  isAbsenSuccess.value = false
  isCameraModalOpen.value = true

  // Tunggu sampai Vue selesai menggambar elemen modal & video di layar
  await nextTick()

  try {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      })
      streamInstance = stream
      if (videoRef.value) {
        videoRef.value.srcObject = stream
      }
    }
  } catch (err) {
    console.error("Gagal mengakses kamera depan asli: ", err)
  }
}


const closeCameraModal = () => {
  if (isCapturing.value) return
  isCameraModalOpen.value = false
  
  // Mematikan lampu kamera asli saat jendela ditutup agar hemat RAM & privasi aman
  if (streamInstance) {
    streamInstance.getTracks().forEach(track => track.stop())
  }
}

// State baru untuk mengecek apakah pekerja sudah mengambil foto wajah atau belum
const isPhotoCaptured = ref(false)

// Simulasi Aksi Deteksi Wajah dan Pengambilan Foto (Modal otomatis tertutup setelah sukses)
const triggerCaptureAbsen = () => {
  isCapturing.value = true
  
  setTimeout(() => {
    isCapturing.value = false
    isAbsenSuccess.value = true // Untuk memunculkan spanduk notifikasi waktu
    isPhotoCaptured.value = true // Menandai bahwa foto lokal sudah siap!
    
    const now = new Date()
    lastAbsenTime.value = now.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }) + ' WIB'
    
    // Beri jeda 1 detik agar pekerja melihat status sukses terverifikasi di modal, 
    // lalu tutup modal kamera secara otomatis agar pekerja bisa menekan tombol ABSEN utama di luar.
    setTimeout(() => {
      closeCameraModal()
    }, 1000)
    
  }, 1200)
}

// Fungsi tombol ABSEN utama untuk mengirim data ke server tiruan dan pindah ke halaman sukses
const handleFinalSubmitAbsen = () => {
  emit('absen-complete')
}

// Fungsi tombol keluar untuk memicu perpindahan layar balik ke Login
const handleLogoutClick = () => {
  emit('logout-trigger')
}

// Keyboard Accessibility: Tutup Modal / Drawer dengan tombol Escape
const handleGlobalKeydown = (event) => {
  if (event.key === 'Escape') {
    if (isCameraModalOpen.value) {
      closeCameraModal()
    } else if (isDrawerOpen.value) {
      closeDrawer()
    }
  }
}

// Waktu Server Reaktif
const serverTime = ref(new Date())
const serverTimeString = ref('')
let timerId = null

const updateClock = () => {
  serverTime.value = new Date(serverTime.value.getTime() + 1000)
  const d = serverTime.value
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGT', 'SEP', 'OKT', 'NOV', 'DES']
  const dateNum = d.getDate()
  const monthName = months[d.getMonth()]
  const year = d.getFullYear()
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  serverTimeString.value = `${dateNum} ${monthName} ${year} ${hours}:${minutes}:${seconds} WIB`
}

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeydown)
  timerId = setInterval(updateClock, 1000)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeydown)
  if (timerId) clearInterval(timerId)
})
</script>

<template>
  <div class="mobile-shell">
    <!-- Header Atas: Navigasi Menu & Tombol Keluar -->
    <header class="topbar-nav">
      <nav class="topbar-content" aria-label="Navigasi Header">
        
        <!-- Tombol Keluar Sesuai Kode Asal -->
        <div class="logout-group">
          <!-- Memanggil fungsi JavaScript handleLogoutClick agar sinkronisasi emit berjalan 100% lancar -->
          <a 
            href="#keluar" 
            class="btn btn-secondary" 
            style="padding: 4px 16px; min-height: 36px; font-size: 14px;"
            @click.prevent="handleLogoutClick"
          >
            <img :src="iconLogOut" alt="" class="icon-logout-svg" width="16" height="16" aria-hidden="true" />
            <span>Keluar</span>
          </a>
        </div>
      </nav>
    </header>

    <!-- Header Identitas: Logo dan Info Lokasi Proyek -->
    <header class="identity-header">
      <figure class="brand-figure">
        <img
          width="100"
          height="100"
          :src="logoPantauHadir"
          alt="Logo Pantau Hadir - Sistem Absensi Pekerja Proyek"
          class="brand-logo"
        />
      </figure>
      <hgroup class="brand-hgroup">
        <h1 class="company-name">PT. Jalan Baru</h1>
        <p class="site-location">SITE A - Kalimalang</p>
      </hgroup>
    </header>

    <!-- Konten Utama: Layar Presensi Mandiri -->
    <main class="main-content">
      <section class="worker-greeting-card">
        <h2 class="worker-name">HALO, CAHYADI!</h2>
        <p class="project-status">
          <span class="status-label">STATUS:</span>
          <strong 
            :class="workerLocationStatus === 'inside' ? 'status-value' : 'status-value-outside'"
            style="padding: 4px 10px; border-radius: 999px; font-size: 13px; font-weight: 700;"
          >
            <img :src="iconMapPinCheck" alt="" width="18" height="18" aria-hidden="true" />
            {{ workerLocationStatus === 'inside' ? 'DI DALAM AREA PROYEK' : 'DI LUAR AREA PROYEK' }}
          </strong>
        </p>


        <!-- Notifikasi Konfirmasi Kehadiran Hari Ini Jika Sudah Absen -->
        <div v-if="isAbsenSuccess" class="attendance-confirmed-banner" role="status" aria-live="polite">
          <img :src="iconCircleCheck" alt="" width="20" height="20" aria-hidden="true" />
          <span>Absensi terverifikasi pukul {{ lastAbsenTime }}</span>
        </div>
      </section>

      <!-- Area Kamera & Interaksi Pengambilan Presensi -->
      <div class="attendance-action-card">
        <!-- Hapus form submit handler agar tombol tidak rebutan fungsi -->
        <div class="attendance-form">
          <fieldset class="camera-fieldset">
            <legend class="camera-legend">Pratinjau Kamera Depan</legend>
            <p class="fieldset-content">
              <button
                type="button"
                class="btn btn-secondary btn-block preview-camera-btn"
                @click="openCameraModal"
              >
                {{ isPhotoCaptured ? '✓ FOTO WAJAH SIAP (KLIK UNTUK ULANGI)' : 'TEKAN UNTUK AKTIFKAN KAMERA DEPAN' }}
              </button>
            </p>
          </fieldset>

          <p class="submit-action-row">
            <!-- Tombol ABSEN Utama sekarang memiliki LOGIKA GANDA:
                Hanya menyala jika pekerja di DALAM area proyek AND sudah sukses mengambil foto wajah! -->
            <button
              type="button"
              class="btn btn-primary btn-block submit-absen-btn"
              :disabled="workerLocationStatus !== 'inside' || !isPhotoCaptured"
              @click="handleFinalSubmitAbsen"
            >
              ABSEN
              <img :src="iconScanFace" alt="" width="24" height="24" aria-hidden="true" />
            </button>
          </p>
        </div>
      </div>

    </main>

    <!-- Footer Sistem -->
    <footer class="mobile-footer">
      <p class="server-time-copy">
        WAKTU SERVER:
        <time :datetime="serverTime.toISOString()">{{ serverTimeString }}</time>
        <!-- dikerjakan oleh Kintan Aulia -->
      </p>
    </footer>
    
    <!-- Pop-up Modal Kamera Deteksi Wajah -->
    <div
      v-if="isCameraModalOpen"
      class="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-camera-title"
    >
      <div class="modal-dialog-box" @click.stop>
        <div class="modal-top">
          <h3 id="modal-camera-title" class="modal-heading">Simulasi Deteksi Wajah</h3>
          <button
            type="button"
            class="modal-close-icon-btn"
            aria-label="Tutup modal kamera"
            @click="closeCameraModal"
          >
            <img :src="iconCircleX" alt="" width="26" height="26" aria-hidden="true" />
          </button>
        </div>

        <p class="modal-instruction">
          Pastikan wajah berada di dalam bingkai dan terlihat jelas tanpa masker.
        </p>

        <!-- Bingkai Kamera Aktif Menggunakan Kelas .camera-frame Sesuai style.css -->
        <!-- GANTI STRUKTUR AREA BINGKAI KAMERA LAMA DENGAN INI -->
        <div class="camera-frame-container">
          <div class="camera-frame" style="position: relative; overflow: hidden; background: #000;">
            
            <!-- Tag video utama dengan posisi absolut menutupi bingkai secara penuh -->
            <video 
              ref="videoRef" 
              autoplay 
              playsinline 
              muted
              style="width: 100%; height: 100%; object-fit: cover; position: absolute; inset: 0; z-index: 1;"
            ></video>

            <!-- Lapisan reticle oval dan teks status diletakkan di atas video (z-index: 2) -->
            <div class="camera-viewfinder" style="position: absolute; inset: 0; z-index: 2; display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
              
              <!-- Reticle Oval Panduan Wajah -->
              <div style="flex: 1; display: flex; align-items: center; justify-content: center;">
                <div class="face-guide-ring" :class="{ 'is-capturing': isCapturing, 'is-success': isAbsenSuccess }">
                  <div class="reticle top-left"></div>
                  <div class="reticle top-right"></div>
                  <div class="reticle bottom-left"></div>
                  <div class="reticle bottom-right"></div>
                  <div v-if="isCapturing" class="scan-beam"></div>
                </div>
              </div>

              <!-- Status Informasi Kamera di Bagian Bawah Bingkai -->
              <div class="camera-overlay-info" style="margin-bottom: 16px; text-align: center;">
                <span v-if="!isCapturing && !isAbsenSuccess" class="camera-status-tag ready">
                  Kamera Siap: Site A Kalimalang
                </span>
                <span v-else-if="isCapturing" class="camera-status-tag scanning">
                  Memindai Biometrik Wajah...
                </span>
                <span v-else class="camera-status-tag verified">
                  Wajah Terverifikasi 100%
                </span>
              </div>

            </div>
          </div>
        </div>


        <!-- Feedback & Tombol Aksi Kamera -->
        <div class="modal-actions-wrapper">
          <div v-if="isAbsenSuccess" class="success-callout" role="alert">
            <img :src="iconCircleCheck" alt="" width="24" height="24" aria-hidden="true" />
            <div>
              <strong>Absensi Berhasil Terkirim!</strong>
              <p>Waktu server: {{ lastAbsenTime }}</p>
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
              <img :src="iconScanFace" alt="" width="20" height="20" aria-hidden="true" />
              <span>{{ isCapturing ? 'Memproses Pengenalan Wajah...' : 'Ambil Foto & Simpan Absen' }}</span>
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
/* -----------------------------------------------------------------------------
   KOMPONEN DASHBOARD PEKERJA — MOBILE FRAME (FIGMA MODUL 5)
   Terintegrasi dengan design token & style.css
   ----------------------------------------------------------------------------- */

/* Header Atas Navigasi */
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
  justify-content: space-between;
  min-height: 44px;
}

/* Tombol Hamburger */
.btn-hamburger {
  display: inline-flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
  width: 44px;
  height: 44px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: var(--radius-sm, 8px);
}

.btn-hamburger:focus-visible {
  outline: 3px solid var(--color-primary, #080264);
  outline-offset: 2px;
}

.hamburger-bar {
  display: block;
  width: 24px;
  height: 3px;
  background-color: var(--color-primary, #080264);
  border-radius: 2px;
}

/* Keluar Link */
.logout-group {
  display: flex;
  align-items: center;
}

/* Header Identitas */
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

/* Konten Utama */
.main-content {
  flex: 1;
  padding: var(--space-16, 16px);
  display: flex;
  flex-direction: column;
  gap: var(--space-24, 24px);
}

/* Kartu Salam Pekerja */
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
  color: #555555;
}

.status-value {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background-color: var(--color-status-hadir-bg, #c8f5d0);
  color: var(--color-status-hadir-text, #0b7a28);
  padding: 4px 10px;
  border-radius: var(--radius-pill, 999px);
  font-size: 13px;
  font-weight: 700;
}

.inline-pin-icon {
  flex-shrink: 0;
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

/* Kartu Aksi Absensi */
.attendance-action-card {
  background: var(--color-surface, #ffffff);
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

/* Footer Waktu Server */
.server-time-copy {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

/* -----------------------------------------------------------------------------
   DRAWER NAVIGATION (AKSI 1)
   ----------------------------------------------------------------------------- */
.drawer-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 100;
  backdrop-filter: blur(2px);
}

.drawer-panel {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: min(320px, 85vw);
  background-color: var(--color-surface, #ffffff);
  z-index: 101;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-panel, 0 12px 32px rgba(8, 12, 100, 0.2));
  transform: translateX(-100%);
  transition: transform 0.25s ease-in-out;
}

.drawer-panel.is-open {
  transform: translateX(0);
}

.drawer-header {
  background-color: var(--color-sidebar, #c5c9e8);
  padding: var(--space-24, 24px) var(--space-16, 16px);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-8, 8px);
}

.drawer-user-info {
  display: flex;
  align-items: center;
  gap: var(--space-16, 16px);
}

.drawer-worker-name {
  font-size: 16px;
  font-weight: 800;
  color: var(--color-primary, #080264);
  margin: 0;
}

.drawer-worker-meta {
  font-size: 12px;
  color: #333333;
  margin: 2px 0 0;
}

.btn-close-drawer {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px;
  min-width: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-pill, 999px);
}

.btn-close-drawer:focus-visible {
  outline: 3px solid var(--color-primary, #080264);
  outline-offset: 2px;
}

.drawer-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: var(--space-16, 16px) 0;
}

.drawer-menu-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.drawer-menu-item {
  margin: 2px 0;
}

.drawer-menu-link {
  display: flex;
  align-items: center;
  gap: var(--space-16, 16px);
  padding: 12px var(--space-24, 24px);
  font-size: 15px;
  font-weight: 600;
  color: var(--color-primary, #080264);
  text-decoration: none;
  min-height: 48px;
  transition: background-color 0.15s ease;
}

.drawer-menu-item.is-active .drawer-menu-link,
.drawer-menu-link:hover {
  background-color: rgba(8, 2, 100, 0.08);
  font-weight: 700;
}

.drawer-menu-link:focus-visible {
  outline: 3px solid var(--color-secondary, #5d2deb);
  outline-offset: -2px;
}

.drawer-footer-action {
  padding: var(--space-16, 16px) var(--space-24, 24px);
  border-top: 1px solid #e0e2ec;
}

.drawer-logout-link {
  display: flex;
  align-items: center;
  gap: var(--space-16, 16px);
  color: var(--color-error, #e22121);
  text-decoration: none;
  font-weight: 700;
  font-size: 15px;
  min-height: 44px;
}

.drawer-logout-link:hover {
  text-decoration: underline;
}

/* -----------------------------------------------------------------------------
   MODAL KAMERA DETEKSI WAJAH (AKSI 2)
   ----------------------------------------------------------------------------- */
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
  background: var(--color-surface, #ffffff);
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

.modal-close-icon-btn:focus-visible {
  outline: 3px solid var(--color-secondary, #5d2deb);
  outline-offset: 2px;
}

.modal-instruction {
  font-size: 13px;
  color: #555555;
  margin: 0;
  text-align: center;
}

/* Wadah Camera-Frame */
.camera-frame-container {
  display: flex;
  justify-content: center;
  margin: var(--space-8, 8px) 0;
}

/* Viewfinder di dalam .camera-frame */
.camera-viewfinder {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-16, 16px);
  overflow: hidden;
  border-radius: inherit;
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

/* Sudut Reticle Kamera */
.reticle {
  position: absolute;
  width: 16px;
  height: 16px;
  border-color: #ffffff;
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

/* Scanning Beam Animation */
.scan-beam {
  position: absolute;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, var(--color-accent, #f58220), transparent);
  box-shadow: 0 0 8px var(--color-accent, #f58220);
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
  margin-top: auto;
  padding-top: var(--space-8, 8px);
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
  color: #ffffff;
}

.camera-status-tag.scanning {
  color: var(--color-accent, #f58220);
}

.camera-status-tag.verified {
  color: var(--color-success, #00e81a);
}

/* Modal Actions */
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