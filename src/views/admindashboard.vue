
<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { supabase } from '../lib/supabase'

import logo from '../assets/images/logo-pantau-hadir.svg'
import constructionImage from '../assets/images/images-konstruksi-biru.jpg'
import hardHatIcon from '../assets/icons/hard-hat.svg'
import checkIcon from '../assets/icons/circle-check.svg'
import absentIcon from '../assets/icons/circle-x.svg'
import logoutIcon from '../assets/icons/log-out.svg'
import usersIcon from '../assets/icons/users.svg'
import scanFaceIcon from '../assets/icons/scan-face.svg'
import squarePenIcon from '../assets/icons/square-pen.svg'

const emit = defineEmits([
  'admin-logout-trigger',
  'data-pekerja-trigger',
  'rekapitulasi-absen-trigger',
  'admin-dashboard-trigger'
])

// ========================================
// NAVIGASI MOBILE
// ========================================

const isMobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

const navigateAdmin = (eventName) => {
  closeMobileMenu()
  emit(eventName)
}

// ========================================
// STATISTIK DASHBOARD
// ========================================

const totalWorkers = ref(0)
const presentWorkers = ref(0)
const now = ref(new Date())

const isLoadingStats = ref(false)
const statsError = ref('')

const absentWorkers = computed(() =>
  Math.max(0, totalWorkers.value - presentWorkers.value)
)

const attendancePercentage = computed(() =>
  totalWorkers.value > 0
    ? Math.round(
        (presentWorkers.value / totalWorkers.value) * 100
      )
    : 0
)

const absentPercentage = computed(() =>
  totalWorkers.value > 0
    ? Math.round(
        (absentWorkers.value / totalWorkers.value) * 100
      )
    : 0
)

// ========================================
// TANGGAL HARI INI BERDASARKAN WIB
// ========================================

const getTodayWIB = () => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date())

  const values = Object.fromEntries(
    parts.map(part => [part.type, part.value])
  )

  return `${values.year}-${values.month}-${values.day}`
}

// ========================================
// MEMUAT STATISTIK DARI SUPABASE
// ========================================

const loadDashboardStats = async () => {
  isLoadingStats.value = true
  statsError.value = ''

  try {
    // Hitung seluruh pekerja terdaftar
    const {
      count: workerCount,
      error: workerError
    } = await supabase
      .from('Workers')
      .select('id', {
        count: 'exact',
        head: true
      })

    if (workerError) throw workerError

    // Ambil pekerja yang sudah absen masuk hari ini
    const today = getTodayWIB()

    const {
      data: attendanceRows,
      error: attendanceError
    } = await supabase
      .from('attendances')
      .select('worker_id')
      .eq('attendance_date', today)
      .not('check_in', 'is', null)

    if (attendanceError) throw attendanceError

    // Mencegah pekerja dihitung lebih dari sekali
    const uniquePresentWorkers = new Set(
      (attendanceRows || [])
        .map(row => row.worker_id)
        .filter(Boolean)
    )

    totalWorkers.value = workerCount ?? 0
    presentWorkers.value = uniquePresentWorkers.size

  } catch (error) {
    console.error(
      'Gagal memuat statistik dashboard:',
      error
    )

    statsError.value =
      error?.message ||
      'Gagal memuat statistik dari Supabase.'

  } finally {
    isLoadingStats.value = false
  }
}

// ========================================
// TANGGAL DAN JAM DASHBOARD
// ========================================

const dateLabel = computed(() =>
  new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta'
  }).format(now.value)
)

const timeLabel = computed(() =>
  `${new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
    timeZone: 'Asia/Jakarta'
  }).format(now.value)} WIB`
)

// ========================================
// REALTIME SUPABASE
// ========================================

let clockInterval = null
let attendanceChannel = null
let workerChannel = null

onMounted(async () => {
  // Jam berjalan setiap detik
  clockInterval = window.setInterval(() => {
    now.value = new Date()
  }, 1000)

  // Muat statistik awal
  await loadDashboardStats()

  // Realtime absensi
  attendanceChannel = supabase
    .channel('admin-dashboard-attendance')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'attendances'
      },
      () => {
        loadDashboardStats()
      }
    )
    .subscribe(status => {
      if (status === 'CHANNEL_ERROR') {
        console.error(
          'Realtime absensi gagal terhubung.'
        )
      }
    })

  // Realtime data pekerja
  workerChannel = supabase
    .channel('admin-dashboard-workers')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'Workers'
      },
      () => {
        loadDashboardStats()
      }
    )
    .subscribe(status => {
      if (status === 'CHANNEL_ERROR') {
        console.error(
          'Realtime data pekerja gagal terhubung.'
        )
      }
    })
})

// ========================================
// MEMBERSIHKAN INTERVAL DAN CHANNEL
// ========================================

onUnmounted(() => {
  if (clockInterval) {
    window.clearInterval(clockInterval)
    clockInterval = null
  }

  if (attendanceChannel) {
    supabase.removeChannel(attendanceChannel)
    attendanceChannel = null
  }

  if (workerChannel) {
    supabase.removeChannel(workerChannel)
    workerChannel = null
  }
})
</script>

<template>
  <div class="layout-admin dashboard-shell">

    <!-- ==================================
         OVERLAY SIDEBAR MOBILE
    =================================== -->

    <div
      v-if="isMobileMenuOpen"
      class="mobile-sidebar-overlay"
      @click="closeMobileMenu"
    ></div>

    <!-- ==================================
         SIDEBAR
    =================================== -->

    <aside
      class="sidebar admin-sidebar"
      :class="{
        'mobile-sidebar-open': isMobileMenuOpen
      }"
    >

      <!-- LOGO -->
      <div class="sidebar-logo">
        <img
          :src="logo"
          alt="Pantau Hadir - Sistem Absensi Pekerja Proyek"
          class="brand-logo"
        />
      </div>

      <!-- NAVIGASI -->
      <nav
        class="sidebar-nav"
        aria-label="Navigasi Utama Admin"
      >

        <!-- DASHBOARD -->
        <button
          type="button"
          class="nav-item is-active"
          aria-current="page"
          @click="navigateAdmin('admin-dashboard-trigger')"
        >
          <img
            :src="scanFaceIcon"
            alt=""
            width="26"
            height="26"
            class="nav-icon"
            aria-hidden="true"
          />

          <span>Dashboard</span>
        </button>

        <!-- REKAP ABSENSI -->
        <button
          type="button"
          class="nav-item"
          @click="navigateAdmin('rekapitulasi-absen-trigger')"
        >
          <img
            :src="squarePenIcon"
            alt=""
            width="26"
            height="26"
            class="nav-icon"
            aria-hidden="true"
          />

          <span>Rekap Absensi</span>
        </button>

        <!-- DATA PEKERJA -->
        <button
          type="button"
          class="nav-item"
          @click="navigateAdmin('data-pekerja-trigger')"
        >
          <img
            :src="usersIcon"
            alt=""
            width="26"
            height="26"
            class="nav-icon"
            aria-hidden="true"
          />

          <span>Data Pekerja</span>
        </button>

      </nav>

      <!-- FOOTER SIDEBAR -->
      <div class="sidebar-footer">

        <button
          type="button"
          class="btn-logout"
          aria-label="Keluar ke halaman landing"
          @click="navigateAdmin('admin-logout-trigger')"
        >
          <img
            :src="logoutIcon"
            alt=""
            width="18"
            height="18"
            aria-hidden="true"
          />

          <span>Keluar</span>
        </button>

        <div class="sidebar-copy">
          <p>© 2026 Pantau Hadir App</p>
          <small>Sistem Absensi Pekerja Proyek</small>
        </div>

      </div>
    </aside>

    <!-- ==================================
         AREA UTAMA
    =================================== -->

    <div class="admin-main-wrap">

      <!-- HEADER -->
      <header class="app-header">

        <!-- HAMBURGER MOBILE -->
        <button
          type="button"
          class="mobile-menu-button"
          aria-label="Buka menu navigasi"
          :aria-expanded="isMobileMenuOpen"
          @click="toggleMobileMenu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <h2 class="company-title">
          PT. Jalan Baru
        </h2>

        <div class="admin-profile">
          <span class="admin-label">Admin</span>

          <div
            class="avatar-circle"
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              class="avatar-icon"
            >
              <path
                d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
                fill="#ffffff"
              />

              <path
                d="M12.0002 14.5C6.99016 14.5 2.91016 17.86 2.91016 22C2.91016 22.28 3.13016 22.5 3.41016 22.5H20.5902C20.8702 22.5 21.0902 22.28 21.0902 22C21.0902 17.86 17.0102 14.5 12.0002 14.5Z"
                fill="#ffffff"
              />
            </svg>
          </div>
        </div>

      </header>

      <!-- ==================================
           KONTEN DASHBOARD
      =================================== -->

      <main class="dashboard-content">

        <section class="dashboard-content">

          <!-- JUDUL HALAMAN -->
          <div class="page-heading">
            <div>
              <span class="eyebrow">
                RINGKASAN AKTIVITAS
              </span>

              <h1>Dashboard</h1>

              <p>
                Selamat datang kembali, Administrator!
              </p>
            </div>
          </div>

          <!-- TANGGAL DAN WAKTU -->
          <div class="datetime-bar" aria-live="off">

            <div class="date-info">
              <span
                class="info-dot"
                aria-hidden="true"
              ></span>

              <div>
                <span class="info-label">
                  Tanggal
                </span>

                <strong>{{ dateLabel }}</strong>
              </div>
            </div>

            <div class="time-info">
              <span class="info-label">
                Waktu saat ini
              </span>

              <strong>{{ timeLabel }}</strong>
            </div>

          </div>

          <!-- ERROR STATISTIK -->
          <div
            v-if="statsError"
            class="stats-error"
            role="alert"
          >
            <span>{{ statsError }}</span>

            <button
              type="button"
              @click="loadDashboardStats"
              :disabled="isLoadingStats"
            >
              {{
                isLoadingStats
                  ? 'Memuat...'
                  : 'Coba Lagi'
              }}
            </button>
          </div>

          <!-- ==================================
               KARTU STATISTIK
          =================================== -->

          <div class="statistics-grid">

            <!-- TOTAL PEKERJA -->
            <article class="stat-card">

              <div class="stat-icon icon-total">
                <img
                  :src="hardHatIcon"
                  alt=""
                />
              </div>

              <div class="stat-details">
                <p>Total Pekerja</p>

                <h2>
                  {{
                    isLoadingStats
                      ? '...'
                      : totalWorkers
                  }}
                </h2>

                <span class="stat-caption">
                  Pekerja terdaftar
                </span>
              </div>

            </article>

            <!-- HADIR -->
            <article class="stat-card">

              <div class="stat-icon icon-present">
                <img
                  :src="checkIcon"
                  alt=""
                />
              </div>

              <div class="stat-details">
                <p>Hadir</p>

                <h2>
                  {{
                    isLoadingStats
                      ? '...'
                      : presentWorkers
                  }}
                </h2>

                <span class="stat-caption">
                  <span
                    class="status-dot"
                    aria-hidden="true"
                  ></span>

                  {{ attendancePercentage }}% dari total pekerja
                </span>
              </div>

            </article>

            <!-- TIDAK HADIR -->
            <article class="stat-card">

              <div class="stat-icon icon-absent">
                <img
                  :src="absentIcon"
                  alt=""
                />
              </div>

              <div class="stat-details">
                <p>Tidak Hadir</p>

                <h2>
                  {{
                    isLoadingStats
                      ? '...'
                      : absentWorkers
                  }}
                </h2>

                <span class="stat-caption">
                  {{ absentPercentage }}% dari total pekerja
                </span>
              </div>

            </article>

          </div>

          <!-- ==================================
               BANNER INFORMASI PROYEK
          =================================== -->

          <section
            class="project-banner"
            aria-label="Informasi proyek"
          >

            <div class="banner-content">

              <span class="banner-label">
                PANTAU HADIR
              </span>

              <h2>
                Proyek terpantau,<br />
                Pekerja terdata.
              </h2>

              <p>
                Kelola kehadiran pekerja proyek dengan lebih mudah
                dan terorganisir.
              </p>

            </div>

            <div class="banner-illustration">
              <img
                :src="constructionImage"
                alt=""
              />
            </div>

          </section>

        </section>
      </main>
    </div>
  </div>
</template>

<style scoped>
/* =========================================
   LAYOUT UTAMA
========================================= */

.dashboard-shell {
  display: grid;
  grid-template-columns:
    var(--sidebar-width, 260px)
    minmax(0, 1fr);

  min-height: 100vh;

  background: var(--color-canvas, #fff);
  color: var(--color-text-strong, #111);
}

/* =========================================
   SIDEBAR DESKTOP
========================================= */

.admin-sidebar {
  display: flex;
  flex-direction: column;

  min-height: 100vh;

  padding: 32px 0 24px;

  border-right:
    1px solid rgba(8, 2, 100, 0.08);

  background:
    var(--color-sidebar, #c5c9e8);
}

.sidebar-logo {
  padding: 0 28px 40px;
}

.brand-logo {
  display: block;
  max-width: 140px;
  height: auto;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;

  gap: 8px;

  padding: 0 16px 0 0;
}

.nav-item {
  display: flex;
  align-items: center;

  gap: 16px;

  padding: 14px 28px;

  border: none;
  border-radius: 0 24px 24px 0;

  background: transparent;

  color: var(--color-primary, #080264);

  font-family: inherit;
  font-size: 1.05rem;
  font-weight: 700;

  text-align: left;

  cursor: pointer;

  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.6);
}

.nav-item.is-active {
  background-color: #ffffff;

  color: var(--color-primary, #080264);

  box-shadow:
    0 2px 10px rgba(8, 2, 100, 0.06);
}

.nav-icon {
  flex-shrink: 0;
}

/* =========================================
   FOOTER SIDEBAR
========================================= */

.sidebar-footer {
  margin-top: auto;

  padding: 24px 24px 8px;

  display: flex;
  flex-direction: column;

  gap: 16px;
}

.btn-logout {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  gap: 10px;

  width: 100%;
  max-width: 170px;

  padding: 8px 18px;

  background-color: #ffffff;

  color: var(--color-primary, #080264);

  border:
    1.5px solid var(--color-primary, #080264);

  border-radius: var(--radius-sm, 8px);

  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 800;

  cursor: pointer;

  transition:
    background-color 0.15s ease,
    transform 0.1s ease;
}

.btn-logout:hover {
  background-color: #f2f4fa;
}

.btn-logout:active {
  transform: scale(0.98);
}

.sidebar-copy {
  color: var(--color-primary, #080264);

  font-size: 0.72rem;
  line-height: 1.35;

  opacity: 0.75;
}

.sidebar-copy p {
  margin: 0;
  font-weight: 700;
}

.sidebar-copy small {
  font-size: inherit;
}

/* =========================================
   AREA UTAMA DAN HEADER
========================================= */

.admin-main-wrap {
  display: flex;
  flex-direction: column;

  min-width: 0;

  background: #fff;
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  min-height: var(--header-height, 56px);

  padding: 0 36px;

  background:
    var(--color-header, #f58220);
}

.company-title {
  margin: 0;

  color: #fff;

  font-size: 1.25rem;
  font-style: italic;
  font-weight: 800;

  letter-spacing: 0.02em;
}

.admin-profile {
  display: flex;
  align-items: center;

  gap: 12px;
}

.admin-label {
  color: #fff;

  font-size: 1rem;
  font-weight: 700;
}

.avatar-circle {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 32px;
  height: 32px;

  overflow: hidden;

  border: 2px solid #fff;
  border-radius: 50%;
}

.avatar-icon {
  width: 22px;
  height: 22px;
}

/* =========================================
   KONTEN DASHBOARD
========================================= */

.dashboard-content {
  display: flex;
  flex-direction: column;

  gap: var(--space-32);

  width: 100%;
  max-width: 1440px;

  margin: 0 auto;

  padding: var(--space-40);

  box-sizing: border-box;
}

.dashboard-section {
  display: flex;
  flex-direction: column;

  gap: var(--space-32);
}

/* =========================================
   JUDUL HALAMAN
========================================= */

.page-heading h1 {
  margin: 4px 0 8px;

  color: var(--color-primary);

  font-size:
    clamp(32px, 4vw, var(--text-h1));

  font-weight: 800;
  line-height: var(--leading-tight);
}

.page-heading p {
  margin: 0;
  color: var(--color-muted);
}

.eyebrow,
.banner-label {
  color: var(--color-secondary);

  font-size: 12px;
  font-weight: 800;

  letter-spacing: 0.12em;
}

/* =========================================
   TANGGAL DAN WAKTU
========================================= */

.datetime-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: var(--space-24);

  padding:
    var(--space-16)
    var(--space-24);

  border:
    var(--border-width)
    solid rgba(8, 2, 100, 0.12);

  border-radius: var(--radius-md);

  background: var(--color-surface);

  box-shadow: var(--shadow-panel);
}

.date-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.info-dot,
.status-dot {
  display: inline-block;

  width: 9px;
  height: 9px;

  flex: 0 0 9px;

  border-radius: 50%;

  background: var(--color-success);
}

.date-info > div,
.time-info {
  display: grid;
  gap: 2px;
}

.info-label {
  color: var(--color-muted);
  font-size: 13px;
}

.datetime-bar strong {
  color: var(--color-primary);
  font-size: 15px;
}

/* =========================================
   ERROR STATISTIK
========================================= */

.stats-error {
  display: flex;
  align-items: center;
  justify-content: space-between;

  flex-wrap: wrap;
  gap: 12px;

  padding: 12px 16px;

  border: 1px solid #fecaca;
  border-radius: 8px;

  background: #fef2f2;
  color: #991b1b;

  font-size: 14px;
}

.stats-error button {
  padding: 7px 12px;

  border: 1px solid #991b1b;
  border-radius: 6px;

  background: #fff;
  color: #991b1b;

  font: inherit;

  cursor: pointer;
}

.stats-error button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* =========================================
   KARTU STATISTIK
========================================= */

.statistics-grid {
  display: grid;

  grid-template-columns:
    repeat(3, minmax(0, 1fr));

  gap: var(--space-24);
}

.stat-card {
  display: flex;
  align-items: center;

  gap: var(--space-16);

  min-width: 0;

  padding: var(--space-24);

  border:
    var(--border-width)
    solid rgba(8, 2, 100, 0.1);

  border-radius: var(--radius-lg);

  background: var(--color-surface);

  box-shadow: var(--shadow-panel);
}

.stat-icon {
  display: grid;

  width: 56px;
  height: 56px;

  flex: 0 0 56px;

  place-items: center;

  border-radius: var(--radius-md);
}

.stat-icon img {
  width: 28px;
  height: 28px;
}

.icon-total {
  background: rgba(93, 45, 235, 0.12);
}

.icon-present {
  background: var(--color-status-hadir-bg);
}

.icon-absent {
  background: var(--color-status-absen-bg);
}

.stat-details {
  min-width: 0;
}

.stat-details p {
  margin: 0 0 2px;

  color: var(--color-muted);

  font-size: 14px;
  font-weight: 600;
}

.stat-details h2 {
  margin: 0;

  color: var(--color-primary);

  font-size: 32px;
  font-weight: 800;

  line-height: 1.2;
}

.stat-caption {
  display: inline-flex;
  align-items: center;

  gap: 7px;

  margin-top: 5px;

  color: var(--color-muted);
  font-size: 12px;
}

.status-dot {
  width: 7px;
  height: 7px;

  flex-basis: 7px;

  background: var(--color-status-hadir-text);
}

/* =========================================
   BANNER PROYEK
========================================= */

.project-banner {
  position: relative;

  display: flex;
  align-items: center;
  justify-content: space-between;

  min-height: 270px;

  overflow: hidden;

  padding:
    var(--space-32)
    var(--space-40);

  border-radius: var(--radius-xl);

  background: var(--color-primary);
  color: var(--color-text-inverse);
}

.banner-content {
  position: relative;
  z-index: 1;

  max-width: 470px;
}

.banner-label {
  color: #c5c9e8;
}

.banner-content h2 {
  margin: 10px 0;

  color: var(--color-text-inverse);

  font-size:
    clamp(27px, 3vw, 38px);

  font-weight: 800;
  line-height: 1.15;
}

.banner-content p {
  max-width: 390px;

  margin: 0;

  color: rgba(255, 255, 255, 0.82);

  font-size: 14px;
}

.banner-illustration {
  align-self: stretch;

  width: min(44%, 420px);

  min-height: 180px;
}

.banner-illustration img {
  width: 100%;
  height: 100%;

  object-fit: contain;
  object-position: center bottom;
}

/* =========================================
   TOMBOL HAMBURGER
========================================= */

.mobile-menu-button {
  display: none;

  width: 38px;
  height: 38px;

  padding: 8px;

  flex-direction: column;
  justify-content: center;

  gap: 5px;

  border: 1px solid rgba(255,255,255,0.7);
  border-radius: 7px;

  background: transparent;

  cursor: pointer;
}

.mobile-menu-button span {
  display: block;

  width: 20px;
  height: 2px;

  border-radius: 3px;

  background: #ffffff;
}

/* Overlay hanya untuk mobile */
.mobile-sidebar-overlay {
  display: none;
}

/* =========================================
   RESPONSIVE TABLET
========================================= */

@media (max-width: 1024px) {
  .dashboard-shell {
    grid-template-columns:
      200px
      minmax(0, 1fr);
  }

  .admin-sidebar {
    padding-top: 24px;
  }

  .sidebar-logo {
    padding: 0 20px 30px;
  }

  .brand-logo {
    max-width: 125px;
  }

  .nav-item {
    gap: 12px;
    padding: 12px 20px;
    font-size: 14px;
  }

  .app-header {
    padding: 0 20px;
  }

  .dashboard-content {
    padding: var(--space-32) var(--space-24);
  }

  .statistics-grid {
    gap: 14px;
  }

  .stat-card {
    padding: 18px;
    gap: 12px;
  }
}

/* =========================================
   RESPONSIVE MOBILE
========================================= */

@media (max-width: 600px) {

  /* Layout utama */
  .dashboard-shell {
    display: flex;
    flex-direction: column;

    width: 100%;
    min-height: 100vh;

    overflow-x: hidden;
  }

  /* Header mobile */
  .app-header {
    position: sticky;
    top: 0;

    z-index: 20;

    width: 100%;
    min-height: 58px;

    display: flex;
    align-items: center;
    justify-content: flex-start;

    gap: 13px;

    padding: 0 15px;
  }

  .mobile-menu-button {
    display: flex;
    flex-shrink: 0;
  }

  .company-title {
    font-size: 17px;
  }

  .admin-profile {
    margin-left: auto;
    gap: 8px;
  }

  .admin-label {
    font-size: 13px;
  }

  .avatar-circle {
    width: 29px;
    height: 29px;
  }

  .avatar-icon {
    width: 19px;
    height: 19px;
  }

  /* Sidebar mobile */
  .admin-sidebar {
    position: fixed;

    top: 0;
    left: 0;
    bottom: 0;

    z-index: 100;

    display: flex;
    flex-direction: column;

    width: min(280px, 82vw);

    height: 100vh;
    height: 100dvh;

    min-height: 100vh;
    min-height: 100dvh;

    padding: 24px 0 18px;

    background:
      var(--color-sidebar, #c5c9e8);

    box-shadow:
      5px 0 25px rgba(0,0,0,0.12);

    overflow-y: auto;

    transform: translateX(-110%);
    visibility: hidden;

    transition:
      transform 0.25s ease,
      visibility 0.25s ease;
  }

  .admin-sidebar.mobile-sidebar-open {
    transform: translateX(0);
    visibility: visible;
  }

  .sidebar-logo {
    padding: 0 24px 30px;
  }

  .brand-logo {
    max-width: 135px;
  }

  .sidebar-nav {
    gap: 7px;
    padding-right: 14px;
  }

  .nav-item {
    min-height: 48px;

    gap: 13px;

    padding: 12px 22px;

    font-size: 15px;
  }

  .nav-icon {
    width: 23px;
    height: 23px;
  }

  .sidebar-footer {
    margin-top: auto;

    padding: 22px 20px 10px;
  }

  .btn-logout {
    max-width: none;
    min-height: 43px;
  }

  .sidebar-copy {
    font-size: 11px;
  }

  /* Overlay */
  .mobile-sidebar-overlay {
    display: block;

    position: fixed;
    inset: 0;

    z-index: 90;

    background: rgba(0,0,0,0.45);

    backdrop-filter: blur(2px);
  }

  /* Area utama */
  .admin-main-wrap {
    width: 100%;
    min-width: 0;

    min-height: calc(100vh - 58px);
  }

  /* Konten */
  .dashboard-content {
    width: 100%;

    padding: 24px 16px;

    gap: 22px;
  }

  .page-heading h1 {
    font-size: 28px;
  }

  .page-heading p {
    font-size: 13px;
    line-height: 1.5;
  }

  .eyebrow {
    font-size: 10px;
  }

  /* Tanggal dan waktu */
.datetime-bar {
  width: 100%;
  align-items: flex-start;
  flex-direction: column;
  gap: 14px;
  padding: 15px;
}

.datetime-bar strong {
  font-size: 15px;
}

.info-label {
  font-size: 13px;
}

  /* Statistik */
  .statistics-grid {
    grid-template-columns: 1fr;
    gap: 13px;
  }

  .stat-card {
    width: 100%;
    min-height: 100px;

    padding: 17px;
  }

  .stat-icon {
    width: 48px;
    height: 48px;

    flex-basis: 48px;
  }

  .stat-icon img {
    width: 25px;
    height: 25px;
  }

  .stat-details h2 {
    font-size: 28px;
  }

  .stat-details p {
    font-size: 13px;
  }

  .stat-caption {
    font-size: 11px;
  }

  /* Banner proyek */
  .project-banner {
    width: 100%;
    min-height: 310px;

    align-items: flex-start;
    flex-direction: column;

    padding: 23px 20px;

    border-radius: 14px;
  }

  .banner-content {
    width: 100%;
    max-width: 100%;
  }

  .banner-content h2 {
    font-size: 27px;
  }

  .banner-content p {
    max-width: 250px;

    font-size: 13px;
    line-height: 1.5;
  }

  .banner-illustration {
    position: absolute;

    right: 0;
    bottom: 0;

    width: 75%;
    height: 165px;

    opacity: 0.8;
  }

  /* Pesan error */
  .stats-error {
    align-items: flex-start;
    flex-direction: column;

    font-size: 13px;
  }
}

/* =========================================
   RESPONSIVE HP SANGAT KECIL
========================================= */

@media (max-width: 360px) {
  .company-title {
    font-size: 15px;
  }

  .admin-label {
    font-size: 12px;
  }

  .dashboard-content {
    padding: 20px 12px;
  }

  .page-heading h1 {
    font-size: 25px;
  }

  .stat-card {
    padding: 13px;
  }
}

/* =========================================
   PENGURANGAN ANIMASI
========================================= */

@media (prefers-reduced-motion: reduce) {
  .admin-sidebar {
    transition: none;
  }
}
</style>
